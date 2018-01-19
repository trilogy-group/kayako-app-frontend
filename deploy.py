import gzip
import boto3
from io import BytesIO
from json import load, dumps
from os import path, getenv, walk
from argparse import ArgumentParser


def _account_id():
    target = getenv('DRONE_DEPLOY_TO')
    if target is None:
        raise Exception('Target environment unknown. DRONE_DEPLOY_TO is not set')

    varname = 'account_number_{}'.format(target).upper()
    acc_id = getenv(varname)
    if acc_id is None:
        raise Exception('Account number not available is "{}" variable. Missing the secrets?'.format(varname))

    return acc_id


def _get_s3_client():
    iam_role = 'arn:aws:iam::{}:role/{}'.format(_account_id(), getenv('PLUGIN_CI_ROLE', 'ci'))
    region = getenv('PLUGIN_REGION', 'us-east-1')

    sts = boto3.client('sts', region_name=region)
    creds = sts.assume_role(RoleArn=iam_role, RoleSessionName='drone-app-frontend-deployer').get('Credentials')

    return boto3.client('s3',
                        aws_access_key_id=creds.get('AccessKeyId'),
                        aws_secret_access_key=creds.get('SecretAccessKey'),
                        aws_session_token=creds.get('SessionToken'),
                        region_name=region)

def _prepare_locales(files: list):
    """
    Take a list that looks like:
        [
            "/root/apps/app-frontend/locale/<locale_id>/api/<file_name>.js",
            ...
            ...
        ]

    and convert it into a dictionary that looks like:

        {
            "<locale_name>": [
                {
                    "id": "frontend.api.<file_name>.attrname",
                    "value": "translated value",
                    "resource_type": "locale_string"
                }
            ]
        }
    """
    artifacts = dict()
    for each in files:
        fname, _ = path.splitext(path.basename(each))
        lang = path.basename(path.dirname(path.dirname(each)).rstrip('/'))
        if lang not in artifacts.keys():
            artifacts[lang] = list()

        with open(each, 'r') as f:
            contents = load(f)
            for k, v in contents.items():
                artifacts[lang].append({
                    'id': 'frontend.api.{}.{}'.format(fname, k),
                    'value': v,
                    'resource_type': 'locale_string'
                })

    return artifacts


def _put_item(client, bucket, file_path, artifact):
    gzobj = BytesIO()
    with gzip.GzipFile(fileobj=gzobj, mode='wb') as gz:
        gz.write(artifact.encode())

    gzobj.seek(0)
    client.put_object(Body=gzobj,
                      Bucket=bucket,
                      Key=file_path,
                      ACL='public-read',
                      Metadata=dict(author='euthanizer'),
                      ContentType='application/json',
                      ContentEncoding='gzip')


def _show_todo(s, d):
    print(' + Will write {} locale to {}'.format(s, d), flush=True)

def _ensure_error_page(client, bucket):
    _put_item(client, bucket, 'error.html', dumps({
            'status': 404,
            'errors': [{
                'code': 'RESOURCE_NOT_FOUND',
                'message': 'Resource does not exist or has been removed',
                'more_info': 'https://developer.kayako.com/api/v1/reference/errors/RESOURCE_NOT_FOUND'
            }]
        }))


def publish(bucket: str, prefix: str, artifacts: dict, dryrun: bool):
    s3 = _get_s3_client() if not dryrun else None

    for k, v in artifacts.items():
        content = dict(status=200, data=v, resource='locale_string', total_count=len(v))
        print(" + uploading locale '{}' to path s3://{}/{}/{}".format(k, bucket, prefix, k), flush=True)
        _put_item(s3,
                  bucket,
                  path.join(prefix, k),
                  dumps(content)) if not dryrun else _show_todo(k, path.join(prefix, k))

    _ensure_error_page(s3, bucket)


def deploy(source: str, bucket: str, prefix: str, dryrun: bool):
    files = [path.join(root, file_name)
               for root, _, files in walk(path.join(source, 'locale'))
               for file_name in files if file_name.endswith('.json')]

    artifacts = _prepare_locales(files)
    publish(bucket, prefix, artifacts, dryrun)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('--path', help='Full path to app-frontend directory')
    parser.add_argument('--bucket', help='Name of destination S3 bucket')
    parser.add_argument('--prefix', help='Path prefix')
    parser.add_argument('--dry', action='store_true', help='Enable dry run mode')
    args = parser.parse_args()

    deploy(source=args.path, bucket=args.bucket, prefix=args.prefix, dryrun=args.dry)


