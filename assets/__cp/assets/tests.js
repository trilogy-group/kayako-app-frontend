define('frontend-cp/tests/acceptance/admin/account/billing/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-admin/billing/index/styles', 'frontend-cp/components/ko-admin/billing/card/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoAdminBillingIndexStyles, _frontendCpComponentsKoAdminBillingCardStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/account/billing Index', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', { locale: 'en-us' });
      server.create('plan', { limits: {}, features: [], account_id: '123', subscription_id: '123' });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
      server.createList('creditcard', 5);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('visiting /admin/account/billing', function (assert) {
    visit('/admin/account/billing');

    andThen(function () {
      assert.equal(currentURL(), '/admin/account/billing');
      assert.equal(find('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card).length, 5);
      assert.equal(find('.' + _frontendCpComponentsKoAdminBillingIndexStyles['default'].tile).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('marking card as default', function (assert) {
    visit('/admin/account/billing');
    andThen(function () {
      click('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card + ':eq(0) .' + _frontendCpComponentsKoAdminBillingCardStyles['default']['card-type']);
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card + ':eq(0) .' + _frontendCpComponentsKoAdminBillingCardStyles['default']['card-type']).hasClass(_frontendCpComponentsKoAdminBillingCardStyles['default'].isDefault), true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('remove a card', function (assert) {
    visit('/admin/account/billing');
    andThen(function () {
      click('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card + ':eq(1) .' + _frontendCpComponentsKoAdminBillingCardStyles['default']['delete-handle']);
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card).length, 4);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cannot remove a default card', function (assert) {
    visit('/admin/account/billing');
    andThen(function () {
      click('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card + ':eq(2) .' + _frontendCpComponentsKoAdminBillingCardStyles['default']['card-type']);
    });
    andThen(function () {
      click('.' + _frontendCpComponentsKoAdminBillingCardStyles['default'].card + ':eq(2) .' + _frontendCpComponentsKoAdminBillingCardStyles['default']['delete-handle']).then(function () {
        assert.equal(true, false);
      })['catch'](function (e) {
        assert.equal(/Element .* not found/.test(e.message), true);
      });
    });
  });
});
define('frontend-cp/tests/acceptance/admin/account/overview/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-toast/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoToastStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/account/overview Index', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', { locale: 'en-us' });
      server.create('plan', { limits: {}, features: [], account_id: '123', subscription_id: '123' });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      server.createList('invoice', 5);
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('visiting /admin/account/overview', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      assert.equal(currentURL(), '/admin/account/overview');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('listing invoices', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      assert.equal(find('.invoice-item').length, 5);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('opening cancel subscription modal', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      click('.cancel-subscription');
    });

    andThen(function () {
      assert.equal(find('.cancel-subscription-modal').length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('closing cancel subscription modal', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      click('.cancel-subscription');
      click('.revert-subscription');
    });

    andThen(function () {
      assert.equal(find('.cancel-subscription-modal').length, 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancel subscription successfully', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      click('.cancel-subscription');
      click('.end-subscription');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoToastStyles['default'].toast).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancel subscription successfully even after moving to different route', function (assert) {
    visit('/admin/account/overview');

    andThen(function () {
      click('.cancel-subscription');
      click('.end-subscription');
      visit('/admin/account');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoToastStyles['default'].toast).length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/account/plans/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-admin/plans/index/styles', 'frontend-cp/components/ko-admin/rateplans/item/styles', 'frontend-cp/components/ko-admin/rateplans/price/styles', 'frontend-cp/components/ko-toast/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoAdminPlansIndexStyles, _frontendCpComponentsKoAdminRateplansItemStyles, _frontendCpComponentsKoAdminRateplansPriceStyles, _frontendCpComponentsKoToastStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/account/plans Index', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', { locale: 'en-us' });
      server.create('plan', { limits: {}, features: [] });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('visiting /admin/account/plans', function (assert) {
    visit('/admin/account/plans');

    andThen(function () {
      assert.equal(currentURL(), '/admin/account/plans');
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell).length, 5);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('switching plan', function (assert) {
    visit('/admin/account/plans');
    click('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)');

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)').hasClass(_frontendCpComponentsKoAdminRateplansItemStyles['default'].selected), true);
      assert.equal(find('.' + _frontendCpComponentsKoAdminPlansIndexStyles['default'].cancel).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing payment term', function (assert) {
    var selectedIndex = null;
    visit('/admin/account/plans');
    andThen(function () {
      selectedIndex = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected).index();
      click('.ko-radio__label:eq(1)');
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(' + selectedIndex + ')').hasClass(_frontendCpComponentsKoAdminRateplansItemStyles['default'].selected), true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('updating plan', function (assert) {
    visit('/admin/account/plans');
    click('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)');
    click('.' + _frontendCpComponentsKoAdminPlansIndexStyles['default'].button);
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoToastStyles['default'].toast).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancelling changed plan', function (assert) {
    var selectedPlanIndex = null;
    visit('/admin/account/plans');
    andThen(function () {
      selectedPlanIndex = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected).index();
      click('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)');
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)').hasClass(_frontendCpComponentsKoAdminRateplansItemStyles['default'].selected), true);
      click('.' + _frontendCpComponentsKoAdminPlansIndexStyles['default'].cancel);
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(2)').hasClass(_frontendCpComponentsKoAdminRateplansItemStyles['default'].selected), false);
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell + ':eq(' + selectedPlanIndex + ')').hasClass(_frontendCpComponentsKoAdminRateplansItemStyles['default'].selected), true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancelling changed term', function (assert) {
    var selectedPlanAmount = 0;
    visit('/admin/account/plans');
    andThen(function () {
      selectedPlanAmount = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected + ' .' + _frontendCpComponentsKoAdminRateplansPriceStyles['default']['plan-price-amount']).text().trim();
      click('.ko-radio__label:eq(1)');
    });
    andThen(function () {
      assert.notEqual(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected + ' .' + _frontendCpComponentsKoAdminRateplansPriceStyles['default']['plan-price-amount']).text().trim(), selectedPlanAmount);
      click('.' + _frontendCpComponentsKoAdminPlansIndexStyles['default'].cancel);
    });
    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected + ' .' + _frontendCpComponentsKoAdminRateplansPriceStyles['default']['plan-price-amount']).text().trim(), selectedPlanAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('seats should be equal to subscription agents default quantity', function (assert) {
    visit('/admin/account/plans');
    andThen(function () {
      assert.equal(find('.agents-count').val(), '10');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancelling changed seats count', function (assert) {
    var selectedSeats = 0;
    visit('/admin/account/plans');
    andThen(function () {
      selectedSeats = find('.agents-count').val();
      fillIn('.agents-count', 20);
    });
    andThen(function () {
      assert.notEqual(find('.agents-count').val(), selectedSeats);
      click('.' + _frontendCpComponentsKoAdminPlansIndexStyles['default'].cancel);
    });
    andThen(function () {
      assert.equal(find('.agents-count').val(), selectedSeats);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/account/trial/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-admin/rateplans/item/styles', 'frontend-cp/components/ko-admin/rateplans/price/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoAdminRateplansItemStyles, _frontendCpComponentsKoAdminRateplansPriceStyles) {

  var currencyToNumber = function currencyToNumber(value) {
    return Number(value.replace(/[^0-9\.]+/g, ''));
  };

  var addVat = function addVat(amount) {
    return amount + amount * 20 / 100;
  };

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/account/trial Index', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', { locale: 'en-us' });
      server.create('plan', { limits: {}, features: [] });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      server.createList('user', 5);
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('visiting /admin/account/trial', function (assert) {
    visit('/admin/account/trial');

    andThen(function () {
      assert.equal(currentURL(), '/admin/account/trial');
      assert.equal(find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].cell).length, 5);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('trial selected plan should be active by default', function (assert) {
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      assert.equal(selectedPlan.find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default']['plan-name']).text(), 'Standard');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('display correct subscription amount by multiplying the agents count and subscription price', function (assert) {
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var price = currencyToNumber(selectedPlan.find('.' + _frontendCpComponentsKoAdminRateplansPriceStyles['default']['plan-price-amount']).text());
      var numOfAgents = selectedPlan.find('.agents-count').val();
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(price * numOfAgents, subscriptionAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('update subscription amount when number of seats are increased', function (assert) {
    visit('/admin/account/trial');

    andThen(function () {
      fillIn('.agents-count', 3);
    });

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var price = currencyToNumber(selectedPlan.find('.' + _frontendCpComponentsKoAdminRateplansPriceStyles['default']['plan-price-amount']).text());
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(price * 3, subscriptionAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('increase subscription amount when billing term is set to annual', function (assert) {
    var initialSubscriptionAmount = 0;
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      initialSubscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      click('.ko-radio__label:eq(1)');
    });

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(initialSubscriptionAmount < subscriptionAmount, true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('add 20% VAT to the subscription amount when one of the european countries is selected', function (assert) {
    var initialSubscriptionAmount = 0;
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      initialSubscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      selectChoose('.countries', 'Greece');
    });

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(addVat(initialSubscriptionAmount), subscriptionAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('remove VAT charges when VAT ID is present', function (assert) {
    var initialSubscriptionAmount = 0;
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      initialSubscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      selectChoose('.countries', 'Greece');
    });

    andThen(function () {
      fillIn('.vat-id', '100120102');
    });

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(initialSubscriptionAmount, subscriptionAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('should charge 20% VAT when country is UK even if VAT ID is present', function (assert) {
    var initialSubscriptionAmount = 0;
    visit('/admin/account/trial');

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      initialSubscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      selectChoose('.countries', 'United Kingdom');
    });

    andThen(function () {
      fillIn('.vat-id', '100120102');
    });

    andThen(function () {
      var selectedPlan = find('.' + _frontendCpComponentsKoAdminRateplansItemStyles['default'].selected);
      var subscriptionAmount = currencyToNumber(selectedPlan.find('.gross-total').text());
      assert.equal(addVat(initialSubscriptionAmount), subscriptionAmount);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('redirect to /overview when not in trial', function (assert) {
    server.create('plan', {
      account_id: 1212,
      subscription_id: 120020,
      limits: {
        agents: 40
      },
      features: []
    });

    andThen(function () {
      visit('/admin/account/trial');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/account/overview');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/apps/webhooks/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;
  var webhook = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/apps/webhooks/edit', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      webhook = server.create('token', {
        label: 'test webhook label',
        description: 'test webhook description',
        token: 'abc',
        is_enabled: true
      });

      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Edit an existing webhook', function (assert) {
    assert.expect(11);

    visit('/admin/apps/webhooks/' + webhook.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/' + webhook.id);
      assert.equal(find('input[name="label"]').val(), 'test webhook label');
      assert.equal(find('input[name="description"]').val(), 'test webhook description');
      assert.equal(find('input[name="token"]').val(), 'abc');
      fillIn('input[name="label"]', 'Sample webhook label');
      fillIn('input[name="description"]', 'Sample webhook description');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 1, 'The webhook is still enabled');
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0, 'There are no disabled webhooks');
      click('.qa-admin_webhooks--enabled .qa-admin_row div:contains("Sample webhook label")');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/' + webhook.id);
      assert.equal(find('input[name="label"]').val(), 'Sample webhook label');
      assert.equal(find('input[name="description"]').val(), 'Sample webhook description');
      assert.equal(find('input[name="token"]').val(), 'abc');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/apps/webhooks/' + webhook.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/' + webhook.id);
      fillIn('input[name="label"]', 'Sample webhook label');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(4);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/apps/webhooks/' + webhook.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/' + webhook.id);
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 1, 'The webhook is still enabled');
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0, 'There are no disabled webhooks');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/apps/webhooks/index-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/apps/webhooks/index', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting an enabled webhook', function (assert) {
    assert.expect(4);

    server.create('token', { label: 'test webhook', is_enabled: true });

    visit('/admin/apps/webhooks');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      triggerEvent('.qa-admin_webhooks--enabled .qa-admin_row div:contains("test webhook")', 'mouseenter');
      click('.qa-admin_webhooks--enabled .qa-admin_row div:contains("test webhook") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.notOk(find('span:contains("test webhook")').length > 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting an disabled webhook', function (assert) {
    assert.expect(4);

    server.create('token', { label: 'test webhook', is_enabled: false });

    visit('/admin/apps/webhooks');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      triggerEvent('.qa-admin_webhooks--disabled .qa-admin_row div:contains("test webhook")', 'mouseenter');
      click('.qa-admin_webhooks--disabled .qa-admin_row div:contains("test webhook") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.notOk(find('span:contains("test webhook")').length > 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabled webhooks can be enabled', function (assert) {
    assert.expect(6);

    server.create('token', { label: 'test webhook', is_enabled: false });

    visit('/admin/apps/webhooks');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 0);
      assert.ok(find('.qa-admin_webhooks--disabled').length === 1);
      triggerEvent('.qa-admin_webhooks--disabled .qa-admin_row div:contains("test webhook")', 'mouseenter');
      click('.qa-admin_webhooks--disabled .qa-admin_row div:contains("test webhook") a:contains(Enable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 1);
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled webhooks can be disabled', function (assert) {
    assert.expect(6);

    server.create('token', { label: 'test webhook', is_enabled: true });

    visit('/admin/apps/webhooks');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 1);
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0);
      triggerEvent('.qa-admin_webhooks--enabled .qa-admin_row div:contains("test webhook")', 'mouseenter');
      click('.qa-admin_webhooks--enabled .qa-admin_row div:contains("test webhook") a:contains(Disable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 0);
      assert.ok(find('.qa-admin_webhooks--disabled').length === 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('webhooks are ordered by their title and then grouped by enabled and disabled', function (assert) {
    assert.expect(6);

    server.create('token', { label: 'test webhook 5', is_enabled: false });
    server.create('token', { label: 'test webhook 4', is_enabled: true });
    server.create('token', { label: 'test webhook 3', is_enabled: true });
    server.create('token', { label: 'test webhook 2', is_enabled: true });
    server.create('token', { label: 'test webhook 1', is_enabled: false });

    visit('/admin/apps/webhooks');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.equal(find('.qa-admin_webhooks--enabled .qa-admin_row:nth-of-type(1) .qa-admin_row_label').text().trim(), 'test webhook 2');
      assert.equal(find('.qa-admin_webhooks--enabled .qa-admin_row:nth-of-type(2) .qa-admin_row_label').text().trim(), 'test webhook 3');
      assert.equal(find('.qa-admin_webhooks--enabled .qa-admin_row:nth-of-type(3) .qa-admin_row_label').text().trim(), 'test webhook 4');
      assert.equal(find('.qa-admin_webhooks--disabled .qa-admin_row:nth-of-type(1) .qa-admin_row_label').text().trim(), 'test webhook 1');
      assert.equal(find('.qa-admin_webhooks--disabled .qa-admin_row:nth-of-type(2) .qa-admin_row_label').text().trim(), 'test webhook 5');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/apps/webhooks/new-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/apps/webhooks/new', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a webhook', function (assert) {
    assert.expect(8);

    visit('/admin/apps/webhooks/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/new');

      fillIn('input[name="label"]', 'Sample webhook label');
      fillIn('input[name="description"]', 'Sample webhook description');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/1');
      assert.equal(find('input[name="label"]').val(), 'Sample webhook label');
      assert.equal(find('input[name="description"]').val(), 'Sample webhook description');
      assert.equal(find('input[name="token"]').val(), 'abc');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 1);
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/apps/webhooks/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/new');

      fillIn('input[name="label"]', 'Sample webhook label');
      fillIn('input[name="description"]', 'Sample webhook title');

      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(4);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/apps/webhooks/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks/new');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/apps/webhooks');
      assert.ok(find('.qa-admin_webhooks--enabled').length === 0, 'The are no enabled webhooks');
      assert.ok(find('.qa-admin_webhooks--disabled').length === 0, 'There are no disabled webhooks');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/businesshours/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/businesshours Edit', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('businesshours', {
        title: 'Initial Default',
        isDefault: true,
        zones: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        }
      });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('select some busines hours by clicking', function (assert) {
    visit('/admin/automation/businesshours/1');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/businesshours/1');
      click('.ko-grid-picker__row:first-child .ko-grid-picker__cell:first-child');
      click('.ko-grid-picker__row:nth-child(2) .ko-grid-picker__cell:first-child');
    });

    andThen(function () {
      assert.equal(find('.ko-grid-picker__row .selected').length, 2);
      click('.ko-grid-picker__row:first-child .ko-grid-picker__cell:first-child');
    });

    andThen(function () {
      assert.equal(find('.ko-grid-picker__row .selected').length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Add a holiday', function (assert) {
    visit('/admin/automation/businesshours/1');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/businesshours/1');
      click('.button--default');
    });

    andThen(function () {
      fillIn('.ko-form_field input', 'My Birthday');
    });

    andThen(function () {
      click('.ko-admin_holidays_edit__buttons button:first');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/monitors/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;
  var monitor = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/monitors - Edit a monitor', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '5': 'Closed',
          '4': 'Completed',
          '1': 'New',
          '2': 'Open',
          '3': 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '4': 'Incident',
          '3': 'Problem',
          '1': 'Question',
          '2': 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '3': 'High',
          '1': 'Low',
          '2': 'Normal',
          '4': 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          '1': 'Active',
          '3': 'Spam',
          '2': 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '0': 'unassigned',
          '(current users team)': '(current users team)',
          '5': 'Contractors',
          '3': 'Finance',
          '4': 'Human Resources',
          '1': 'Sales',
          '2': 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'breached'
        }
      });

      var proposition = server.create('proposition', {
        field: 'cases.subject',
        operator: 'string_contains',
        value: 'dave'
      });
      var collection = server.create('predicate-collection', {
        propositions: [{ id: proposition.id, resource_type: 'proposition' }]
      });
      var action = server.create('automation-action');
      monitor = server.create('monitor', {
        predicate_collections: [{ id: collection.id, resource_type: 'predicate_collection' }],
        action: { id: action.id, resource_type: 'automation-action' }
      });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Edit an existing monitor', function (assert) {
    assert.expect(15);

    visit('/admin/automation/monitors/' + monitor.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/' + monitor.id);
      click('.ko-predicate-builder__add');

      selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:eq(1) input:last', 'collection1proposition2');

      click('.ko-predicate-builder__new');

      selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:eq(2) input:last', 'collection2proposition1');

      click('.ko-predicate-builder_proposition__remove:eq(0)');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor is still enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There is no disabled monitors');
      click('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/' + monitor.id);
      assert.equal(find('.ko-predicate-builder').length, 2, 'There is 2 predicate collections');
      assert.equal(find('.ko-predicate-builder:eq(0) .qa-predicate-builder--proposition').length, 1, 'There is 1 proposition in the first predicate collection');
      assert.equal(find('.ko-predicate-builder:eq(1) .qa-predicate-builder--proposition').length, 1, 'There is 1 proposition in the second predicate collection');
      click('.ko-predicate-builder__remove:eq(0)'); // Remove the first predicate collection
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor is still enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There is no disabled monitors');
      click('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/' + monitor.id);
      assert.equal(find('.ko-predicate-builder').length, 1, 'There is 1 predicate collection');
      assert.equal(find('.ko-predicate-builder:eq(0) .qa-predicate-builder--proposition').length, 1, 'There is 1 proposition in the first predicate collection');
      assert.equal(find('.ko-predicate-builder_proposition__input').val(), 'collection2proposition1', 'The proposition left is the expected one');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/automation/monitors/' + monitor.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/' + monitor.id);
      fillIn('input[name="title"]', 'Sample monitor name');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(2);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/automation/monitors/' + monitor.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/' + monitor.id);
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/monitors/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/monitors - Index of monitors', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting an enabled monitor', function (assert) {
    assert.expect(4);

    server.create('monitor', { title: 'test monitor', is_enabled: true, execution_order: 1 });

    visit('/admin/automation/monitors');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor")', 'mouseenter');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('span:contains("test monitor")').length, 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a disabled monitor', function (assert) {
    assert.expect(4);

    server.create('monitor', { title: 'test monitor', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/monitors');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor")', 'mouseenter');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('span:contains("test monitor")').length, 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabled monitors can be enabled', function (assert) {
    assert.expect(6);

    server.create('monitor', { title: 'test monitor', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/monitors');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled li').length, 0);
      assert.equal(find('.qa-admin_monitors--disabled').length, 1);
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor")', 'mouseenter');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor") a:contains(Enable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .qa-sortable-item').length, 1);
      assert.equal(find('.qa-admin_monitors--disabled').length, 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled monitors can be disabled', function (assert) {
    assert.expect(6);

    server.create('monitor', { title: 'test monitor', is_enabled: true, execution_order: 1 });

    visit('/admin/automation/monitors');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.ok(find('.qa-admin_monitors--enabled .qa-sortable-item').length === 1);
      assert.ok(find('.qa-admin_monitors--disabled').length === 0);
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor")', 'mouseenter');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test monitor") a:contains(Disable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.ok(find('.qa-admin_monitors--enabled .qa-sortable-item').length === 0);
      assert.ok(find('.qa-admin_monitors--disabled').length === 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled monitors are ordered by their execution order, disabled monitors are ordered by title', function (assert) {
    assert.expect(6);

    server.create('monitor', { title: 'test monitor 5', is_enabled: false, execution_order: 5 });
    server.create('monitor', { title: 'test monitor 4', is_enabled: true, execution_order: 4 });
    server.create('monitor', { title: 'test monitor 3', is_enabled: true, execution_order: 3 });
    server.create('monitor', { title: 'test monitor 2', is_enabled: true, execution_order: 2 });
    server.create('monitor', { title: 'test monitor 1', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/monitors');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test monitor 2');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test monitor 3');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test monitor 4');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(0) .t-bold').text().trim(), 'test monitor 1');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(1) .t-bold').text().trim(), 'test monitor 5');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled monitors can be reordered', function (assert) {
    assert.expect(11);

    server.create('monitor', { title: 'test monitor 1', is_enabled: true, execution_order: 1 });
    server.create('monitor', { title: 'test monitor 2', is_enabled: true, execution_order: 2 });
    server.create('monitor', { title: 'test monitor 3', is_enabled: true, execution_order: 3 });
    server.create('monitor', { title: 'test monitor 4', is_enabled: true, execution_order: 4 });
    server.create('monitor', { title: 'test monitor 5', is_enabled: true, execution_order: 5 });

    visit('/admin/automation/monitors');

    scrollToBottomOfPage();

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test monitor 1');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test monitor 2');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test monitor 3');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(4) .t-bold').text().trim(), 'test monitor 4');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(5) .t-bold').text().trim(), 'test monitor 5');
    });

    reorderListItems('.i-dragstrip', '.t-bold', 'test monitor 5', 'test monitor 4', 'test monitor 3', 'test monitor 2', 'test monitor 1');

    andThen(function () {
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test monitor 5');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test monitor 4');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test monitor 3');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(4) .t-bold').text().trim(), 'test monitor 2');
      assert.equal(find('.qa-admin_monitors--enabled li:nth-of-type(5) .t-bold').text().trim(), 'test monitor 1');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/monitors/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'moment', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-admin/automation-actions-builder/styles'], function (exports, _frontendCpTestsHelpersQunit, _moment, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoAdminAutomationActionsBuilderStyles) {

  var originalConfirm = undefined,
      role = undefined;

  function fillPredicateCollections() {
    selectChoose('.qa-predicate-builder--proposition:eq(0) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(0) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(0) input:last', 'collection1proposition1');

    click('.ko-predicate-builder__add');

    selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(1) input:last', 'collection1proposition2');

    click('.ko-predicate-builder__new');

    selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(2) input:last', 'collection2proposition1');
  }

  function assertPredicateCollestionsAreCorrect(assert) {
    assert.equal($('.qa-predicate-builder--proposition:eq(0) input:last').val(), 'collection1proposition1');
    assert.equal($('.qa-predicate-builder--proposition:eq(1) input:last').val(), 'collection1proposition2');
    assert.equal($('.qa-predicate-builder--proposition:eq(2) input:last').val(), 'collection2proposition1');
  }

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/monitors - Create a monitor', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      role = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          5: 'Closed',
          4: 'Completed',
          1: 'New',
          2: 'Open',
          3: 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          4: 'Incident',
          3: 'Problem',
          1: 'Question',
          2: 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          3: 'High',
          1: 'Low',
          2: 'Normal',
          4: 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          1: 'Active',
          3: 'Spam',
          2: 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          1: 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          0: 'unassigned',
          '(current users team)': '(current users team)',
          5: 'Contractors',
          3: 'Finance',
          4: 'Human Resources',
          1: 'Sales',
          2: 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          1: 'breached'
        }
      });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      originalConfirm = role = null;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "status" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Status',
      name: 'status',
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      options: ['CHANGE'],
      values: {
        1: 'New',
        2: 'Open',
        3: 'Resolved',
        4: 'Closed'
      }
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Status');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'New');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'New', 'The status is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "priority" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Priority',
      name: 'priority',
      options: ['CHANGE', 'INCREASE', 'DECREASE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        0: 'none',
        24: 'Critical',
        18: 'High',
        14: 'Low',
        26: 'Normal'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Priority');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Low');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Low', 'The priority is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "type" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Type',
      name: 'type',
      options: ['CHANGE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        0: 'none',
        24: 'Incident',
        25: 'Installation',
        2: 'Issue',
        27: 'Problem',
        26: 'Question',
        4: 'Task'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Type');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Issue');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Issue', 'The type is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "assignee" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Assignee',
      name: 'assignee',
      options: ['CHANGE'],
      input_type: 'AUTOCOMPLETE',
      value_type: 'NUMERIC',
      values: [],
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('user', { full_name: 'Jane Morris', role: role });
    server.create('user', { full_name: 'Alicia Morris', role: role });
    server.create('user', { full_name: 'Ben Morris', role: role });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Assignee');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Morr');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Alicia Morris');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Alicia Morris', 'The assignee is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "tags" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Tags',
      name: 'tags',
      options: ['ADD', 'REMOVE', 'REPLACE'],
      input_type: 'TAGS',
      value_type: 'COLLECTION',
      values: [],
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('tag', { name: 'status' });
    server.create('tag', { name: 'critical' });
    server.create('tag', { name: 'support' });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Tags');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'add');

      // Add an existent tag
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'stat');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'status');

      // Add a nonexistent tag
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'nonexistent');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Add tag “nonexistent”');
    });

    andThen(function () {
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger .ember-power-select-multiple-option').length, 2, 'There is two tags in this monitor');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "team" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Team',
      name: 'team',
      options: ['CHANGE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        43: 'Billing',
        50: 'Customer Success',
        44: 'Engineering',
        46: 'Hello',
        52: 'IT',
        48: 'New Business',
        49: 'Renewals',
        14: 'Sales',
        16: 'Support'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Team');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Engineering');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Engineering', 'The team is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "Send satisfaction survey" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Satisfaction survey',
      name: 'satisfactionsurvey',
      options: ['SEND'],
      input_type: 'BOOLEAN_TRUE',
      value_type: 'BOOLEAN',
      values: [],
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Satisfaction survey');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Case: Satisfaction survey', 'The Satisfaction survey has been selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "Email a user" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Email a user',
      name: 'notificationuser',
      options: ['SEND'],
      input_type: 'NOTIFICATION_USER',
      value_type: 'ATTRIBUTES',
      values: {
        '-2': '(Last active user)',
        '-3': '(Requester)',
        '-4': '(Assignee)'
      },
      attributes: ['subject', 'message'],
      group: 'NOTIFICATION',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Email a user');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', '(Requester)');
      fillIn('[name="subject"]', 'Example subject');
      fillIn('[name="message"]', 'Example message blah blah');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1) .ember-power-select-trigger').text().trim(), '(Requester)', 'The requester is selected');
      assert.equal(find('[name="subject"]').val(), 'Example subject', 'The subject is set');
      assert.equal(find('[name="message"]').val(), 'Example message blah blah', 'The message is set');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "Email a team" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Email a team',
      name: 'notificationteam',
      options: ['SEND'],
      input_type: 'NOTIFICATION_TEAM',
      value_type: 'ATTRIBUTES',
      values: {
        '-5': '(Assigned team)',
        43: 'Billing',
        50: 'Customer Success',
        44: 'Engineering',
        46: 'Hello',
        52: 'IT',
        48: 'New Business',
        49: 'Renewals',
        14: 'Sales',
        16: 'Support'
      },
      attributes: ['subject', 'message'],
      group: 'NOTIFICATION',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Email a team');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'Billing');
      fillIn('[name="subject"]', 'Example subject');
      fillIn('[name="message"]', 'Example message blah blah');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1) .ember-power-select-trigger').text().trim(), 'Billing', 'The requester is selected');
      assert.equal(find('[name="subject"]').val(), 'Example subject', 'The subject is set');
      assert.equal(find('[name="message"]').val(), 'Example message blah blah', 'The message is set');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "Stop notifications" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Stop notifications',
      name: 'stopnotification',
      options: ['SEND'],
      input_type: 'BOOLEAN_TRUE',
      value_type: 'BOOLEAN',
      values: [],
      attributes: [],
      group: 'FLOW_CONTROL',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Stop notifications');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Flow control: Stop notifications');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "ENDPOINT_SLACK" action', function (assert) {
    assert.expect(10);
    server.create('automation-action-definition', {
      label: 'Test Slack thing',
      name: 'endpoint_2',
      options: ['SEND'],
      input_type: 'ENDPOINT_SLACK',
      value_type: 'STRING',
      values: [],
      attributes: [],
      group: 'ENDPOINT',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Test Slack thing');
      fillIn('[name=endpoint-message]', 'foobar');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Endpoint: Test Slack thing');
      assert.equal(find('[name=endpoint-message]').val(), 'foobar');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "ENDPOINT_EMAIL" action', function (assert) {
    assert.expect(10);
    server.create('automation-action-definition', {
      label: 'Example email endpoint',
      name: 'endpoint_4',
      options: ['SEND'],
      input_type: 'ENDPOINT_EMAIL',
      value_type: 'STRING',
      values: '',
      attributes: [],
      group: 'ENDPOINT',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Example email endpoint');
      fillIn('[name="endpoint-message"]', 'foobar');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Endpoint: Example email endpoint');
      assert.equal(find('[name="endpoint-message"]').val(), 'foobar');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "ENDPOINT_HTTP_XML" action', function (assert) {
    assert.expect(14);
    server.create('automation-action-definition', {
      label: 'Some XML thing',
      name: 'endpoint_3',
      options: ['SEND'],
      input_type: 'ENDPOINT_HTTP_XML',
      value_type: 'STRING',
      values: '',
      attributes: [],
      group: 'ENDPOINT',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Some XML thing');
    });

    andThen(function () {
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'true', 'The first radio is selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'false', 'The second radio is not selected');
      click('.ko-radio__label:eq(1)');
      fillIn('[name="endpoint-payload"]', '<foo>bar</foo>');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Endpoint: Some XML thing');
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'false', 'The first radio is not selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'true', 'The second radio is selected');
      assert.equal(find('[name="endpoint-payload"]').val(), '<foo>bar</foo>');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "ENDPOINT_HTTP_JSON" action', function (assert) {
    assert.expect(14);
    server.create('automation-action-definition', {
      label: 'POST json example',
      name: 'endpoint_5',
      options: ['SEND'],
      input_type: 'ENDPOINT_HTTP_JSON',
      value_type: 'STRING',
      values: '',
      attributes: [],
      group: 'ENDPOINT',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'POST json example');
    });

    andThen(function () {
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'true', 'The first radio is selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'false', 'The second radio is not selected');
      click('.ko-radio__label:eq(1)');
      fillIn('[name="endpoint-payload"]', '{ "foo": "bar" }');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Endpoint: POST json example');
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'false', 'The first radio is not selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'true', 'The second radio is selected');
      assert.equal(find('[name="endpoint-payload"]').val(), '{ "foo": "bar" }');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "ENDPOINT_HTTP" action', function (assert) {
    assert.expect(15);
    server.create('automation-action-definition', {
      label: 'GET example',
      name: 'endpoint_6',
      options: ['SEND'],
      input_type: 'ENDPOINT_HTTP',
      value_type: 'STRING',
      values: '',
      attributes: [],
      group: 'ENDPOINT',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'GET example');
    });

    andThen(function () {
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'true', 'The first radio is selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'false', 'The second radio is not selected');
      click('.ko-radio__label:eq(1)');
    });

    andThen(function () {
      fillIn('[name="parameters-key-0"]', 'foo');
      fillIn('[name="parameters-value-0"]', 'bar');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Endpoint: GET example');
      assert.equal($('.ko-radio__container:eq(0)').attr('aria-checked'), 'false', 'The first radio is not selected');
      assert.equal($('.ko-radio__container:eq(1)').attr('aria-checked'), 'true', 'The second radio is selected');
      assert.equal(find('[name="parameters-key-0"]').val(), 'foo');
      assert.equal(find('[name="parameters-value-0"]').val(), 'bar');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with "DATE_ABSOLUTE" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'RZ: Date',
      name: 'customfield_85',
      options: ['CHANGE'],
      input_type: 'DATE_ABSOLUTE',
      value_type: 'DATE_ABSOLUTE',
      values: '',
      attributes: [],
      group: 'CUSTOM_FIELD',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'RZ: Date');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      click('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ko-date-select__trigger');
    });

    andThen(function () {
      var dayText = (0, _moment['default'])().date().toString();
      var dayCell = find('.ko-datepicker__date--current-month').filter(function (_, el) {
        return el.textContent.trim() === dayText;
      });
      click(dayCell);
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Custom field: RZ: Date');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "MULTIPLE" action', function (assert) {
    assert.expect(10);
    server.create('automation-action-definition', {
      label: 'Bug Test',
      name: 'customfield_86',
      options: ['ADD', 'REMOVE'],
      input_type: 'MULTIPLE',
      value_type: 'COLLECTION',
      values: {
        57: 'aaa111',
        58: 'aaa112',
        59: 'aaa113',
        60: 'aaa114'
      },
      attributes: [],
      group: 'CUSTOM_FIELD',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Bug Test');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'add');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'aaa112');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'aaa114');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);

      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-multiple-option:eq(0)').text().trim(), 'aaa112');
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-multiple-option:eq(1)').text().trim(), 'aaa114');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "BOOLEAN" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Yes / No',
      name: 'customfield_84',
      options: ['CHANGE'],
      input_type: 'BOOLEAN',
      value_type: 'BOOLEAN',
      values: '',
      attributes: [],
      group: 'CUSTOM_FIELD',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Yes / No');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Yes');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Yes', 'The value is YES');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a monitor with a "Stop processing other rules" action', function (assert) {
    assert.expect(9);
    server.create('automation-action-definition', {
      label: 'Stop processing other rules',
      name: 'stoprules',
      options: ['SEND'],
      input_type: 'BOOLEAN_TRUE',
      value_type: 'BOOLEAN',
      values: [],
      attributes: [],
      group: 'FLOW_CONTROL',
      resource_type: 'automation_action_definition'
    });

    visit('/admin/automation/monitors/new');
    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');

      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Stop processing other rules');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
      assert.equal(find('.qa-admin_monitors--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The monitor has been created and it is enabled');
      assert.equal(find('.qa-admin_monitors--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled monitors');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/1');
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Flow control: Stop processing other rules');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      fillIn('input[name="title"]', 'Sample monitor name');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(2);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/automation/monitors/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors/new');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/monitors');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/sla/index-test', ['exports', 'qunit', 'frontend-cp/tests/helpers/qunit'], function (exports, _qunit, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/sla/index', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _qunit.test)('disabling an SLA', function (assert) {
    assert.expect(4);

    server.create('sla', { title: 'test sla', is_enabled: true, execution_order: 1 });

    visit('/admin/automation/sla');

    andThen(function () {
      assert.equal(find('.qa-enabled-slas .qa-sla-row').length, 1, 'SLA is enabled');
      assert.equal(find('.qa-disabled-slas .qa-sla-row').length, 0, 'Disabled SLA list is empty');
    });

    andThen(function () {
      triggerEvent('.qa-enabled-slas .qa-sla-row:eq(0)', 'mouseenter');
    });

    click('.qa-disable-sla');

    andThen(function () {
      assert.equal(find('.qa-enabled-slas .qa-sla-row').length, 0, 'Enabled SLA list is empty');
      assert.equal(find('.qa-disabled-slas .qa-sla-row').length, 1, 'SLA is disabled');
    });
  });

  (0, _qunit.test)('enabling an SLA', function (assert) {
    assert.expect(4);

    server.create('sla', { title: 'test sla', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/sla');

    andThen(function () {
      assert.equal(find('.qa-disabled-slas .qa-sla-row').length, 1, 'SLA is disabled');
      assert.equal(find('.qa-enabled-slas .qa-sla-row').length, 0, 'Enabled SLA list is empty');
    });

    andThen(function () {
      triggerEvent('.qa-disabled-slas .qa-sla-row:eq(0)', 'mouseenter');
    });

    click('.qa-enable-sla');

    andThen(function () {
      assert.equal(find('.qa-disabled-slas .qa-sla-row').length, 0, 'Disabled SLA list is empty');
      assert.equal(find('.qa-enabled-slas .qa-sla-row').length, 1, 'SLA is enabled');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/triggers/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;
  var trigger = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/triggers/edit', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      server.create('trigger-channel', { name: 'SYSTEM', events: ['TRIGGER'] });
      server.create('trigger-channel', { name: 'FACEBOOK', events: ['WALL_POST'] });

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '5': 'Closed',
          '4': 'Completed',
          '1': 'New',
          '2': 'Open',
          '3': 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '4': 'Incident',
          '3': 'Problem',
          '1': 'Question',
          '2': 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '3': 'High',
          '1': 'Low',
          '2': 'Normal',
          '4': 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          '1': 'Active',
          '3': 'Spam',
          '2': 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '0': 'unassigned',
          '(current users team)': '(current users team)',
          '5': 'Contractors',
          '3': 'Finance',
          '4': 'Human Resources',
          '1': 'Sales',
          '2': 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'breached'
        }
      });

      var proposition = server.create('proposition', {
        field: 'cases.subject',
        operator: 'string_contains',
        value: 'dave'
      });
      var collection = server.create('predicate-collection', {
        propositions: [{ id: proposition.id, resource_type: 'proposition' }]
      });
      var action = server.create('automation-action');
      trigger = server.create('trigger', {
        channel: 'SYSTEM',
        event: 'TRIGGER',
        predicate_collections: [{ id: collection.id, resource_type: 'predicate_collection' }],
        action: { id: action.id, resource_type: 'automation_action' }
      });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Edit an existing trigger', function (assert) {
    assert.expect(17);

    visit('/admin/automation/triggers/' + trigger.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      click('.ko-predicate-builder__add');
      selectChoose('.qa-channels', 'Facebook');
      selectChoose('.qa-events', 'Facebook Wall Post');

      selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:eq(1) input:last', 'collection1proposition2');

      click('.ko-predicate-builder__new');

      selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:eq(2) input:last', 'collection2proposition1');

      click('.ko-predicate-builder_proposition__remove:eq(0)');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger is still enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      assert.equal(find('.qa-channels .ember-power-select-selected-item').text().trim(), 'Facebook');
      assert.equal(find('.qa-events .ember-power-select-selected-item').text().trim(), 'Facebook Wall Post');
      assert.equal(find('.ko-predicate-builder').length, 2, 'There are 2 predicate collections');
      assert.equal(find('.ko-predicate-builder:eq(0) .qa-predicate-builder--proposition').length, 1, 'There are 1 proposition in the first predicate collection');
      assert.equal(find('.ko-predicate-builder:eq(1) .qa-predicate-builder--proposition').length, 1, 'There are 1 proposition in the second predicate collection');
      click('.ko-predicate-builder__remove:eq(0)'); // Remove the first predicate collection
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger is still enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      assert.equal(find('.ko-predicate-builder').length, 1, 'There are 1 predicate collection');
      assert.equal(find('.ko-predicate-builder:eq(0) .qa-predicate-builder--proposition').length, 1, 'There are 1 proposition in the first predicate collection');
      assert.equal(find('.ko-predicate-builder_proposition__input').val(), 'collection2proposition1', 'The proposition left is the expected one');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/automation/triggers/' + trigger.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      fillIn('input[name="title"]', 'Sample trigger name');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(2);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/automation/triggers/' + trigger.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('when any is selected for channel, null is sent for channel and event', function (assert) {
    assert.expect(3);

    server.post('/api/v1/triggers', function (schema, req) {
      var data = JSON.parse(req.requestBody);
      assert.equal(data.channel, null);
      assert.equal(data.event, null);
      return { status: 200 };
    });

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      selectChoose('.qa-channels', 'Any');
      click('.button[name=submit]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('when any is selected for event null is sent', function (assert) {
    assert.expect(3);

    server.create('trigger-channel', { name: 'FACEBOOK', events: ['MESSAGE'] });

    server.post('/api/v1/triggers', function (schema, req) {
      var data = JSON.parse(req.requestBody);
      assert.equal(data.channel, 'FACEBOOK');
      assert.equal(data.event, null);
      return { status: 200 };
    });

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      selectChoose('.qa-channels', 'Facebook');
      click('.button[name=submit]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing channel changes event to any', function (assert) {
    assert.expect(2);

    visit('/admin/automation/triggers/' + trigger.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      selectChoose('.qa-channels', 'Facebook');
    });

    andThen(function () {
      assert.equal(find('.qa-events .ember-power-select-selected-item').text().trim(), 'Any');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading a trigger that has a channel but a null event should set the event dropdown to any', function (assert) {
    assert.expect(3);

    var trigger = server.create('trigger', {
      channel: 'SYSTEM',
      event: null,
      predicate_collections: [],
      action: {}
    });

    visit('/admin/automation/triggers/' + trigger.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/' + trigger.id);
      assert.equal(find('.qa-channels .ember-power-select-selected-item').text().trim(), 'System');
      assert.equal(find('.qa-events .ember-power-select-selected-item').text().trim(), 'Any');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/triggers/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/triggers/index', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting an enabled trigger field', function (assert) {
    assert.expect(4);

    server.create('trigger', { title: 'test trigger', is_enabled: true, execution_order: 1 });

    visit('/admin/automation/triggers');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger")', 'mouseenter');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.notOk(find('span:contains("test trigger")').length > 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabled triggers can be enabled', function (assert) {
    assert.expect(6);

    server.create('trigger', { title: 'test trigger', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/triggers');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.ok(find('.qa-admin_triggers--enabled .qa-sortable-item').length === 0);
      assert.ok(find('.qa-admin_triggers--disabled').length === 1);
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger")', 'mouseenter');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger") a:contains(Enable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.ok(find('.qa-admin_triggers--enabled .qa-sortable-item').length === 1);
      assert.ok(find('.qa-admin_triggers--disabled').length === 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled triggers can be disabled', function (assert) {
    assert.expect(6);

    server.create('trigger', { title: 'test trigger', is_enabled: true, execution_order: 1 });

    visit('/admin/automation/triggers');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.ok(find('.qa-admin_triggers--enabled .qa-sortable-item').length === 1);
      assert.ok(find('.qa-admin_triggers--disabled').length === 0);
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger")', 'mouseenter');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("test trigger") a:contains(Disable)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.ok(find('.qa-admin_triggers--enabled').length === 0);
      assert.ok(find('.qa-admin_triggers--disabled').length === 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('triggers are ordered by their execution order and then grouped by enabled and disabled', function (assert) {
    assert.expect(6);

    server.create('trigger', { title: 'test trigger 5', is_enabled: false, execution_order: 5 });
    server.create('trigger', { title: 'test trigger 4', is_enabled: true, execution_order: 4 });
    server.create('trigger', { title: 'test trigger 3', is_enabled: true, execution_order: 3 });
    server.create('trigger', { title: 'test trigger 2', is_enabled: true, execution_order: 2 });
    server.create('trigger', { title: 'test trigger 1', is_enabled: false, execution_order: 1 });

    visit('/admin/automation/triggers');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test trigger 2');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test trigger 3');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test trigger 4');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(0) .t-bold').text().trim(), 'test trigger 1');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(1) .t-bold').text().trim(), 'test trigger 5');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabled triggers can be reordered', function (assert) {
    assert.expect(11);

    server.create('trigger', { title: 'test trigger 1', is_enabled: true, execution_order: 1 });
    server.create('trigger', { title: 'test trigger 2', is_enabled: true, execution_order: 2 });
    server.create('trigger', { title: 'test trigger 3', is_enabled: true, execution_order: 3 });
    server.create('trigger', { title: 'test trigger 4', is_enabled: true, execution_order: 4 });
    server.create('trigger', { title: 'test trigger 5', is_enabled: true, execution_order: 5 });

    visit('/admin/automation/triggers');

    scrollToBottomOfPage();

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test trigger 1');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test trigger 2');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test trigger 3');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(4) .t-bold').text().trim(), 'test trigger 4');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(5) .t-bold').text().trim(), 'test trigger 5');
    });

    reorderListItems('.i-dragstrip', '.t-bold', 'test trigger 5', 'test trigger 4', 'test trigger 3', 'test trigger 2', 'test trigger 1');

    andThen(function () {
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(1) .t-bold').text().trim(), 'test trigger 5');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(2) .t-bold').text().trim(), 'test trigger 4');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(3) .t-bold').text().trim(), 'test trigger 3');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(4) .t-bold').text().trim(), 'test trigger 2');
      assert.equal(find('.qa-admin_triggers--enabled li:nth-of-type(5) .t-bold').text().trim(), 'test trigger 1');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/automation/triggers/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-admin/automation-actions-builder/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoAdminAutomationActionsBuilderStyles) {
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var originalConfirm = undefined,
      role = undefined;

  function fillPredicateCollections() {
    selectChoose('.qa-predicate-builder--proposition:eq(0) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(0) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(0) input:last', 'collection1proposition1');

    click('.ko-predicate-builder__add');

    selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(1) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(1) input:last', 'collection1proposition2');

    click('.ko-predicate-builder__new');

    selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--column', 'Subject');
    selectChoose('.qa-predicate-builder--proposition:eq(2) .qa-proposition--operator', 'does not contain');
    fillIn('.qa-predicate-builder--proposition:eq(2) input:last', 'collection2proposition1');
  }

  function assertPredicateCollestionsAreCorrect(assert) {
    assert.equal($('.qa-predicate-builder--proposition:eq(0) input:last').val(), 'collection1proposition1');
    assert.equal($('.qa-predicate-builder--proposition:eq(1) input:last').val(), 'collection1proposition2');
    assert.equal($('.qa-predicate-builder--proposition:eq(2) input:last').val(), 'collection2proposition1');
  }

  function fillChannelAndEvent() {
    selectChoose('.qa-channels', 'System');
    selectChoose('.qa-events', 'Trigger');
  }

  function assertChannelAndEventAreCorrect(assert) {
    assert.equal($('.qa-channels .ember-power-select-selected-item').text().trim(), 'System');
    assert.equal($('.qa-events .ember-power-select-selected-item').text().trim(), 'Trigger rule action');
  }

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/automation/triggers/new', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      var locale = server.create('locale', {
        locale: 'en-us'
      });

      role = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      server.create('trigger-channel', { name: 'SYSTEM', events: ['TRIGGER'] });

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          5: 'Closed',
          4: 'Completed',
          1: 'New',
          2: 'Open',
          3: 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          4: 'Incident',
          3: 'Problem',
          1: 'Question',
          2: 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          3: 'High',
          1: 'Low',
          2: 'Normal',
          4: 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          1: 'Active',
          3: 'Spam',
          2: 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          1: 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          0: 'unassigned',
          '(current users team)': '(current users team)',
          5: 'Contractors',
          3: 'Finance',
          4: 'Human Resources',
          1: 'Sales',
          2: 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          1: 'breached'
        }
      });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "status" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Status',
      name: 'status',
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      options: ['CHANGE'],
      values: {
        1: 'New',
        2: 'Open',
        3: 'Resolved',
        4: 'Closed'
      }
    });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Status');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'New');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'New', 'The status is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "priority" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Priority',
      name: 'priority',
      options: ['CHANGE', 'INCREASE', 'DECREASE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        0: 'none',
        24: 'Critical',
        18: 'High',
        14: 'Low',
        26: 'Normal'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Priority');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Low');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Low', 'The priority is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "type" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Type',
      name: 'type',
      options: ['CHANGE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        0: 'none',
        24: 'Incident',
        25: 'Installation',
        2: 'Issue',
        27: 'Problem',
        26: 'Question',
        4: 'Task'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Type');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Issue');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Issue', 'The type is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "assignee" action', function (assert) {
    var _values;

    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Assignee',
      name: 'assignee',
      options: ['CHANGE'],
      input_type: 'AUTOCOMPLETE',
      value_type: 'NUMERIC',
      values: (_values = {}, _defineProperty(_values, '(current_user)', 'Current User'), _defineProperty(_values, '(requester)', 'Requester'), _values),
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('user', { full_name: 'Jane Morris', role: role });
    server.create('user', { full_name: 'Alicia Morris', role: role });
    server.create('user', { full_name: 'Ben Morris', role: role });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Assignee');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Morr');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Alicia Morris');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Alicia Morris', 'The assignee is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "assignee" action (selecting preset)', function (assert) {
    var _values2;

    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Assignee',
      name: 'assignee',
      options: ['CHANGE'],
      input_type: 'AUTOCOMPLETE',
      value_type: 'NUMERIC',
      values: (_values2 = {}, _defineProperty(_values2, '(current_user)', 'Current User'), _defineProperty(_values2, '(requester)', 'Requester'), _values2),
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('user', { full_name: 'Jane Morris', role: role });
    server.create('user', { full_name: 'Alicia Morris', role: role });
    server.create('user', { full_name: 'Ben Morris', role: role });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Assignee');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Requester');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Requester', 'The preset is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "assignee" action (searching preset)', function (assert) {
    var _values3;

    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Assignee',
      name: 'assignee',
      options: ['CHANGE'],
      input_type: 'AUTOCOMPLETE',
      value_type: 'NUMERIC',
      values: (_values3 = {}, _defineProperty(_values3, '(current_user)', 'Current User'), _defineProperty(_values3, '(requester)', 'Requester'), _values3),
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('user', { full_name: 'Jane Morris', role: role });
    server.create('user', { full_name: 'Alicia Morris', role: role });
    server.create('user', { full_name: 'Ben Morris', role: role });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Assignee');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Req');
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Requester', 'The preset is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "tags" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Tags',
      name: 'tags',
      options: ['ADD', 'REMOVE', 'REPLACE'],
      input_type: 'TAGS',
      value_type: 'COLLECTION',
      values: [],
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    server.create('tag', { name: 'status' });
    server.create('tag', { name: 'critical' });
    server.create('tag', { name: 'support' });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Tags');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'add');

      // Add an existent tag
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'stat');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'status');

      // Add a nonexistent tag
      selectSearch('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'nonexistent');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Add tag “nonexistent”');
    });

    andThen(function () {
      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger .ember-power-select-multiple-option').length, 2, 'There is two tags in this trigger');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "team" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Team',
      name: 'team',
      options: ['CHANGE'],
      input_type: 'OPTIONS',
      value_type: 'NUMERIC',
      values: {
        43: 'Billing',
        50: 'Customer Success',
        44: 'Engineering',
        46: 'Hello',
        52: 'IT',
        48: 'New Business',
        49: 'Renewals',
        14: 'Sales',
        16: 'Support'
      },
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Team');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(1)', 'change');
      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2)', 'Engineering');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(2) .ember-power-select-trigger').text().trim(), 'Engineering', 'The team is selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a trigger with a "Send satisfaction survey" action', function (assert) {
    assert.expect(11);
    server.create('automation-action-definition', {
      label: 'Satisfaction survey',
      name: 'satisfactionsurvey',
      options: ['SEND'],
      input_type: 'BOOLEAN_TRUE',
      value_type: 'BOOLEAN',
      values: [],
      attributes: [],
      group: 'CASE',
      resource_type: 'automation_action_definition'
    });
    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');

      fillChannelAndEvent();
      fillPredicateCollections();

      selectChoose('.ko-automation-actions-builder .' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0)', 'Satisfaction survey');

      click('.button[name=submit]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
      assert.equal(find('.qa-admin_triggers--enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 1, 'The trigger has been created and it is enabled');
      assert.equal(find('.qa-admin_triggers--disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row).length, 0, 'There are no disabled triggers');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default']['row--actionable']);
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/1');
      assertChannelAndEventAreCorrect(assert);
      assertPredicateCollestionsAreCorrect(assert);
      assert.equal($('.' + _frontendCpComponentsKoAdminAutomationActionsBuilderStyles['default']['small-slot'] + ':eq(0) .ember-power-select-trigger').text().trim(), 'Case: Satisfaction survey', 'The Satisfaction survey has been selected');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit having pending changes ask for confirmation', function (assert) {
    assert.expect(3);

    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      fillIn('input[name="title"]', 'Sample trigger name');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Exit without having pending changes doesn\'t ask for confirmation', function (assert) {
    assert.expect(2);

    window.confirm = function (message) {
      assert.ok(false, 'This should never be called');
      return false;
    };

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('channel and event defaults to any', function (assert) {
    assert.expect(2);

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      assert.equal(find('.qa-channels .ember-power-select-selected-item').text().trim(), 'Any');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('when any is selected for channel, null is sent for channel and event', function (assert) {
    assert.expect(3);

    server.post('/api/v1/triggers', function (schema, req) {
      var data = JSON.parse(req.requestBody);
      assert.equal(data.channel, null);
      assert.equal(data.event, null);
      return { status: 200 };
    });

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      selectChoose('.qa-channels', 'Any');
      click('.button[name=submit]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('when any is selected for event null is sent', function (assert) {
    assert.expect(3);

    server.create('trigger-channel', { name: 'FACEBOOK', events: ['MESSAGE'] });

    server.post('/api/v1/triggers', function (schema, req) {
      var data = JSON.parse(req.requestBody);
      assert.equal(data.channel, 'FACEBOOK');
      assert.equal(data.event, null);
      return { status: 200 };
    });

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      selectChoose('.qa-channels', 'Facebook');
      click('.button[name=submit]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing channel changes event to any', function (assert) {
    assert.expect(2);

    visit('/admin/automation/triggers/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/automation/triggers/new');
      selectChoose('.qa-channels', 'System');
    });

    andThen(function () {
      assert.equal(find('.qa-events .ember-power-select-selected-item').text().trim(), 'Any');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/channels/email/helpers', ['exports', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpComponentsKoSimpleListRowStyles) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var getEnabledRows = function getEnabledRows() {
    return find('.qa-mailboxes-enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };
  exports.getEnabledRows = getEnabledRows;
  var getDisabledRows = function getDisabledRows() {
    return find('.qa-mailboxes-disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };

  exports.getDisabledRows = getDisabledRows;
  var assertRow = function assertRow(assert, row, _ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var address = _ref2[0];
    var _ref2$1 = _ref2[1];
    var options = _ref2$1 === undefined ? [] : _ref2$1;
    var _ref2$2 = _ref2[2];
    var hash = _ref2$2 === undefined ? {} : _ref2$2;

    assert.ok(row.text().indexOf(address) !== -1, address + ' (Mailbox address)');
    var brand = hash.brand || 'Main Brand';
    assert.ok(row.text().indexOf('(' + brand + ')') !== -1, address + ' (Main Brand)');

    var isDefault = options.indexOf('isDefault') !== -1;
    assert[isDefault ? 'ok' : 'notOk'](row.text().indexOf('(Default)') !== -1, address + ' (Default)');
    triggerEvent(row, 'mouseenter');
    andThen(function () {
      var canEdit = options.indexOf('canEdit') !== -1;
      assert[canEdit ? 'ok' : 'notOk'](row.text().indexOf('Edit') !== -1, address + ' Editable');

      var canDisable = options.indexOf('canDisable') !== -1;
      assert[canDisable ? 'ok' : 'notOk'](row.text().indexOf('Disable') !== -1, address + ' Can be disabled');

      var canMakeDefault = options.indexOf('canMakeDefault') !== -1;
      assert[canMakeDefault ? 'ok' : 'notOk'](row.text().indexOf('Make default') !== -1, address + ' Can be made default');

      var canEnable = options.indexOf('canEnable') !== -1;
      assert[canEnable ? 'ok' : 'notOk'](row.text().indexOf('Enable') !== -1, address + ' Can be enabled');

      var canDelete = options.indexOf('canDelete') !== -1;
      assert[canDelete ? 'ok' : 'notOk'](row.text().indexOf('Delete') !== -1, address + ' Can be deleted`');
    });
    triggerEvent(row, 'mouseleave');
  };

  exports.assertRow = assertRow;
  var assertRows = function assertRows(assert) {
    var enabled = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var disabled = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var enabledRows = getEnabledRows();
    var disabledRows = getDisabledRows();
    assert.equal(enabledRows.length, enabled.length, 'Enabled mailbox count');
    assert.equal(disabledRows.length, disabled.length, 'Disabled mailbox count');

    enabled.forEach(function (row, index) {
      return assertRow(assert, enabledRows.eq(index), row);
    });
    disabled.forEach(function (row, index) {
      return assertRow(assert, disabledRows.eq(index), row);
    });
  };
  exports.assertRows = assertRows;
});
define('frontend-cp/tests/acceptance/admin/channels/email/list-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/acceptance/admin/channels/email/helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/channels/email/list', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', { id: 1, locale: 'en-us', isDefault: true });
      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      var brand = server.create('brand', { domain: 'kayako.com', name: 'Main Brand' });
      server.create('mailbox', { address: 'main@kayako.com', brand: brand, is_system: true });
      server.create('mailbox', { address: 'support@kayako.com', brand: brand, is_enabled: true, is_default: true });
      server.create('mailbox', { address: 'sales@kayako.com', brand: brand, is_enabled: true });
      server.create('mailbox', { address: 'jobs@kayako.com', brand: brand, is_enabled: false });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('listing mailboxes', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['isDefault', 'canEdit']], ['sales@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']]], [['jobs@kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabling a mailbox', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2).find('.qa-mailbox-disable'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['isDefault', 'canEdit']]], [['sales@kayako.com', ['canEdit', 'canEnable', 'canDelete']], ['jobs@kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabling a mailbox', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getDisabledRows)().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getDisabledRows)().eq(0).find('.qa-mailbox-enable'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['isDefault', 'canEdit']], ['sales@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['jobs@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a mailbox', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2), 'mouseenter');
    });
    andThen(function () {
      return confirming(true, function () {
        click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2).find('.qa-mailbox-delete'));
      });
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['isDefault', 'canEdit']]], [['jobs@kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('making mailbox default', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(2).find('.qa-mailbox-make-default'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['sales@kayako.com', ['isDefault', 'canEdit']]], [['jobs@kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('opening a mailbox edit page by clicking on the row', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(0));
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/channels/email/1');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('opening a mailbox edit page by clicking on the edit link', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.getEnabledRows)().eq(0).find('.qa-mailbox-edit'));
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/channels/email/1');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/channels/email/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/acceptance/admin/channels/email/helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/channels/email/list', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', { id: 1, locale: 'en-us', isDefault: true });
      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      var brand = server.create('brand', { domain: 'kayako.com', name: 'Main Brand' });
      server.create('brand', { domain: 'kayako.com', name: 'Second Brand' });
      server.create('mailbox', { address: 'main@kayako.com', brand: brand, is_system: true });
      server.create('mailbox', { address: 'support@kayako.com', brand: brand, is_enabled: true, is_default: true });
      server.create('mailbox', { address: 'sales@kayako.com', brand: brand, is_enabled: true });
      server.create('mailbox', { address: 'jobs@kayako.com', brand: brand, is_enabled: false });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new mailbox', function (assert) {
    visit('/admin/channels/email');
    andThen(function () {
      return click('.qa-admin-email-new-link');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/channels/email/new');
    });
    andThen(function () {
      return fillIn('.qa-email-edit-address', 'hello@kayako.com');
    });
    andThen(function () {
      return selectChoose('.qa-email-edit-brand', 'Second Brand');
    });
    andThen(function () {
      return click('button[type=submit]');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/channels/email');
    });
    andThen(function () {
      return (0, _frontendCpTestsAcceptanceAdminChannelsEmailHelpers.assertRows)(assert, [['main@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault']], ['support@kayako.com', ['isDefault', 'canEdit']], ['sales@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['hello@kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete'], { brand: 'Second Brand' }]], [['jobs@kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/channels/messenger/code-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/channels/messenger/code Code', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      var locale = server.create('locale', { locale: 'en-us' });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('visiting /admin/channels/messenger/code', function (assert) {
    visit('/admin/channels/messenger/code');

    andThen(function () {
      assert.equal(currentURL(), '/admin/channels/messenger/code');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('default brand should be selected by default', function (assert) {
    server.create('brand', {
      is_enabled: true,
      is_default: true,
      locale: null,
      alias: null,
      domain: 'kayako.com',
      sub_domain: 'support',
      name: 'Kayako Support',
      resource_type: 'brand',
      created_at: '2015-08-05T06:13:59Z',
      resource_url: 'http://novo/api/index.php?/v1/brands/1',
      updated_at: '2015-08-05T06:13:59Z',
      url: null
    });

    visit('/admin/channels/messenger/code');

    andThen(function () {
      assert.equal(find('.brand').text().trim(), 'Kayako Support');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('inherit messenge title from selected brand', function (assert) {
    server.create('brand', {
      is_enabled: true,
      is_default: true,
      locale: null,
      alias: null,
      domain: 'kayako.com',
      sub_domain: 'support',
      name: 'Kayako Support',
      resource_type: 'brand',
      created_at: '2015-08-05T06:13:59Z',
      resource_url: 'http://novo/api/index.php?/v1/brands/1',
      updated_at: '2015-08-05T06:13:59Z',
      url: null
    });

    visit('/admin/channels/messenger/code');

    andThen(function () {
      assert.equal(find('.messenger-title').val(), 'Kayako Support');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('inherit welcome message from selected brand', function (assert) {
    server.create('brand', {
      is_enabled: true,
      is_default: true,
      locale: null,
      alias: null,
      domain: 'kayako.com',
      sub_domain: 'support',
      name: 'Kayako Support',
      resource_type: 'brand',
      created_at: '2015-08-05T06:13:59Z',
      resource_url: 'http://novo/api/index.php?/v1/brands/1',
      updated_at: '2015-08-05T06:13:59Z',
      url: null
    });

    visit('/admin/channels/messenger/code');

    andThen(function () {
      assert.equal(/Kayako Support/.test(find('.messenger-title').val()), true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('should generate embed code with correct apiUrl and team name', function (assert) {
    var brand = {
      is_enabled: true,
      is_default: true,
      locale: null,
      alias: null,
      domain: 'kayako.com',
      sub_domain: 'support',
      name: 'Kayako Support',
      resource_type: 'brand',
      created_at: '2015-08-05T06:13:59Z',
      resource_url: 'http://novo/api/index.php?/v1/brands/1',
      updated_at: '2015-08-05T06:13:59Z',
      url: null
    };
    server.create('brand', brand);

    visit('/admin/channels/messenger/code');

    andThen(function () {
      var generatedCode = find('.generated-code').val();
      var apiUrl = 'apiUrl:"https://' + brand.sub_domain + '.' + brand.domain + '/api/v1"';
      var teamName = 'defaultName:"' + brand.name + '"';
      assert.equal(generatedCode.indexOf(apiUrl) > -1, true);
      assert.equal(generatedCode.indexOf(teamName) > -1, true);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cdnUrl should inherit from the brand subdomain', function (assert) {
    var brand = {
      is_enabled: true,
      is_default: true,
      locale: null,
      alias: null,
      domain: 'kayako.com',
      sub_domain: 'foo',
      name: 'Kayako Support',
      resource_type: 'brand',
      created_at: '2015-08-05T06:13:59Z',
      resource_url: 'http://novo/api/index.php?/v1/brands/1',
      updated_at: '2015-08-05T06:13:59Z',
      url: null
    };
    server.create('brand', brand);

    visit('/admin/channels/messenger/code');

    andThen(function () {
      var generatedCode = find('.generated-code').val();
      var apiUrl = 'cdnUrl:"https://' + brand.sub_domain + '.' + brand.domain + '/__apps/widget/assets/visitor"';
      var teamName = 'defaultName:"' + brand.name + '"';
      assert.equal(generatedCode.indexOf(apiUrl) > -1, true);
      assert.equal(generatedCode.indexOf(teamName) > -1, true);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/brands/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/acceptance/admin/manage/brands/helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsAcceptanceAdminManageBrandsHelpers) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/brands/edit', {
    beforeEach: function beforeEach() {
      var en = server.create('locale', { id: 1, locale: 'en-us', name: 'English', is_public: true, is_localised: true });

      var brand = server.create('brand', { id: 1, locale: en, is_enabled: true, name: 'Default', domain: 'kayako.com', sub_domain: 'support', is_default: true });
      server.create('brand', { id: 2, locale: en, is_enabled: true, name: 'Custom Alias', domain: 'kayako.com', sub_domain: 'custom_alias', is_default: false, alias: 'example.com' });
      server.create('brand', { id: 3, locale: en, is_enabled: false, name: 'Disabled', domain: 'kayako.com', sub_domain: 'disabled', is_default: false });

      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: en, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('setting', {
        id: 'account.default_language',
        value: 'en-us'
      });

      server.create('locale', { id: 2, locale: 'fr-fr', name: 'French', is_public: true, is_localised: true });
      server.create('locale', { id: 3, locale: 'de-de', name: 'German', is_public: true, is_localised: true });
      server.create('locale', { id: 4, locale: 'ru-ru', name: 'Russian', is_public: true, is_localised: true });

      server.create('template', {
        brand: brand,
        name: 'cases_email_notification',
        contents: '{{ foo }}',
        resource_url: 'http://localhost:4200/api/v1/brands/' + brand.id + '/templates/cases_email_notification'
      });

      server.create('template', {
        brand: brand,
        name: 'base_email_notification',
        contents: '{{ bar }}',
        resource_url: 'http://localhost:4200/api/v1/brands/' + brand.id + '/templates/base_email_notification'
      });

      server.create('template', {
        brand: brand,
        name: 'cases_email_satisfaction',
        contents: '{{ baz }}',
        resource_url: 'http://localhost:4200/api/v1/brands/' + brand.id + '/templates/cases_email_satisfaction'
      });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing brand', function (assert) {
    visit('/admin/manage/brands/2');
    andThen(function () {
      return fillIn('.qa-brand-edit-name', 'Another name');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-alias', 'dremora.com');
    });
    andThen(function () {
      return click('button[type=submit]');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands');
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Another name', 'dremora.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['Default', 'support.kayako.com', ['isDefault', 'canEdit']]], [['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing brand SSL settings', function (assert) {
    visit('/admin/manage/brands/2');
    andThen(function () {
      return fillIn('.qa-brand-edit-name', 'Another name');
    });
    andThen(function () {
      return assert.ok(find('.qa-brand-edit-ssl-edit').text().includes('Set certificate'), 'button says "Set certificate"');
    });
    andThen(function () {
      return click('.qa-brand-edit-ssl-edit');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-ssl-certificate', 'certificate');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-private-key', 'private key');
    });
    andThen(function () {
      return click('button[type=submit]');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands');
    });
    visit('/admin/manage/brands/2');
    andThen(function () {
      return assert.ok(find('.qa-brand-edit-ssl-edit').text().includes('Replace certificate'), 'button says "Replace certificate"');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing brand templates', function (assert) {
    visit('/admin/manage/brands/1/templates');
    andThen(function () {
      return assert.equal(find('.qa-brand-edit-templates-reply').val(), '{{ foo }}', 'Reply says "{{ foo }}"');
    });
    andThen(function () {
      return assert.equal(find('.qa-brand-edit-templates-notification').val(), '{{ bar }}', 'Reply says "{{ bar }}"');
    });
    andThen(function () {
      return assert.equal(find('.qa-brand-edit-templates-satisfaction-survey').val(), '{{ baz }}', 'Reply says "{{ baz }}"');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-templates-reply', '{{ contents }}');
    });
    andThen(function () {
      return click('button[type=button].button--primary');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands/1');
    });
    visit('/admin/manage/brands/1/templates');
    andThen(function () {
      return assert.equal(find('.qa-brand-edit-templates-reply').val(), '{{ contents }}', 'Reply says "{{ contents }}"');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/brands/helpers', ['exports', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpComponentsKoSimpleListRowStyles) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var getEnabledRows = function getEnabledRows() {
    return find('.qa-brands-enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };
  exports.getEnabledRows = getEnabledRows;
  var getDisabledRows = function getDisabledRows() {
    return find('.qa-brands-disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };

  exports.getDisabledRows = getDisabledRows;
  var assertRow = function assertRow(assert, row, _ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var name = _ref2[0];
    var domain = _ref2[1];
    var _ref2$2 = _ref2[2];
    var options = _ref2$2 === undefined ? [] : _ref2$2;

    assert.ok(row.text().indexOf(name) !== -1, 'Name is correct');

    var isDefault = options.indexOf('isDefault') !== -1;
    assert[isDefault ? 'ok' : 'notOk'](row.text().indexOf('(Default)') !== -1, name + ': (Default)');

    triggerEvent(row, 'mouseenter');
    andThen(function () {
      var canEdit = options.indexOf('canEdit') !== -1;
      assert[canEdit ? 'ok' : 'notOk'](row.find('a').text().indexOf('Edit') !== -1, name + ': Can be edited');

      var canDisable = options.indexOf('canDisable') !== -1;
      assert[canDisable ? 'ok' : 'notOk'](row.find('a').text().indexOf('Disable') !== -1, name + ': Can be disabled');

      var canEnable = options.indexOf('canEnable') !== -1;
      assert[canEnable ? 'ok' : 'notOk'](row.find('a').text().indexOf('Enable') !== -1, name + ': Can be enabled');

      var canMakeDefault = options.indexOf('canMakeDefault') !== -1;
      assert[canMakeDefault ? 'ok' : 'notOk'](row.find('a').text().indexOf('Make default') !== -1, name + ': Can be made default');

      var canDelete = options.indexOf('canDelete') !== -1;
      assert[canDelete ? 'ok' : 'notOk'](row.find('a').text().indexOf('Delete') !== -1, name + ': Can be removed');
    });
    triggerEvent(row, 'mouseleave');
  };

  exports.assertRow = assertRow;
  var assertRows = function assertRows(assert) {
    var enabled = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var disabled = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var enabledRows = getEnabledRows();
    var disabledRows = getDisabledRows();
    assert.equal(enabledRows.length, enabled.length, 'Enabled brand count');
    assert.equal(disabledRows.length, disabled.length, 'Disabled brand count');

    enabled.forEach(function (row, index) {
      return assertRow(assert, enabledRows.eq(index), row);
    });
    disabled.forEach(function (row, index) {
      return assertRow(assert, disabledRows.eq(index), row);
    });
  };
  exports.assertRows = assertRows;
});
define('frontend-cp/tests/acceptance/admin/manage/brands/list-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/acceptance/admin/manage/brands/helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsAcceptanceAdminManageBrandsHelpers) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/brands', {
    beforeEach: function beforeEach() {
      var en = server.create('locale', { id: 1, locale: 'en-us', name: 'English', is_public: true, is_localised: true });

      server.create('brand', { id: 1, locale: en, is_enabled: true, name: 'Default', domain: 'kayako.com', sub_domain: 'support', is_default: true });
      server.create('brand', { id: 2, locale: en, is_enabled: true, name: 'Custom Alias', domain: 'kayako.com', sub_domain: 'custom_alais', is_default: false, alias: 'example.com' });
      server.create('brand', { id: 3, locale: en, is_enabled: false, name: 'Disabled', domain: 'kayako.com', sub_domain: 'disabled', is_default: false });

      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: en, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('listing brands', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Custom Alias', 'example.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['Default', 'support.kayako.com', ['isDefault', 'canEdit']]], [['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabling a brand', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0).find('.qa-brand-disable'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Default', 'support.kayako.com', ['isDefault', 'canEdit']]], [['Custom Alias', 'example.com', ['canEdit', 'canEnable', 'canDelete']], ['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabling a brand', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getDisabledRows)().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getDisabledRows)().eq(0).find('.qa-brand-enable'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Custom Alias', 'example.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['Default', 'support.kayako.com', ['isDefault', 'canEdit']], ['Disabled', 'disabled.kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']]], []);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a brand', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(1), 'mouseenter');
    });
    andThen(function () {
      return confirming(true, function () {
        click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0).find('.qa-brand-delete'));
      });
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Default', 'support.kayako.com', ['isDefault', 'canEdit']]], [['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('making a brand default', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(1), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0).find('.qa-brand-make-default'));
    });
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Custom Alias', 'example.com', ['isDefault', 'canEdit']], ['Default', 'support.kayako.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']]], [['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });
  //
  (0, _frontendCpTestsHelpersQunit.test)('opening a brand edit page by clicking on the row', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0));
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands/2');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('opening a brand edit page by clicking on the edit link', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return triggerEvent((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click((0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.getEnabledRows)().eq(0).find('.qa-brand-edit'));
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands/2');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/brands/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/acceptance/admin/manage/brands/helpers', 'frontend-cp/components/ko-admin/brands/form/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsAcceptanceAdminManageBrandsHelpers, _frontendCpComponentsKoAdminBrandsFormStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/brands/new', {
    beforeEach: function beforeEach() {
      var en = server.create('locale', { id: 1, locale: 'en-us', name: 'English', is_public: true, is_localised: true });

      server.create('brand', { id: 1, locale: en, is_enabled: true, name: 'Default', domain: 'kayako.com', sub_domain: 'support', is_default: true });
      server.create('brand', { id: 2, locale: en, is_enabled: true, name: 'Custom Alias', domain: 'kayako.com', sub_domain: 'custom_alias', is_default: false, alias: 'example.com' });
      server.create('brand', { id: 3, locale: en, is_enabled: false, name: 'Disabled', domain: 'kayako.com', sub_domain: 'disabled', is_default: false });

      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: en, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('setting', {
        id: 'account.default_language',
        value: 'en-us'
      });

      server.create('locale', { id: 2, locale: 'fr-fr', name: 'French', is_public: true, is_localised: true });
      server.create('locale', { id: 3, locale: 'de-de', name: 'German', is_public: true, is_localised: true });
      server.create('locale', { id: 4, locale: 'ru-ru', name: 'Russian', is_public: true, is_localised: true });

      server.create('plan', { limits: { brands: 10 }, features: [], account_id: '123', subscription_id: '123' });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new brand', function (assert) {
    visit('/admin/manage/brands');
    andThen(function () {
      return click('.button:contains("Create a new Brand")');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands/new');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-name', 'My New Brand');
    });
    andThen(function () {
      return selectChoose('.qa-brand-edit-locale', 'Russian');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-subdomain input', 'support');
    });
    andThen(function () {
      var text = 'this domain is not available, try another one';
      assert.notEqual(find('.' + _frontendCpComponentsKoAdminBrandsFormStyles['default']['domain-not-available']).text().indexOf(text), -1, '"domain unavailable" text is shown');
      assert.equal($('button[type=submit][disabled]').length, 2, 'submit is disabled');
    });
    andThen(function () {
      return fillIn('.qa-brand-edit-subdomain input', 'my-new-brand');
    });
    andThen(function () {
      var text = 'this domain name is available!';
      assert.notEqual(find('.' + _frontendCpComponentsKoAdminBrandsFormStyles['default']['domain-available']).text().indexOf(text), -1, '"domain available" text is shown');
      assert.equal($('button[type=submit][disabled]').length, 0, 'submit is enabled');
    });
    andThen(function () {
      return click('button[type=submit]');
    });
    andThen(function () {
      return assert.equal(currentURL(), '/admin/manage/brands/4');
    });
    visit('/admin/manage/brands');
    andThen(function () {
      (0, _frontendCpTestsAcceptanceAdminManageBrandsHelpers.assertRows)(assert, [['Custom Alias', 'example.com', ['canEdit', 'canDisable', 'canMakeDefault', 'canDelete']], ['Default', 'support.kayako.com', ['isDefault', 'canEdit']]], [['Disabled', 'disabled.kayako.com', ['canEdit', 'canEnable', 'canDelete']], ['My New Brand', 'mynewbrand.kayako.com', ['canEdit', 'canEnable', 'canDelete']]]);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/delete-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;
  var fieldTitle = 'test field';

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/case fields/delete', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var customerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var descriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: fieldTitle,
        customer_titles: [{
          id: customerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: descriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        is_system: false
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a text field', function (assert) {
    assert.expect(4);

    visit('/admin/manage/case-fields');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '")', 'mouseenter');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      assert.notOk(find('span:contains("' + fieldTitle + '")').length > 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-toggle/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoToggleStyles) {

  var textFieldTitle = 'text field';
  var textAreaFieldTitle = 'text area field';
  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var numericFieldTitle = 'numeric field';
  var decimalFieldTitle = 'decimal field';
  var fileFieldTitle = 'file field';
  var yesNoFieldTitle = 'yes no field';
  var cascadingSelectFieldTitle = 'cascading select field';
  var dateFieldTitle = 'date field';
  var regexFieldTitle = 'regex field';

  var customerTitle = 'customer title';
  var description = 'description';
  var optionTitle = 'option title';
  var regEx = 'regEx';

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/case fields/edit', {
    beforeEach: function beforeEach() {
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var textCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: textFieldTitle,
        type: 'TEXT',
        is_system: false,
        customer_titles: [{
          id: textCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var textAreaCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textAreaDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: textAreaFieldTitle,
        type: 'TEXTAREA',
        is_system: false,
        customer_titles: [{
          id: textAreaCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textAreaDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var radioCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOption = server.create('field-option', {
        values: [{
          id: radioOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('case-field', {
        title: radioFieldTitle,
        type: 'RADIO',
        is_system: false,
        customer_titles: [{
          id: radioCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: radioDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: radioOption.id,
          resource_type: 'field_option'
        }]
      });
      var selectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOption = server.create('field-option', {
        values: [{
          id: selectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('case-field', {
        title: normalSelectFieldTitle,
        type: 'SELECT',
        is_system: false,
        customer_titles: [{
          id: selectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: selectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: selectOption.id,
          resource_type: 'field_option'
        }]
      });
      var checkboxCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOption = server.create('field-option', {
        values: [{
          id: checkboxOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('case-field', {
        title: checkboxFieldTitle,
        type: 'CHECKBOX',
        is_system: false,
        customer_titles: [{
          id: checkboxCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: checkboxDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: checkboxOption.id,
          resource_type: 'field_option'
        }]
      });
      var numericCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var numericDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: numericFieldTitle,
        type: 'NUMERIC',
        is_system: false,
        customer_titles: [{
          id: numericCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: numericDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var decimalCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var decimalDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: decimalFieldTitle,
        type: 'DECIMAL',
        is_system: false,
        customer_titles: [{
          id: decimalCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: decimalDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var fileCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var fileDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: fileFieldTitle,
        type: 'FILE',
        is_system: false,
        customer_titles: [{
          id: fileCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: fileDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var yesNoCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var yesNoDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: yesNoFieldTitle,
        type: 'YESNO',
        is_system: false,
        customer_titles: [{
          id: yesNoCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: yesNoDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var cascadingSelectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOption = server.create('field-option', {
        values: [{
          id: cascadingSelectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('case-field', {
        title: cascadingSelectFieldTitle,
        type: 'CASCADINGSELECT',
        is_system: false,
        customer_titles: [{
          id: cascadingSelectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: cascadingSelectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: cascadingSelectOption.id,
          resource_type: 'field_option'
        }]
      });
      var dateCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var dateDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: dateFieldTitle,
        type: 'DATE',
        is_system: false,
        customer_titles: [{
          id: dateCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: dateDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var regexCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var regexDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('case-field', {
        title: regexFieldTitle,
        type: 'REGEX',
        is_system: false,
        customer_titles: [{
          id: regexCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: regexDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        regular_expression: '^(.*)'
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      findWithAssert('.qa-admin_case-fields_edit__api-key');

      fillIn('input.ko-admin_case-fields_edit__title', textFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text area field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', textAreaFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textAreaFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a radio field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', radioFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), radioFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', normalSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), normalSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a checkbox field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', checkboxFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), checkboxFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a numeric field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', numericFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), numericFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a decimal field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', decimalFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), decimalFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a file field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', fileFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fileFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a yes no field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', yesNoFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), yesNoFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a cascading select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', cascadingSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), cascadingSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a date field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', dateFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), dateFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a regular expression field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', regexFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), regexFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=false]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancelling an edit', function (assert) {
    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', 'edited field title');

      fillIn('input.ko-admin_case-fields_edit__customer-title', 'edited customer title');
      fillIn('textarea.ko-admin_case-fields_edit__description', 'edited description');
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), 'text field');
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), 'locale specific text here');
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), 'locale specific text here');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=true]');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/manage-priorities-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var caseFieldId = 1;

  (0, _qunit.module)('Acceptance | admin/manage/cases/priorities', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();
      var role = server.create('role', { type: 'ADMIN' });
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var agent = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      login(session.id);

      server.create('case-field', {
        id: caseFieldId,
        title: 'Priority',
        is_system: true, // eslint-disable-line camelcase
        type: 'PRIORITY'
      });

      server.createList('case-priority', 3, {
        label: function label(i) {
          return 'Test Priority ' + (i + 1);
        },
        is_system: false, // eslint-disable-line camelcase
        type: 'CUSTOM',
        is_sla_active: false // eslint-disable-line camelcase
      });
      var prioritiesFeature = server.create('feature', { code: 'custom_case_priorities' });
      server.create('plan', { limits: { agents: 20 }, features: [prioritiesFeature], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('reordering a priority', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    andThen(function () {
      var handleSelector = '.ko-reorderable-list_item_handle';
      var items = findWithAssert(handleSelector);
      var sortedItems = [items[1], items[0], items[2]];

      items[2].scrollIntoView();
      reorder.apply(undefined, ['mouse', handleSelector].concat(sortedItems));
    });

    andThen(function () {
      assert.deepEqual(find('.qa-custom-priority-label').toArray().map(function (l) {
        return $(l).text().trim();
      }), ['Test Priority 2', 'Test Priority 1', 'Test Priority 3']);
    });
  });

  (0, _qunit.test)('creating a priority', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    click('.qa-priorities__add-priority-message');
    fillIn('.qa-custom-priority-label-input', 'New Priority');
    click('.qa-custom-priority-save');

    andThen(function () {
      assert.equal(find('.qa-custom-priority-label:contains("New Priority")').length, 1);
    });
  });

  (0, _qunit.test)('editing a priority', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
    click('.qa-custom-priority-edit:first');
    fillIn('.qa-custom-priority-label-input', 'Edited Priority');
    click('.qa-custom-priority-save');

    andThen(function () {
      assert.equal(find('.qa-custom-priority-label:contains("Edited Priority")').length, 1);
      assert.equal(find('.qa-custom-priority-label:contains("Test Priority 1")').length, 0);
    });
  });

  (0, _qunit.test)('deleting a priority', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(true, function () {
      click('.qa-custom-priority-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-priority-label:contains("Test Priority 1")').length, 0);
    });
  });

  (0, _qunit.test)('cancelling deletion of a priority', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(false, function () {
      click('.qa-custom-priority-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-priority-label:contains("Test Priority 1")').length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/manage-statuses-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var caseFieldId = 1;

  (0, _qunit.module)('Acceptance | admin/manage/cases/statuses', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();

      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var role = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      login(session.id);

      server.create('case-field', {
        id: caseFieldId,
        title: 'Status',
        is_system: true,
        type: 'STATUS'
      });

      server.createList('case-status', 3, {
        label: function label(i) {
          return 'Test Status ' + (i + 1);
        },
        is_system: false,
        type: 'CUSTOM',
        is_sla_active: false
      });
      var statusesFeature = server.create('feature', { code: 'custom_case_statuses' });
      server.create('plan', { limits: { agents: 20 }, features: [statusesFeature], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('reordering a status', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    andThen(function () {
      var handleSelector = '.ko-reorderable-list_item_handle';
      var items = findWithAssert(handleSelector);
      var sortedItems = [items[1], items[0], items[2]];

      items[2].scrollIntoView();
      reorder.apply(undefined, ['mouse', handleSelector].concat(sortedItems));
    });

    andThen(function () {
      assert.deepEqual(find('.qa-custom-status-label').toArray().map(function (l) {
        return $(l).text().trim();
      }), ['Test Status 2', 'Test Status 1', 'Test Status 3']);
    });
  });

  (0, _qunit.test)('creating a status', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    click('.statuses__add-status-message');
    fillIn('.qa-custom-status-label-input', 'New Status');
    click('.qa-custom-status-sla-toggle div[role="radio"]');
    click('.qa-custom-status-save');

    andThen(function () {
      assert.equal(find('.qa-custom-status-label:contains("New Status")').length, 1);
      assert.equal(find('.qa-custom-status-sla-active:contains("SLA timers active")').length, 1);
    });
  });

  (0, _qunit.test)('editing a status', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
    click('.qa-custom-status-edit:first');
    fillIn('.qa-custom-status-label-input', 'Edited Status');
    click('.qa-custom-status-save');

    andThen(function () {
      assert.equal(find('.qa-custom-status-label:contains("Edited Status")').length, 1);
      assert.equal(find('.qa-custom-status-label:contains("Test Status 1")').length, 0);
    });
  });

  (0, _qunit.test)('deleting a status', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(true, function () {
      click('.qa-custom-status-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-status-label:contains("Test Status 1")').length, 0);
    });
  });

  (0, _qunit.test)('cancelling deletion of a status', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(false, function () {
      click('.qa-custom-status-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-status-label:contains("Test Status 1")').length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/manage-types-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var caseFieldId = 1;

  (0, _qunit.module)('Acceptance | admin/manage/cases/types', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();

      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var role = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: role, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      login(session.id);

      server.create('case-field', {
        id: caseFieldId,
        title: 'Type',
        is_system: true,
        type: 'TYPE'
      });

      server.createList('case-type', 3, {
        label: function label(i) {
          return 'Test Type ' + (i + 1);
        },
        type: 'CUSTOM'
      });
      var typesFeature = server.create('feature', { code: 'custom_case_types' });
      server.create('plan', { limits: { agents: 20 }, features: [typesFeature], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('creating a type', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    click('.types__add-type-message');
    fillIn('.qa-custom-type-label-input', 'New Type');
    click('.qa-custom-type-save');

    andThen(function () {
      assert.equal(find('.qa-custom-type-label:contains("New Type")').length, 1);
    });
  });

  (0, _qunit.test)('editing a type', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    andThen(function () {
      click('.qa-custom-type-edit:first');
      fillIn('.qa-custom-type-label-input', 'Edited Type');
      click('.qa-custom-type-save');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-type-label:contains("Edited Type")').length, 1);
      assert.equal(find('.qa-custom-type-label:contains("Test Type 1")').length, 0);
    });
  });

  (0, _qunit.test)('deleting a type', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(true, function () {
      click('.qa-custom-type-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-type-label:contains("Test Type 1")').length, 0);
    });
  });

  (0, _qunit.test)('cancelling deletion of a type', function (assert) {
    visit('/admin/manage/case-fields/' + caseFieldId);

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(false, function () {
      click('.qa-custom-type-delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-custom-type-label:contains("Test Type 1")').length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/case fields/new', {
    beforeEach: function beforeEach() {
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: { id: locale.id, resource_type: 'locale' }, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new field sends locale fields for all public locales', function (assert) {
    assert.expect(7);

    server.create('locale', {
      id: 2,
      locale: 'es',
      is_public: false
    });

    visit('/admin/manage/case-fields/new/TEXT');

    server.post('/api/v1/cases/fields', function (schema, request) {
      var requestData = JSON.parse(request.requestBody);
      assert.equal(requestData.customer_titles.length, 1, '1 customer title');
      assert.equal(requestData.descriptions.length, 1, '1 description');
      assert.equal(requestData.customer_titles[0].locale, 'en-us', 'customer title locale');
      assert.equal(requestData.customer_titles[0].translation, null, 'customer title translation');
      assert.equal(requestData.descriptions[0].locale, 'en-us', 'description locale');
      assert.equal(requestData.descriptions[0].translation, null, 'description translation');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/TEXT');

      fillIn('input.ko-admin_case-fields_edit__title', 'fieldTitle');
      click('.button--primary:first');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/TEXT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/TEXT');
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 0);
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text area field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/TEXTAREA');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/TEXTAREA');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Multi-line text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new radio field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/manage/case-fields/new/RADIO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/RADIO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Radio buttons (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new dropdown box field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/manage/case-fields/new/SELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/SELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Dropdown list (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new checkbox field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/manage/case-fields/new/CHECKBOX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/CHECKBOX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Checkboxes (multiple choices) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new numeric field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/NUMERIC');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/NUMERIC');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Numerical input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new decimal field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/DECIMAL');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/DECIMAL');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Decimal input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new file field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/FILE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/FILE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / File upload / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new yes/no toggle field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/YESNO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/YESNO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Yes/No toggle / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new cascading select field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/manage/case-fields/new/CASCADINGSELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/CASCADINGSELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Cascading select / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new date field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/manage/case-fields/new/DATE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/DATE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Date / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new regular expression field', function (assert) {
    assert.expect(8);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var regEx = 'regex';

    visit('/admin/manage/case-fields/new/REGEX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields/new/REGEX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / Regular expression / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Case fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-fields/reorder-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var cascadingSelectFieldTitle = 'cascading select field';
  var priorityFieldTitle = 'priority field';

  var option1Title = 'option title 1';
  var option2Title = 'option title 2';
  var option3Title = 'option title 3';
  var option4Title = 'option title 4';

  (0, _qunit.module)('Acceptance | admin/manage/case fields/reorder', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();
      /*eslint-disable camelcase*/
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var radioOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var radioOption1 = server.create('field-option', {
        values: [{ id: radioOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var radioOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var radioOption2 = server.create('field-option', {
        values: [{ id: radioOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var radioOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var radioOption3 = server.create('field-option', {
        values: [{ id: radioOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var radioOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var radioOption4 = server.create('field-option', {
        values: [{ id: radioOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('case-field', {
        title: radioFieldTitle,
        is_system: false,
        type: 'RADIO',
        options: [{ id: radioOption1.id, resource_type: 'field_option' }, { id: radioOption2.id, resource_type: 'field_option' }, { id: radioOption3.id, resource_type: 'field_option' }, { id: radioOption4.id, resource_type: 'field_option' }]
      });
      var normalSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var normalSelectOption1 = server.create('field-option', {
        values: [{ id: normalSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var normalSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var normalSelectOption2 = server.create('field-option', {
        values: [{ id: normalSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var normalSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var normalSelectOption3 = server.create('field-option', {
        values: [{ id: normalSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var normalSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var normalSelectOption4 = server.create('field-option', {
        values: [{ id: normalSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('case-field', {
        title: normalSelectFieldTitle,
        is_system: false,
        type: 'SELECT',
        options: [{ id: normalSelectOption1.id, resource_type: 'field_option' }, { id: normalSelectOption2.id, resource_type: 'field_option' }, { id: normalSelectOption3.id, resource_type: 'field_option' }, { id: normalSelectOption4.id, resource_type: 'field_option' }]
      });
      var checkboxOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var checkboxOption1 = server.create('field-option', {
        values: [{ id: checkboxOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var checkboxOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var checkboxOption2 = server.create('field-option', {
        values: [{ id: checkboxOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var checkboxOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var checkboxOption3 = server.create('field-option', {
        values: [{ id: checkboxOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var checkboxOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var checkboxOption4 = server.create('field-option', {
        values: [{ id: checkboxOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('case-field', {
        title: checkboxFieldTitle,
        is_system: false,
        type: 'CHECKBOX',
        options: [{ id: checkboxOption1.id, resource_type: 'field_option' }, { id: checkboxOption2.id, resource_type: 'field_option' }, { id: checkboxOption3.id, resource_type: 'field_option' }, { id: checkboxOption4.id, resource_type: 'field_option' }]
      });
      var cascadingSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var cascadingSelectOption1 = server.create('field-option', {
        values: [{ id: cascadingSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var cascadingSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var cascadingSelectOption2 = server.create('field-option', {
        values: [{ id: cascadingSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var cascadingSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var cascadingSelectOption3 = server.create('field-option', {
        values: [{ id: cascadingSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var cascadingSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var cascadingSelectOption4 = server.create('field-option', {
        values: [{ id: cascadingSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('case-field', {
        title: cascadingSelectFieldTitle,
        is_system: false,
        type: 'CASCADINGSELECT',
        options: [{ id: cascadingSelectOption1.id, resource_type: 'field_option' }, { id: cascadingSelectOption2.id, resource_type: 'field_option' }, { id: cascadingSelectOption3.id, resource_type: 'field_option' }, { id: cascadingSelectOption4.id, resource_type: 'field_option' }]
      });
      server.create('case-priority', {
        label: option1Title,
        sort_order: 1
      });
      server.create('case-priority', {
        label: option2Title,
        sort_order: 2
      });
      server.create('case-priority', {
        label: option3Title,
        sort_order: 3
      });
      server.create('case-priority', {
        label: option4Title,
        sort_order: 4
      });
      server.create('case-field', {
        title: priorityFieldTitle,
        is_system: false,
        type: 'PRIORITY'
      });
      var agentRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable camelcase*/
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('reordering a radio field', function (assert) {
    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + radioFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a select field', function (assert) {
    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + normalSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a checkbox field', function (assert) {
    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + checkboxFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a cascading select field', function (assert) {
    visit('/admin/manage/case-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + cascadingSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering fields', function (assert) {
    visit('/admin/manage/case-fields');

    andThen(function () {
      var handleSelector = '.ko-reorderable-list_item_handle';
      var items = findWithAssert(handleSelector);
      var sortedItems = [items[1], items[2], items[3], items[4], items[0]];

      items[0].scrollIntoView();
      reorder.apply(undefined, ['mouse', handleSelector].concat(sortedItems));
    });

    andThen(function () {
      assert.deepEqual(find('.qa-custom-case-field-label').toArray().map(function (l) {
        return $(l).text().trim();
      }), ['normal select field', 'checkbox field', 'cascading select field', 'priority field', 'radio field']);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/case-forms-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'npm:lodash', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-simple-list/cell/styles', 'frontend-cp/components/ko-simple-list/actions/styles', 'frontend-cp/components/ko-toggle/styles'], function (exports, _frontendCpTestsHelpersQunit, _npmLodash, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoSimpleListCellStyles, _frontendCpComponentsKoSimpleListActionsStyles, _frontendCpComponentsKoToggleStyles) {

  var brand = undefined,
      locale = undefined,
      originalConfirm = undefined;
  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Admin | Manage | Case Forms', {
    beforeEach: function beforeEach() {
      var emails = [server.create('identity-email', { email: 'first@example.com', is_primary: true, is_validated: true }), server.create('identity-email', { email: 'second@example.com', is_primary: false, is_validated: true }), server.create('identity-email', { email: 'third@example.com', is_primary: false, is_validated: false })];
      locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { emails: emails, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      brand = server.create('brand', { name: 'Brewfictus', locale: locale });
      originalConfirm = window.confirm;
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
      window.confirm = originalConfirm;
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating Case Form followed by cancelling redirects back to Case Form Index', function (assert) {
    visit('/admin/manage/case-forms');

    andThen(function () {
      click('.qa-admin_case-forms__new-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms/new');
      click('.qa-admin_case-forms__cancel-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Try to create new Case Form, Modify field, then Cancel, Prompt should appear, Agree, then redirects back to Case Form Index Page', function (assert) {
    visit('/admin/manage/case-forms');

    andThen(function () {
      click('.qa-admin_case-forms__new-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms/new');
      fillIn('.qa-admin_case-forms_edit__title-input', 'Case Form Title');
    });

    andThen(function () {
      click('.qa-admin_case-forms__cancel-button');
      click('.qa-ko-confirm-modal__confirm');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Cancelling new case form after it was modified triggers prompt and prevents redirect when cancelled', function (assert) {
    visit('/admin/manage/case-forms');
    andThen(function () {
      click('.qa-admin_case-forms__new-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms/new');
      fillIn('.qa-admin_case-forms_edit__title-input', 'Case Form Title');
    });

    andThen(function () {
      click('.qa-admin_case-forms__cancel-button');
      click('.qa-ko-confirm-modal__cancel');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms/new');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Create New Case Form Workflow', function (assert) {
    server.createList('case-field', 5);

    server.create('case-field', {
      type: 'TEXT',
      key: 'not_system',
      title: 'Simple Text',
      customer_title: 'Simple Text',
      is_enabled: true,
      sort_order: 1,
      is_system: false
    });

    server.create('case-field', {
      type: 'CHECKBOX',
      key: 'not_system',
      title: 'Checkbox Field',
      customer_title: 'Checkbox Field',
      is_enabled: true,
      sort_order: 2,
      is_system: false
    });

    visit('/admin/manage/case-forms');

    andThen(function () {
      click('.qa-admin_case-forms__new-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms/new');
      fillIn('.qa-admin_case-forms_edit__title-input', 'QA: Case Form Title');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__customer-title').length, 0);
      assert.equal(find('.qa-admin_case-forms__customer-description').length, 0);
    });

    andThen(function () {
      click('.qa-admin_case-forms__customer-available-checkbox');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__customer-title').length, 1);
      assert.equal(find('.qa-admin_case-forms__customer-description').length, 1);
      fillIn('.qa-admin_case-forms__customer-title', 'Customer Seen Title');
      fillIn('.qa-admin_case-forms__customer-description', 'Case Seen Description');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms_edit_fields__row').length, 5);
      click('.qa-admin_case-forms_edit_fields__configure-dropdown .ember-basic-dropdown-trigger');
    });

    andThen(function () {
      assert.equal(find('.ember-power-select-option').length, 2);
      click('.ember-power-select-option:eq(0)');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms_edit_fields__row').length, 6);
      click('.qa-admin_case-forms_edit_fields__configure-dropdown .ember-basic-dropdown-trigger');
    });

    andThen(function () {
      click('.ember-power-select-option:eq(0)');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms_edit_fields__row').length, 7);
      triggerEvent('.qa-admin_case-forms_edit_fields__row:eq(6)', 'hover');
      click('.qa-admin_case-forms_edit_fields__row:eq(6) .ko-admin_case-forms_edit_fields__action');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms_edit_fields__row').length, 6);
      click('.qa-admin_case-forms_edit__submit-button');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/case-forms');
      assert.equal(find('.t-bold:contains("QA: Case Form Title")').length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Default case forms have a visual indication of their status', function (assert) {
    server.create('case-form', {
      is_default: true,
      title: 'The Default Case Form',
      brand: brand
    });

    visit('/admin/manage/case-forms');
    andThen(function () {
      assert.equal(find('.ko-reorderable-list .' + _frontendCpComponentsKoSimpleListCellStyles['default'].cell + ':eq(0)').text().trim().replace(/[\s\n]+/g, ' '), 'The Default Case Form (Brewfictus) (Default)');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Correct controls are displayed for non default case form', function (assert) {
    server.create('case-form', {
      is_default: false,
      title: 'A Regular Case Form',
      brand: brand
    });

    visit('/admin/manage/case-forms');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
    andThen(function () {
      assert.deepEqual(_npmLodash['default'].map(find('.ko-reorderable-list .' + _frontendCpComponentsKoSimpleListActionsStyles['default'].actions + ' a'), function (element) {
        return $(element).text().trim();
      }), ['Edit', 'Disable', 'Make default', 'Delete']);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('I do not see delete, disable, and make default for default case form', function (assert) {
    server.create('case-form', {
      is_default: true,
      title: 'The Default Case Form',
      brand: brand
    });

    visit('/admin/manage/case-forms');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
    andThen(function () {
      assert.deepEqual(_npmLodash['default'].map(find('.ko-reorderable-list .' + _frontendCpComponentsKoSimpleListActionsStyles['default'].actions + ' a'), function (element) {
        return $(element).text().trim();
      }), ['Edit']);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('I cannot disable a new case form', function (assert) {
    visit('/admin/manage/case-forms/new');

    andThen(function () {
      assert.equal(typeof $('.' + _frontendCpComponentsKoToggleStyles['default'].slider)[0], 'undefined');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('When I disable form, it moves to the Disabled section', function (assert) {
    assert.expect(5);

    server.create('case-form', {
      is_default: false,
      is_enabled: true,
      title: 'A Regular Case Form',
      brand: brand
    });

    visit('/admin/manage/case-forms');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 1);
      click('.qa-admin_case-forms__enabled-list .' + _frontendCpComponentsKoSimpleListActionsStyles['default'].actions + ' a:contains("Disable")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 0);
      assert.equal(find('.qa-admin_case-forms__disabled-list .qa-admin_case-forms__list-row').length, 1);
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
      click('.qa-admin_case-forms__disabled-list .' + _frontendCpComponentsKoSimpleListActionsStyles['default'].actions + ' a:contains("Enable")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__disabled-list .qa-admin_case-forms__list-row').length, 0);
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('I can change default case form', function (assert) {
    assert.expect(5);

    server.create('case-form', {
      is_default: false,
      is_enabled: true,
      title: 'Form 1',
      brand: brand
    });

    server.create('case-form', {
      is_default: true,
      is_enabled: true,
      title: 'Form 2',
      brand: brand
    });

    visit('/admin/manage/case-forms');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 2);
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 1") .t-caption:contains("(Default)")').length, 0);
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 2") .t-caption:contains("(Default)")').length, 1);
      click('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 1") a:contains("Make default")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 1") .t-caption:contains("(Default)")').length, 1);
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 2") .t-caption:contains("(Default)")').length, 0);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('I can delete regular case form (not default one)', function (assert) {
    assert.expect(2);

    server.create('case-form', {
      is_default: false,
      is_enabled: true,
      title: 'Form 1',
      brand: brand
    });

    visit('/admin/manage/case-forms');

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 1);
      click('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row:contains("Form 1") a:contains("Delete")');
      click('.qa-ko-confirm-modal__confirm');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-forms__enabled-list .qa-admin_case-forms__list-row').length, 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/facebook/manage-pages-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-admin/facebook/index/styles', 'frontend-cp/components/ko-simple-list/cell/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoAdminFacebookIndexStyles, _frontendCpComponentsKoSimpleListCellStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/facebook/pages', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      server.create('locale', {
        locale: 'en-us',
        isDefault: true
      });

      var businesshour = server.create('business-hour', { title: 'Default Business Hours' });
      var salesTeam = server.create('team', { title: 'Sales', businesshour: businesshour });
      var agentRole = server.create('role', { type: 'AGENT' });
      var locale = server.create('locale', { locale: 'en-us' });

      server.create('user', { teams: [salesTeam], role: agentRole, full_name: 'Leeroy Jenkins', locale: locale, time_zone: 'Europe/London' });
      server.create('case-status', { label: 'New' });
      server.create('case-type', { label: 'Question' });
      server.create('case-priority', { label: 'Low' });
      server.create('facebook-page');

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('adding a facebook page', function (assert) {
    visit('/admin/channels/facebook');

    andThen(function () {
      click('.qa-admin-facebook-page__add-page');
    });

    andThen(function () {
      assert.equal(find('.qa-admin-facebook-page__add-page-modal-title').length, 1);
      click('.' + _frontendCpComponentsKoAdminFacebookIndexStyles['default'].availablePage + ' [role="checkbox"]');
      click('.qa-admin-facebook-page__save');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first .t-bold').text(), 'HelpDesk Management System');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabling a facebook page', function (assert) {
    visit('/admin/channels/facebook');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');
    click('.qa-admin-facebook-page__disable');

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoSimpleListCellStyles['default'].disabled).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a facebook page', function (assert) {
    visit('/admin/channels/facebook');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':first', 'mouseenter');

    confirming(true, function () {
      click('.qa-admin-facebook-page__delete');
    });

    andThen(function () {
      assert.equal(find('.qa-admin-facebook-page').length, 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/localization/list-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var getEnabledRows = function getEnabledRows() {
    return find('.qa-languages-enabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };
  exports.getEnabledRows = getEnabledRows;
  var getDisabledRows = function getDisabledRows() {
    return find('.qa-languages-disabled .' + _frontendCpComponentsKoSimpleListRowStyles['default'].row);
  };

  exports.getDisabledRows = getDisabledRows;
  var assertRow = function assertRow(assert, row, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var name = _ref2[0];
    var _ref2$1 = _ref2[1];
    var options = _ref2$1 === undefined ? [] : _ref2$1;

    assert.ok(row.text().indexOf(name) !== -1, 'Language name');

    var isLocalised = options.indexOf('isLocalised') !== -1;
    assert[isLocalised ? 'ok' : 'notOk'](row.text().indexOf('(Officially supported)') !== -1, name + ' (Officially supported)');

    triggerEvent(row, 'mouseenter');
    andThen(function () {
      var canDisable = options.indexOf('canDisable') !== -1;
      assert[canDisable ? 'ok' : 'notOk'](row.text().indexOf('Disable') !== -1, name + ' Can be disabled');

      var canEnable = options.indexOf('canEnable') !== -1;
      assert[canEnable ? 'ok' : 'notOk'](row.text().indexOf('Enable') !== -1, name + ' Can be enabled');
    });
    triggerEvent(row, 'mouseleave');
  };

  exports.assertRow = assertRow;
  var assertRows = function assertRows(assert) {
    var enabled = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var disabled = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var enabledRows = getEnabledRows();
    var disabledRows = getDisabledRows();
    assert.equal(enabledRows.length, enabled.length, 'Enabled language count');
    assert.equal(disabledRows.length, disabled.length, 'Disabled language count');

    enabled.forEach(function (row, index) {
      return assertRow(assert, enabledRows.eq(index), row);
    });
    disabled.forEach(function (row, index) {
      return assertRow(assert, disabledRows.eq(index), row);
    });
  };

  exports.assertRows = assertRows;
  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/localization', {
    beforeEach: function beforeEach() {
      var en = server.create('locale', { id: 1, locale: 'en-us', name: 'English', native_name: 'English', is_public: true, is_localised: true });
      server.create('locale', { id: 2, locale: 'fr-fr', name: 'French', native_name: 'French', is_public: true, is_localised: false });
      server.create('locale', { id: 3, locale: 'de-de', name: 'German', native_name: 'German', is_public: false, is_localised: false });
      server.create('locale', { id: 4, locale: 'ru-ru', name: 'Russian', native_name: 'Russian', is_public: false, is_localised: false });
      var role = server.create('role', { type: 'ADMIN' });
      var user = server.create('user', { role: role, locale: en, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('listing index', function (assert) {
    visit('/admin/manage/localization');
    andThen(function () {
      assertRows(assert, [['English', ['isLocalised', 'canDisable']], ['French', ['canDisable']]], [['German', ['canEnable']], ['Russian', ['canEnable']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('disabling a language', function (assert) {
    visit('/admin/manage/localization');
    andThen(function () {
      return triggerEvent(getEnabledRows().eq(1), 'mouseenter');
    });
    andThen(function () {
      return click(getEnabledRows().eq(1).find('.qa-language-disable'));
    });
    andThen(function () {
      assertRows(assert, [['English', ['isLocalised']]], [['French', ['canEnable']], ['German', ['canEnable']], ['Russian', ['canEnable']]]);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('enabling a language', function (assert) {
    visit('/admin/manage/localization');
    andThen(function () {
      return triggerEvent(getDisabledRows().eq(0), 'mouseenter');
    });
    andThen(function () {
      return click(getDisabledRows().eq(0).find('.qa-language-enable'));
    });
    andThen(function () {
      assertRows(assert, [['English', ['isLocalised', 'canDisable']], ['French', ['canDisable']], ['German', ['canDisable']]], [['Russian', ['canEnable']]]);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/macros/new-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/macros/new', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase, quote-props*/
      server.create('locale', {
        locale: 'en-us'
      });

      var businesshour = server.create('business-hour', { title: 'Default Business Hours' });
      var salesTeam = server.create('team', { title: 'Sales', businesshour: businesshour });
      var agentRole = server.create('role', { type: 'AGENT' });
      var locale = server.create('locale', { locale: 'en-us' });

      server.create('user', { teams: [salesTeam], role: agentRole, full_name: 'Leeroy Jenkins', locale: locale, time_zone: 'Europe/London' });
      server.create('case-status', { label: 'New' });
      server.create('case-type', { label: 'Question' });
      server.create('case-priority', { label: 'Low' });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });

      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable camelcase, quote-props*/
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new macro', function (assert) {
    var actionSelect = '.ko-admin_macros_edit__actions-selector:contains("Please select an action")';

    function formSelectFor(id) {
      return '.qa-ko-admin-macros-action-' + id + '\n           .ko-admin-macros-action__form';
    }

    function formOptionFor(id, value) {
      return formSelectFor(id) + ' .ember-power-select-trigger:contains("' + value + '")';
    }

    function typeOptionFor(id, value) {
      return '.qa-ko-admin-macros-action-' + id + '\n            .ko-admin-macros-action__types\n            .ember-power-select-trigger:contains("' + value + '")';
    }

    function addTag(id, name) {
      var input = '.qa-ko-admin-macros-action-' + id + ' input';

      fillIn(input, name);
      triggerEvent(input, 'focus');
      triggerEvent(input, 'input');
      triggerEvent(input, 'blur');
    }

    visit('/admin/manage/macros/new');

    fillIn('.qa-admin_macros_edit__title-input', 'New Macro');
    selectChoose(actionSelect, 'Add reply text');
    selectChoose(actionSelect, 'Set reply type');
    selectChoose(actionSelect, 'Change status');
    selectChoose(actionSelect, 'Change type');
    selectChoose(actionSelect, 'Change assignee');
    selectChoose(actionSelect, 'Add tags');
    selectChoose(actionSelect, 'Remove tags');
    selectChoose(actionSelect, 'Priority');

    fillIn('.qa-ko-admin-macros-action-reply-contents textarea', 'Some contents');
    selectChoose(formSelectFor('reply-type'), 'Note');
    selectChoose(formSelectFor('status'), 'New');
    selectChoose(formSelectFor('type'), 'Question');
    selectChoose(formSelectFor('priority'), 'Low');

    var assigneeFormSelect = formSelectFor('assignee');
    selectChoose(assigneeFormSelect, 'Sales');
    selectChoose(assigneeFormSelect, 'Leeroy Jenkins');
    addTag('add-tags', 'tag-to-add');
    addTag('remove-tags', 'tag-to-remove');
    click('.qa-admin_macros_edit__submit-button');

    andThen(function () {
      assert.equal(find('.ko-admin_macros__title:contains("New Macro")').length, 1);
    });

    click('.ko-admin_macros__title:contains("New Macro")');

    andThen(function () {
      assert.equal(find('.qa-admin_macros_edit__title-input').val(), 'New Macro');
      assert.equal(find('.qa-admin-macros-action-reply-contents__textarea').val(), 'Some contents');
      assert.equal(find(typeOptionFor('reply-type', 'change to')).length, 1);
      assert.equal(find(typeOptionFor('assignee', 'change to')).length, 1);
      assert.equal(find(typeOptionFor('status', 'change to')).length, 1);
      assert.equal(find(typeOptionFor('type', 'change to')).length, 1);
      assert.equal(find(typeOptionFor('priority', 'change to')).length, 1);
      assert.equal(find(formOptionFor('reply-type', 'Note')).length, 1);
      assert.equal(find(formOptionFor('assignee', 'Sales / Leeroy Jenkins')).length, 1);
      assert.equal(find(formOptionFor('status', 'New')).length, 1);
      assert.equal(find(formOptionFor('type', 'Question')).length, 1);
      assert.equal(find(formOptionFor('priority', 'Low')).length, 1);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/views/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;
  var view = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/views/edit', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      server.create('locale', {
        locale: 'en-us'
      });

      var columns = [server.create('column', { name: 'caseid', title: 'Case ID' }), server.create('column', { name: 'subject', title: 'Subject' }), server.create('column', { name: 'casestatusid', title: 'Status' }), server.create('column', { name: 'casepriorityid', title: 'Priority' }), server.create('column', { name: 'casetypeid', title: 'Type' }), server.create('column', { name: 'assigneeagentid', title: 'Assigned agent' }), server.create('column', { name: 'assigneeteamid', title: 'Assigned team' }), server.create('column', { name: 'brandid', title: 'Brand' }), server.create('column', { name: 'channeltype', title: 'Channel type' }), server.create('column', { name: 'createdat', title: 'Created at' }), server.create('column', { name: 'updatedat', title: 'Updated at' }), server.create('column', { name: 'requesterid', title: 'Requester' })];

      var businesshour = server.create('business-hour', { title: 'Default Business Hours' });
      var teams = [server.create('team', { title: 'Sales', businesshour: businesshour }), server.create('team', { title: 'Support', businesshour: businesshour }), server.create('team', { title: 'Finance', businesshour: businesshour }), server.create('team', { title: 'Human Resources', businesshour: businesshour }), server.create('team', { title: 'Contractors', businesshour: businesshour })];

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '5': 'Closed',
          '4': 'Completed',
          '1': 'New',
          '2': 'Open',
          '3': 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '4': 'Incident',
          '3': 'Problem',
          '1': 'Question',
          '2': 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '3': 'High',
          '1': 'Low',
          '2': 'Normal',
          '4': 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          '1': 'Active',
          '3': 'Spam',
          '2': 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '0': 'unassigned',
          '(current users team)': '(current users team)',
          '5': 'Contractors',
          '3': 'Finance',
          '4': 'Human Resources',
          '1': 'Sales',
          '2': 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'breached'
        }
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
      server.create('view');
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var stringProposition = server.create('proposition', {
        field: 'cases.subject',
        operator: 'string_contains',
        value: 'dave'
      });
      var predicateCollections = [server.create('predicate-collection', { propositions: [stringProposition] })];
      view = server.create('view', {
        title: 'Engineering',
        type: 'CUSTOM',
        visibility_type: 'TEAM',
        order_by_column: 'createdat',
        order_by: 'DESC',
        is_default: false,
        is_system: false,
        is_enabled: true,
        agent: { id: agent.id, resource_type: 'user' },
        visibility_to_teams: teams.map(function (t) {
          return { id: t.id, resource_type: 'team' };
        }),
        columns: columns.map(function (c) {
          return { name: c.name, resource_type: 'column' };
        }),
        predicate_collections: predicateCollections.map(function (pc) {
          return { id: pc.id, resource_type: 'predicate_collection' };
        })
      });
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a view and leaving without making changes', function (assert) {
    window.confirm = function (message) {
      assert.ok(false, 'This confirm shouln\'t be invoked');
      return true;
    };

    visit('/admin/manage/views/' + view.id);

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/' + view.id);
      click('.button[name=cancel]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/manage/views/new-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;
  var fieldTitle = 'fieldTitle';
  var rule1String = 'rule1string';

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/manage/views/new', {
    beforeEach: function beforeEach() {
      /*eslint-disable quote-props*/
      server.create('locale', {
        locale: 'en-us'
      });

      server.create('column', { name: 'caseid', title: 'Case ID' });
      server.create('column', { name: 'subject', title: 'Subject' });
      server.create('column', { name: 'casestatusid', title: 'Status' });
      server.create('column', { name: 'casepriorityid', title: 'Priority' });
      server.create('column', { name: 'casetypeid', title: 'Type' });
      server.create('column', { name: 'assigneeagentid', title: 'Assigned agent' });
      server.create('column', { name: 'assigneeteamid', title: 'Assigned team' });
      server.create('column', { name: 'brandid', title: 'Brand' });
      server.create('column', { name: 'channeltype', title: 'Channel type' });
      server.create('column', { name: 'createdat', title: 'Created at' });
      server.create('column', { name: 'updatedat', title: 'Updated at' });
      server.create('column', { name: 'requesterid', title: 'Requester' });

      var businesshour = server.create('business-hour', { title: 'Default Business Hours' });

      server.create('team', { title: 'Sales', businesshour: businesshour });
      server.create('team', { title: 'Support', businesshour: businesshour });
      server.create('team', { title: 'Finance', businesshour: businesshour });
      server.create('team', { title: 'Human Resources', businesshour: businesshour });
      server.create('team', { title: 'Contractors', businesshour: businesshour });

      server.create('definition', {
        label: 'Subject',
        field: 'cases.subject',
        type: 'STRING',
        sub_type: '',
        group: 'CASES',
        input_type: 'STRING',
        operators: ['string_contains', 'string_does_not_contain'],
        values: ''
      });

      server.create('definition', {
        label: 'Status',
        field: 'cases.casestatusid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '5': 'Closed',
          '4': 'Completed',
          '1': 'New',
          '2': 'Open',
          '3': 'Pending'
        }
      });

      server.create('definition', {
        label: 'Type',
        field: 'cases.casetypeid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '4': 'Incident',
          '3': 'Problem',
          '1': 'Question',
          '2': 'Task'
        }
      });

      server.create('definition', {
        label: 'Priority',
        field: 'cases.casepriorityid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto', 'comparison_lessthan', 'comparison_greaterthan'],
        values: {
          '3': 'High',
          '1': 'Low',
          '2': 'Normal',
          '4': 'Urgent'
        }
      });

      server.create('definition', {
        label: 'State',
        field: 'cases.state',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto'],
        values: {
          '1': 'Active',
          '3': 'Spam',
          '2': 'Trash'
        }
      });

      server.create('definition', {
        label: 'Brand',
        field: 'cases.brandid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'Default'
        }
      });

      server.create('definition', {
        label: 'Assigned Agent Team',
        field: 'cases.assigneeteamid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '0': 'unassigned',
          '(current users team)': '(current users team)',
          '5': 'Contractors',
          '3': 'Finance',
          '4': 'Human Resources',
          '1': 'Sales',
          '2': 'Support'
        }
      });

      server.create('definition', {
        label: 'Assigned agent',
        field: 'cases.assigneeagentid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Requester',
        field: 'cases.requesterid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Tags',
        field: 'tags.name',
        type: 'COLLECTION',
        sub_type: '',
        group: 'CASES',
        input_type: 'TAGS',
        operators: ['collection_contains_insensitive', 'collection_does_not_contain_insensitive', 'collection_contains_any_insensitive'],
        values: ''
      });

      server.create('definition', {
        label: 'Organization',
        field: 'users.organizationid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'AUTOCOMPLETE',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: ''
      });

      server.create('definition', {
        label: 'Following',
        field: 'followers.userid',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '(current user)': '(current user)'
        }
      });

      server.create('definition', {
        label: 'SLA Breached',
        field: 'caseslametrics.isbreached',
        type: 'NUMERIC',
        sub_type: 'INTEGER',
        group: 'CASES',
        input_type: 'OPTIONS',
        operators: ['comparison_equalto', 'comparison_not_equalto'],
        values: {
          '1': 'breached'
        }
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
      server.create('view');
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable quote-props*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using does not contain', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');
      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:first input:last', rule1String);
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using `equal to`', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Status');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'equal to');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--property', 'New');
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using `not equal to`', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Status');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'not equal to');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--property', 'New');
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using `less than`', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Priority');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'less than');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--property', 'Low');
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using is `greater than`', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Priority');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'greater than');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--property', 'Low');
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using contains one of the following', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Tags');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'contains one of the following');
      fillIn('.qa-predicate-builder--proposition:first input:last', rule1String);
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using does not contain', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Tags');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'does not contain');
      fillIn('.qa-predicate-builder--proposition:first input:last', rule1String);
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with a single proposition using is contains one of the following', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Tags');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'contains one of the following');
      fillIn('.qa-predicate-builder--proposition:first input:last', rule1String);
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view with an additional column configured and sorted on', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');

      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.ko-radio__label:contains(Just myself)');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--column', 'Subject');
      selectChoose('.qa-predicate-builder--proposition:first .qa-proposition--operator', 'contains');
      fillIn('.qa-predicate-builder--proposition:first input:last', rule1String);
      selectChoose('.qa-configure-column', 'Created at');
      selectChoose('.qa-sorted-by', 'Created at');
      click('.button[name=submit]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
      findWithAssert('.qa-view-list-active--title:contains(' + fieldTitle + ')');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view making changes and then cancelling', function (assert) {
    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?');
      return true;
    };

    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');
      fillIn('input.ko-admin_views_edit__title', fieldTitle);
      click('.button[name=cancel]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new view and cancelling without changes', function (assert) {
    window.confirm = function (message) {
      assert.ok(false, 'this confirm should never be called');
      return true;
    };

    visit('/admin/manage/views/new');

    andThen(function () {
      click('.button[name=cancel]:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('ability to sort configurable columns', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');
    });

    andThen(function () {
      scrollToBottomOfPage();
    });

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Case ID');
      expectedColumns.push('Subject');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });

    reorderListItems('.i-dragstrip', '.ko-views-column__content', 'Subject', 'Case ID', 'Status', 'Assigned agent', 'Updated at', 'Requester');

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Subject');
      expectedColumns.push('Case ID');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('ability to sort configurable columns with additional column', function (assert) {
    visit('/admin/manage/views/new');

    andThen(function () {
      assert.equal(currentURL(), '/admin/manage/views/new');
    });

    andThen(function () {
      scrollToBottomOfPage();
    });

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Case ID');
      expectedColumns.push('Subject');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });

    andThen(function () {
      selectChoose('.qa-configure-column', 'Priority');
    });

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Case ID');
      expectedColumns.push('Subject');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');
      expectedColumns.push('Priority');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });

    reorderListItems('.i-dragstrip', '.ko-views-column__content', 'Case ID', 'Priority', 'Subject', 'Status', 'Assigned agent', 'Updated at', 'Requester');

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Case ID');
      expectedColumns.push('Priority');
      expectedColumns.push('Subject');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });

    andThen(function () {
      click('.ko-views-column .ko-views-column__item:contains("Priority") .qa-configure-column__remove');
    });

    andThen(function () {
      var expectedColumns = [];
      expectedColumns.push('Case ID');
      expectedColumns.push('Subject');
      expectedColumns.push('Status');
      expectedColumns.push('Assigned agent');
      expectedColumns.push('Updated at');
      expectedColumns.push('Requester');

      assert.deepEqual(textNodesToArray('.ko-views-column .ko-views-column__content'), expectedColumns);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/organization-fields/delete-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;
  var fieldTitle = 'test field';

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/organization fields/delete', {
    beforeEach: function beforeEach() {
      var customerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var descriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: fieldTitle,
        customer_titles: [{
          id: customerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: descriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var sessionId = server.create('session', { user: agent }).id;
      login(sessionId);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a text field', function (assert) {
    assert.expect(4);

    visit('/admin/people/organization-fields');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '")', 'mouseenter');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      assert.notOk(find('span:contains("' + fieldTitle + '")').length > 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/organization-fields/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles', 'frontend-cp/components/ko-toggle/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles, _frontendCpComponentsKoToggleStyles) {

  var textFieldTitle = 'text field';
  var textAreaFieldTitle = 'text area field';
  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var numericFieldTitle = 'numeric field';
  var decimalFieldTitle = 'decimal field';
  var fileFieldTitle = 'file field';
  var yesNoFieldTitle = 'yes no field';
  var cascadingSelectFieldTitle = 'cascading select field';
  var dateFieldTitle = 'date field';
  var regexFieldTitle = 'regex field';

  var customerTitle = 'customer title';
  var description = 'description';
  var optionTitle = 'option title';
  var regEx = 'regEx';

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/organization fields/edit', {
    beforeEach: function beforeEach() {
      /*eslint-disable camelcase*/
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var textCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: textFieldTitle,
        type: 'TEXT',
        customer_titles: [{
          id: textCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var textAreaCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textAreaDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: textAreaFieldTitle,
        type: 'TEXTAREA',
        customer_titles: [{
          id: textAreaCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textAreaDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var radioCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOption = server.create('field-option', {
        values: [{
          id: radioOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('organization-field', {
        title: radioFieldTitle,
        type: 'RADIO',
        customer_titles: [{
          id: radioCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: radioDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: radioOption.id,
          resource_type: 'field_option'
        }]
      });
      var selectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOption = server.create('field-option', {
        values: [{
          id: selectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('organization-field', {
        title: normalSelectFieldTitle,
        type: 'SELECT',
        customer_titles: [{
          id: selectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: selectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: selectOption.id,
          resource_type: 'field_option'
        }]
      });
      var checkboxCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOption = server.create('field-option', {
        values: [{
          id: checkboxOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('organization-field', {
        title: checkboxFieldTitle,
        type: 'CHECKBOX',
        customer_titles: [{
          id: checkboxCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: checkboxDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: checkboxOption.id,
          resource_type: 'field_option'
        }]
      });
      var numericCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var numericDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: numericFieldTitle,
        type: 'NUMERIC',
        customer_titles: [{
          id: numericCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: numericDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var decimalCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var decimalDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: decimalFieldTitle,
        type: 'DECIMAL',
        customer_titles: [{
          id: decimalCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: decimalDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var fileCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var fileDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: fileFieldTitle,
        type: 'FILE',
        customer_titles: [{
          id: fileCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: fileDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var yesNoCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var yesNoDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: yesNoFieldTitle,
        type: 'YESNO',
        customer_titles: [{
          id: yesNoCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: yesNoDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var cascadingSelectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOption = server.create('field-option', {
        values: [{
          id: cascadingSelectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('organization-field', {
        title: cascadingSelectFieldTitle,
        type: 'CASCADINGSELECT',
        customer_titles: [{
          id: cascadingSelectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: cascadingSelectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: cascadingSelectOption.id,
          resource_type: 'field_option'
        }]
      });
      var dateCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var dateDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: dateFieldTitle,
        type: 'DATE',
        customer_titles: [{
          id: dateCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: dateDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var regexCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var regexDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('organization-field', {
        title: regexFieldTitle,
        type: 'REGEX',
        customer_titles: [{
          id: regexCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: regexDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        regular_expression: '^(.*)'
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable camelcase*/
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      findWithAssert('.qa-admin_case-fields_edit__api-key');

      fillIn('input.ko-admin_case-fields_edit__title', textFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text area field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', textAreaFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textAreaFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a radio field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', radioFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), radioFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', normalSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), normalSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a checkbox field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', checkboxFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), checkboxFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a numeric field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', numericFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), numericFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a decimal field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', decimalFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), decimalFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a file field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', fileFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fileFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a yes no field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', yesNoFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), yesNoFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a cascading select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', cascadingSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), cascadingSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a date field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', dateFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), dateFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a regular expression field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', regexFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), regexFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('cancelling an edit', function (assert) {
    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', 'edited field title');

      fillIn('input.ko-admin_case-fields_edit__customer-title', 'edited customer title');
      fillIn('textarea.ko-admin_case-fields_edit__description', 'edited description');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), 'text field');
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), 'locale specific text here');
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), 'locale specific text here');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=true]');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/organization-fields/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/organization fields/new', {
    beforeEach: function beforeEach() {
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_ublic: true
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: { id: locale.id, resource_type: 'locale' }, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new field sends locale fields for all public locales', function (assert) {
    assert.expect(7);

    server.create('locale', {
      id: 2,
      locale: 'es',
      is_public: false
    });

    visit('/admin/people/organization-fields/new/TEXT');

    server.post('/api/v1/organizations/fields', function (schema, request) {
      var requestData = JSON.parse(request.requestBody);
      assert.equal(requestData.customer_titles.length, 1, '1 customer title');
      assert.equal(requestData.descriptions.length, 1, '1 description');
      assert.equal(requestData.customer_titles[0].locale, 'en-us', 'customer title locale');
      assert.equal(requestData.customer_titles[0].translation, null, 'customer title translation');
      assert.equal(requestData.descriptions[0].locale, 'en-us', 'description locale');
      assert.equal(requestData.descriptions[0].translation, null, 'description translation');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/TEXT');

      fillIn('input.ko-admin_case-fields_edit__title', 'fieldTitle');
      click('.button--primary:first');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/TEXT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/TEXT');
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 0);
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text area field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/TEXTAREA');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/TEXTAREA');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Multi-line text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new radio field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/organization-fields/new/RADIO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/RADIO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Radio buttons (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new dropdown box field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/organization-fields/new/SELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/SELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Dropdown list (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new checkbox field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/organization-fields/new/CHECKBOX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/CHECKBOX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Checkboxes (multiple choices) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new numeric field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/NUMERIC');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/NUMERIC');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Numerical input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new decimal field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/DECIMAL');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/DECIMAL');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Decimal input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new file field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/FILE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/FILE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / File upload / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new yes/no toggle field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/YESNO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/YESNO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Yes/No toggle / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new cascading select field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/organization-fields/new/CASCADINGSELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/CASCADINGSELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Cascading select / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new date field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/organization-fields/new/DATE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/DATE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Date / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new regular expression field', function (assert) {
    assert.expect(8);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var regEx = 'regex';

    visit('/admin/people/organization-fields/new/REGEX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields/new/REGEX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / Regular expression / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'Organization fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/organization-fields/reorder-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var cascadingSelectFieldTitle = 'cascading select field';

  var option1Title = 'option title 1';
  var option2Title = 'option title 2';
  var option3Title = 'option title 3';
  var option4Title = 'option title 4';

  (0, _qunit.module)('Acceptance | admin/people/organization fields/reorder', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();
      /*eslint-disable camelcase*/
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var radioOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var radioOption1 = server.create('field-option', {
        values: [{ id: radioOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var radioOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var radioOption2 = server.create('field-option', {
        values: [{ id: radioOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var radioOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var radioOption3 = server.create('field-option', {
        values: [{ id: radioOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var radioOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var radioOption4 = server.create('field-option', {
        values: [{ id: radioOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('organization-field', {
        title: radioFieldTitle,
        is_system: false,
        type: 'RADIO',
        options: [{ id: radioOption1.id, resource_type: 'field_option' }, { id: radioOption2.id, resource_type: 'field_option' }, { id: radioOption3.id, resource_type: 'field_option' }, { id: radioOption4.id, resource_type: 'field_option' }]
      });
      var normalSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var normalSelectOption1 = server.create('field-option', {
        values: [{ id: normalSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var normalSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var normalSelectOption2 = server.create('field-option', {
        values: [{ id: normalSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var normalSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var normalSelectOption3 = server.create('field-option', {
        values: [{ id: normalSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var normalSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var normalSelectOption4 = server.create('field-option', {
        values: [{ id: normalSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('organization-field', {
        title: normalSelectFieldTitle,
        is_system: false,
        type: 'SELECT',
        options: [{ id: normalSelectOption1.id, resource_type: 'field_option' }, { id: normalSelectOption2.id, resource_type: 'field_option' }, { id: normalSelectOption3.id, resource_type: 'field_option' }, { id: normalSelectOption4.id, resource_type: 'field_option' }]
      });
      var checkboxOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var checkboxOption1 = server.create('field-option', {
        values: [{ id: checkboxOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var checkboxOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var checkboxOption2 = server.create('field-option', {
        values: [{ id: checkboxOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var checkboxOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var checkboxOption3 = server.create('field-option', {
        values: [{ id: checkboxOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var checkboxOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var checkboxOption4 = server.create('field-option', {
        values: [{ id: checkboxOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('organization-field', {
        title: checkboxFieldTitle,
        is_system: false,
        type: 'CHECKBOX',
        options: [{ id: checkboxOption1.id, resource_type: 'field_option' }, { id: checkboxOption2.id, resource_type: 'field_option' }, { id: checkboxOption3.id, resource_type: 'field_option' }, { id: checkboxOption4.id, resource_type: 'field_option' }]
      });
      var cascadingSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var cascadingSelectOption1 = server.create('field-option', {
        values: [{ id: cascadingSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var cascadingSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var cascadingSelectOption2 = server.create('field-option', {
        values: [{ id: cascadingSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var cascadingSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var cascadingSelectOption3 = server.create('field-option', {
        values: [{ id: cascadingSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var cascadingSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var cascadingSelectOption4 = server.create('field-option', {
        values: [{ id: cascadingSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('organization-field', {
        title: cascadingSelectFieldTitle,
        is_system: false,
        type: 'CASCADINGSELECT',
        options: [{ id: cascadingSelectOption1.id, resource_type: 'field_option' }, { id: cascadingSelectOption2.id, resource_type: 'field_option' }, { id: cascadingSelectOption3.id, resource_type: 'field_option' }, { id: cascadingSelectOption4.id, resource_type: 'field_option' }]
      });
      var agentRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      /*eslint-enable camelcase*/
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('reordering a radio field', function (assert) {
    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + radioFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a select field', function (assert) {
    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + normalSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a checkbox field', function (assert) {
    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + checkboxFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a cascading select field', function (assert) {
    visit('/admin/people/organization-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + cascadingSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/organization-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/roles/form-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-admin/page/styles', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoAdminPageStyles, _frontendCpComponentsKoSimpleListRowStyles) {

  var createNewCaseCheckboxClass = 'qa-ko-admin_roles-create-public-reply-checkbox';
  var createNewUsersCheckboxClass = 'qa-ko-admin_roles-create-new-users-checkbox';
  var acceptNewChatRequestsCheckboxClass = 'qa-ko-admin_roles-accept-new-chat-requests-checkbox';
  var manageHelpcenterCheckboxClass = 'qa-ko-admin_roles-manage-helpcenter-checkbox';
  var manageTeamsCheckboxClass = 'qa-ko-admin_roles-manage-teams-checkbox';

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/roles form', {
    beforeEach: function beforeEach() {
      server.create('locale', {
        locale: 'en-us',
        isDefault: true
      });

      var rolesAndPermissionsFeature = server.create('feature', { code: 'custom_roles_and_permissions' });

      server.create('plan', { limits: { agents: 20 }, features: [rolesAndPermissionsFeature], account_id: '123', subscription_id: '123' });

      server.create('role', {
        id: 6,
        type: 'COLLABORATOR',
        title: 'Existing Role',
        is_system: false
      });

      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new role', function (assert) {
    visit('/admin/people/roles');
    click('.' + _frontendCpComponentsKoAdminPageStyles['default'].header + ' button:contains("New role")');
    fillIn('input.ko-admin_roles_form__title', 'Custom Role');
    selectChoose('.qa-ko-admin_roles_form__role-type', 'Agent');
    selectChoose('.qa-ko-admin_roles_form__agent-case-access-type', 'Assigned to agent');
    click('.' + createNewCaseCheckboxClass);
    click('.' + acceptNewChatRequestsCheckboxClass);
    click('.' + createNewUsersCheckboxClass);
    click('.' + manageHelpcenterCheckboxClass);

    andThen(function () {
      assert.equal(find('.ko-admin-form-group__legend:contains("User administration")').length, 0);
      assert.equal(find('.ko-admin-form-group__legend:contains("System administration")').length, 0);
    });

    click('button:contains("Save")');

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("Custom Role")', 'mouseenter');
    click('.qa-ko-admin_roles__list-item:contains("Custom Role") .qa-ko-admin_roles_list-item__edit');

    andThen(function () {
      findWithAssert('.' + createNewCaseCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + acceptNewChatRequestsCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + createNewUsersCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + manageHelpcenterCheckboxClass + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new admin role', function (assert) {
    assert.expect(0);
    visit('/admin/people/roles');
    click('.' + _frontendCpComponentsKoAdminPageStyles['default'].header + ' button:contains("New role")');
    fillIn('input.ko-admin_roles_form__title', 'Custom Role');
    selectChoose('.qa-ko-admin_roles_form__role-type', 'Administrator');
    selectChoose('.qa-ko-admin_roles_form__agent-case-access-type', 'Assigned to agent');
    click('.' + createNewCaseCheckboxClass);
    click('.' + acceptNewChatRequestsCheckboxClass);
    click('.' + createNewUsersCheckboxClass);
    click('.' + manageHelpcenterCheckboxClass);
    click('.' + manageTeamsCheckboxClass);
    click('button:contains("Save")');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("Custom Role")', 'mouseenter');
    click('.qa-ko-admin_roles__list-item:contains("Custom Role") .qa-ko-admin_roles_list-item__edit');

    andThen(function () {
      findWithAssert('.' + createNewCaseCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + acceptNewChatRequestsCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + createNewUsersCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + manageHelpcenterCheckboxClass + '[aria-checked=false]');
      findWithAssert('.' + manageTeamsCheckboxClass + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a role', function (assert) {
    server.create('permission', { name: 'case.create' });
    server.create('permission', { name: 'chat.observe' });
    server.create('permission', { name: 'chat.transfer' });
    server.create('permission', { name: 'chat.manage' });
    server.create('permission', { name: 'user.create' });
    server.create('permission', { name: 'organization.create' });
    server.create('permission', { name: 'help_center.manage' });

    visit('/admin/people/roles');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("Existing Role")', 'mouseenter');
    click('.qa-ko-admin_roles__list-item:contains("Existing Role") .qa-ko-admin_roles_list-item__edit');

    fillIn('input.ko-admin_roles_form__title', 'Edited Role');
    selectChoose('.qa-ko-admin_roles_form__agent-case-access-type', 'Assigned to agent');
    click('.' + createNewCaseCheckboxClass);
    click('.' + acceptNewChatRequestsCheckboxClass);
    click('.' + createNewUsersCheckboxClass);
    click('.' + manageHelpcenterCheckboxClass);

    andThen(function () {
      assert.equal(find('.ko-admin-form-group__legend:contains("User administration")').length, 0);
      assert.equal(find('.ko-admin-form-group__legend:contains("System administration")').length, 0);
    });

    click('button:contains("Save")');
    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("Edited Role")', 'mouseenter');
    click('.qa-ko-admin_roles__list-item:contains("Edited Role") .qa-ko-admin_roles_list-item__edit');

    andThen(function () {
      findWithAssert('.' + createNewCaseCheckboxClass + '[aria-checked=true]');
      findWithAssert('.' + acceptNewChatRequestsCheckboxClass + '[aria-checked=true]');
      findWithAssert('.' + createNewUsersCheckboxClass + '[aria-checked=true]');
      findWithAssert('.' + manageHelpcenterCheckboxClass + '[aria-checked=true]');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/roles/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/roles index', {
    beforeEach: function beforeEach() {
      server.create('locale', {
        locale: 'en-us',
        isDefault: true
      });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      server.create('role', {
        id: 2,
        type: 'AGENT',
        title: 'Agent'
      });

      server.create('role', {
        id: 3,
        type: 'COLLABORATOR',
        title: 'Collaborator'
      });

      server.create('role', {
        id: 4,
        type: 'CUSTOMER',
        title: 'Customer'
      });

      server.create('role', {
        id: 5,
        type: 'OWNER',
        title: 'Owner'
      });

      server.create('role', {
        id: 6,
        type: 'CUSTOMER',
        title: 'Custom Role',
        is_system: false
      });

      var adminRole = server.create('role', {
        id: 1,
        type: 'ADMIN',
        title: 'Administrator'
      });

      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('reading the roles list', function (assert) {
    visit('/admin/people/roles');

    andThen(function () {
      var textFor = function textFor(item, elementClass) {
        var element = $(item).find('.qa-ko-admin_roles_list-item__' + elementClass);
        return element.length > 0 ? element.text().trim() : null;
      };

      var getRowData = function getRowData(index) {
        var item = find('.qa-ko-admin_roles__list-item:eq(' + index + ')');
        return {
          title: textFor(item, 'title'),
          caption: textFor(item, 'title-caption'),
          label: textFor(item, 'label'),
          editLink: textFor(item, 'edit'),
          deleteLink: textFor(item, 'delete')
        };
      };

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(0)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(0), {
          title: 'Administrator',
          caption: '(System)',
          label: 'Administrator',
          editLink: 'Edit',
          deleteLink: null
        });
      });

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(1)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(1), {
          title: 'Agent',
          caption: '(System)',
          label: 'Agent',
          editLink: 'Edit',
          deleteLink: null
        });
      });

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(2)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(2), {
          title: 'Collaborator',
          caption: '(System)',
          label: 'Collaborator',
          editLink: null,
          deleteLink: null
        });
      });

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(3)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(3), {
          title: 'Customer',
          caption: '(System)',
          label: 'Customer',
          editLink: null,
          deleteLink: null
        });
      });

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(4)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(4), {
          title: 'Owner',
          caption: '(System)',
          label: 'Owner',
          editLink: null,
          deleteLink: null
        });
      });

      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':eq(5)', 'mouseenter');
      andThen(function () {
        assert.deepEqual(getRowData(5), {
          title: 'Custom Role',
          caption: null,
          label: 'Customer',
          editLink: 'Edit',
          deleteLink: 'Delete'
        });
      });
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a role', function (assert) {
    visit('/admin/people/roles');

    andThen(function () {
      assert.equal(find('.qa-ko-admin_roles_list-item__title:contains("Custom Role")').length, 1);
    });

    triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("Custom Role")', 'mouseenter');
    confirming(true, function () {
      click('.qa-ko-admin_roles_list-item__delete:first');
    });

    andThen(function () {
      assert.equal(find('.qa-ko-admin_roles_list-item__title:contains("Custom Role")').length, 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/teams-forms-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Admin | People | Teams', {
    beforeEach: function beforeEach() {
      var emails = [server.create('identity-email', { email: 'first@example.com', is_primary: true, is_validated: true }), server.create('identity-email', { email: 'second@example.com', is_primary: false, is_validated: true }), server.create('identity-email', { email: 'third@example.com', is_primary: false, is_validated: false })];

      server.create('team', { title: 'Sales', businesshour: server.create('business-hour') });
      server.create('team', { title: 'Finance', businesshour: server.create('business-hour') });

      server.create('permission', { name: 'admin.team.create', value: true });
      server.create('permission', { name: 'admin.team.update', value: true });
      server.create('permission', { name: 'admin.team.update', value: true });
      server.create('permission', { name: 'admin.team.delete', value: true });

      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { emails: emails, locale: locale, role: server.create('role', { roleType: 'ADMIN' }), time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

      server.create('brand', { locale: server.create('locale') });

      login(session.id);
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Trying to Delete Team and Cancelling operation, should leave you on the same page', function (assert) {
    assert.expect(3);

    visit('/admin/people/teams');

    andThen(function () {
      assert.equal(find('.ko-admin-card-team').length, 2);
      click('.ko-admin-card-team:eq(0) a');
    });

    andThen(function () {
      assert.equal(find('.qa-ko-admin_team__input-title').val(), 'Sales');
      click('.qa-ko-form_buttons__delete');
      click('.qa-ko-confirm-modal__cancel');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/teams/1');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/user-fields/delete-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = undefined;
  var fieldTitle = 'test field';

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/user fields/delete', {
    beforeEach: function beforeEach() {
      server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var customerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var descriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: fieldTitle,
        customer_titles: [{
          id: customerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: descriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('deleting a text field', function (assert) {
    assert.expect(4);

    visit('/admin/people/user-fields');

    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to delete this?', 'The proper confirm message is shown');
      return true;
    };

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      triggerEvent('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '")', 'mouseenter');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + fieldTitle + '") a:contains(Delete)');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      assert.notOk(find('span:contains("' + fieldTitle + '")').length > 0);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/user-fields/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-toggle/styles', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoToggleStyles, _frontendCpComponentsKoSimpleListRowStyles) {

  var textFieldTitle = 'text field';
  var textAreaFieldTitle = 'text area field';
  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var numericFieldTitle = 'numeric field';
  var decimalFieldTitle = 'decimal field';
  var fileFieldTitle = 'file field';
  var yesNoFieldTitle = 'yes no field';
  var cascadingSelectFieldTitle = 'cascading select field';
  var dateFieldTitle = 'date field';
  var regexFieldTitle = 'regex field';

  var customerTitle = 'customer title';
  var description = 'description';
  var optionTitle = 'option title';
  var regEx = 'regEx';

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/user fields/edit', {
    beforeEach: function beforeEach() {
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var textCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: textFieldTitle,
        type: 'TEXT',
        customer_titles: [{
          id: textCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var textAreaCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var textAreaDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: textAreaFieldTitle,
        type: 'TEXTAREA',
        customer_titles: [{
          id: textAreaCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: textAreaDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var radioCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var radioOption = server.create('field-option', {
        values: [{
          id: radioOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('user-field', {
        title: radioFieldTitle,
        type: 'RADIO',
        customer_titles: [{
          id: radioCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: radioDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: radioOption.id,
          resource_type: 'field_option'
        }]
      });
      var selectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var selectOption = server.create('field-option', {
        values: [{
          id: selectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('user-field', {
        title: normalSelectFieldTitle,
        type: 'SELECT',
        customer_titles: [{
          id: selectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: selectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: selectOption.id,
          resource_type: 'field_option'
        }]
      });
      var checkboxCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var checkboxOption = server.create('field-option', {
        values: [{
          id: checkboxOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('user-field', {
        title: checkboxFieldTitle,
        type: 'CHECKBOX',
        customer_titles: [{
          id: checkboxCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: checkboxDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: checkboxOption.id,
          resource_type: 'field_option'
        }]
      });
      var numericCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var numericDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: numericFieldTitle,
        type: 'NUMERIC',
        customer_titles: [{
          id: numericCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: numericDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var decimalCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var decimalDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: decimalFieldTitle,
        type: 'DECIMAL',
        customer_titles: [{
          id: decimalCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: decimalDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var fileCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var fileDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: fileFieldTitle,
        type: 'FILE',
        customer_titles: [{
          id: fileCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: fileDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var yesNoCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var yesNoDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: yesNoFieldTitle,
        type: 'YESNO',
        customer_titles: [{
          id: yesNoCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: yesNoDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var cascadingSelectCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var cascadingSelectOption = server.create('field-option', {
        values: [{
          id: cascadingSelectOptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      server.create('user-field', {
        title: cascadingSelectFieldTitle,
        type: 'CASCADINGSELECT',
        customer_titles: [{
          id: cascadingSelectCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: cascadingSelectDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        options: [{
          id: cascadingSelectOption.id,
          resource_type: 'field_option'
        }]
      });
      var dateCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var dateDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: dateFieldTitle,
        type: 'DATE',
        customer_titles: [{
          id: dateCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: dateDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }]
      });
      var regexCustomerTitleLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      var regexDescriptionLocaleField = server.create('locale-field', {
        locale: 'en-us'
      });
      server.create('user-field', {
        title: regexFieldTitle,
        type: 'REGEX',
        customer_titles: [{
          id: regexCustomerTitleLocaleField.id,
          resource_type: 'locale_field'
        }],
        descriptions: [{
          id: regexDescriptionLocaleField.id,
          resource_type: 'locale_field'
        }],
        regular_expression: '^(.*)'
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: adminRole, locale: locale });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      findWithAssert('.qa-admin_case-fields_edit__api-key');

      fillIn('input.ko-admin_case-fields_edit__title', textFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text area field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', textAreaFieldTitle);
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + textAreaFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), textAreaFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a radio field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', radioFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), radioFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', normalSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), normalSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a checkbox field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', checkboxFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), checkboxFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a numeric field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', numericFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + numericFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), numericFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a decimal field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', decimalFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + decimalFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), decimalFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a file field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', fileFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fileFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fileFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a yes no field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', yesNoFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + yesNoFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), yesNoFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a cascading select field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', cascadingSelectFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('.ko-reorderable-list-item:first input:first', optionTitle);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), cascadingSelectFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), optionTitle);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a date field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', dateFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + dateFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), dateFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a regular expression field', function (assert) {
    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', regexFieldTitle);

      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + regexFieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), regexFieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=false]');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a text field', function (assert) {
    window.confirm = function (message) {
      assert.equal(message, 'You have unsaved changes on this page. Are you sure you want to discard these changes?', 'The proper confirm message is shown');
      return true;
    };

    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      fillIn('input.ko-admin_case-fields_edit__title', 'edited field title');

      fillIn('input.ko-admin_case-fields_edit__customer-title', 'edited customer title');
      fillIn('textarea.ko-admin_case-fields_edit__description', 'edited description');
      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div');

      click('.' + _frontendCpComponentsKoToggleStyles['default'].container);

      click('.button[name=cancel]');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + textFieldTitle + '")');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), 'text field');
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), 'locale specific text here');
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), 'locale specific text here');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can edit this field) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(This field is required for customers) div[aria-checked=true]');
      findWithAssert('div .' + _frontendCpComponentsKoToggleStyles['default'].container + '[aria-checked=true]');
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/user-fields/new-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoSimpleListRowStyles) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/people/user fields/new', {
    beforeEach: function beforeEach() {
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var adminRole = server.create('role', { type: 'ADMIN' });
      var agent = server.create('user', { role: adminRole, locale: { id: locale.id, resource_type: 'locale' }, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new field sends locale fields for all public locales', function (assert) {
    assert.expect(7);

    server.create('locale', {
      id: 2,
      locale: 'es',
      is_public: false
    });

    visit('/admin/people/user-fields/new/TEXT');

    server.post('/api/v1/users/fields', function (schema, request) {
      var requestData = JSON.parse(request.requestBody);
      assert.equal(requestData.customer_titles.length, 1, '1 customer title');
      assert.equal(requestData.descriptions.length, 1, '1 description');
      assert.equal(requestData.customer_titles[0].locale, 'en-us', 'customer title locale');
      assert.equal(requestData.customer_titles[0].translation, null, 'customer title translation');
      assert.equal(requestData.descriptions[0].locale, 'en-us', 'description locale');
      assert.equal(requestData.descriptions[0].translation, null, 'description translation');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/TEXT');

      fillIn('input.ko-admin_case-fields_edit__title', 'fieldTitle');
      click('.button--primary:first');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/TEXT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/TEXT');
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 0);
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('.qa-admin_case-fields_edit__api-key').length, 1);
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new text area field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/TEXTAREA');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/TEXTAREA');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Multi-line text / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new radio field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/user-fields/new/RADIO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/RADIO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Radio buttons (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new dropdown box field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/user-fields/new/SELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/SELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Dropdown list (single choice) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new checkbox field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/user-fields/new/CHECKBOX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/CHECKBOX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Checkboxes (multiple choices) / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new numeric field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/NUMERIC');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/NUMERIC');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Numerical input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new decimal field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/DECIMAL');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/DECIMAL');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Decimal input / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new file field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/FILE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/FILE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / File upload / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new yes/no toggle field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/YESNO');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/YESNO');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Yes/No toggle / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new cascading select field', function (assert) {
    assert.expect(9);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var option1Title = 'option 1 title';
    var option2Title = 'option 2 title';

    visit('/admin/people/user-fields/new/CASCADINGSELECT');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/CASCADINGSELECT');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Cascading select / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('.ko-reorderable-list-item:first input:first', option1Title);

      click('.i-add-circle');
      fillIn('.ko-reorderable-list-item:last input:first', option2Title);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('.ko-reorderable-list-item:first input:first').val(), option1Title);
      assert.equal(find('.ko-reorderable-list-item:last input:first').val(), option2Title);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new date field', function (assert) {
    assert.expect(7);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';

    visit('/admin/people/user-fields/new/DATE');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/DATE');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Date / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('creating a new regular expression field', function (assert) {
    assert.expect(8);

    window.confirm = function () {
      return assert.ok(false, 'dialogue not expected to be shown');
    };

    var fieldTitle = 'fieldTitle';
    var customerTitle = 'customer title';
    var description = 'description';
    var regEx = 'regex';

    visit('/admin/people/user-fields/new/REGEX');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields/new/REGEX');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / Regular expression / New', 'Edit form default title is correct');

      fillIn('input.ko-admin_case-fields_edit__title', fieldTitle);

      click('div .' + _frontendCpComponentsKoCheckboxStyles['default'].checkboxWrap + ':contains(Customers can see this field) div');
      fillIn('input.ko-admin_case-fields_edit__customer-title', customerTitle);
      fillIn('textarea.ko-admin_case-fields_edit__description', description);

      fillIn('input.ko-admin_case-fields_edit_regex__input', regEx);
    });

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-layout_two-columns__content h3'), 'User fields / ' + fieldTitle, 'Edit form title is correct');

      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + fieldTitle + ')');
    });

    andThen(function () {
      assert.equal(find('input.ko-admin_case-fields_edit__title').val(), fieldTitle);
      assert.equal(find('input.ko-admin_case-fields_edit__customer-title').val(), customerTitle);
      assert.equal(find('textarea.ko-admin_case-fields_edit__description').val(), description);
      assert.equal(find('input.ko-admin_case-fields_edit_regex__input').val(), regEx);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/people/user-fields/reorder-test', ['exports', 'ember', 'qunit', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/components/ko-simple-list/row/styles'], function (exports, _ember, _qunit, _frontendCpTestsHelpersStartApp, _frontendCpComponentsKoSimpleListRowStyles) {

  var radioFieldTitle = 'radio field';
  var normalSelectFieldTitle = 'normal select field';
  var checkboxFieldTitle = 'checkbox field';
  var cascadingSelectFieldTitle = 'cascading select field';

  var option1Title = 'option title 1';
  var option2Title = 'option title 2';
  var option3Title = 'option title 3';
  var option4Title = 'option title 4';

  (0, _qunit.module)('Acceptance | admin/people/user fields/reorder', {
    beforeEach: function beforeEach() {
      this.application = (0, _frontendCpTestsHelpersStartApp['default'])();
      server.create('setting', {
        id: 'account.default_language',
        category: 'account',
        name: 'default_language',
        is_protected: false,
        value: 'en-us',
        resource_type: 'setting'
      });
      server.create('locale', {
        id: 1,
        locale: 'en-us',
        is_public: true
      });
      var radioOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var radioOption1 = server.create('field-option', {
        values: [{ id: radioOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var radioOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var radioOption2 = server.create('field-option', {
        values: [{ id: radioOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var radioOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var radioOption3 = server.create('field-option', {
        values: [{ id: radioOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var radioOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var radioOption4 = server.create('field-option', {
        values: [{ id: radioOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('user-field', {
        title: radioFieldTitle,
        is_system: false,
        type: 'RADIO',
        options: [{ id: radioOption1.id, resource_type: 'field_option' }, { id: radioOption2.id, resource_type: 'field_option' }, { id: radioOption3.id, resource_type: 'field_option' }, { id: radioOption4.id, resource_type: 'field_option' }]
      });
      var normalSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var normalSelectOption1 = server.create('field-option', {
        values: [{ id: normalSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var normalSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var normalSelectOption2 = server.create('field-option', {
        values: [{ id: normalSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var normalSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var normalSelectOption3 = server.create('field-option', {
        values: [{ id: normalSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var normalSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var normalSelectOption4 = server.create('field-option', {
        values: [{ id: normalSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('user-field', {
        title: normalSelectFieldTitle,
        is_system: false,
        type: 'SELECT',
        options: [{ id: normalSelectOption1.id, resource_type: 'field_option' }, { id: normalSelectOption2.id, resource_type: 'field_option' }, { id: normalSelectOption3.id, resource_type: 'field_option' }, { id: normalSelectOption4.id, resource_type: 'field_option' }]
      });
      var checkboxOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var checkboxOption1 = server.create('field-option', {
        values: [{ id: checkboxOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var checkboxOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var checkboxOption2 = server.create('field-option', {
        values: [{ id: checkboxOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var checkboxOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var checkboxOption3 = server.create('field-option', {
        values: [{ id: checkboxOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var checkboxOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var checkboxOption4 = server.create('field-option', {
        values: [{ id: checkboxOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('user-field', {
        title: checkboxFieldTitle,
        is_system: false,
        type: 'CHECKBOX',
        options: [{ id: checkboxOption1.id, resource_type: 'field_option' }, { id: checkboxOption2.id, resource_type: 'field_option' }, { id: checkboxOption3.id, resource_type: 'field_option' }, { id: checkboxOption4.id, resource_type: 'field_option' }]
      });
      var cascadingSelectOption1LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option1Title
      });
      var cascadingSelectOption1 = server.create('field-option', {
        values: [{ id: cascadingSelectOption1LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 1
      });
      var cascadingSelectOption2LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option2Title
      });
      var cascadingSelectOption2 = server.create('field-option', {
        values: [{ id: cascadingSelectOption2LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 2
      });
      var cascadingSelectOption3LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option3Title
      });
      var cascadingSelectOption3 = server.create('field-option', {
        values: [{ id: cascadingSelectOption3LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 3
      });
      var cascadingSelectOption4LocaleField = server.create('locale-field', {
        locale: 'en-us', translation: option4Title
      });
      var cascadingSelectOption4 = server.create('field-option', {
        values: [{ id: cascadingSelectOption4LocaleField.id, resource_type: 'locale_field' }],
        sort_order: 4
      });
      server.create('user-field', {
        title: cascadingSelectFieldTitle,
        is_system: false,
        type: 'CASCADINGSELECT',
        options: [{ id: cascadingSelectOption1.id, resource_type: 'field_option' }, { id: cascadingSelectOption2.id, resource_type: 'field_option' }, { id: cascadingSelectOption3.id, resource_type: 'field_option' }, { id: cascadingSelectOption4.id, resource_type: 'field_option' }]
      });
      var agentRole = server.create('role', { type: 'ADMIN' });
      var locale = server.create('locale', { locale: 'en-us' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
      _ember['default'].run(this.application, 'destroy');
    }
  });

  (0, _qunit.test)('reordering a radio field', function (assert) {
    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + radioFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + radioFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a select field', function (assert) {
    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + normalSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + normalSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a checkbox field', function (assert) {
    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + checkboxFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + checkboxFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });

  (0, _qunit.test)('reordering a cascading select field', function (assert) {
    visit('/admin/people/user-fields');

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains("' + cascadingSelectFieldTitle + '")');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option1Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option4Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });

    reorderInputs('.i-dragstrip', 'input[placeholder="Option title"]', option4Title, option3Title, option2Title, option1Title);

    andThen(function () {
      click('.button--primary:first');
    });

    andThen(function () {
      assert.equal(currentURL(), '/admin/people/user-fields');
      click('.' + _frontendCpComponentsKoSimpleListRowStyles['default'].row + ':contains(' + cascadingSelectFieldTitle + ')');
    });

    scrollToBottomOfPage();

    andThen(function () {
      var expectedOptionTitles = [];
      expectedOptionTitles.push(option4Title);
      expectedOptionTitles.push(option3Title);
      expectedOptionTitles.push(option2Title);
      expectedOptionTitles.push(option1Title);

      assert.deepEqual(inputArrayToInputValArray('input[placeholder="Option title"]'), expectedOptionTitles);
    });
  });
});
define('frontend-cp/tests/acceptance/admin/settings/security-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/expect-request'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersExpectRequest) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/settings/security', {
    beforeEach: function beforeEach() {
      useDefaultScenario();
      login();
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('display settings', function (assert) {
    visit('/admin/settings/security');
    andThen(function () {
      assert.ok(find('.ko-admin-settings-security-authentication').text().includes('Standard Kayako login'));
      assert.equal(find('.ko-admin-settings-security-session-expiry').val(), '8');
      assert.equal(find('.ko-admin-settings-security-login-attempt-limit').val(), '10');
      assert.equal(find('.ko-admin-settings-security-password-expires-in').val(), '0');
      assert.equal(find('.ko-admin-settings-security-minimum-length').val(), '8');
      assert.equal(find('.ko-admin-settings-security-minimum-numbers').val(), '1');
      assert.equal(find('.ko-admin-settings-security-minimum-symbols').val(), '1');
      assert.ok(find('.ko-admin-settings-security-mixed-case').text().includes('Yes'));
      assert.equal(find('.ko-admin-settings-security-maximum-consecutive').val(), '0');
      assert.equal(find('.ko-admin-settings-security-ip-restrictions').val(), '');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('toggle authentication dropdown', function (assert) {
    visit('/admin/settings/security');
    andThen(function () {
      assert.equal(find('.ko-admin-settings-security-login-url').length, 0);
      assert.equal(find('.ko-admin-settings-security-logout-url').length, 0);
      assert.equal(find('.ko-admin-settings-security-shared-secret').length, 0);
      selectChoose('.ko-admin-settings-security-authentication', 'Single sign-on (JWT)');
    });
    andThen(function () {
      assert.equal(find('.ko-admin-settings-security-login-url').val(), 'login url');
      assert.equal(find('.ko-admin-settings-security-logout-url').val(), 'logout url');
      assert.equal(find('.ko-admin-settings-security-shared-secret').val(), 'shared secret');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('display customer settings', function (assert) {
    visit('/admin/settings/security/customers');
    andThen(function () {
      assert.ok(find('.ko-admin-settings-security-authentication').text().includes('Standard Kayako login'));
      assert.ok(find('.ko-admin-settings-security-twitter-login[aria-checked=true]').length === 1);
      assert.ok(find('.ko-admin-settings-security-facebook-login[aria-checked=true]').length === 1);
      assert.equal(find('.ko-admin-settings-security-session-expiry').val(), '72');
      assert.equal(find('.ko-admin-settings-security-login-attempt-limit').val(), '10');
      assert.equal(find('.ko-admin-settings-security-password-expires-in').val(), '0');
      assert.equal(find('.ko-admin-settings-security-minimum-length').val(), '5');
      assert.equal(find('.ko-admin-settings-security-minimum-numbers').val(), '1');
      assert.equal(find('.ko-admin-settings-security-minimum-symbols').val(), '0');
      assert.ok(find('.ko-admin-settings-security-mixed-case').text().includes('No'));
      assert.equal(find('.ko-admin-settings-security-maximum-consecutive').val(), '0');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('toggle customer authentication dropdown', function (assert) {
    visit('/admin/settings/security/customers');
    andThen(function () {
      assert.equal(find('.ko-admin-settings-security-login-url').length, 0);
      assert.equal(find('.ko-admin-settings-security-logout-url').length, 0);
      assert.equal(find('.ko-admin-settings-security-shared-secret').length, 0);
      selectChoose('.ko-admin-settings-security-authentication', 'Single sign-on (JWT)');
    });
    andThen(function () {
      assert.equal(find('.ko-admin-settings-security-login-url').val(), 'customer login url');
      assert.equal(find('.ko-admin-settings-security-logout-url').val(), 'customer logout url');
      assert.equal(find('.ko-admin-settings-security-shared-secret').val(), 'customer shared secret');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('edit agent settings', function (assert) {
    visit('/admin/settings/security');
    selectChoose('.ko-admin-settings-security-authentication', 'Single sign-on (JWT)');
    fillIn('.ko-admin-settings-security-login-url', 'http://example.com');
    fillIn('.ko-admin-settings-security-logout-url', 'http://example.com/logout');
    fillIn('.ko-admin-settings-security-shared-secret', 'new shared secter');
    fillIn('.ko-admin-settings-security-session-expiry', '9');
    fillIn('.ko-admin-settings-security-login-attempt-limit', '11');
    fillIn('.ko-admin-settings-security-password-expires-in', '1');
    fillIn('.ko-admin-settings-security-minimum-length', '9');
    fillIn('.ko-admin-settings-security-minimum-numbers', '2');
    fillIn('.ko-admin-settings-security-minimum-symbols', '2');
    selectChoose('.ko-admin-settings-security-mixed-case', 'No');
    fillIn('.ko-admin-settings-security-maximum-consecutive', '1');
    fillIn('.ko-admin-settings-security-ip-restrictions', '192.168.0.1');
    click('button[name=submit].button');
    (0, _frontendCpTestsHelpersExpectRequest['default'])(server.pretender, {
      verb: 'PUT',
      path: '/api/v1/settings',
      query: {
        include: '*'
      },
      headers: {
        'X-Options': 'flat',
        'X-Session-ID': 'pPW6tnOyJG6TmWCVea175d1bfc5dbf073a89ffeb6a2a198c61aae941Aqc7ahmzw8a'
      },
      payload: {
        values: {
          'security.agent.authentication_type': 'jwt',
          'security.agent.sso.jwt.login_url': 'http://example.com',
          'security.agent.sso.jwt.logout_url': 'http://example.com/logout',
          'security.agent.sso.jwt.shared_secret': 'new shared secter',
          'security.agent.session_expiry': '9',
          'security.agent.login_attempt_limit': '11',
          'security.agent.password.expires_in': '1',
          'security.agent.password.min_characters': '9',
          'security.agent.password.min_numbers': '2',
          'security.agent.password.min_symbols': '2',
          'security.agent.password.require_mixed_case': '0',
          'security.agent.password.max_consecutive': '1',
          'security.agent.ip_restriction': '192.168.0.1'
        }
      }
    });
  });
});
define('frontend-cp/tests/acceptance/admin/settings/users-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | admin/settings/users', {
    beforeEach: function beforeEach() {
      useDefaultScenario();
      login();
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('display settings', function (assert) {
    visit('/admin/settings/users');
    andThen(function () {
      assert.ok(find('.ko-admin-settings-users-allow-from-unregistered[aria-checked=true]').length === 1);
      assert.ok(find('.ko-admin-settings-users-require-captcha[aria-checked=true]').length === 1);
      assert.equal(find('.ko-admin-settings-users-email-whitelist').val(), 'email whitelist');
      assert.equal(find('.ko-admin-settings-users-email-blacklist').val(), 'email blacklist');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/cases/create-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-tabs/styles', 'frontend-cp/session/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoTabsStyles, _frontendCpSessionStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Create case', {
    beforeEach: function beforeEach() {
      createView();

      var locale = server.create('locale', { locale: 'en-us' });
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var agentRole = server.create('role', { type: 'AGENT' });
      var customerRole = server.create('role', { type: 'AGENT' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      server.create('user', { full_name: 'Barney Stinson', role: customerRole, locale: locale, time_zone: 'Europe/London' });
      server.createList('case-status', 5);
      server.createList('case-priority', 4);
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a case using the "+" button in the main header', function (assert) {
    visit('/agent');

    click('.ko-agent-dropdown__add-icon');

    andThen(function () {
      assert.equal(find('.ko-agent-dropdown__drop').is(':visible'), true, '"+" Dropdown content should be visible');
      click('.ko-agent-dropdown__nav-item:eq(0)');
    });

    andThen(function () {
      click('.ko-agent-dropdown-create-case__input .ember-power-select-trigger');
    });

    andThen(function () {
      find('.ember-power-select-trigger input').val('Barney');
      var evt = new window.Event('input');
      find('.ember-power-select-trigger input')[0].dispatchEvent(evt);
    });

    andThen(function () {
      click('.ember-power-select-option');
    });

    andThen(function () {
      click('.ko-agent-dropdown__drop .button--primary');
    });

    andThen(function () {
      assert.ok(new RegExp('\/agent\/cases\/new\/\\d{4}-\\d{2}-\\d{2}-\\d{2}-\\d{2}-\\d{2}\\?requester_id=2').test(currentURL()), 'Current URL matches the expected format');

      assert.equal(find('.ko-agent-dropdown__drop').is(':visible'), false, '"+" Dropdown content should be hidden');

      assert.equal(find('.ko-layout_advanced__sidebar .ko-info-bar_item:eq(1) input').val(), 'Barney Stinson', 'The recipient of the new case is Barney');
      assert.ok(find('.' + _frontendCpComponentsKoTabsStyles['default'].item + ':eq(0)').text().trim() === 'Barney Stinson' && find('.' + _frontendCpComponentsKoTabsStyles['default'].item + ':eq(1)').text().trim() === 'New case', 'Breadcrums are correct');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 1, 'There is only one tab');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab + '.active').length, 1, 'That tab is active');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).text().trim(), 'New case', 'That tab belongs to the case being created');
      click('.ko-layout_advanced_section__subject .editable-text__text');
      fillIn('.ko-layout_advanced_section__subject input', 'No internet');
      triggerEvent('.ko-layout_advanced_section__subject input', 'input');
    });

    andThen(function () {
      find('.ko-layout_advanced_section__subject input').trigger($.Event('keydown', { which: 13, keyCode: 13 }));
      fillInRichTextEditor('I press the button and the bomb explodes');
    });

    andThen(function () {
      // click('.ko-info-bar_item:contains("Case form")');
      // click('.ko-info-bar_item:contains("Case form") .dropdown-menu__item:contains("Internet Related Issue")');
      click('.ko-layout_advanced__sidebar .button--primary');
      var status = find('.ko-info-bar_item__header:contains("Status")').next().val();
      assert.equal(status, 'New', 'Status defaults to NEW');
    });

    andThen(function () {
      var status = find('.ko-info-bar_item__header:contains("Status")').next().val();
      assert.equal(status, 'Open', 'Status has updated to OPEN');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 1, 'There is only one tab');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).text().trim(), 'No internet', 'That title of the tab has updated');
      assert.equal(currentURL(), '/agent/cases/1');
    });
  });

  function createView() {
    var columns = server.createList('column', 5);

    var propositionAssignedToCurrentUser = server.create('proposition', {
      field: 'cases.assigneeagentid',
      operator: 'comparison_equalto',
      value: '(current_user)'
    });

    var inboxPredicateCollection = server.create('predicate-collection', {
      propositions: [{ id: propositionAssignedToCurrentUser.id, resource_type: 'proposition' }]
    });

    server.create('view', {
      title: 'Inbox',
      is_default: true,
      is_enabled: true,
      is_system: true,
      order_by: 'DESC',
      order_by_column: 'caseid',
      columns: columns,
      predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
      sort_order: 1,
      type: 'INBOX'
    });
  }
});
/* eslint-disable new-cap */
define('frontend-cp/tests/acceptance/agent/cases/list-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'ember', 'frontend-cp/session/styles', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-info-bar/field/select/trigger/styles', 'frontend-cp/components/ko-pagination/styles'], function (exports, _frontendCpTestsHelpersQunit, _ember, _frontendCpSessionStyles, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles, _frontendCpComponentsKoPaginationStyles) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | List', {
    beforeEach: function beforeEach() {
      var enUsLocale = server.create('locale', {
        locale: 'en-us'
      });
      server.create('permission', { name: 'agent.cases.public_reply' });
      server.create('permission', { name: 'agent.cases.trash' });

      var organization = server.create('organization');
      var team = server.create('team');
      var role = server.create('role', { title: 'Admin', type: 'ADMIN', id: 1 });

      server.create('contact-address');
      server.create('contact-website');

      server.create('identity-domain');
      var identityEmail = server.create('identity-email');
      server.create('identity-phone');

      var custom_fields = server.createList('user-field-value', 3);
      var metadata = server.create('metadata');
      var defaultUser = server.create('user', {
        custom_fields: custom_fields,
        emails: [{ id: identityEmail.id, resource_type: 'identityEmail' }],
        locale: { id: enUsLocale.id, resource_type: 'locale' },
        organization: { id: organization.id, resource_type: 'organization' },
        role: { id: role.id, resource_type: 'role' },
        teams: [{ id: team.id, title: team.title, resource_type: 'team' }],
        time_zone: 'Europe/London'
      });

      server.create('session', { user: { id: defaultUser.id, resource_type: 'user' } });

      var columns = server.createList('column', 5);
      var propositionAssignedToCurrentUser = server.create('proposition', {
        field: 'cases.assigneeagentid',
        operator: 'comparison_equalto',
        value: '(current_user)'
      });
      var stringProposition = server.create('proposition', {
        field: 'cases.subject',
        operator: 'string_contains',
        value: 'dave'
      });
      var inboxPredicateCollection = server.create('predicate-collection', {
        propositions: [{ id: propositionAssignedToCurrentUser.id, resource_type: 'proposition' }]
      });
      var simplePredicateCollection = server.create('predicate-collection', {
        propositions: [{ id: stringProposition.id, resource_type: 'proposition' }]
      });

      server.create('view', {
        title: 'Inbox',
        is_default: true,
        is_enabled: true,
        is_system: true,
        order_by: 'DESC',
        order_by_column: 'caseid',
        columns: columns,
        predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
        sort_order: 1,
        type: 'INBOX'
      });
      server.create('view', {
        title: 'Test basic custom view',
        is_default: false,
        is_enabled: true,
        is_system: false,
        order_by: 'DESC',
        order_by_column: 'caseid',
        columns: columns,
        predicate_collections: [{ id: simplePredicateCollection.id, resource_type: 'predicate_collection' }],
        sort_order: 2,
        type: 'CUSTOM',
        visibility_type: 'ALL'
      });
      server.create('view', {
        title: 'Trash',
        is_default: false,
        is_enabled: true,
        is_system: true,
        sort_order: 5,
        type: 'TRASH'
      });

      var operatorsForInputTypeString = ['string_contains', 'string_does_not_contain'];

      server.create('definition', {
        field: 'cases.subject',
        group: 'CASES',
        type: 'STRING',
        sub_type: '',
        input_type: 'STRING',
        label: 'STRING',
        operators: operatorsForInputTypeString,
        values: ''
      });

      var assignedAgent = defaultUser;
      var assignedTeam = team;
      var brand = server.create('brand', { locale: enUsLocale });
      var statuses = server.createList('case-status', 5);
      var status = statuses[0];
      var priority = server.create('case-priority');
      var type = server.create('type');
      var slaVersion = server.create('sla-version');
      var caseSlaMetrics = server.createList('sla-metric', 3);
      var tags = server.createList('tag', 2);

      var caseFields = server.createList('case-field', 14);

      server.createList('case', 50, {
        source_channel: null,
        requester: defaultUser,
        creator: defaultUser,
        identity: identityEmail,
        assignedAgent: assignedAgent,
        assignedTeam: assignedTeam,
        brand: brand,
        status: status,
        priority: priority,
        type: type,
        sla_version: slaVersion,
        sla_metrics: caseSlaMetrics,
        tags: tags,
        custom_fields: [],
        metadata: metadata,
        last_replier: defaultUser,
        last_replier_identity: identityEmail
      });

      server.createList('case-priority', 3);
      server.createList('case-type', 4, {
        resource_url: function resource_url(i) {
          return 'http://novo/api/index.php?/v1/cases/types/' + ++i;
        }
      });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });

      var limit = server.create('plan-limit', {
        collaborators: 10,
        agents: 5
      });

      var feature = server.create('feature', {
        code: 3232,
        name: 'collaborators',
        description: 'People who may log in as a team member'
      });

      server.create('plan', { limits: limit, features: [feature], account_id: '123', subscription_id: '123' });

      var macroAssignee = server.create('macro-assignee');
      var macroVisibility = server.create('macro-visibility');

      server.create('macro', {
        agent: defaultUser,
        assignee: macroAssignee,
        visibility: macroVisibility
      });

      login();
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('sort case list', function (assert) {
    assert.expect(6);
    visit('/agent/cases');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
      assert.equal(find('tbody tr').length, 20);
      assert.equal(find('tbody tr:first td:nth-child(3)').text().trim(), '1');
      click('thead th:nth-child(3)');
    });

    andThen(function () {
      assert.ok(find('thead th:nth-child(3) span:last').hasClass('i-chevron-small-up'));
      click('thead th:nth-child(3)');
    });

    andThen(function () {
      assert.ok(find('thead th:nth-child(3) span:last').hasClass('i-chevron-small-down'));
      assert.equal(find('tbody tr:first td:nth-child(3)').text().trim(), '50');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Meta click opens in new tab', function (assert) {
    assert.expect(4);
    visit('/agent');
    visit('/agent/cases');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 0);
      triggerEvent('.ko-cases-list__row:first-child', 'click', { metaKey: true });
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 1);
      triggerEvent('.ko-cases-list__row:first-child', 'click', { metaKey: true });
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Disabled views are not displayed', function (assert) {
    assert.expect(3);

    server.create('view', {
      title: 'DisabledView',
      is_default: false,
      is_enabled: false,
      is_system: false,
      order_by: 'DESC',
      order_by_column: 'caseid',
      columns: [],
      sort_order: 3
    });

    server.create('view', {
      title: 'EnabledView',
      is_default: false,
      is_enabled: true,
      is_system: false,
      order_by: 'DESC',
      order_by_column: 'caseid',
      columns: [],
      sort_order: 4
    });

    visit('/agent');
    visit('/agent/cases');

    andThen(function () {
      assert.equal(find('.sidebar__link').length, 5);
      assert.equal(find('.sidebar__link').text().indexOf('DisabledView'), -1);
      assert.ok(find('.sidebar__link').text().indexOf('EnabledView') > -1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Unavailable views redirect to default', function (assert) {
    assert.expect(1);
    visit('/agent/cases/view/666');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Selecting cases shows trash button and bulk sidebar, hides pagination', function (assert) {
    assert.expect(6);
    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
      assert.equal(find('.ko-cases-list__action-button').length, 0);
    });

    andThen(function () {
      assert.ok(find('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationContainer).length);
      click('tbody .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      assert.equal(find('.ko-cases-list__action-button').length, 1);
      assert.notOk(find('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationContainer).length);
      assert.equal(find('.ko-bulk-sidebar__title').text().trim(), 'Update Cases');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Select all cases', function (assert) {
    assert.expect(2);
    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox).attr('aria-checked'), 'true');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Show confirmation when trashing cases', function (assert) {
    assert.expect(2);

    window.confirm = function () {
      return assert.ok(true, 'dialogue shown');
    };
    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      click('.ko-cases-list__action-button');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Bulk side bar should be shown with "No Changes" options set and cancel button disabled as default', function (assert) {
    assert.expect(6);

    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      var _this = this;

      assert.equal(find('.ko-info-bar_field_drill-down__placeholder').text(), 'No Changes');
      find('.' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder).each(function (index, placeholder) {
        assert.equal(_this.$(placeholder).text(), 'No Changes');
      });
      assert.ok(find('button[name=update-cases]').hasClass('disabled'));
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Bulk sidebar cancel button shows returns the screen to its pre-selection state', function (assert) {
    assert.expect(6);

    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      assert.equal(find('.ko-bulk-sidebar__title').text().trim(), 'Update Cases');
      assert.equal(find('button:contains("Trash cases")').length, 1);
      click('button[name=cancel]');
    });

    andThen(function () {
      assert.equal(find('.sidebar__first-item').text().trim(), 'Inbox');
      assert.equal(find('button:contains("Trash cases")').length, 0);
      assert.equal(find('.' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox).attr('aria-checked'), 'false');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('After a bulk update has been performed the view sidebar should be shown and no cases should be selected', function (assert) {
    assert.expect(4);

    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      assert.equal(find('.ko-bulk-sidebar__title').text().trim(), 'Update Cases');
      selectChoose('.fields div:nth-child(2)', 'Open');
      click('button[name=update-cases]');
    });

    andThen(function () {
      assert.equal(find('.sidebar__first-item').text().trim(), 'Inbox');
      assert.equal(find('.' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox).attr('aria-checked'), 'false');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('After a bulk update has been performed the values should be cleared before a subsequent update is attempted', function (assert) {
    assert.expect(7);

    visit('/agent/cases/view/1');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      assert.equal(find('.ko-bulk-sidebar__title').text().trim(), 'Update Cases');
      selectChoose('.fields div:nth-child(2)', 'Open');
      selectChoose('.fields div:nth-child(3)', 'Question');
      selectChoose('.fields div:nth-child(4)', 'Low');
    });

    andThen(function () {
      _ember['default'].$('.fields div:nth-child(5) input').val('tag test');
      _ember['default'].$('.fields div:nth-child(5) input').trigger('input');
    });

    andThen(function () {
      click('button[name=update-cases]');
    });

    andThen(function () {
      click('thead .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':first');
    });

    andThen(function () {
      var _this2 = this;

      assert.equal(find('.ko-info-bar_field_drill-down__placeholder').text(), 'No Changes');
      find('.' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder).each(function (index, placeholder) {
        assert.equal(_this2.$(placeholder).text(), 'No Changes');
      });
      assert.equal(find('.fields div:nth-child(5) ul').text().trim(), '');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('REGRESSION(FT-278) A case without assignee (assignee.agent and assignee.team are null) is not considered dirty', function (assert) {
    assert.expect(1);
    var defaultUser = server.db.users.find(1);

    var unassignedCase = unassignedCase = server.create('case', {
      assignee: server.create('assignee', { agent: null, team: null }),
      source_channel: null,
      requester: defaultUser,
      creator: defaultUser,
      identity: server.db.identityEmails.find(1),
      status: server.db.caseStatuses.find(1)
    });

    visit('/agent/cases/' + unassignedCase.id);

    andThen(function () {
      assert.ok(!/Assignee/i.test($('.ko-info-bar_item--edited .ko-info-bar_item__header').text()));
    });
  });
});
/* eslint-disable camelcase */
define('frontend-cp/tests/acceptance/agent/cases/organization-timeline-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers) {

  var targetCase = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | agent/cases/organization timeline', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.organizations.update' });
      var locale = server.create('locale', { id: 1, locale: 'en-us' });
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      var sourceChannel = server.create('channel', { account: mailbox });
      var noteChannel = server.create('channel', { type: 'NOTE' });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var agentRole = server.create('role', { type: 'AGENT' });
      var customerRole = server.create('role', { type: 'AGENT' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      var organization = server.create('organization');
      var customer = server.create('user', {
        full_name: 'Barney Stinson',
        role: customerRole,
        locale: locale,
        organization: { id: organization.id, resource_type: 'organization' },
        time_zone: 'Europe/London'
      });
      var identityEmail = server.create('identity-email');
      server.createList('case-status', 5);
      server.createList('case-priority', 4);
      server.createList('attachment', 3);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var status = server.create('case-status');
      targetCase = server.create('case', {
        source_channel: sourceChannel,
        requester: customer,
        creator: agent,
        identity: identityEmail,
        status: status,
        assignee: {
          agent: agent
        }
      });

      server.createList('activity', 25, {
        summary: 'Test activity'
      });

      var note = server.create('note');

      server.createList('post', 25, {
        creator: agent,
        identity: identityEmail,
        'case': targetCase,
        original: note,
        source_channel: noteChannel
      });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
      targetCase = null;
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('it filters feed items to show only notes', function (assert) {
    assert.expect(2);

    visit('/agent/cases/' + targetCase.id + '/organization');

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Notes displayed');
      assert.equal(find('.qa-feed_activity').length, 0, 'Activities not displayed');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('it filters feed items to show only activities', function (assert) {
    assert.expect(3);

    visit('/agent/cases/' + targetCase.id + '/organization');

    selectChoose('.qa-timeline__filter', 'Activities');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 0, 'Notes not displayed');
      assert.equal(find('.qa-feed_activity').length, 20, 'Activities displayed');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-timeline_activity__summary:eq(0)'), 'Test activity', 'Activity text displayed');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('default filter', function (assert) {
    assert.expect(1);

    visit('/agent/cases/' + targetCase.id + '/organization');

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-timeline__filter .ember-power-select-placeholder'), 'Filter: Notes', 'Default filter is correct');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more note entries below', function (assert) {
    assert.expect(4);

    visit('/agent/cases/' + targetCase.id + '/organization');

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Default number of notes displayed');
      assert.equal(find('.qa-timeline__load-more-below').length, 1, 'Load more link available due to more posts to load');
    });

    click('.qa-timeline__load-more-below');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 25, 'Load more notes below');
      assert.equal(find('.qa-timeline__load-more-below').length, 0, 'Load more link hidden due to no more posts to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more note entries above', function (assert) {
    assert.expect(4);

    var allPosts = server.db.posts.sortBy('created_at').reverse();
    var postId = allPosts[2].id;

    visit('/agent/cases/' + targetCase.id + '/organization?postId=' + postId);

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Last 8 notes displayed');
      assert.equal(find('.qa-timeline__load-more-above').length, 1, 'Load more link available due to more posts to load');
    });

    click('.qa-timeline__load-more-above');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 22, 'Load more notes');
      assert.equal(find('.qa-timeline__load-more-above').length, 0, 'Load more link hidden due to no more posts to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more activity entries below', function (assert) {
    assert.expect(4);

    visit('/agent/cases/' + targetCase.id + '/organization');

    selectChoose('.qa-timeline__filter', 'Activities');

    andThen(function () {
      assert.equal(find('.qa-feed_activity').length, 20, 'Default number of activities displayed');
      assert.equal(find('.qa-timeline__load-more-below').length, 1, 'Load more link available due to more activities to load');
    });

    click('.qa-timeline__load-more-below');

    andThen(function () {
      assert.equal(find('.qa-feed_activity').length, 25, 'Load more activities below');
      assert.equal(find('.qa-timeline__load-more-below').length, 0, 'Load more link hidden due to no more activities to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('adding a note updates the timeline when filtering by notes', function (assert) {
    assert.expect(3);

    visit('/agent/cases/' + targetCase.id + '/organization');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Begin with 20 notes');
    });

    andThen(function () {
      selectChoose('.qa-timeline__filter', 'Notes');
      click('.ko-layout_advanced_editor__placeholder');
      fillInRichTextEditor('Testing notes');
    });

    andThen(function () {
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 21, 'Now there are 21 notes');
      assert.equal(find('.ko-feed_item:eq(0) .ko-feed_item__content').text().trim(), 'Testing notes', 'The added note is in the top');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/cases/replying-to-a-facebook-message-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'qunit', 'ember-platform'], function (exports, _frontendCpTestsHelpersQunit, _qunit, _emberPlatform) {
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Replying to a Facebook message', {
    beforeEach: function beforeEach() {
      this.agent = createAgent();
      this['case'] = createCase();

      var session = server.create('session', { user: this.agent });

      login(session.id);
      visit('/agent/cases/' + this['case'].id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _qunit.test)('using the channel selector', function (assert) {
    var _this = this;

    andThen(function () {
      click('.qa-ko-case-content__reply');
      selectChoose('.qa-post__channel-selector', 'Brewfictus - Message');
    });

    andThen(function () {
      fillInRichTextEditor('An answer via Facebook');
    });

    andThen(function () {
      click('button:contains("Submit")');
    });

    // Assert we sent the correct data
    server.post('/api/v1/cases/' + this['case'].id + '/reply', function (schema, req) {
      verifyRequest(assert, req, _this);
      return createResponse(_this);
    });

    // Assert we rendered the correct result
    andThen(function () {
      var item = findWithAssert('.ko-feed_item:first');
      var content = item.find('.ko-feed_item__content');
      var subtitle = item.find('.qa-ko-timeline_item__subtitle');

      assert.equal(content.text().trim(), 'An answer via Facebook');
      assert.equal(subtitle.text().trim(), 'via Facebook');
    });
  });

  (0, _qunit.test)('using the inline reply button', function (assert) {
    var _this2 = this;

    andThen(function () {
      triggerEvent('.ko-feed_item:first', 'mouseover');
      click('.qa-ko-timeline_item_menu__reply');
      fillInRichTextEditor('An answer via Facebook');
    });

    andThen(function () {
      click('button:contains("Submit")');
    });

    // Assert we sent the correct data
    server.post('/api/v1/cases/' + this['case'].id + '/reply', function (schema, req) {
      verifyRequest(assert, req, _this2, {
        in_reply_to_uuid: _this2['case'].posts[0].uuid
      });
      return createResponse(_this2);
    });

    // Assert we rendered the correct result
    andThen(function () {
      var item = findWithAssert('.ko-feed_item:first');
      var content = item.find('.ko-feed_item__content');
      var subtitle = item.find('.qa-ko-timeline_item__subtitle');

      assert.equal(content.text().trim(), 'An answer via Facebook');
      assert.equal(subtitle.text().trim(), 'via Facebook');
    });
  });

  // Fixtures

  var FACEBOOK_PAGE = 'Brewfictus';
  var CUSTOMER_NAME = 'Caryn Pryor';
  var AGENT_NAME = 'Jordan Mitchell';

  function createAgent() {
    var name = AGENT_NAME;
    var role = server.create('role', { type: 'AGENT' });
    var identity = server.create('identity-facebook', { full_name: name });
    var agent = server.create('user', {
      full_name: name,
      role: role,
      facebook: [identity],
      time_zone: 'Europe/London'
    });

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

    return agent;
  }

  function createCase() {
    var customer = createCustomer();
    var identity = customer.facebook[0];
    var channel = createChannel();
    var status = server.create('case-status');
    var kase = server.create('case', {
      source_channel: channel,
      creator: customer,
      requester: customer,
      identity: identity,
      status: status
    });
    var post = server.create('post', {
      contents: 'A question via Facebook',
      creator: customer,
      requester: customer,
      identity: identity,
      source_channel: channel
    });

    kase.posts = [post];

    return kase;
  }

  function createCustomer() {
    var name = CUSTOMER_NAME;
    var role = server.create('role', { type: 'CUSTOMER' });
    var identity = server.create('identity-facebook', { full_name: name });
    var customer = server.create('user', {
      full_name: name,
      role: role,
      facebook: [identity],
      time_zone: 'Europe/London'
    });

    return customer;
  }

  function createChannel() {
    var title = FACEBOOK_PAGE;
    var account = server.create('facebook-account', { title: title });
    var channel = server.create('channel', { type: 'FACEBOOK', account: account });

    channel.id = channel.uuid;

    return channel;
  }

  function verifyRequest(assert, req, context, fields) {
    var actualPayload = JSON.parse(req.requestBody);

    var expectedPayload = (0, _emberPlatform.assign)({
      contents: 'An answer via Facebook',
      channel: 'FACEBOOK',
      channel_id: context['case'].source_channel.account.id,
      subject: 'ERS Audit 1',
      requester_id: '2',
      in_reply_to_uuid: null,
      status_id: null,
      priority_id: null,
      type_id: null,
      assigned_team_id: null,
      assigned_agent_id: null,
      tags: '',
      form_id: null,
      field_values: {},
      attachment_file_ids: ''
    }, fields);

    assert.deepEqual(actualPayload, expectedPayload);
  }

  function createResponse(context) {
    var post = {
      id: 71,
      uuid: 'adddf2fc-8113-4f4b-9c71-40d4a2f44a5b',
      contents: 'An answer via Facebook',
      creator: { id: context.agent.id, resource_type: 'user' },
      identity: { id: context.agent.facebook[0].id, resource_type: 'identity_facebook' },
      source_channel: { id: context['case'].source_channel.uuid, resource_type: 'channel' },
      created_at: new Date(),
      updated_at: new Date(),
      resource_url: '/api/v1/cases/posts/71'
    };

    var reply = {
      resource_type: 'case_reply',
      posts: [{ id: post.id, resource_type: 'post' }],
      'case': { id: context['case'].id, resource_type: 'case' }
    };

    var response = {
      data: reply,
      resource: 'case_reply',
      resources: {
        'case': _defineProperty({}, context['case'].id, context['case']),
        post: _defineProperty({}, post.id, post)
      }
    };

    return response;
  }
});
define('frontend-cp/tests/acceptance/agent/cases/subject-created-at-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit', 'qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit, _qunit) {

  var customer = undefined,
      caseStatus = undefined,
      agent = undefined,
      agentRole = undefined,
      locale = undefined,
      sourceChannel = undefined,
      identityEmail = undefined;

  var StubDateService = _ember['default'].Service.extend({
    getNewDate: function getNewDate(dateTime) {
      return new Date('2016', '6', '4', '13', '22', '33');
    }
  });

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Subject created at', {
    beforeEach: function beforeEach(application) {
      application.register('service:stubDate', StubDateService);
      application.inject('helper:ko-intl-datetime-format', 'date', 'service:stubDate');

      locale = server.create('locale', { locale: 'en-us' });
      var customerRole = server.create('role', { type: 'AGENT' });
      customer = server.create('user', { full_name: 'Mickey Bubbles', role: customerRole, locale: locale, time_zone: 'Europe/London' });

      var brand = server.create('brand', { locale: locale });
      var mailbox = server.create('mailbox', { brand: brand });
      sourceChannel = server.create('channel', { account: mailbox });

      agentRole = server.create('role', { type: 'AGENT' });

      server.create('plan', {
        limits: {},
        features: []
      });

      identityEmail = server.create('identity-email');
      caseStatus = server.create('case-status');
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _qunit.test)('it shows the created date relative to Africa/Casablanca timezone', function (assert) {
    assert.expect(1);

    agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Africa/Casablanca' });
    var session = server.create('session', { user: agent });
    login(session.id);

    var targetCase = server.create('case', {
      source_channel: sourceChannel,
      requester: customer,
      creator: agent,
      identity: identityEmail,
      status: caseStatus,
      created_at: '2016-07-04T13:22:33+00:00',
      assignee: {
        agent: agent
      }
    });

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-ko-case-content__subject-subtitle').text().trim(), 'Jul 4, 2016 – 1:22 PM created via email', 'No offset from UTC has been applied');
    });
  });

  (0, _qunit.test)('it shows the created date relative to Indian/Maldives timezone', function (assert) {
    assert.expect(1);

    agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Indian/Maldives' });
    var session = server.create('session', { user: agent });
    login(session.id);

    var targetCase = server.create('case', {
      source_channel: sourceChannel,
      requester: customer,
      creator: agent,
      identity: identityEmail,
      status: caseStatus,
      created_at: '2016-07-04T13:22:33+00:00',
      assignee: {
        agent: agent
      }
    });

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-ko-case-content__subject-subtitle').text().trim(), 'Jul 4, 2016 – 6:22 PM created via email', 'An offset of 5 hours from UTC has been applied');
    });
  });

  (0, _qunit.test)('it shows the created date relative to the local time zone if none is specified', function (assert) {
    assert.expect(1);

    agent = server.create('user', { role: agentRole, locale: locale, time_zone: '' });
    var session = server.create('session', { user: agent });
    login(session.id);

    var targetCase = server.create('case', {
      source_channel: sourceChannel,
      requester: customer,
      creator: agent,
      identity: identityEmail,
      status: caseStatus,
      created_at: '2016-07-04T13:22:33+00:00',
      assignee: {
        agent: agent
      }
    });

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-ko-case-content__subject-subtitle').text().trim(), 'Jul 4, 2016 – 1:22 PM created via email', 'No offset from UTC has been applied as stubbed date has been used');
    });
  });
});
/* eslint-disable new-cap */
define('frontend-cp/tests/acceptance/agent/cases/timeline-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'qunit', 'sinon', 'frontend-cp/components/ko-text-editor/mode-selector/styles'], function (exports, _frontendCpTestsHelpersQunit, _qunit, _sinon, _frontendCpComponentsKoTextEditorModeSelectorStyles) {

  var targetCase = undefined,
      identityEmail = undefined,
      agent = undefined,
      originalConfirm = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Timeline', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', { locale: 'en-us' });
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      var twitterAccount = server.create('twitter-account', { brand: brand });
      var sourceChannel = server.create('channel', { account: mailbox });
      server.create('channel', { type: 'NOTE' });

      var twitterChannel = server.create('channel', { type: 'TWITTER', account: twitterAccount });
      var helpCenterChannel = server.create('channel', { type: 'HELPCENTER' });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var agentRole = server.create('role', { type: 'AGENT' });
      var customerRole = server.create('role', { type: 'AGENT' });
      agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      var customer = server.create('user', { full_name: 'Barney Stinson', role: customerRole, locale: locale, time_zone: 'Europe/London' });
      identityEmail = server.create('identity-email');
      server.createList('case-status', 5);
      server.createList('case-priority', 4);
      server.createList('attachment', 3);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var status = server.create('case-status');
      targetCase = server.create('case', {
        source_channel: sourceChannel,
        requester: customer,
        creator: agent,
        identity: identityEmail,
        status: status,
        assignee: {
          agent: agent
        }
      });

      var caseMessage = server.create('case-message', { type: 'case-message' });

      server.createList('post', 3, {
        creator: agent,
        identity: identityEmail,
        'case': targetCase,
        original: caseMessage,
        source_channel: sourceChannel
      });

      var twitterTweet = server.create('twitter-tweet');

      this.tweet = server.create('post', {
        creator: agent,
        identity: identityEmail,
        'case': targetCase,
        original: twitterTweet,
        source_channel: twitterChannel
      });

      server.create('post', {
        creator: agent,
        identity: identityEmail,
        'case': targetCase,
        original: caseMessage,
        source_channel: helpCenterChannel
      });

      login(session.id);

      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
      targetCase = null;
    }
  });

  (0, _qunit.test)('it shows messages, notes and attachments', function (assert) {
    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-feed_item--post').length, 3, 'There is three posts');
    });
  });

  (0, _qunit.test)('posts have linkified text', function (assert) {
    server.create('post', {
      creator: agent,
      identity: identityEmail,
      'case': targetCase,
      original: null,
      created_at: new Date(),
      contents: 'http://google.com'
    });

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal($('.ko-feed_item__content:first').html().trim(), '<a href="http://google.com" target="_blank">http://google.com</a>');
    });
  });

  (0, _qunit.test)('posts have a link to the original message', function (assert) {
    var _this = this;

    assert.expect(3);

    _sinon['default'].stub(window, 'open');

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      click('.qa-feed_item--post:first .qa-link-to-message');
    });

    andThen(function () {
      var postId = find('.qa-feed_item--post:first').attr('data-id');
      assert.ok(window.open.calledWithMatch('/agent/case/display/original/' + targetCase.id + '/' + postId), 'Link to original email');
    });

    andThen(function () {
      click('.qa-feed_item--twitter-post:first .qa-link-to-message');
    });

    andThen(function () {
      var screenName = _this.tweet.original.screen_name;
      var id = _this.tweet.original.id;

      assert.ok(window.open.calledWithMatch('https://twitter.com/' + screenName + '/status/' + id), 'Link to original tweet');
      window.open.restore();
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--helpcenter-post:first a.qa-link-to-message').length, 0, 'Help Center post does not link to original');
    });
  });

  (0, _qunit.test)('add replies', function (assert) {
    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-feed_item--post').length, 3, 'There is three posts');
      click('.ko-layout_advanced_editor__placeholder');
    });

    andThen(function () {
      fillInRichTextEditor('Testing replies');
    });

    andThen(function () {
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--post').length, 4, 'There is four posts now');
      assert.equal(find('.qa-feed_item--post:eq(0) .ko-feed_item__content').text().trim(), 'Testing replies', 'The added post is in the top');
    });
  });

  (0, _qunit.test)('add notes', function (assert) {
    assert.expect(5);

    visit('/agent/cases/' + targetCase.id);

    andThen(function () {
      assert.equal(find('.qa-feed_item--post').length, 3, 'There is three posts');
      assert.equal(find('.ko-feed_item').length, 5, 'There are five items');
      click('.ko-layout_advanced_editor__placeholder');
    });

    andThen(function () {
      click('.' + _frontendCpComponentsKoTextEditorModeSelectorStyles['default'].root);
      fillInRichTextEditor('Testing notes');
    });

    andThen(function () {
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--post').length, 3, 'There is still 3 posts');
      assert.equal(find('.ko-feed_item').length, 6, 'There are six items now');
      assert.equal(find('.ko-feed_item:eq(0) .ko-feed_item__content').text().trim(), 'Testing notes', 'The added note is in the top');
    });
  });
});
/* eslint-disable new-cap */
define('frontend-cp/tests/acceptance/agent/cases/update-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Update', {
    beforeEach: function beforeEach() {
      useDefaultScenario();
      login();
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Tag added', function (assert) {
    assert.expect(4);
    visit('/agent');
    visit('/agent/cases/5');
    var tagCount = undefined;

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/5');
      assert.ok(find('.button--primary')[0].classList.contains('disabled'));
      tagCount = find('.qa-ko-case-content__tags .qa-ko-select_multiple_pill').length;
      fillIn('.qa-ko-case-content__tags input', 'Test ');
    });

    andThen(function () {
      find('.qa-ko-case-content__tags input').trigger($.Event('keydown', { which: 13, keyCode: 13 }));
    });

    andThen(function () {
      assert.equal(find('.qa-ko-case-content__tags .qa-ko-select_multiple_pill').length, tagCount + 1);
      assert.notOk(find('.button--primary')[0].classList.contains('disabled'));
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Tag removed', function (assert) {
    assert.expect(4);
    visit('/agent');
    visit('/agent/cases/5');
    var tagCount = undefined;

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/5');
      assert.ok(find('.button--primary')[0].classList.contains('disabled'));
      tagCount = find('.qa-ko-case-content__tags .qa-ko-select_multiple_pill').length;
      click('.qa-ko-case-content__tags .qa-ko-select_multiple_pill:first [role=button]');
    });

    andThen(function () {
      assert.equal(find('.qa-ko-case-content__tags .qa-ko-select_multiple_pill').length, tagCount - 1);
      assert.notOk(find('.button--primary')[0].classList.contains('disabled'));
    });
  });
});
define('frontend-cp/tests/acceptance/agent/cases/user-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-tabs/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoTabsStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | User', {
    beforeEach: function beforeEach() {
      useDefaultScenario().then(function () {
        login(server.db.sessions[0].id);
      });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)("REGRESSION: Breadcrumb doesn't change when navigating to cases/:id/user", function (assert) {
    visit('/agent/cases/1/user');

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoTabsStyles['default'].item).length, 3);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('User menu drop-down is visible for agents', function (assert) {
    var locale = server.create('locale', { locale: 'en-us' });
    var brand = server.create('brand', { locale: locale });
    var caseFields = server.createList('case-field', 4);
    var mailbox = server.create('mailbox', { brand: brand });
    server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
    server.create('case-form', {
      fields: caseFields,
      brand: brand
    });
    var agentRole = server.create('role', { type: 'AGENT' });
    var customerRole = server.create('role', { type: 'AGENT' });
    var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
    var sessionId = server.db.sessions[0].id;
    server.db.sessions.update(sessionId, { user: agent });
    server.create('user', { full_name: 'Barney Stinson', role: customerRole, locale: locale, time_zone: 'Europe/London' });
    server.createList('case-status', 5);
    server.createList('case-priority', 4);
    login(sessionId);

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });

    assert.expect(1);

    visit('/agent/cases/1/user');

    andThen(function () {
      click('.qa-user-action-menu__dropdown .ember-basic-dropdown-trigger');
    });

    andThen(function () {
      assert.equal(find('.qa-user-action-menu__dropdown .ko-dropdown_list__item').length, 3);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Update a user with invalid info highlights the errors', function (assert) {
    var locale = server.create('locale', { locale: 'en-us' });
    var agentRole = server.create('role', { type: 'AGENT' });
    var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
    server.db.cases.update(1, { requester: agent });
    visit('/agent/cases/1/user');

    andThen(function () {
      selectChoose('.ko-user-content__role-field', 'Agent');
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.user-team-ids-field .ko-info-bar_item--error').length, 1, 'The teams field contains errors');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/cases/user-timeline-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers) {

  var targetCase = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | agent/cases/user timeline', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.users.update' });
      var locale = server.create('locale', { id: 1, locale: 'en-us' });
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      var sourceChannel = server.create('channel', { account: mailbox });
      var noteChannel = server.create('channel', { type: 'NOTE' });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var agentRole = server.create('role', { type: 'AGENT' });
      var customerRole = server.create('role', { type: 'CUSTOMER' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      var customer = server.create('user', { full_name: 'Barney Stinson', role: customerRole, locale: locale, time_zone: 'Europe/London' });
      var identityEmail = server.create('identity-email');
      server.createList('case-status', 5);
      server.createList('case-priority', 4);
      server.createList('attachment', 3);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      var status = server.create('case-status');
      targetCase = server.create('case', {
        source_channel: sourceChannel,
        requester: customer,
        creator: agent,
        identity: identityEmail,
        status: status,
        assignee: {
          agent: agent
        }
      });

      server.createList('activity', 25, {
        summary: 'Test activity'
      });

      var note = server.create('note');

      server.createList('post', 25, {
        creator: agent,
        identity: identityEmail,
        'case': targetCase,
        original: note,
        source_channel: noteChannel
      });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
      targetCase = null;
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('it filters feed items to show only notes', function (assert) {
    assert.expect(2);

    visit('/agent/cases/' + targetCase.id + '/user');

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Notes displayed');
      assert.equal(find('.qa-feed_activity').length, 0, 'Activities not displayed');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('it filters feed items to show only activities', function (assert) {
    assert.expect(3);

    visit('/agent/cases/' + targetCase.id + '/user');

    selectChoose('.qa-timeline__filter', 'Activities');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 0, 'Notes not displayed');
      assert.equal(find('.qa-feed_activity').length, 20, 'Activities displayed');
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-timeline_activity__summary:eq(0)'), 'Test activity', 'Activity text displayed');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('default filter', function (assert) {
    assert.expect(1);

    visit('/agent/cases/' + targetCase.id + '/user');

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-timeline__filter .ember-power-select-placeholder'), 'Filter: Notes', 'Default filter is correct');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more note entries below', function (assert) {
    assert.expect(4);

    visit('/agent/cases/' + targetCase.id + '/user');

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Default number of notes displayed');
      assert.equal(find('.qa-timeline__load-more-below').length, 1, 'Load more link available due to more posts to load');
    });

    click('.qa-timeline__load-more-below');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 25, 'Load more notes below');
      assert.equal(find('.qa-timeline__load-more-below').length, 0, 'Load more link hidden due to no more posts to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more note entries above', function (assert) {
    assert.expect(4);

    var allPosts = server.db.posts.sortBy('created_at').reverse();
    var postId = allPosts[2].id;

    visit('/agent/cases/' + targetCase.id + '/user?postId=' + postId);

    selectChoose('.qa-timeline__filter', 'Notes');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Last 8 notes displayed');
      assert.equal(find('.qa-timeline__load-more-above').length, 1, 'Load more link available due to more posts to load');
    });

    click('.qa-timeline__load-more-above');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 22, 'Load more notes');
      assert.equal(find('.qa-timeline__load-more-above').length, 0, 'Load more link hidden due to no more posts to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('loading more activity entries below', function (assert) {
    assert.expect(4);

    visit('/agent/cases/' + targetCase.id + '/user');

    selectChoose('.qa-timeline__filter', 'Activities');

    andThen(function () {
      assert.equal(find('.qa-feed_activity').length, 20, 'Default number of activities displayed');
      assert.equal(find('.qa-timeline__load-more-below').length, 1, 'Load more link available due to more activities to load');
    });

    click('.qa-timeline__load-more-below');

    andThen(function () {
      assert.equal(find('.qa-feed_activity').length, 25, 'Load more activities below');
      assert.equal(find('.qa-timeline__load-more-below').length, 0, 'Load more link hidden due to no more activities to load');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('adding a note updates the timeline when filtering by notes', function (assert) {
    assert.expect(3);

    visit('/agent/cases/' + targetCase.id + '/user');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 20, 'Begin with 10 notes');
    });

    andThen(function () {
      selectChoose('.qa-timeline__filter', 'Notes');
      click('.ko-layout_advanced_editor__placeholder');
      fillInRichTextEditor('Testing notes');
    });

    andThen(function () {
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 21, 'Now there are 21 notes');
      assert.equal(find('.ko-feed_item:eq(0) .ko-feed_item__content').text().trim(), 'Testing notes', 'The added note is in the top');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('adding a note doesn\'t update the timeline when filtering by activities', function (assert) {
    assert.expect(2);

    visit('/agent/cases/' + targetCase.id + '/user');

    selectChoose('.qa-timeline__filter', 'Activities');

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 0, 'No notes displayed as filtering by activities');
    });

    andThen(function () {
      click('.ko-layout_advanced_editor__placeholder');
      fillInRichTextEditor('Testing notes');
    });

    andThen(function () {
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.qa-feed_item--note').length, 0, 'Still no notes displayed');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/index-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'qunit'], function (exports, _frontendCpTestsHelpersQunit, _qunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | agent/index', {
    beforeEach: function beforeEach() {
      var columns = server.createList('column', 5);

      var propositionAssignedToCurrentUser = server.create('proposition', {
        field: 'cases.assigneeagentid',
        operator: 'comparison_equalto',
        value: '(current_user)'
      });

      var inboxPredicateCollection = server.create('predicate-collection', {
        propositions: [{ id: propositionAssignedToCurrentUser.id, resource_type: 'proposition' }]
      });

      this.view = server.create('view', {
        title: 'Inbox',
        is_default: true,
        is_enabled: true,
        is_system: true,
        order_by: 'DESC',
        order_by_column: 'caseid',
        columns: columns,
        predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
        sort_order: 1,
        type: 'INBOX'
      });

      var emails = [server.create('identity-email', { email: 'first@example.com', is_primary: true, is_validated: true })];
      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { emails: emails, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: {}, features: [], account_id: '123', subscription_id: '123' });

      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _qunit.test)('visiting /agent redirects to case list', function (assert) {
    var _this = this;

    assert.expect(1);

    visit('/agent');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/' + _this.view.id);
    });
  });
});
define("frontend-cp/tests/acceptance/agent/macros/select-macro-test", ["exports"], function (exports) {});
// /* eslint-disable new-cap */
//
// import {
//   app,
//   test
// } from 'frontend-cp/tests/helpers/qunit';
//
// app('Acceptance | Macro | Select macro', {
//   beforeEach() {
//     const locale = server.create('locale');
//     const brand = server.create('brand', { locale });
//     const caseFields = server.createList('case-field', 4);
//     const mailbox = server.create('mailbox', { brand });
//     const sourceChannel = server.create('channel', { uuid: 1, account: mailbox });
//     server.create('channel', {
//       uuid: 3,
//       type: 'NOTE'
//     });
//     server.create('case-form', {
//       fields: caseFields,
//       brand: brand
//     });
//     const agentRole = server.create('role', { type: 'AGENT' });
//     const agent = server.create('user', { role: agentRole });
//     const session = server.create('session', { user: agent });
//     const identityEmail = server.create('identity-email');
//     server.createList('case-status', 5);
//     server.createList('case-priority', 4);
//     server.createList('attachment', 3);
//
//     server.create('plan', {
//       limits: [],
//       features: []
//     });
//     const status = server.create('case-status');
//
//     server.create('case', {
//       assignee: server.create('assignee', { agent: null, team: null }),
//       source_channel: sourceChannel,
//       requester: agent,
//       creator: agent,
//       identity: identityEmail,
//       status: status,
//     });
//
//     const macroAssignee = server.create('macro-assignee');
//     const macroVisibility = server.create('macro-visibility');
//
//     server.create('macro', {
//       title: 'Cat 1 \\ Foo',
//       agent: agent,
//       assignee: macroAssignee,
//       visibility: macroVisibility,
//       reply_contents: 'I am Cat 1 / Foo'
//     });
//
//     server.create('macro', {
//       title: 'Cat 1 \\ Bar',
//       agent: agent,
//       assignee: macroAssignee,
//       visibility: macroVisibility,
//       reply_contents: 'I am Cat 1 / Bar'
//     });
//
//     server.create('macro', {
//       title: 'Cat 2 \\ Baz',
//       agent: agent,
//       assignee: macroAssignee,
//       visibility: macroVisibility,
//       reply_contents: 'I am Cat 2 / Baz'
//     });
//
//     login(session.id);
//   },
//
//   afterEach() {
//     logout();
//   }
// });
//
// const triggerSelector = '.ko-case_macro-selector .ember-power-select-trigger';
// const optionSelector = '.ko-case_macro-selector .ember-power-select-option';
// const textAreaSelector = '.ko-text-editor__text-area .ql-editor';
//
// test('Selecting a macro', function(assert) {
//   assert.expect(8);
//   visit('/agent/cases/1');
//
//   click(triggerSelector);
//
//   andThen(() => {
//     assert.equal(find(optionSelector + ':eq(0)').text().trim(), 'Cat 1', 'Root level should be shown');
//     assert.equal(find(optionSelector + ':eq(1)').text().trim(), 'Cat 2', 'Root level should be shown');
//     assert.equal(find(optionSelector).length, 2, 'Dropdown content should be visible');
//     click(optionSelector + ':eq(0)');
//   });
//
//   andThen(() => {
//     assert.equal(find(optionSelector + ':eq(0)').text().trim(), 'Back', 'Back button should be shown');
//     assert.equal(find(optionSelector + ':eq(1)').text().trim(), 'Cat 1  /  Foo', '1st level should be shown');
//     assert.equal(find(optionSelector + ':eq(2)').text().trim(), 'Cat 1  /  Bar', '1st level should be shown');
//     assert.equal(find(optionSelector).length, 3, 'Dropdown should be nested');
//     click(optionSelector + ':eq(2)');
//   });
//
//   andThen(() => {
//     assert.equal(find(textAreaSelector).text().trim(), 'I am Cat 1 / Bar', 'Selected macro should apply');
//   });
// });
define('frontend-cp/tests/acceptance/agent/manage-user-identities-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-toast/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoToastStyles) {

  var originalConfirm = undefined;
  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Manage Email Identities', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.users.update' });
      server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var emails = [server.create('identity-email', { email: 'first@example.com', is_primary: true, is_validated: true }), server.create('identity-email', { email: 'second@example.com', is_primary: false, is_validated: true }), server.create('identity-email', { email: 'third@example.com', is_primary: false, is_validated: false })];
      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { emails: emails, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      login(session.id);

      visit('/agent/users/' + user.id);
      originalConfirm = window.confirm;
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Validate an email identity of a user', function (assert) {
    click('[class*=ember-basic-dropdown-trigger]:contains("third@example.com")');

    andThen(function () {
      assert.equal(find('.ko-identities__list--emails .ember-basic-dropdown-content li:eq(0)').text().trim(), 'Remove identity', 'The identity can be removed');
      assert.equal(find('.ko-identities__list--emails .ember-basic-dropdown-content li:eq(1)').text().trim(), 'Send verification email', 'The identity is not validated');
      click('.ko-identities__list--emails .ember-basic-dropdown-content li:eq(1)');
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpComponentsKoToastStyles['default'].container).text().trim(), 'An email has been sent to your email id', 'Display a notification message');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Mark a validate email as primary', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("second@example.com")');

    andThen(function () {
      click('.ko-identities__list--emails .ember-basic-dropdown-content li:contains("Make primary")');
    });

    andThen(function () {
      assert.ok(/\(primary\)/.test(find('.ko-identities__list--emails li:contains("second@example.com")').text().trim()), 'The second address became the primary one');
      assert.ok(!/\(primary\)/.test(find('.ko-identities__list--emails li:contains("first@example.com")').text().trim()), 'That first address isn\'t the primary anymore');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Remove an email', function (assert) {
    assert.expect(4);
    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to remove this identity?');
      return true;
    };
    click('[class*=ember-basic-dropdown-trigger ]:contains("second@example.com")');

    andThen(function () {
      click('.ko-identities__list--emails .ember-basic-dropdown-content li:contains("Remove identity")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--emails li:contains("first@example.com (primary)")').length, 1, 'The first email is still there');
      assert.equal(find('.ko-identities__list--emails li:contains("second@example.com")').length, 0, 'The first email is NOT there');
      assert.equal(find('.ko-identities__list--emails li:contains("third@example.com")').length, 1, 'The third email is still there');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Add an email identity', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("Add new")');

    andThen(function () {
      click('.ko-identities__create-dropdown .ember-basic-dropdown-content li:contains("Email")');
      fillIn('.ko-identities_form input', 'newemail@example.com');
      click('.ko-identities_form button:contains("Save")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--emails li:contains("newemail@example.com")').length, 1, 'The new email is in the list');
      assert.equal(find('.ko-identities__list--emails li:contains("newemail@example.com") .i-caution').length, 1, 'This new email is marked as not validate');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Add an invalid email identity shows an error message', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("Add new")');

    andThen(function () {
      click('.ko-identities__create-dropdown .ember-basic-dropdown-content li:contains("Email")');
      fillIn('.ko-identities_form input', 'wrong@example');
      click('.ko-identities_form button:contains("Save")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities_form .ko-form_field_errors__error').text(), 'Email format invalid');
    });
  });

  // test('Send validation email', function(assert) {
  //   throw new Error('not implemented');
  // });

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Manage Twitter Identities', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.users.update' });
      server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var twitter = [server.create('identity-twitter', { screen_name: '@first', is_primary: true, is_validated: true }), server.create('identity-twitter', { screen_name: '@second', is_primary: false, is_validated: true }), server.create('identity-twitter', { screen_name: '@third', is_primary: false, is_validated: false })];
      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { twitter: twitter, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      login(session.id);

      visit('/agent/users/' + user.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Mark a validate twitter as primary', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("@second")');

    andThen(function () {
      click('.ko-identities__list--twitters .ember-basic-dropdown-content li:contains("Make primary")');
    });

    andThen(function () {
      assert.ok(/\(primary\)/.test(find('.ko-identities__list--twitters li:contains("@second")').text().trim()), 'The second address became the primary one');
      assert.ok(!/\(primary\)/.test(find('.ko-identities__list--twitters li:contains("@first")').text().trim()), 'That first address isn\'t the primary anymore');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Remove a twitter identity', function (assert) {
    assert.expect(4);
    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to remove this identity?');
      return true;
    };
    click('[class*=ember-basic-dropdown-trigger ]:contains("@second")');

    andThen(function () {
      click('.ko-identities__list--twitters .ember-basic-dropdown-content li:contains("Remove identity")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--twitters li:contains("@first (primary)")').length, 1, 'The first twitter is still there');
      assert.equal(find('.ko-identities__list--twitters li:contains("@second")').length, 0, 'The first twitter is NOT there');
      assert.equal(find('.ko-identities__list--twitters li:contains("@third")').length, 1, 'The third twitter is still there');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Add an twitter identity', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("Add new")');

    andThen(function () {
      click('.ko-identities__create-dropdown .ember-basic-dropdown-content li:contains("Twitter")');
      fillIn('.ko-identities_form input', '@miguelcamba');
      click('.ko-identities_form button:contains("Save")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--twitters li:contains("@miguelcamba")').length, 1, 'The new email is in the list');
    });
  });

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Manage Facebook Identities', {
    beforeEach: function beforeEach() {
      server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var facebook = [server.create('identity-facebook', { user_name: 'Mike', is_primary: true, is_validated: true }), server.create('identity-facebook', { user_name: 'Mary', is_primary: false, is_validated: true }), server.create('identity-facebook', { user_name: 'John', is_primary: false, is_validated: false })];
      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { facebook: facebook, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      login(session.id);

      visit('/agent/users/' + user.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Mark a validate facebook as primary', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("Mary")');

    andThen(function () {
      click('.ko-identities__list--facebooks .ember-basic-dropdown-content li:contains("Make primary")');
    });

    andThen(function () {
      assert.ok(/\(primary\)/.test(find('.ko-identities__list--facebooks li:contains("Mary")').text().trim()), 'The second address became the primary one');
      assert.ok(!/\(primary\)/.test(find('.ko-identities__list--facebooks li:contains("Mike")').text().trim()), 'That first address isn\'t the primary anymore');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Remove a facebook identity', function (assert) {
    assert.expect(4);
    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to remove this identity?');
      return true;
    };
    click('[class*=ember-basic-dropdown-trigger ]:contains("Mary")');

    andThen(function () {
      click('.ko-identities__list--facebooks .ember-basic-dropdown-content li:contains("Remove identity")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--facebooks li:contains("Mike (primary)")').length, 1, 'The first facebook is still there');
      assert.equal(find('.ko-identities__list--facebooks li:contains("Mary")').length, 0, 'The first facebook is NOT there');
      assert.equal(find('.ko-identities__list--facebooks li:contains("John")').length, 1, 'The third facebook is still there');
    });
  });

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Manage Phone Identities', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.users.update' });
      server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var phones = [server.create('identity-phone', { number: '+44 1111 111111', is_primary: true, is_validated: true }), server.create('identity-phone', { number: '+44 2222 222222', is_primary: false, is_validated: true }), server.create('identity-phone', { number: '+44 3333 333333', is_primary: false, is_validated: false })];
      var locale = server.create('locale', { locale: 'en-us' });
      var user = server.create('user', { phones: phones, role: server.create('role'), locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: user });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      login(session.id);

      visit('/agent/users/' + user.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Mark a validate phone as primary', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("+44 2222 222222")');

    andThen(function () {
      click('.ko-identities__list--phones .ember-basic-dropdown-content li:contains("Make primary")');
    });

    andThen(function () {
      assert.ok(/\(primary\)/.test(find('.ko-identities__list--phones li:contains("+44 2222 222222")').text().trim()), 'The second address became the primary one');
      assert.ok(!/\(primary\)/.test(find('.ko-identities__list--phones li:contains("+44 1111 111111")').text().trim()), 'That first address isn\'t the primary anymore');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Remove a phone identity', function (assert) {
    assert.expect(4);
    window.confirm = function (message) {
      assert.equal(message, 'Are you sure you want to remove this identity?');
      return true;
    };
    click('[class*=ember-basic-dropdown-trigger ]:contains("+44 2222 222222")');

    andThen(function () {
      click('.ko-identities__list--phones .ember-basic-dropdown-content li:contains("Remove identity")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--phones li:contains("+44 1111 111111 (primary)")').length, 1, 'The first phone is still there');
      assert.equal(find('.ko-identities__list--phones li:contains("+44 2222 222222")').length, 0, 'The first phone is NOT there');
      assert.equal(find('.ko-identities__list--phones li:contains("+44 3333 333333")').length, 1, 'The third phone is still there');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Add an phone identity', function (assert) {
    click('[class*=ember-basic-dropdown-trigger ]:contains("Add new")');

    andThen(function () {
      click('.ko-identities__create-dropdown .ember-basic-dropdown-content li:contains("Phone")');
      fillIn('.ko-identities_form input', '+44 (7746) 123-456');
      click('.ko-identities_form button:contains("Save")');
    });

    andThen(function () {
      assert.equal(find('.ko-identities__list--phones li:contains("+447746123456")').length, 1, 'The new phone is in the list, with all chars but number and `+` removed');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/organizations/create-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Organization | Create organization', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale');
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var roles = [server.create('role'), server.create('role', { title: 'Agent', type: 'AGENT', id: 2 })
      // server.create('role', {title: 'Collaborator', type: 'COLLABORATOR', id: 3}),
      // server.create('role', {title: 'Customer', type: 'CUSTOMER', id: 4})
      ];
      var agentRole = roles[1];
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  // This test is failing randomly, need to find out what is causing this strange fail
  // https://travis-ci.com/kayako/frontend-cp/builds/18413801 - example of failing error.
  //test('Creating a organization using the "+" button in the main header', function(assert) {
  //  visit('/agent');
  //
  //  click('.ko-agent-dropdown__add-icon');
  //
  //  andThen(function() {
  //    assert.equal(find('.ko-agent-dropdown__drop').length, 1, '"+" Dropdown content should be visible');
  //    click('.ko-agent-dropdown__nav-item:eq(2)');
  //  });
  //
  //  andThen(function() {
  //    fillIn('.ko-agent-dropdown__drop input[name=name]', 'Gadisa');
  //    fillIn('.ko-agent-dropdown__drop .ko-tags__input', 'gadisa.com');
  //    triggerEvent('.ko-agent-dropdown__drop .ko-tags__input', 'blur');
  //    click('.ko-agent-dropdown__drop .button--primary');
  //  });
  //
  //  andThen(function() {
  //    assert.equal(currentURL(), '/agent/organizations/1', 'We are in the show page of the created user');
  //    assert.equal(find('.ko-agent-dropdown__drop').length, 0, false, '"+" Dropdown content should be hidden');
  //    assert.equal(find('.ko-organization-content__header-title').text().trim(), 'Gadisa', 'The name of the organization is vissible in the header');
  //    assert.equal(find('.breadcrumbs .breadcrumbs__item:eq(0)').text().trim(), 'Gadisa', 'Breadcrums are correct');
  //    assert.equal(find('.nav-tabs__item').length, 1, 'There is only one tab');
  //    assert.equal(find('.nav-tabs__item.active').length, 1, 'That tab is active');
  //    assert.equal(find('.nav-tabs__item').text().trim(), 'Gadisa', 'That tab belongs to the created organization');
  //  });
  //});
});
/* eslint-disable camelcase, new-cap */
define('frontend-cp/tests/acceptance/agent/organizations/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit'], function (exports, _frontendCpTestsHelpersQunit) {

  var theCase = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Organization | Update organization', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', {
        id: 1,
        locale: 'en-us'
      });
      var brand = server.create('brand', { locale: locale });
      var statuses = server.createList('case-status', 5);
      var priority = server.create('case-priority');
      var businesshour = server.create('business-hour', { title: 'Default Business Hours' });
      var teams = server.createList('team', 4, { businesshour: businesshour });
      var customFields = server.createList('user-field-value', 3);
      var agentRole = server.create('role', { title: 'Agent', type: 'AGENT', id: 2 });
      var customerRole = server.create('role', { title: 'Agent', type: 'CUSTOMER', id: 4 });
      var organization = server.create('organization', {
        domains: [server.create('identity-domain')]
      });
      server.create('organization', {
        domains: [server.create('identity-domain')]
      }); // Another organization

      var inboxPredicateCollection = server.create('predicate-collection', {
        propositions: [{
          id: server.create('proposition', { field: 'cases.assigneeagentid', operator: 'comparison_equalto', value: '(current_user)' }).id,
          resource_type: 'proposition'
        }]
      });

      server.create('view', {
        title: 'Inbox',
        is_default: true,
        is_enabled: true,
        is_system: true,
        order_by: 'DESC',
        order_by_column: 'caseid',
        columns: server.createList('column', 5),
        predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
        sort_order: 1,
        type: 'INBOX'
      });

      var customer = server.create('user', {
        custom_fields: customFields,
        role: customerRole,
        locale: locale,
        organization: organization,
        time_zone: 'Europe/London'
      });

      var agent = server.create('user', {
        custom_fields: customFields,
        role: agentRole,
        teams: teams,
        locale: locale,
        time_zone: 'Europe/London'
      });

      theCase = server.create('case', {
        requester: customer,
        creator: agent,
        assignedAgent: { id: agent.id, resource_type: 'user' },
        assignedTeam: { id: teams[0].id, resource_type: 'team' },
        brand: brand,
        source_channel: null,
        identity: null,
        status: statuses[0],
        priority: priority,
        type: server.create('type'),
        sla_version: server.create('sla-version'),
        sla_metrics: server.createList('sla-metric', 3),
        tags: server.createList('tag', 2)
      });

      ['admin.organizations.update', 'admin.organizations.delete'].forEach(function (name) {
        return server.create('permission', { name: name });
      });

      var session = server.create('session', { user: agent });
      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
      login(session.id);
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Update an organization with invalid info highlights the errors', function (assert) {
    visit('/agent/cases/' + theCase.id + '/organization');

    andThen(function () {
      click('.organization-domains-field .ember-power-select-multiple-remove-btn');
      fillIn('.organization-domains-field .ember-power-select-trigger-multiple-input', 'brew2.com');
      keyEvent('.organization-domains-field .ember-power-select-trigger-multiple-input', 'keydown', 13);
      click('.button--primary');
    });

    andThen(function () {
      assert.equal(find('.organization-domains-field .ko-info-bar_item--error').length, 1, 'The domains field is marked as errored');
    });
  });
});
/* eslint-disable camelcase, new-cap */
define('frontend-cp/tests/acceptance/agent/search/search-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/lib/keycodes', 'frontend-cp/session/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpLibKeycodes, _frontendCpSessionStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Case | Search', {
    beforeEach: function beforeEach() {
      useDefaultScenario();
      login();
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Search case returns result', function (assert) {
    visit('/agent/search/ERS%20Audit%207');

    andThen(function () {
      assert.equal(find('.ko-table_row').length, 1);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Searching opens in new tab', function (assert) {
    var term = 'ERS';
    visit('/agent/search/' + term);

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).text().trim(), 'Search: "' + term + '"');
      assert.equal(find('.ko-universal-search_entry').val(), term);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Advanced search reuses tab', function (assert) {
    var term1 = 'ERS';
    var term2 = 'murray';
    visit('/agent/search/' + term1);

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).length, 1);
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).text().trim(), 'Search: "' + term1 + '"');
    });

    andThen(function () {
      fillIn('.ko-universal-search_entry', term2);
      keyEvent('.ko-universal-search_entry', 'keydown', _frontendCpLibKeycodes.enter);
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).length, 1);
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).text().trim(), 'Search: "' + term2 + '"');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Change search result group', function (assert) {
    var term1 = 'Murray';
    visit('/agent/search/' + term1);

    andThen(function () {
      assert.equal(find('.ko-table_row').length, 0);
      click(find('.sidebar__link')[1]);
    });

    andThen(function () {
      assert.equal(find('.ko-table_row').length, 20);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('Multiple searches in multiple tabs', function (assert) {
    var term1 = 'Murray';
    var term2 = 'ERS';
    visit('/agent/search/' + term1);

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).length, 1);
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab + ' .active').text().trim(), 'Search: "' + term1 + '"');
    });

    andThen(function () {
      visit('/agent');
    });

    andThen(function () {
      visit('/agent/search/' + term2);
    });

    andThen(function () {
      assert.equal(find('.' + _frontendCpSessionStyles['default']['tab-label']).length, 2);
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab + ' .active').text().trim(), 'Search: "' + term2 + '"');
    });
  });
});
/* eslint-disable camelcase */
define('frontend-cp/tests/acceptance/agent/tabs/tabs-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/fixtures/location/mock-location', 'frontend-cp/session/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsFixturesLocationMockLocation, _frontendCpSessionStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | Tabs', {
    beforeEach: function beforeEach(application) {
      application.__container__.lookup('router:main').set('location', _frontendCpTestsFixturesLocationMockLocation['default'].create());
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('cases open in their own tabs', function (assert) {
    assert.expect(26);

    useDefaultScenario();
    login();

    visit('/agent');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 0);
    });

    visit('/agent/cases/1');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 1);
      var $firstTabElement = getTabElements().eq(0);
      assert.ok(getIsActiveTabElement($firstTabElement));
    });

    visit('/agent/cases/1/user');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 1);
      var $firstTabElement = getTabElements().eq(0);
      assert.ok(getIsActiveTabElement($firstTabElement));
    });

    visit('/agent/cases/1');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 1);
      var $firstTabElement = getTabElements().eq(0);
      assert.ok(getIsActiveTabElement($firstTabElement));
    });

    visit('/agent/cases/2/user');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    visit('/agent/cases/2');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    visit('/agent/cases/2/user');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    visit('/agent/cases/1');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(getIsActiveTabElement($firstTabElement));
      assert.ok(!getIsActiveTabElement($secondTabElement));
    });

    visit('/agent/cases/2');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    visit('/agent/cases/2/user');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = getTabElements().eq(0);
      var $secondTabElement = getTabElements().eq(1);
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    visit('/');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('tab label is set to case name', function (assert) {
    assert.expect(2);

    useDefaultScenario();
    login();

    visit('/agent/cases/1');

    andThen(function () {
      var $tabElement = getTabElements();
      assert.equal($tabElement.text().trim(), 'ERS Audit 1');
    });

    visit('/agent/cases/2');

    andThen(function () {
      var $tabElement = getTabElements().eq(1);
      assert.equal($tabElement.text().trim(), 'ERS Audit 2');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('tabs are loaded from session storage', function (assert) {
    assert.expect(3);

    sessionStorage.setItem('ko:core:tabs', JSON.stringify([{
      url: '/agent/cases/1',
      dynamicSegments: ['1'],
      queryParams: null,
      label: 'Case 1'
    }, {
      url: '/agent/cases/2',
      dynamicSegments: ['1'],
      queryParams: null,
      label: 'Case 2'
    }]));

    useDefaultScenario();
    login();

    visit('/');

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);

      var $firstTabElement = $tabElements.eq(0);
      var $secondTabElement = $tabElements.eq(1);
      assert.equal($firstTabElement.text().trim(), 'Case 1');
      assert.equal($secondTabElement.text().trim(), 'Case 2');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('tabs can be closed', function (assert) {
    assert.expect(9);

    useDefaultScenario();
    login();

    visit('/');
    visit('/agent/cases/1');
    visit('/agent/cases/2');
    visit('/agent/cases/3');

    andThen(function () {
      var $activeTabElement = getActiveTabElement();
      closeTab($activeTabElement);
    });

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 2);
      var $firstTabElement = $tabElements.eq(0);
      var $secondTabElement = $tabElements.eq(1);
      assert.equal(currentURL(), '/agent/cases/2');
      assert.ok(!getIsActiveTabElement($firstTabElement));
      assert.ok(getIsActiveTabElement($secondTabElement));
    });

    andThen(function () {
      var $firstTabElement = getTabElements().eq(0);
      closeTab($firstTabElement);
    });

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 1);
      var $firstTabElement = $tabElements.eq(0);
      assert.equal(currentURL(), '/agent/cases/2');
      assert.ok(getIsActiveTabElement($firstTabElement));
    });

    andThen(function () {
      var $firstTabElement = getTabElements().eq(0);
      closeTab($firstTabElement);
    });

    andThen(function () {
      var $tabElements = getTabElements();
      assert.equal($tabElements.length, 0);
      assert.equal(currentURL(), '/agent/cases/view/1');
    });
  });

  function getTabElements() {
    return find('.' + _frontendCpSessionStyles['default'].tab);
  }

  function getActiveTabElement() {
    return getTabElements().filter('.active');
  }

  function getIsActiveTabElement(element) {
    return $(element).hasClass('active');
  }

  function closeTab(tabElement) {
    andThen(function () {
      $(tabElement).find('.' + _frontendCpSessionStyles['default']['tab-close']).click();
    });
  }
});
define('frontend-cp/tests/acceptance/agent/users/change-role-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'qunit', 'frontend-cp/locales/en-us/users'], function (exports, _frontendCpTestsHelpersQunit, _qunit, _frontendCpLocalesEnUsUsers) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | User | Change role', {
    beforeEach: function beforeEach() {
      var _this = this;

      server.create('permission', { name: 'agent.users.update' });

      this.roles = {
        admin: server.create('role', { type: 'ADMIN', title: 'Administrator' }),
        agent: server.create('role', { type: 'AGENT', title: 'Agent' }),
        customer: server.create('role', { type: 'CUSTOMER', title: 'Customer' })
      };

      this.confirmationMessages = [];

      window.confirm = function (msg) {
        _this.confirmationMessages.push(msg);
        return true;
      };
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _qunit.test)('Changing another user’s role from CUSTOMER requires confirmation', function (assert) {
    var _this2 = this;

    var me = server.create('user', { role: this.roles.admin, time_zone: 'Europe/London' });
    var other = server.create('user', { role: this.roles.customer, time_zone: 'Europe/London' });
    var session = server.create('session', { user: me });

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    login(session.id);

    visit('/agent/users/' + other.id);

    andThen(function () {
      selectChoose('.ko-user-content__role-field', 'Agent');
      click('button:contains(Submit)');
    });

    andThen(function () {
      assert.ok(find('.ko-user-content__role-field').is(':contains(Agent)'), 'expected role field to contain "Agent"');
      assert.deepEqual(_this2.confirmationMessages, [_frontendCpLocalesEnUsUsers['default']['change_role.from_customer']]);
    });
  });

  (0, _qunit.test)('Changing another user’s role to CUSTOMER requires confirmation', function (assert) {
    var _this3 = this;

    var me = server.create('user', { role: this.roles.admin, time_zone: 'Europe/London' });
    var other = server.create('user', { role: this.roles.agent, time_zone: 'Europe/London' });
    var session = server.create('session', { user: me });

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    login(session.id);

    visit('/agent/users/' + other.id);
    selectChoose('.ko-user-content__role-field', 'Customer');
    click('button:contains(Submit)');

    andThen(function () {
      assert.ok(find('.ko-user-content__role-field').is(':contains(Customer)'), 'expected role field to contain "Agent"');
      assert.deepEqual(_this3.confirmationMessages, [_frontendCpLocalesEnUsUsers['default']['change_role.to_customer']]);
    });
  });

  (0, _qunit.test)('Declining confirmation prevents the record from saving', function (assert) {
    var me = server.create('user', { role: this.roles.admin, time_zone: 'Europe/London' });
    var other = server.create('user', { role: this.roles.agent, time_zone: 'Europe/London' });
    var session = server.create('session', { user: me });
    var requested = false;
    var endpoint = '/api/v1/users/' + other.id;

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    login(session.id);

    server.put(endpoint, function () {
      assert.ok(false, 'expected NOT to request PUT ' + endpoint);
    });

    visit('/agent/users/' + other.id);
    selectChoose('.ko-user-content__role-field', 'Customer');
    click('button:contains(Submit)');

    window.confirm = function () {
      return false;
    };

    andThen(function () {
      assert.equal(requested, false, 'expect NOT to request PUT ' + endpoint);
    });
  });

  (0, _qunit.test)('AGENTs may not change another user’s role', function (assert) {
    var me = server.create('user', { role: this.roles.agent, time_zone: 'Europe/London' });
    var other = server.create('user', { role: this.roles.customer, time_zone: 'Europe/London' });
    var session = server.create('session', { user: me });

    server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    login(session.id);

    visit('/agent/users/' + other.id);

    andThen(function () {
      var trigger = find('.ko-user-content__role-field .ember-power-select-trigger');

      assert.ok(trigger.is('[aria-disabled="true"]'), 'expected role field to be disabled');
    });
  });
});
define('frontend-cp/tests/acceptance/agent/users/create-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/session/styles', 'frontend-cp/components/ko-tabs/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpSessionStyles, _frontendCpComponentsKoTabsStyles) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | User | Create user', {
    beforeEach: function beforeEach() {
      createView();

      server.create('permission', { name: 'agent.users.update' });
      var locale = server.create('locale');
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var roles = [server.create('role'), server.create('role', { title: 'Agent', type: 'AGENT', id: 2 }), server.create('role', { title: 'Collaborator', type: 'COLLABORATOR', id: 3 }), server.create('role', { title: 'Customer', type: 'CUSTOMER', id: 4 })];
      var agentRole = roles[1];
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', { limits: { agents: 20 }, features: [], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('Creating a user using the "+" button in the main header', function (assert) {
    visit('/agent');

    click('.ko-agent-dropdown__add-icon');

    andThen(function () {
      assert.equal(find('.ko-agent-dropdown__drop').length, 1, '"+" Dropdown content should be visible');
      click('.ko-agent-dropdown__nav-item:eq(1)');
    });

    andThen(function () {
      fillIn('.ko-agent-dropdown__drop input.ko-agent-dropdown_create-user__full_name', 'Barney Stinson');
      fillIn('.ko-agent-dropdown__drop input.ko-agent-dropdown_create-user__email', 'barney@stin.son');
      click('.ko-agent-dropdown__drop .button--primary');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/users/2', 'We are in the show page of the created user');

      assert.equal(find('.ko-agent-dropdown .ember-basic-dropdown-trigger').attr('aria-expanded'), undefined, '"+" Dropdown content should be hidden');

      assert.equal(find('.ko-layout_advanced_section__subject').text().trim(), 'Barney Stinson', 'The name of the user is vissible in the header');
      assert.equal(find('.' + _frontendCpComponentsKoTabsStyles['default'].item + ':eq(0)').text().trim(), 'Barney Stinson', 'Tabs are correct');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).length, 1, 'There is only one tab');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab + '.active').length, 1, 'That tab is active');
      assert.equal(find('.' + _frontendCpSessionStyles['default'].tab).text().trim(), 'Barney Stinson', 'That tab belongs to the created user');
    });
  });

  function createView() {
    var columns = server.createList('column', 5);

    var propositionAssignedToCurrentUser = server.create('proposition', {
      field: 'cases.assigneeagentid',
      operator: 'comparison_equalto',
      value: '(current_user)'
    });

    var inboxPredicateCollection = server.create('predicate-collection', {
      propositions: [{ id: propositionAssignedToCurrentUser.id, resource_type: 'proposition' }]
    });

    server.create('view', {
      title: 'Inbox',
      is_default: true,
      is_enabled: true,
      is_system: true,
      order_by: 'DESC',
      order_by_column: 'caseid',
      columns: columns,
      predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
      sort_order: 1,
      type: 'INBOX'
    });
  }
});
define('frontend-cp/tests/acceptance/agent/users/edit-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/dom-helpers', 'frontend-cp/components/ko-info-bar/field/select/trigger/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersDomHelpers, _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles) {

  var customer = undefined,
      owner = undefined;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | User | Edit user', {
    beforeEach: function beforeEach() {
      server.create('permission', { name: 'agent.users.update' });
      var locale = server.create('locale');
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var roles = [server.create('role'), server.create('role', { title: 'Agent', type: 'AGENT', id: 2 }), server.create('role', { title: 'Collaborator', type: 'COLLABORATOR', id: 3 }), server.create('role', { title: 'Customer', type: 'CUSTOMER', id: 4 }), server.create('role', { title: 'Owner', type: 'OWNER', id: 5 })];

      var customerRole = roles[3];
      customer = server.create('user', { role: customerRole, locale: locale, agent_case_access: null, organization_case_access: 'REQUESTED', time_zone: 'Europe/London' });

      var ownerRole = roles[4];
      owner = server.create('user', { role: ownerRole, locale: locale, agent_case_access: 'ALL', organization_case_access: null, time_zone: 'Europe/London' });

      var agent = server.create('user', { role: ownerRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      var feature = server.create('feature', {
        code: 'shared_organizations',
        name: 'shared_organizations',
        description: 'People who may log in as a team member'
      });

      server.create('plan', { limits: { agents: 20 }, features: [feature], account_id: '123', subscription_id: '123' });
    },

    afterEach: function afterEach() {
      logout();
      customer = null;
      owner = null;
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing an owner\'s case access field', function (assert) {
    assert.expect(4);

    server.put('/api/v1/users/' + owner.id, function (_, _ref) {
      var requestBody = _ref.requestBody;

      var body = JSON.parse(requestBody);

      assert.equal(body.agent_case_access, 'SELF', 'agent_case_access correctly set in request payload');
      assert.equal(body.organization_case_access, null, 'organization_case_access correctly set to null in request payload');
    });

    visit('/agent/users/' + owner.id);

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-user-content__case-access-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'All cases', 'Case access field initial value is correct');
    });

    selectChoose('.qa-user-content__case-access-field', 'Cases assigned to agent');

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-user-content__case-access-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'Cases assigned to agent', 'Case access field changed value is correct');
    });

    click('.button--primary');
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a customer\'s case access field', function (assert) {
    assert.expect(4);

    server.put('/api/v1/users/' + customer.id, function (_, _ref2) {
      var requestBody = _ref2.requestBody;

      var body = JSON.parse(requestBody);

      assert.equal(body.agent_case_access, null, 'agent_case_access correctly set in request payload');
      assert.equal(body.organization_case_access, 'ORGANIZATION', 'organization_case_access correctly set to null in request payload');
    });

    visit('/agent/users/' + customer.id);

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-user-content__case-access-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'Only requested cases', 'Case access field initial value is correct');
    });

    selectChoose('.qa-user-content__case-access-field', 'All organization\'s cases');

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.qa-user-content__case-access-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'All organization\'s cases', 'Case access field changed value is correct');
    });

    click('.button--primary');
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing a customer to an owner and changing the case access field', function (assert) {
    window.confirm = function () {
      return true;
    };

    assert.expect(3);

    server.put('/api/v1/users/' + customer.id, function (_, _ref3) {
      var requestBody = _ref3.requestBody;

      var body = JSON.parse(requestBody);

      assert.equal(body.agent_case_access, 'SELF', 'agent_case_access correctly set in request payload');
      assert.equal(body.organization_case_access, null, 'organization_case_access correctly set to null in request payload');
    });

    visit('/agent/users/' + customer.id);

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.ko-user-content__role-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'Customer', 'Role field initial value is correct');
    });

    selectChoose('.ko-user-content__role-field', 'Collaborator');
    selectChoose('.qa-user-content__case-access-field', 'Cases assigned to agent');

    click('.button--primary');
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing an owner to a customer and changing the case access field', function (assert) {
    window.confirm = function () {
      return true;
    };

    assert.expect(3);

    server.put('/api/v1/users/' + owner.id, function (_, _ref4) {
      var requestBody = _ref4.requestBody;

      var body = JSON.parse(requestBody);

      assert.equal(body.agent_case_access, null, 'agent_case_access correctly set in request payload');
      assert.equal(body.organization_case_access, 'ORGANIZATION', 'organization_case_access correctly set to null in request payload');
    });

    visit('/agent/users/' + owner.id);

    andThen(function () {
      assert.equal((0, _frontendCpTestsHelpersDomHelpers.text)('.ko-user-content__role-field .' + _frontendCpComponentsKoInfoBarFieldSelectTriggerStyles['default'].placeholder), 'Owner', 'Role field initial value is correct');
    });

    selectChoose('.ko-user-content__role-field', 'Customer');
    selectChoose('.qa-user-content__case-access-field', 'All organization\'s cases');

    click('.button--primary');
  });

  (0, _frontendCpTestsHelpersQunit.test)('editing a customer\'s locale', function (assert) {
    window.confirm = function () {
      return true;
    };

    assert.expect(1);

    server.create('locale', {
      id: 4,
      name: 'Deutsch',
      native_name: 'Deutsch',
      locale: 'de'
    });

    server.put('/api/v1/users/' + owner.id, function (_, _ref5) {
      var requestBody = _ref5.requestBody;

      var body = JSON.parse(requestBody);
      assert.equal(body.locale_id, '4', 'locale_id correctly set in request payload');
    });

    visit('/agent/users/' + owner.id);

    selectChoose('.qa-user-content__locale-select', 'Deutsch');

    click('.button--primary');
  });
});
define('frontend-cp/tests/acceptance/login/login-test', ['exports', 'qunit', 'frontend-cp/tests/helpers/qunit'], function (exports, _qunit, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | login/login');

  (0, _qunit.test)('visiting /agent/login', function (assert) {
    visit('/agent/login');

    andThen(function () {
      assert.equal(currentURL(), '/agent/login');
    });
  });

  (0, _qunit.test)('submitting invalid credentials', function (assert) {
    visit('/agent/login');

    fillIn('.ko-login-password__email', 'invalid@kayako.com');
    fillIn('.ko-login-password__password', 'invalid');
    click('.ko-login__submit');

    andThen(function () {
      assert.equal(currentURL(), '/agent/login');
      assert.equal(find('.ko-login__flipper.login__error').length, 1);
      assert.equal(find('.ko-login__error').text().trim(), 'Email and password combination is incorrect');
    });
  });

  (0, _qunit.test)('submitting valid credentials', function (assert) {
    // required data for the subsequent redirect, but not interesting for this test itself
    setupDataForCasesView();

    visit('/agent/login');

    fillIn('.ko-login-password__email', 'main@kayako.com');
    fillIn('.ko-login-password__password', 'valid');
    click('.ko-login__submit');

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/view/1');
    });
  });

  (0, _qunit.test)('Redirecting to last URL after successful login', function (assert) {
    setupDataForCasesView();

    /*
     * Create a requester
     */
    var enUsLocale = server.create('locale', { locale: 'en-us' });
    var identityEmail = server.create('identity-email');
    var organization = server.create('organization');
    var role = server.create('role', { title: 'Admin', type: 'ADMIN' });
    var team = server.create('team');
    var requester = server.create('user', {
      custom_fields: [],
      emails: [{ id: identityEmail.id, resource_type: 'identityEmail' }],
      locale: { id: enUsLocale.id, resource_type: 'locale' },
      organization: { id: organization.id, resource_type: 'organization' },
      role: { id: role.id, resource_type: 'role' },
      teams: [{ id: team.id, title: team.title, resource_type: 'team' }],
      time_zone: 'Europe/London'
    });

    visit('/agent/login?redirectTo=%2Fagent%2Fcases%2Fnew%2F2016-07-04-09-54-50%3Frequester_id%3D' + requester.id);

    fillIn('.ko-login-password__email', 'main@kayako.com');
    fillIn('.ko-login-password__password', 'valid');
    click('.ko-login__submit');

    andThen(function () {
      // we should be redirected back to login screen
      assert.equal(currentURL(), '/agent/cases/new/2016-07-04-09-54-50?requester_id=' + requester.id);
    });
  });

  function setupDataForCasesView() {
    var locale = server.create('locale', { locale: 'en-us' });
    var brand = server.create('brand', { locale: locale });
    var caseFields = server.createList('case-field', 4);
    var mailbox = server.create('mailbox', { brand: brand });
    server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
    server.create('case-form', {
      fields: caseFields,
      brand: brand
    });
    var agentRole = server.create('role', { type: 'AGENT' });
    var customerRole = server.create('role', { type: 'AGENT' });

    server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });

    server.create('user', { full_name: 'Barney Stinson', role: customerRole, locale: locale, time_zone: 'Europe/London' });
    server.createList('case-status', 5);
    server.createList('case-priority', 4);

    server.create('plan', {
      limits: {},
      features: [],
      account_id: '123',
      subscription_id: '123'
    });

    var columns = server.createList('column', 5);

    var propositionAssignedToCurrentUser = server.create('proposition', {
      field: 'cases.assigneeagentid',
      operator: 'comparison_equalto',
      value: '(current_user)'
    });

    var inboxPredicateCollection = server.create('predicate-collection', {
      propositions: [{ id: propositionAssignedToCurrentUser.id, resource_type: 'proposition' }]
    });

    server.create('view', {
      title: 'Inbox',
      is_default: true,
      is_enabled: true,
      is_system: true,
      order_by: 'DESC',
      order_by_column: 'caseid',
      columns: columns,
      predicate_collections: [{ id: inboxPredicateCollection.id, resource_type: 'predicate_collection' }],
      sort_order: 1,
      type: 'INBOX'
    });
  }
});
define('frontend-cp/tests/acceptance/suspended-messages-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/components/ko-checkbox/styles', 'frontend-cp/components/ko-modal/styles', 'frontend-cp/components/ko-pagination/styles'], function (exports, _frontendCpTestsHelpersQunit, _frontendCpComponentsKoCheckboxStyles, _frontendCpComponentsKoModalStyles, _frontendCpComponentsKoPaginationStyles) {

  var originalConfirm = window.confirm;

  (0, _frontendCpTestsHelpersQunit.app)('Acceptance | suspended messages', {
    beforeEach: function beforeEach() {
      var locale = server.create('locale', { locale: 'en-us' });
      var brand = server.create('brand', { locale: locale });
      var caseFields = server.createList('case-field', 4);
      var mailbox = server.create('mailbox', { brand: brand });
      server.create('channel', { account: { id: mailbox.id, resource_type: 'mailbox' } });
      server.create('case-form', {
        fields: caseFields,
        brand: brand
      });
      var agentRole = server.create('role', { type: 'AGENT' });
      var agent = server.create('user', { role: agentRole, locale: locale, time_zone: 'Europe/London' });
      var session = server.create('session', { user: agent });
      login(session.id);

      server.create('plan', {
        limits: {},
        features: [],
        account_id: '123',
        subscription_id: '123'
      });

      for (var i = 0; i < 22; i++) {
        server.create('mail', {
          is_suspended: true,
          status: 'SUSPENDED',
          suspension_code: 'SPAM',
          from: 'client' + i + '@example.com',
          subject: 'subject' + i
        });
      }
    },

    afterEach: function afterEach() {
      window.confirm = originalConfirm;
      logout();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('view and paginate suspended messages', function (assert) {
    visit('/agent/cases/suspended-messages');

    andThen(function () {
      assert.equal($('.suspended-messages-section__table tbody tr').length, 20, 'There is 20 mails in the first page');
      assert.equal($('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationPageNumber).text().trim(), '1', 'This is page 1... ');
      assert.equal($('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationPageCount).text().trim(), 'of 2', '... of 2');

      assert.equal($('.suspended-messages-section__table tbody tr:eq(0) td:eq(1)').text().trim(), 'client0@example.com');
      click('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationNext + ' a');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages?page=2');
      assert.equal($('.suspended-messages-section__table tbody tr').length, 2, 'There is 2 mails in the second page');
      assert.equal($('.suspended-messages-section__table tbody tr:eq(0) td:eq(1)').text().trim(), 'client20@example.com');
      assert.equal($('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationPageNumber).text().trim(), '2', 'This is page 2... ');
      assert.equal($('.' + _frontendCpComponentsKoPaginationStyles['default'].paginationPageCount).text().trim(), 'of 2', '... of 2');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('open detail of a message and exit detail', function (assert) {
    visit('/agent/cases/suspended-messages');

    andThen(function () {
      click($('.suspended-messages-section__table tbody tr:eq(2)'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages/3');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 1, 'A modal opened with the message clicked');
      assert.equal($('.qa-suspended-message-modal__table-row:eq(0) td').text().trim(), 'client2@example.com', 'The data seems correct');
      click('a:contains("Cancel")');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 0, 'The modal is gone');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('delete permanently the opened message', function (assert) {
    visit('/agent/cases/suspended-messages');

    andThen(function () {
      click($('.suspended-messages-section__table tbody tr:eq(2)'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages/3');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 1, 'A modal opened with the message clicked');
      assert.equal($('.qa-suspended-message-modal__table-row:eq(0) td').text().trim(), 'client2@example.com', 'The data seems correct');
      click('.button:contains("Permanently delete")');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 0, 'The modal is gone');
      assert.equal($('.suspended-messages-section__table tbody tr').length, 19, 'Message was deleted');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('allow to passthough the opened message', function (assert) {
    visit('/agent/cases/suspended-messages');

    andThen(function () {
      click($('.suspended-messages-section__table tbody tr:eq(2)'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages/3');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 1, 'A modal opened with the message clicked');
      assert.equal($('.qa-suspended-message-modal__table-row:eq(0) td').text().trim(), 'client2@example.com', 'The data seems correct');
      click('.button:contains("Allow through")');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages');
      assert.equal($('.' + _frontendCpComponentsKoModalStyles['default'].content).length, 0, 'The modal is gone');
      assert.equal($('.suspended-messages-section__table tbody tr').length, 19, 'Message was deleted');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('delete permanently in batch', function (assert) {
    window.confirm = function () {
      return true;
    };
    visit('/agent/cases/suspended-messages?page=2');

    andThen(function () {
      assert.equal($('.suspended-messages-section__delete-all').length, 0, 'There is no button to delete ni batch visible');
      click('.suspended-messages-section__table tbody tr .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':eq(0)');
      click('.suspended-messages-section__table tbody tr .' + _frontendCpComponentsKoCheckboxStyles['default'].checkbox + ':eq(1)');
    });

    andThen(function () {
      assert.equal($('.suspended-messages-section__delete-all').length, 1, 'The button to delete in batch appeared');
      click('.suspended-messages-section__delete-all');
    });

    andThen(function () {
      assert.equal(currentURL(), '/agent/cases/suspended-messages');
      assert.equal($('.suspended-messages-section__table tbody tr').length, 20, 'Message was deleted');
      assert.equal($('.suspended-messages-section__delete-all').length, 0, 'The button to delete in batch is gone again');
    });
  });
});
/*eslint-disable camelcase */
define('frontend-cp/tests/assertions/properties-equal', ['exports', 'ember', 'qunit'], function (exports, _ember, _qunit) {
  exports['default'] = propertiesEqual;

  function propertiesEqual(actual, expected, message) {
    var expectedProperties = expected instanceof _ember['default'].Object ? getEmberObjectProperties(expected) : expected;
    if (!actual) {
      this.push(false, actual, expectedProperties, message);
      return;
    }
    var actualProperties = getEmberObjectProperties(actual);
    var objectsAreEqual = _qunit['default'].equiv(actualProperties, expectedProperties);
    this.push(objectsAreEqual, actualProperties, expectedProperties, message);
  }

  function getEmberObjectProperties(value) {
    if (!value) {
      return parsePrimitive(value);
    } else if (Array.isArray(value)) {
      return parseArray(value);
    } else if (value instanceof _ember['default'].Object) {
      return parseEmberObject(value);
    } else if (value instanceof Object) {
      return parseObject(value);
    }

    return value;

    function parsePrimitive(value) {
      return value;
    }

    function parseEmberObject(value) {
      var properties = value.getProperties(Object.keys(value));
      return parseObject(properties);
    }

    function parseObject(value) {
      return Object.keys(value).reduce(function (fields, key) {
        fields[key] = getEmberObjectProperties(value[key]);
        return fields;
      }, {});
    }

    function parseArray(value) {
      return value.map(function (item) {
        return getEmberObjectProperties(item);
      });
    }
  }
});
define('frontend-cp/tests/blanket-options', ['exports'], function (exports) {
  /* globals blanket, module */
  /*eslint-disable */
  var options = {
    modulePrefix: 'frontend-cp',
    filter: '//.*frontend-cp/.*/',
    antifilter: '//.*(tests|template).*/',
    loaderExclusions: [],
    enableCoverage: true,
    cliOptions: {
      reporters: ['json'],
      autostart: true
    }
  };
  if (typeof exports === 'undefined') {
    blanket.options(options);
  } else {
    module.exports = options;
  }
  /*eslint-enable */
});
define('frontend-cp/tests/fixtures/browser/mock-browser', ['exports'], function (exports) {
  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Location = function Location() {
    var url = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];

    _classCallCheck(this, Location);

    var linkElement = document.createElement('a');
    linkElement.href = url;

    this.hash = linkElement.hash;
    this.host = linkElement.host;
    this.hostname = linkElement.hostname;
    this.href = linkElement.href;
    this.origin = linkElement.origin;
    this.pathname = linkElement.pathname;
    this.port = linkElement.port;
    this.protocol = linkElement.protocol;
    this.search = linkElement.search;
  };

  exports.Location = Location;

  var History = (function () {
    function History() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$location = _ref.location;
      var location = _ref$location === undefined ? null : _ref$location;
      var _ref$state = _ref.state;
      var state = _ref$state === undefined ? null : _ref$state;
      var _ref$title = _ref.title;
      var title = _ref$title === undefined ? null : _ref$title;

      _classCallCheck(this, History);

      this._location = location || new Location();
      this._entries = [];
      this._currentIndex = -1;

      var path = this._location.href;
      this.pushState(state, title, path);
    }

    _createClass(History, [{
      key: 'back',
      value: function back() {
        if (this._currentIndex > 0) {
          this._currentIndex--;
        }
      }
    }, {
      key: 'forward',
      value: function forward() {
        if (this._currentIndex < this._entries.length - 1) {
          this._currentIndex++;
        }
      }
    }, {
      key: 'go',
      value: function go(delta) {
        var targetIndex = this._currentIndex + delta;
        if (targetIndex >= 0 && targetIndex < this._entries.length) {
          this._currentIndex = targetIndex;
        }
      }
    }, {
      key: 'pushState',
      value: function pushState(state, title, path) {
        this._entries.length = this._currentIndex + 1;
        this._entries.push({
          state: state,
          title: title,
          path: path
        });
        this._currentIndex = this._entries.length - 1;
        var newLocation = new Location(path);
        Object.assign(this._location, newLocation);
      }
    }, {
      key: 'replaceState',
      value: function replaceState(state, title, path) {
        if (arguments.length < 3) {
          var currentItem = this._entries[this._currentIndex] || {
            state: null,
            title: null,
            path: null
          };
          if (arguments.length < 2) {
            title = currentItem.title;
          }
          if (arguments.length < 3) {
            path = currentItem.path;
          }
        }
        this._currentIndex = Math.max(0, this._currentIndex);
        this._entries[this._currentIndex] = {
          state: state,
          title: title,
          path: path
        };
        var newLocation = this._entries[this._currentIndex];
        Object.assign(this._location, newLocation);
      }
    }, {
      key: 'length',
      get: function get() {
        return this._entries.length;
      }
    }, {
      key: 'state',
      get: function get() {
        if (this._currentIndex === -1) {
          return null;
        }
        return this._entries[this._currentIndex].state;
      }
    }]);

    return History;
  })();

  exports.History = History;
});
define('frontend-cp/tests/fixtures/location/mock-location', ['exports', 'ember', 'frontend-cp/tests/fixtures/browser/mock-browser'], function (exports, _ember, _frontendCpTestsFixturesBrowserMockBrowser) {
  exports['default'] = _ember['default'].HistoryLocation.extend({
    init: function init() {
      var location = new _frontendCpTestsFixturesBrowserMockBrowser.Location();
      var history = new _frontendCpTestsFixturesBrowserMockBrowser.History({
        location: location
      });
      this.set('location', location);
      this.set('history', history);
      this._super();
      this.initState();
      this.replaceState(this.formatURL('/'));
    }
  });
});
define('frontend-cp/tests/fixtures/router/mock-router', ['exports', 'ember', 'frontend-cp/tests/fixtures/location/mock-location'], function (exports, _ember, _frontendCpTestsFixturesLocationMockLocation) {
  exports['default'] = _ember['default'].Object.extend(_ember['default'].Evented, {
    init: function init() {
      this._super();
      this.set('location', this.get('location') || _frontendCpTestsFixturesLocationMockLocation['default'].create());
    },
    location: null,
    transitionTo: function transitionTo(url) {
      var _this = this;

      var location = this.get('location');
      var path = location.formatURL(url);
      var state = {
        path: path
      };
      location.get('history').pushState(state, null, path);
      return _ember['default'].RSVP.resolve().then(function () {
        _this.trigger('didTransition');
      });
    }
  });
});
define('frontend-cp/tests/fixtures/services/mock-local-store', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Service.extend({
    _localStore: null,
    _sessionStore: null,

    init: function init() {
      this._super();
      this.set('_localStore', {});
      this.set('_sessionStore', {});
    },

    getItem: function getItem(key) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref$persist = _ref.persist;
      var persist = _ref$persist === undefined ? false : _ref$persist;

      var store = this.get(persist ? '_localStore' : '_sessionStore');
      return store[key];
    },

    setItem: function setItem(key, value) {
      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref2$persist = _ref2.persist;
      var persist = _ref2$persist === undefined ? false : _ref2$persist;

      var store = this.get(persist ? '_localStore' : '_sessionStore');
      store[key] = value;
    },

    removeItem: function removeItem(key) {
      var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref3$persist = _ref3.persist;
      var persist = _ref3$persist === undefined ? false : _ref3$persist;

      var store = this.get(persist ? '_localStore' : '_sessionStore');
      Reflect.deleteProperty(store, key);
    },

    clearAll: function clearAll() {
      this.set('_localStore', {});
      this.set('_sessionStore', {});
    }
  });
});
define('frontend-cp/tests/helpers/confirming', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Test.registerAsyncHelper('confirming', function (app, confirming, fn) {
    var originalConfirm = window.confirm;

    window.confirm = function () {
      return confirming;
    };

    fn();

    return app.testHelpers.wait().then(function () {
      window.confirm = originalConfirm;
    });
  });
});
define('frontend-cp/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
    server.shutdown();
  }
});
define('frontend-cp/tests/helpers/dom-helpers', ['exports'], function (exports) {
  function text(selector) {
    return $.trim($(selector).text()).replace(/\s+/g, ' ');
  }

  exports.text = text;
});
define('frontend-cp/tests/helpers/drag', ['exports', 'ember'], function (exports, _ember) {
  exports.drag = drag;
  var $ = _ember['default'].$;

  function drag(app, itemSelector, offsetFn) {
    var callbacks = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    var start = undefined,
        move = undefined,
        end = undefined,
        which = undefined;

    var _app$testHelpers = app.testHelpers;
    var andThen = _app$testHelpers.andThen;
    var findWithAssert = _app$testHelpers.findWithAssert;
    var wait = _app$testHelpers.wait;

    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
    which = 1;

    andThen(function () {
      var item = findWithAssert(itemSelector);
      var itemOffset = item.offset();
      var offset = offsetFn();
      var targetX = itemOffset.left + offset.dx;
      var targetY = itemOffset.top + offset.dy;

      triggerEvent(app, item, start, {
        pageX: itemOffset.left,
        pageY: itemOffset.top,
        which: which
      });

      if (callbacks.dragstart) {
        andThen(callbacks.dragstart);
      }

      triggerEvent(app, item, move, {
        pageX: itemOffset.left,
        pageY: itemOffset.top
      });

      if (callbacks.dragmove) {
        andThen(callbacks.dragmove);
      }

      triggerEvent(app, item, move, {
        pageX: targetX,
        pageY: targetY
      });

      triggerEvent(app, item, end, {
        pageX: targetX,
        pageY: targetY
      });

      if (callbacks.dragend) {
        andThen(callbacks.dragend);
      }
    });

    return wait();
  }

  function triggerEvent(app, el, type, props) {
    return app.testHelpers.andThen(function () {
      var event = $.Event(type, props);
      $(el).trigger(event);
    });
  }

  exports['default'] = _ember['default'].Test.registerAsyncHelper('drag', drag);
});
//unashamedly stolen from ember-sortable test helper
define('frontend-cp/tests/helpers/ember-basic-dropdown', ['exports', 'ember', 'ember-runloop'], function (exports, _ember, _emberRunloop) {
  exports.nativeClick = nativeClick;
  exports.clickTrigger = clickTrigger;
  exports.tapTrigger = tapTrigger;
  exports.fireKeydown = fireKeydown;

  // integration helpers
  function focus(el) {
    if (!el) {
      return;
    }
    var $el = jQuery(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        (0, _emberRunloop['default'])(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  }

  function nativeClick(selector) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var mousedown = new window.Event('mousedown', { bubbles: true, cancelable: true, view: window });
    var mouseup = new window.Event('mouseup', { bubbles: true, cancelable: true, view: window });
    var click = new window.Event('click', { bubbles: true, cancelable: true, view: window });
    Object.keys(options).forEach(function (key) {
      mousedown[key] = options[key];
      mouseup[key] = options[key];
      click[key] = options[key];
    });
    var element = document.querySelector(selector);
    (0, _emberRunloop['default'])(function () {
      return element.dispatchEvent(mousedown);
    });
    focus(element);
    (0, _emberRunloop['default'])(function () {
      return element.dispatchEvent(mouseup);
    });
    (0, _emberRunloop['default'])(function () {
      return element.dispatchEvent(click);
    });
  }

  function clickTrigger(scope) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var selector = '.ember-basic-dropdown-trigger';
    if (scope) {
      selector = scope + ' ' + selector;
    }
    nativeClick(selector, options);
  }

  function tapTrigger(scope) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var selector = '.ember-basic-dropdown-trigger';
    if (scope) {
      selector = scope + ' ' + selector;
    }
    var touchStartEvent = new window.Event('touchstart', { bubbles: true, cancelable: true, view: window });
    Object.keys(options).forEach(function (key) {
      return touchStartEvent[key] = options[key];
    });
    (0, _emberRunloop['default'])(function () {
      return document.querySelector(selector).dispatchEvent(touchStartEvent);
    });
    var touchEndEvent = new window.Event('touchend', { bubbles: true, cancelable: true, view: window });
    Object.keys(options).forEach(function (key) {
      return touchEndEvent[key] = options[key];
    });
    (0, _emberRunloop['default'])(function () {
      return document.querySelector(selector).dispatchEvent(touchEndEvent);
    });
  }

  function fireKeydown(selector, k) {
    var oEvent = document.createEvent('Events');
    oEvent.initEvent('keydown', true, true);
    $.extend(oEvent, {
      view: window,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      keyCode: k,
      charCode: k
    });
    (0, _emberRunloop['default'])(function () {
      return document.querySelector(selector).dispatchEvent(oEvent);
    });
  }

  // acceptance helpers

  exports['default'] = function () {
    _ember['default'].Test.registerAsyncHelper('clickDropdown', function (app, cssPath) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      clickTrigger(cssPath, options);
    });

    _ember['default'].Test.registerAsyncHelper('tapDropdown', function (app, cssPath) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      tapTrigger(cssPath, options);
    });
  };
});
define('frontend-cp/tests/helpers/ember-power-select', ['exports', 'jquery', 'ember-runloop', 'ember-test'], function (exports, _jquery, _emberRunloop, _emberTest) {
  exports.nativeMouseDown = nativeMouseDown;
  exports.nativeMouseUp = nativeMouseUp;
  exports.triggerKeydown = triggerKeydown;
  exports.typeInSearch = typeInSearch;
  exports.clickTrigger = clickTrigger;
  exports.nativeTouch = nativeTouch;
  exports.touchTrigger = touchTrigger;

  // Helpers for integration tests

  function typeText(selector, text) {
    var $selector = (0, _jquery['default'])((0, _jquery['default'])(selector).get(0)); // Only interact with the first result
    $selector.val(text);
    var event = document.createEvent('Events');
    event.initEvent('input', true, true);
    $selector[0].dispatchEvent(event);
  }

  function fireNativeMouseEvent(eventType, selectorOrDomElement) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var event = new window.Event(eventType, { bubbles: true, cancelable: true, view: window });
    Object.keys(options).forEach(function (key) {
      return event[key] = options[key];
    });
    var target = undefined;
    if (typeof selectorOrDomElement === 'string') {
      target = (0, _jquery['default'])(selectorOrDomElement)[0];
    } else {
      target = selectorOrDomElement;
    }
    (0, _emberRunloop['default'])(function () {
      return target.dispatchEvent(event);
    });
  }

  function nativeMouseDown(selectorOrDomElement, options) {
    fireNativeMouseEvent('mousedown', selectorOrDomElement, options);
  }

  function nativeMouseUp(selectorOrDomElement, options) {
    fireNativeMouseEvent('mouseup', selectorOrDomElement, options);
  }

  function triggerKeydown(domElement, k) {
    var oEvent = document.createEvent('Events');
    oEvent.initEvent('keydown', true, true);
    _jquery['default'].extend(oEvent, {
      view: window,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      keyCode: k,
      charCode: k
    });
    (0, _emberRunloop['default'])(function () {
      domElement.dispatchEvent(oEvent);
    });
  }

  function typeInSearch(text) {
    (0, _emberRunloop['default'])(function () {
      typeText('.ember-power-select-search-input, .ember-power-select-search input, .ember-power-select-trigger-multiple-input, input[type="search"]', text);
    });
  }

  function clickTrigger(scope) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var selector = '.ember-power-select-trigger';
    if (scope) {
      selector = scope + ' ' + selector;
    }
    nativeMouseDown(selector, options);
  }

  function nativeTouch(selectorOrDomElement) {
    var event = new window.Event('touchstart', { bubbles: true, cancelable: true, view: window });
    var target = undefined;

    if (typeof selectorOrDomElement === 'string') {
      target = (0, _jquery['default'])(selectorOrDomElement)[0];
    } else {
      target = selectorOrDomElement;
    }
    (0, _emberRunloop['default'])(function () {
      return target.dispatchEvent(event);
    });
    (0, _emberRunloop['default'])(function () {
      event = new window.Event('touchend', { bubbles: true, cancelable: true, view: window });
      target.dispatchEvent(event);
    });
  }

  function touchTrigger() {
    var selector = '.ember-power-select-trigger';
    nativeTouch(selector);
  }

  // Helpers for acceptance tests

  exports['default'] = function () {
    _emberTest['default'].registerAsyncHelper('selectChoose', function (app, cssPath, value) {
      var $trigger = find(cssPath).find('.ember-power-select-trigger');
      var contentId = '' + $trigger.attr('aria-controls');
      var $content = find('#' + contentId);
      // If the dropdown is closed, open it
      if ($content.length === 0) {
        nativeMouseDown(cssPath + ' .ember-power-select-trigger');
        wait();
      }

      // Select the option with the given text
      andThen(function () {
        var potentialTargets = (0, _jquery['default'])('#' + contentId + ' .ember-power-select-option:contains("' + value + '")').toArray();
        var target = undefined;
        if (potentialTargets.length > 1) {
          target = potentialTargets.filter(function (t) {
            return t.textContent.trim() === value;
          })[0] || potentialTargets[0];
        } else {
          target = potentialTargets[0];
        }
        nativeMouseUp(target);
      });
    });

    _emberTest['default'].registerAsyncHelper('selectSearch', function (app, cssPath, value) {
      var $trigger = find(cssPath).find('.ember-power-select-trigger');
      var contentId = '' + $trigger.attr('aria-controls');
      var isMultipleSelect = (0, _jquery['default'])(cssPath + ' .ember-power-select-trigger-multiple-input').length > 0;

      var dropdownIsClosed = (0, _jquery['default'])('#' + contentId).length === 0;
      if (dropdownIsClosed) {
        nativeMouseDown(cssPath + ' .ember-power-select-trigger');
        wait();
      }
      var isDefaultSingleSelect = (0, _jquery['default'])('.ember-power-select-search-input').length > 0;

      if (isMultipleSelect) {
        fillIn(cssPath + ' .ember-power-select-trigger-multiple-input', value);
      } else if (isDefaultSingleSelect) {
        fillIn('.ember-power-select-search-input', value);
      } else {
        // It's probably a customized version
        var inputIsInTrigger = !!find(cssPath + ' .ember-power-select-trigger input[type=search]')[0];
        if (inputIsInTrigger) {
          fillIn(cssPath + ' .ember-power-select-trigger input[type=search]', value);
        } else {
          fillIn('#' + contentId + ' .ember-power-select-search-input[type=search]', 'input');
        }
      }
    });

    _emberTest['default'].registerAsyncHelper('removeMultipleOption', function (app, cssPath, value) {
      var elem = find(cssPath + ' .ember-power-select-multiple-options > li:contains(' + value + ') > .ember-power-select-multiple-remove-btn').get(0);
      try {
        nativeMouseDown(elem);
        wait();
      } catch (e) {
        console.warn('css path to remove btn not found');
        throw e;
      }
    });

    _emberTest['default'].registerAsyncHelper('clearSelected', function (app, cssPath) {
      var elem = find(cssPath + ' .ember-power-select-clear-btn').get(0);
      try {
        nativeMouseDown(elem);
        wait();
      } catch (e) {
        console.warn('css path to clear btn not found');
        throw e;
      }
    });
  };
});
define('frontend-cp/tests/helpers/ember-sortable/test-helpers', ['exports', 'ember-sortable/helpers/drag', 'ember-sortable/helpers/reorder'], function (exports, _emberSortableHelpersDrag, _emberSortableHelpersReorder) {});
define('frontend-cp/tests/helpers/expect-request', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = expectRequest;
  var copy = _ember['default'].copy;
  var typeOf = _ember['default'].typeOf;

  var STANDARD_RESPONSE = [200, {}, ''];

  /**
    Installs a mock endpoint for *exactly* the specified request and adds an
    async-aware assertion that the request will be made at the expected time.
    Example:
    ```js
    expectRequest(pretender, {
      verb: 'POST',
      path: '/favourites',
      headers: {
        Authorization: 'bearer some-cool-token'
      },
      payload: {
        favourite: {
          sport_id: 1,
          position: 0
        }
      },
      response: [
        201,
        { 'Content-Type': 'application/json' },
        '{"favourite":{"id":101,"sport_id":1,"position":0}'
      ]
    });
    ```
    Note that in acceptance tests we monkey patch an `expectRequest` method onto
    the pretender instance returned by `startPretender`. As such you use this
    instead:
    ```js
    pretender.expectRequest({
      // ...
    });
    ```
    @public
    @method expectRequest
    @param {Pretender} [pretender]
    @param {Object} [options]
    @param {String} [options.message]
      Optional message/nickname for this request. Appears in test output.
      Useful for differentiating occurences of requests.
    @param {String} [options.verb]
      The HTTP method to use. Aliased as [options.method].
      Default 'GET'.
    @param {String} [options.path]
      The request path.
      Default '/'.
    @param {Object} [options.headers]
      Expected HTTP headers. We ignore `Accept`, `Content-Type`, and
      `X-Requested-With` for convenience.
      Default { Authorization: 'test-access-token' }.
    @param {Object} [options.payload]
      The expected JSON-encoded body of the request.
      No default
    @param {Object} [options.query]
      The expected query params.
    @param {Number} [options.count]
      The number of times this request is expected to be made.
      Default 1.
    @param {Array|Function} [options.response]
      The response when this request matches in Pretender-standard format
      `[status, headers, body]`.
  */

  function expectRequest(pretender, options) {
    var message = options.message || 'request';
    var expectedVerb = (options.verb || options.method || 'get').toUpperCase();
    var expectedPath = options.path || '/';
    var expectedHeaders = options.headers || { Authorization: 'bearer test-access-token' };
    var expectedPayload = options.payload || {};
    var expectedQuery = options.query || {};
    var expectedCount = options.count || 1;
    var response = options.response || STANDARD_RESPONSE;
    var actualCount = 0;

    // Create key for this handler. We’ll use it in the generic
    // request handler to pluck this specialised handler from
    // the queue.
    var key = generateKey(expectedVerb, expectedPath, expectedHeaders, expectedQuery, expectedPayload);

    function genericHandler(req) {
      var headers = sanitizeHeaders(req.requestHeaders, expectedHeaders);
      var payload = JSON.parse(req.requestBody) || {};
      var query = req.queryParams;
      var reqKey = generateKey(expectedVerb, expectedPath, headers, query, payload);
      var handler = fetchHandler(pretender, reqKey);

      if (!handler) {
        console.error('Unexpected request ' + reqKey); // eslint-disable-line
        throw new Error('Unexpected request ' + reqKey);
      }

      return Reflect.apply(handler, this, [req]);
    }

    function specialisedHandler(req) {
      actualCount++;

      if (typeOf(response) === 'function') {
        return response(req);
      } else {
        return response;
      }
    }

    function assertion() {
      equal(actualCount, expectedCount, 'Expected ' + message + ' ' + key);
    }

    // Register our specialised handler in the queue as many
    // times as specified in `count`.
    for (var i = 0; i < expectedCount; i++) {
      storeHandler(pretender, key, specialisedHandler);
    }

    // This is our generic handler. Its job is to pop a specialised
    // handler off the queue or complain if none exists.
    pretender.register(expectedVerb, expectedPath, genericHandler);

    // Whatever happens, we’ll queue up our assertion.
    andThen(assertion);
  }

  function generateKey(verb, path, headers, query, payload) {
    return JSON.stringify([verb.toUpperCase(), path, headers, query, payload]);
  }

  function storeHandler(pretender, key, handler) {
    pretender.__handlers__ = pretender.__handlers__ || {};
    pretender.__handlers__[key] = pretender.__handlers__[key] || [];
    pretender.__handlers__[key].push(handler);
  }

  function fetchHandler(pretender, key) {
    var handlers = pretender.__handlers__[key];
    var handler = handlers && handlers.shift();
    return handler;
  }

  function sanitizeHeaders(headers, expectedHeaders) {
    var result = copy(headers, false);

    if (!expectedHeaders.hasOwnProperty('Accept')) {
      Reflect.deleteProperty(result, 'Accept');
    }
    if (!expectedHeaders.hasOwnProperty('Content-Type')) {
      Reflect.deleteProperty(result, 'Content-Type');
    }
    if (!expectedHeaders.hasOwnProperty('X-Requested-With')) {
      Reflect.deleteProperty(result, 'X-Requested-With');
    }

    return result;
  }
});
/* global equal */
define('frontend-cp/tests/helpers/fill-in-rich-text-editor', ['exports', 'ember', 'frontend-cp/components/ko-text-editor/styles'], function (exports, _ember, _frontendCpComponentsKoTextEditorStyles) {
  exports['default'] = _ember['default'].Test.registerAsyncHelper('fillInRichTextEditor', function (app, html) {
    var editor = _ember['default'].$('.' + _frontendCpComponentsKoTextEditorStyles['default'].froalaTextArea);
    editor.froalaEditor('html.set', html);

    // This is a special hack in tests to make Froala to respond and trigger event for update
    editor.find('[contenteditable]').trigger($.Event('keyup', { which: 32, keyCode: 32 }));
    editor.find('[contenteditable]').trigger($.Event('keyup', { which: 8, keyCode: 8 }));
  });
});
define('frontend-cp/tests/helpers/input-array-to-input-val-array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Test.registerHelper('inputArrayToInputValArray', function (app, selector) {
    var titles = [];

    $(selector).each(function (index, item) {
      titles.push($(item).val());
    });

    return titles;
  });
});
define('frontend-cp/tests/helpers/login', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Test.registerAsyncHelper('login', function (app) {
    var sessionId = arguments.length <= 1 || arguments[1] === undefined ? '1' : arguments[1];

    var sessionService = app.__container__.lookup('service:session');
    var locale = app.__container__.lookup('service:locale');
    locale.setup();
    sessionService.set('sessionId', null);
    sessionService.set('sessionId', sessionId);
  });
});
define('frontend-cp/tests/helpers/logout', ['exports', 'ember', 'frontend-cp/config/environment'], function (exports, _ember, _frontendCpConfigEnvironment) {

  var sessionIdCookieName = _frontendCpConfigEnvironment['default'].sessionIdCookieName;
  var sessionIdCookieDomain = '.' + window.location.hostname;

  exports['default'] = _ember['default'].Test.registerAsyncHelper('logout', function () {

    localStorage.removeItem('sessionId');
    localStorage.removeItem('tabs');
    document.cookie = sessionIdCookieName + '=; expires=0; domain=' + sessionIdCookieDomain + '; path=/';
  });
});
define('frontend-cp/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember', 'frontend-cp/tests/helpers/start-app', 'frontend-cp/tests/helpers/destroy-app'], function (exports, _qunit, _ember, _frontendCpTestsHelpersStartApp, _frontendCpTestsHelpersDestroyApp) {
  var Promise = _ember['default'].RSVP.Promise;

  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _frontendCpTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          return Reflect.apply(options.beforeEach, this, arguments);
        }
      },

      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && Reflect.apply(options.afterEach, this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _frontendCpTestsHelpersDestroyApp['default'])(_this.application);
        });
      }
    });
  };
});
define('frontend-cp/tests/helpers/native-focus', ['exports', 'ember'], function (exports, _ember) {

  function fireEvent(node, eventType) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventType, true, true);
    node.dispatchEvent(event);
  }

  exports['default'] = function (el) {
    if (!el) {
      return;
    }
    var $el = $(el);
    if ($(el).is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        _ember['default'].run(el, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.
          if (!document.hasFocus || document.hasFocus()) {
            this.focus();
          } else {
            fireEvent(this, 'focusin');
          }
        });
      }
    }
  };
});
define('frontend-cp/tests/helpers/qunit', ['exports', 'ember', 'qunit', 'ember-qunit/qunit-module', 'ember-test-helpers', 'ember-qunit/test', 'frontend-cp/tests/helpers/start-app', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/utils/register-helper', 'frontend-cp/tests/assertions/properties-equal'], function (exports, _ember, _qunit, _emberQunitQunitModule, _emberTestHelpers, _emberQunitTest, _frontendCpTestsHelpersStartApp, _emberTruthHelpersHelpersAnd, _emberTruthHelpersHelpersEqual, _emberTruthHelpersHelpersNot, _emberTruthHelpersHelpersOr, _emberTruthHelpersUtilsRegisterHelper, _frontendCpTestsAssertionsPropertiesEqual) {
  exports.createModule = createModule;
  exports.moduleForComponent = moduleForComponent;
  exports.moduleForModel = moduleForModel;
  exports.moduleFor = moduleFor;
  exports.app = app;

  _qunit['default'].assert.propertiesEqual = _frontendCpTestsAssertionsPropertiesEqual['default'];

  function createModule(Constructor, name, description, callbacks) {
    var actualCallbacks = callbacks || (typeof description === 'object' ? description : {});
    var beforeCallback = actualCallbacks.setup || actualCallbacks.beforeEach;
    actualCallbacks['beforeEach' in actualCallbacks ? 'beforeEach' : 'setup'] = function () {
      (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('and', _emberTruthHelpersHelpersAnd.andHelper);
      (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('eq', _emberTruthHelpersHelpersEqual.equalHelper);
      (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not', _emberTruthHelpersHelpersNot.notHelper);
      (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('or', _emberTruthHelpersHelpersOr.orHelper);

      if (beforeCallback) {
        Reflect.apply(beforeCallback, this, arguments);
      }
    };

    if (typeof description !== 'object' && !Boolean(description)) {
      return (0, _emberQunitQunitModule.createModule)(Constructor, name, description, actualCallbacks);
    }

    return (0, _emberQunitQunitModule.createModule)(Constructor, name, actualCallbacks);
  }

  function moduleForComponent(name, description, callbacks) {
    createModule(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
  }

  function moduleForModel(name, description, callbacks) {
    createModule(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }

  function moduleFor(name, description, callbacks) {
    createModule(_emberTestHelpers.TestModule, name, description, callbacks);
  }

  exports.test = _emberQunitTest['default'];
  exports.setResolver = _emberTestHelpers.setResolver;

  function app(name) {
    var callbacks = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _qunit['default'].module(name, {
      beforeEach: function beforeEach() {
        localStorage.clear();
        sessionStorage.clear();
        this.application = (0, _frontendCpTestsHelpersStartApp['default'])();
        if (callbacks.beforeEach) {
          Reflect.apply(callbacks.beforeEach, this, [this.application]);
        }
      },

      afterEach: function afterEach() {
        if (callbacks.afterEach) {
          Reflect.apply(callbacks.afterEach, this, [this.application]);
        }
        _ember['default'].run(this.application, 'destroy');
        server.shutdown();
      }
    });
  }
});
define('frontend-cp/tests/helpers/reorder-inputs', ['exports', 'ember'], function (exports, _ember) {

  var OVERSHOOT = 2;

  exports['default'] = _ember['default'].Test.registerAsyncHelper('reorderInputs', function (app, itemSelector, elementSelector) {
    for (var _len = arguments.length, resultSelectors = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      resultSelectors[_key - 3] = arguments[_key];
    }

    resultSelectors.forEach(function (selector, targetIndex) {
      andThen(function () {
        var items = findWithAssert(itemSelector);
        var element = items.filter(function (index, element) {
          return $(element).parent().find(elementSelector).val() === selector;
        });
        var targetElement = items.eq(targetIndex);
        var dx = targetElement.offset().left - OVERSHOOT - element.offset().left;
        var dy = targetElement.offset().top - OVERSHOOT - element.offset().top;

        drag('mouse', element, function () {
          return { dx: dx, dy: dy };
        });
      });
    });

    return wait();
  });
});
//unashamedly stolen from ember-sortable test helper
define('frontend-cp/tests/helpers/reorder-list-items', ['exports', 'ember'], function (exports, _ember) {

  var OVERSHOOT = 2;

  exports['default'] = _ember['default'].Test.registerAsyncHelper('reorderListItems', function (app, itemSelector, elementSelector) {
    for (var _len = arguments.length, resultSelectors = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      resultSelectors[_key - 3] = arguments[_key];
    }

    resultSelectors.forEach(function (selector, targetIndex) {
      andThen(function () {
        var items = findWithAssert(itemSelector);
        var element = items.filter(function (index, element) {
          return $(element).parent().find(elementSelector).text().trim() === selector;
        });
        var targetElement = items.eq(targetIndex);
        var dx = targetElement.offset().left - OVERSHOOT - element.offset().left;
        var dy = targetElement.offset().top - OVERSHOOT - element.offset().top;

        drag('mouse', element, function () {
          return { dx: dx, dy: dy };
        });
      });
    });

    return wait();
  });
});
//unashamedly stolen from ember-sortable test helper
define('frontend-cp/tests/helpers/resolver', ['exports', 'frontend-cp/resolver', 'frontend-cp/config/environment'], function (exports, _frontendCpResolver, _frontendCpConfigEnvironment) {

  var resolver = _frontendCpResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _frontendCpConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _frontendCpConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('frontend-cp/tests/helpers/scroll-to-bottom-of-page', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Test.registerAsyncHelper('scrollToBottomOfPage', function (app) {
    _ember['default'].$('#ember-testing-container').scrollTop($('#ember-testing-container')[0].scrollHeight);
  });
});
define('frontend-cp/tests/helpers/setup-mirage-for-integration', ['exports', 'frontend-cp/initializers/ember-cli-mirage'], function (exports, _frontendCpInitializersEmberCliMirage) {
  exports['default'] = setupMirage;

  function setupMirage(container) {
    _frontendCpInitializersEmberCliMirage['default'].initialize(container);
  }
});
//Work around until this is real
//https://github.com/samselikoff/ember-cli-mirage/issues/183
define('frontend-cp/tests/helpers/start-app', ['exports', 'ember', 'frontend-cp/app', 'frontend-cp/config/environment', 'frontend-cp/tests/helpers/login', 'frontend-cp/tests/helpers/fill-in-rich-text-editor', 'frontend-cp/tests/helpers/use-default-scenario', 'frontend-cp/tests/helpers/ember-power-select', 'frontend-cp/tests/helpers/reorder-inputs', 'frontend-cp/tests/helpers/reorder-list-items', 'frontend-cp/tests/helpers/confirming', 'frontend-cp/tests/helpers/ember-sortable/test-helpers', 'frontend-cp/tests/helpers/scroll-to-bottom-of-page', 'frontend-cp/tests/helpers/input-array-to-input-val-array', 'frontend-cp/tests/helpers/text-nodes-to-array', 'frontend-cp/tests/helpers/logout'], function (exports, _ember, _frontendCpApp, _frontendCpConfigEnvironment, _frontendCpTestsHelpersLogin, _frontendCpTestsHelpersFillInRichTextEditor, _frontendCpTestsHelpersUseDefaultScenario, _frontendCpTestsHelpersEmberPowerSelect, _frontendCpTestsHelpersReorderInputs, _frontendCpTestsHelpersReorderListItems, _frontendCpTestsHelpersConfirming, _frontendCpTestsHelpersEmberSortableTestHelpers, _frontendCpTestsHelpersScrollToBottomOfPage, _frontendCpTestsHelpersInputArrayToInputValArray, _frontendCpTestsHelpersTextNodesToArray, _frontendCpTestsHelpersLogout) {
  exports['default'] = startApp;
  // eslint-disable-line

  (0, _frontendCpTestsHelpersEmberPowerSelect['default'])();

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].assign({}, _frontendCpConfigEnvironment['default'].APP);
    attributes = _ember['default'].assign(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _frontendCpApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
// eslint-disable-line
define('frontend-cp/tests/helpers/text-nodes-to-array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Test.registerHelper('textNodesToArray', function (app, selector) {
    var nodes = [];
    $(selector).each(function (index, item) {
      nodes.push($(item).text().trim());
    });

    return nodes;
  });
});
define('frontend-cp/tests/helpers/use-default-scenario', ['exports', 'ember', 'frontend-cp/mirage/scenarios/default'], function (exports, _ember, _frontendCpMirageScenariosDefault) {
  exports['default'] = _ember['default'].Test.registerAsyncHelper('useDefaultScenario', function () {
    (0, _frontendCpMirageScenariosDefault['default'])(server); //eslint-disable-line no-undef
  });
});
define('frontend-cp/tests/integration/components/ko-admin/sidebar-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleForComponent)('ko-admin/sidebar', 'Integration | Component | ko-admin/sidebar', {
    integration: true,

    beforeEach: function beforeEach() {
      // Mock services we’ll need for these tests.
      this.set('features', { isEnabled: function isEnabled() {
          return true;
        } });
      this.set('intl', { findTranslationByKey: function findTranslationByKey(key) {
          return key;
        } });
      this.set('permissions', { has: function has() {
          return true;
        } });
    }
  });

  (0, _emberQunit.test)('it shows account section for instances', function (assert) {
    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 7,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-admin/sidebar', [], ['features', ['subexpr', '@mut', [['get', 'features', ['loc', [null, [3, 15], [3, 23]]]]], [], []], 'intl', ['subexpr', '@mut', [['get', 'intl', ['loc', [null, [4, 11], [4, 15]]]]], [], []], 'permissions', ['subexpr', '@mut', [['get', 'permissions', ['loc', [null, [5, 18], [5, 29]]]]], [], []], 'hostname', 'brewfictus.kayako.com'], ['loc', [null, [2, 4], [6, 40]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.ok(this.$(':contains("admin.navigation.account")').length, 'expected to see the account section');
  });

  (0, _emberQunit.test)('it hides account section for support.kayako.com', function (assert) {
    this.render(Ember.HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 7,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-admin/sidebar', [], ['features', ['subexpr', '@mut', [['get', 'features', ['loc', [null, [3, 15], [3, 23]]]]], [], []], 'intl', ['subexpr', '@mut', [['get', 'intl', ['loc', [null, [4, 11], [4, 15]]]]], [], []], 'permissions', ['subexpr', '@mut', [['get', 'permissions', ['loc', [null, [5, 18], [5, 29]]]]], [], []], 'hostname', 'support.kayako.com'], ['loc', [null, [2, 4], [6, 37]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.ok(!this.$(':contains("admin.navigation.account")').length, 'expected *not* to see the account section');
  });
});
define('frontend-cp/tests/integration/components/ko-agent-dropdown/create-user/component-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'ember', 'sinon', 'frontend-cp/components/ko-form/buttons/styles'], function (exports, _frontendCpTestsHelpersQunit, _ember, _sinon, _frontendCpComponentsKoFormButtonsStyles) {
  var getOwner = _ember['default'].getOwner;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-agent-dropdown/create-user', 'Integration | Component | ko agent dropdown/create user', {
    integration: true,
    beforeEach: function beforeEach() {
      var intlService = getOwner(this).lookup('service:intl');
      intlService.setLocale('en-us');
      intlService.addTranslations('en-us', {
        frontend: {
          api: {
            generic: {
              validation_errors: 'validation_errors',
              cancel: 'Cancel',
              create_user_panel: {
                name_label: 'Name label',
                email_label: 'Email label',
                submit: 'Submit',
                info: 'Info',
                name_required: 'name_required',
                email_required: 'email_required',
                email_invalid: 'email_invalid'
              }
            }
          }
        }
      });

      var mockStore = createMockStore();
      this.registry.unregister('service:store');
      this.registry.register('service:store', mockStore, { instantiate: false });
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('it renders', function (assert) {
    assert.expect(9);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 33
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'ko-agent-dropdown/create-user', ['loc', [null, [1, 0], [1, 33]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $formElement = this.$('form');

    var $nameInputElement = getFormInput($formElement, 'full_name');
    var $emailInputElement = getFormInput($formElement, 'email');
    var $cancelButtonElement = getFormControl($formElement, 'cancel');
    var $submitButtonElement = getFormControl($formElement, 'submit');

    var $infoElement = this.$('.ko-agent-dropdown__footer');

    var $nameLabelElement = $nameInputElement.closest('label');
    var $emailLabelElement = $emailInputElement.closest('label');

    assert.equal($nameLabelElement.text().trim(), 'Name label');
    assert.equal($nameInputElement.val(), '');
    assert.equal($nameInputElement.prop('placeholder'), '');

    assert.equal($emailLabelElement.text().trim(), 'Email label');
    assert.equal($emailInputElement.val(), '');
    assert.equal($nameInputElement.prop('placeholder'), '');

    assert.equal($submitButtonElement.text().trim(), 'Submit');
    assert.equal($cancelButtonElement.text().trim(), 'Cancel');

    assert.equal($infoElement.text().trim(), 'Info');
  });

  (0, _frontendCpTestsHelpersQunit.test)('it validates the form fields before allowing submit', function (assert) {
    assert.expect(19);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 33
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'ko-agent-dropdown/create-user', ['loc', [null, [1, 0], [1, 33]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $formElement = this.$('form');

    var $nameInputElement = getFormInput($formElement, 'full_name');
    var $emailInputElement = getFormInput($formElement, 'email');

    var nameErrors = getFieldErrors($formElement, 'full_name');
    var emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      $nameInputElement.focusin();
      $nameInputElement.focusout();
    });

    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      $emailInputElement.focusin();
      $emailInputElement.focusout();
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      fillIn($nameInputElement, 'Tim Kendrick');
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);
    _ember['default'].run(function () {
      fillIn($emailInputElement, 'tim.kendrick@kayako');
      $emailInputElement[0].dispatchEvent(new Event('input'));
    });
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(emailErrors, ['email_invalid']);

    _ember['default'].run(function () {
      fillIn($nameInputElement, 'Tim Kendrick');
      fillIn($emailInputElement, 'tim.kendrick@kayako.com');
      $nameInputElement[0].dispatchEvent(new Event('input'));
      $emailInputElement[0].dispatchEvent(new Event('input'));
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      fillIn($nameInputElement, '');
      $nameInputElement[0].dispatchEvent(new Event('input'));
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      fillIn($nameInputElement, 'Tim Kendrick');
      $nameInputElement[0].dispatchEvent(new Event('input'));
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      fillIn($emailInputElement, '');
      $emailInputElement[0].dispatchEvent(new Event('input'));
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);

    _ember['default'].run(function () {
      fillIn($emailInputElement, 'tim.kendrick@kayako.com');
      $emailInputElement[0].dispatchEvent(new Event('input'));
    });
    nameErrors = getFieldErrors($formElement, 'full_name');
    emailErrors = getFieldErrors($formElement, 'email');
    assert.deepEqual(nameErrors, []);
    assert.deepEqual(emailErrors, []);
  });

  (0, _frontendCpTestsHelpersQunit.test)('it submits the form', function (assert) {
    var _this = this;

    assert.expect(17);
    var done = assert.async();

    this.dropdown = { actions: { close: function close() {} } };
    var onCreate = _sinon['default'].spy();
    var onCancel = _sinon['default'].spy();

    this.on('onCancel', onCancel);
    this.on('onCreate', onCreate);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 4
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-agent-dropdown/create-user', [], ['dropdown', ['subexpr', '@mut', [['get', 'dropdown', ['loc', [null, [2, 15], [2, 23]]]]], [], []], 'onCreate', ['subexpr', 'action', ['onCreate'], [], ['loc', [null, [3, 15], [3, 34]]]], 'onCancel', ['subexpr', 'action', ['onCancel'], [], ['loc', [null, [4, 15], [4, 34]]]]], ['loc', [null, [1, 0], [5, 4]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $formElement = this.$('form');

    var $nameInputElement = getFormInput($formElement, 'full_name');
    var $emailInputElement = getFormInput($formElement, 'email');
    var $cancelButtonElement = getFormControl($formElement, 'cancel');
    var $loaderElement = $formElement.find('.' + _frontendCpComponentsKoFormButtonsStyles['default'].loader);

    assert.equal($formElement.hasClass('ko-form--is-submitting'), false);
    assert.equal($cancelButtonElement.length, 1);
    assert.equal($loaderElement.length, 0);

    fillIn($nameInputElement, 'Tim Kendrick');
    fillIn($emailInputElement, 'tim.kendrick@kayako.com');
    $nameInputElement[0].dispatchEvent(new Event('input'));
    $emailInputElement[0].dispatchEvent(new Event('input'));
    _ember['default'].run(function () {
      $formElement.submit();
    });

    _ember['default'].run(function () {
      var $cancelButtonElement = getFormControl($formElement, 'cancel');
      var $loaderElement = $formElement.find('.' + _frontendCpComponentsKoFormButtonsStyles['default'].loader);

      assert.equal($formElement.hasClass('ko-form--is-submitting'), true);
      assert.equal($cancelButtonElement.length, 0);
      assert.equal($loaderElement.length, 1);

      assert.equal(onCreate.callCount, 0);
      assert.equal(onCancel.callCount, 0);
    });

    _ember['default'].run.later(function () {
      var $cancelButtonElement = getFormControl($formElement, 'cancel');
      var $loaderElement = $formElement.find('.' + _frontendCpComponentsKoFormButtonsStyles['default'].loader);

      assert.equal($formElement.hasClass('ko-form--is-submitting'), false);
      assert.equal($cancelButtonElement.length, 1);
      assert.equal($loaderElement.length, 0);

      var mockStore = getOwner(_this).lookup('service:store');
      assert.ok(mockStore.createRecord.calledTwice);
      assert.ok(mockStore.createRecord.calledWith('identity-email', {
        isPrimary: true,
        email: 'tim.kendrick@kayako.com'
      }));
      assert.equal(mockStore.createRecord.secondCall.args[0], 'user');
      assert.propertiesEqual(mockStore.createRecord.secondCall.args[1], {
        fullName: 'Tim Kendrick',
        emails: [{
          email: 'tim.kendrick@kayako.com',
          isPrimary: true
        }],
        role: {
          id: 4 // Users are created as CUSTOMERs
        }
      });

      assert.ok(onCreate.calledOnce);
      assert.propertiesEqual(onCreate.firstCall.args[0], {
        fullName: 'Tim Kendrick',
        emails: [{
          email: 'tim.kendrick@kayako.com',
          isPrimary: true
        }],
        role: {
          id: 4
        }
      });

      done();
    }, 100); // Delay due to inaccurate `createMockStore` behaviour (see below)
  });

  (0, _frontendCpTestsHelpersQunit.test)('it emits an onCancel event', function (assert) {
    assert.expect(1);

    var onCancel = _sinon['default'].spy();

    this.on('onCancel', onCancel);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 3,
              'column': 4
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-agent-dropdown/create-user', [], ['onCancel', ['subexpr', 'action', ['onCancel'], [], ['loc', [null, [2, 15], [2, 34]]]]], ['loc', [null, [1, 0], [3, 4]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $formElement = this.$('form');
    var $cancelButtonElement = getFormControl($formElement, 'cancel');

    _ember['default'].run(function () {
      $cancelButtonElement.click();
    });

    assert.equal(onCancel.callCount, 1);
  });

  function getFormInput(formElement, controlName) {
    return _ember['default'].$(formElement).find('.ko-agent-dropdown_create-user__' + controlName);
  }

  function getFormControl(formElement, controlName) {
    formElement = $(formElement)[0];
    return $(formElement.elements.namedItem(controlName));
  }

  function fillIn(inputElement, value) {
    $(inputElement).val(value).change();
  }

  function getFieldErrors(formElement, inputName) {
    var $errorElements = _ember['default'].$(formElement).find('.ko-agent-dropdown_create-user__' + inputName + ' + .ko-form_field__error');
    return $errorElements.map(function (index, element) {
      return _ember['default'].$(element).text().trim();
    }).get();
  }

  function createMockStore(records) {
    records = records || {};
    var store = {
      findRecord: _sinon['default'].spy(function (typeName, id) {
        var record = _ember['default'].Object.create({
          id: id
        });
        return _ember['default'].RSVP.Promise.resolve(record);
      }),
      createRecord: _sinon['default'].spy(function (typeName, fields) {
        if (typeName === 'user') {
          fields = Object.assign({ emails: [] }, fields);
        }
        var record = _ember['default'].Object.extend({
          save: _sinon['default'].spy(function () {
            // FIXME: This sequence doesn't quite accurately reflect the
            // store's async behaviour (this is why the delay is necessary
            // in the async tests)
            var hasErrors = Object.keys(fields).some(function (key) {
              return fields[key] === 'ERROR';
            });
            return new _ember['default'].RSVP.Promise(function (resolve, reject) {
              setTimeout(function () {
                if (hasErrors) {
                  reject({
                    errors: []
                  });
                } else {
                  resolve(record);
                }
              });
            });
          })
        }).create(fields);
        return record;
      })
    };
    return store;
  }
});
/* eslint-disable camelcase */
define('frontend-cp/tests/integration/components/ko-info-bar/component-test', ['exports', 'ember', 'ember-qunit'], function (exports, _ember, _emberQunit) {
  var getOwner = _ember['default'].getOwner;

  (0, _emberQunit.moduleForComponent)('ko-info-bar', 'Integration | Component | ko info bar', {
    integration: true,
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
    }
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    assert.expect(1);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 15
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['content', 'ko-info-bar', ['loc', [null, [1, 0], [1, 15]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '');
  });
});
define('frontend-cp/tests/integration/components/ko-info-bar/field/drill-down/component-test', ['exports', 'ember', 'ember-qunit', 'frontend-cp/lib/keycodes', 'ember-test-helpers/wait', 'frontend-cp/tests/helpers/ember-power-select'], function (exports, _ember, _emberQunit, _frontendCpLibKeycodes, _emberTestHelpersWait, _frontendCpTestsHelpersEmberPowerSelect) {
  var getOwner = _ember['default'].getOwner;

  var trigger = '.ember-power-select-trigger';
  var searchField = trigger + ' input:visible';
  var optionList = '.ember-power-select-dropdown ul';
  var optionListItem = optionList + ' li';
  var firstOption = optionListItem + ':first-child';
  var secondOption = optionListItem + ':nth-child(2)';
  // const hierarchyList = 'ul:last li:visible';
  // const hierarchyLevelOneItemOne = 'ul:last li:first:visible';
  // const hierarchyLevelOneItemTwo = 'ul:last li:nth-of-type(2):visible';
  // const hierarchyLevelTwoItemThree = 'ul:last li:nth-of-type(3):visible';

  var defaultOptions = [{ value: 'Team A', id: 1, children: [{ id: 2, value: 'Jesse Bennett-Chamberlain' }, { id: 3, value: 'Jamie Edwards' }, { id: 4, value: 'Drew Warkentin' }] }, { value: 'Team B', children: [{ id: 5, value: 'Jesse Bennett-Chamberlain' }] }, { id: 6, value: 'Team C' }, { id: 7, value: 'Team D' }];

  (0, _emberQunit.moduleForComponent)('ko-info-bar/field/drill-down', 'Integration | Component | ko-info-bar/field/drill-down', {
    integration: true,
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      this.registry.optionsForType('sanitizer', { instantiate: false });
      this.set('options', defaultOptions);
    }
  });

  (0, _emberQunit.test)('levels are extracted from options', function (assert) {
    assert.expect(1);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 48
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/drill-down', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [1, 39], [1, 46]]]]], [], []]], ['loc', [null, [1, 0], [1, 48]]]]],
        locals: [],
        templates: []
      };
    })()));
    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();

    var expectedList = ['-', 'Team A', 'Team B', 'Team C', 'Team D'];

    var actualList = this.$(optionListItem).map(function (i, el) {
      return $(el).text().trim();
    }).get();
    assert.deepEqual(actualList, expectedList, '1st level list');
  });

  (0, _emberQunit.test)('suggestions are recalculated after search', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 48
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/drill-down', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [1, 39], [1, 46]]]]], [], []]], ['loc', [null, [1, 0], [1, 48]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();

    _ember['default'].run(function () {
      var input = _this.$(searchField)[0];
      input.value = 'j';
      var event = new window.Event('input');
      input.dispatchEvent(event);
    });

    return (0, _emberTestHelpersWait['default'])().then(function () {
      var expectedList = ['Team A / Jesse Bennett-Chamberlain', 'Team A / Jamie Edwards', 'Team B / Jesse Bennett-Chamberlain'];
      var actualList = this.$(optionListItem).map(function (i, el) {
        return $(el).text().trim();
      }).get();
      assert.deepEqual(actualList, expectedList, 'suggestions list');
    });
  });

  (0, _emberQunit.test)('search input should be set to selected value', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.actions.valueChanged = function (value) {
      _this2.set('value', 5);
    };

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 98
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/drill-down', [], ['value', ['subexpr', '@mut', [['get', 'value', ['loc', [null, [1, 37], [1, 42]]]]], [], []], 'options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [1, 51], [1, 58]]]]], [], []], 'onValueChange', ['subexpr', 'action', ['valueChanged'], [], ['loc', [null, [1, 73], [1, 96]]]]], ['loc', [null, [1, 0], [1, 98]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();
    _ember['default'].run(function () {
      return _this2.$(searchField).trigger(new $.Event('input', { target: { value: 'j' } }));
    });

    return (0, _emberTestHelpersWait['default'])().then(function () {
      (0, _frontendCpTestsHelpersEmberPowerSelect.triggerKeydown)(this.$(searchField)[0], _frontendCpLibKeycodes.down);
      (0, _frontendCpTestsHelpersEmberPowerSelect.triggerKeydown)(this.$(searchField)[0], _frontendCpLibKeycodes.enter);

      assert.equal(this.$(searchField).val(), 'Team B / Jesse Bennett-Chamberlain', 'empty text');
    });
  });

  (0, _emberQunit.test)('if a search is started but then all the characters are cleared from the search field the hierarchy dropdown should be shown', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 48
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/drill-down', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [1, 39], [1, 46]]]]], [], []]], ['loc', [null, [1, 0], [1, 48]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();
    _ember['default'].run(function () {
      return _this3.$(searchField).trigger(new $.Event('input', { target: { value: 'j' } }));
    });
    _ember['default'].run(function () {
      return _this3.$(searchField).trigger(new $.Event('input', { target: { value: '' } }));
    });

    var expectedList = ['-', 'Team A', 'Team B', 'Team C', 'Team D'];

    return (0, _emberTestHelpersWait['default'])().then(function () {
      var actualList = this.$(optionListItem).map(function (i, el) {
        return $(el).text().trim();
      }).get();
      assert.deepEqual(actualList, expectedList, '1st level list');
    });
  });

  (0, _emberQunit.test)('moving up and down the hierarchy by mouse', function (assert) {
    assert.expect(2);

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 1,
              'column': 48
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/drill-down', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [1, 39], [1, 46]]]]], [], []]], ['loc', [null, [1, 0], [1, 48]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();
    (0, _frontendCpTestsHelpersEmberPowerSelect.nativeMouseUp)(secondOption);

    var expectedListLevel1 = ['Back', 'Team A', 'Team A / Jesse Bennett-Chamberlain', 'Team A / Jamie Edwards', 'Team A / Drew Warkentin'];

    var actualListLevel1 = this.$(optionListItem).map(function (i, el) {
      return $(el).text().trim();
    }).get();
    assert.deepEqual(actualListLevel1, expectedListLevel1, 'level 1 hierarchy list');
    (0, _frontendCpTestsHelpersEmberPowerSelect.nativeMouseUp)(firstOption);

    var expectedRootLevelList = ['-', 'Team A', 'Team B', 'Team C', 'Team D'];

    var actualRootLevelList = this.$(optionListItem).map(function (i, el) {
      return $(el).text().trim();
    }).get();
    assert.deepEqual(actualRootLevelList, expectedRootLevelList, 'root list');
  });
});
define('frontend-cp/tests/integration/components/ko-info-bar/field/multiline-text/component-test', ['exports', 'ember', 'ember-qunit'], function (exports, _ember, _emberQunit) {
  var getOwner = _ember['default'].getOwner;

  var title = 'span:first';
  var valueClass = 'textarea';

  var textAreaFieldValue = 'Some other value';

  (0, _emberQunit.moduleForComponent)('ko-info-bar/field/multiline-text', 'Integration | Component | ko info bar field multiline text', {
    integration: true,
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      this.set('textAreaFieldValue', textAreaFieldValue);
    }
  });

  (0, _emberQunit.test)('renders with title and value populated', function (assert) {
    assert.expect(2);
    this.onValueChange = function () {};
    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 4
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/multiline-text', [], ['title', 'Some other field', 'value', ['subexpr', '@mut', [['get', 'textAreaFieldValue', ['loc', [null, [3, 10], [3, 28]]]]], [], []], 'onValueChange', ['subexpr', '@mut', [['get', 'onValueChange', ['loc', [null, [4, 18], [4, 31]]]]], [], []]], ['loc', [null, [1, 0], [5, 4]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$(title).text(), 'Some other field');
    assert.equal(this.$(valueClass).val(), 'Some other value');
  });

  (0, _emberQunit.test)('action is fired on input', function (assert) {
    assert.expect(1);

    this.on('assertTextAreaFieldValueChanged', function (value) {
      assert.equal(value, 'Khaleesi');
    });

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 4,
              'column': 4
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/multiline-text', [], ['title', 'Some other field', 'onValueChange', ['subexpr', 'action', ['assertTextAreaFieldValueChanged'], [], ['loc', [null, [3, 18], [3, 60]]]]], ['loc', [null, [1, 0], [4, 4]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $textArea = this.$('textarea');

    $textArea.val('Khaleesi');

    _ember['default'].run(function () {
      $textArea.trigger(new $.Event('input'));
    });
  });
});
define('frontend-cp/tests/integration/components/ko-info-bar/field/select/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/tests/helpers/ember-power-select'], function (exports, _ember, _frontendCpTestsHelpersQunit, _frontendCpTestsHelpersEmberPowerSelect) {
  var getOwner = _ember['default'].getOwner;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-info-bar/field/select', 'Integration | Component | ko-info-bar/field/select', {
    integration: true,
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      this.registry.optionsForType('sanitizer', { instantiate: false });
    }
  });

  var dummyContent = ['Open', 'Pending', 'Closed'];

  (0, _frontendCpTestsHelpersQunit.test)('it has a title', function (assert) {
    var _this = this;

    assert.expect(2);
    this.options = [];
    this.set('title', '');

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 7,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/select', [], ['title', ['subexpr', '@mut', [['get', 'title', ['loc', [null, [3, 12], [3, 17]]]]], [], []], 'options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [4, 14], [4, 21]]]]], [], []], 'hasEmptyOption', false], ['loc', [null, [2, 4], [6, 6]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$().text().trim(), '-');

    _ember['default'].run(function () {
      _this.set('title', 'Title Goes Here');
    });

    assert.ok(/Title Goes Here/.test(this.$().text()), 'It contains the title');
  });

  (0, _frontendCpTestsHelpersQunit.test)('content appears in the dropdown', function (assert) {
    assert.expect(1);
    this.options = dummyContent;

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 5,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/select', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [3, 14], [3, 21]]]]], [], []]], ['loc', [null, [2, 4], [4, 6]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();
    assert.equal($('.ember-power-select-dropdown').text().replace(/(\r\n|\n|\r| )/g, ''), '-OpenPendingClosed');
  });

  (0, _frontendCpTestsHelpersQunit.test)('clicking on a content item triggers value change', function (assert) {
    assert.expect(1);

    this.set('options', dummyContent);

    this.change = function (value) {
      assert.equal(value, 'Open');
    };

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 6,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/select', [], ['options', ['subexpr', '@mut', [['get', 'options', ['loc', [null, [3, 14], [3, 21]]]]], [], []], 'onValueChange', ['subexpr', '@mut', [['get', 'change', ['loc', [null, [4, 20], [4, 26]]]]], [], []]], ['loc', [null, [2, 4], [5, 6]]]]],
        locals: [],
        templates: []
      };
    })()));

    (0, _frontendCpTestsHelpersEmberPowerSelect.clickTrigger)();
    (0, _frontendCpTestsHelpersEmberPowerSelect.nativeMouseUp)('.ember-power-select-option:nth-child(2)');
  });
});
define("frontend-cp/tests/integration/components/ko-info-bar/field/select-multiple/component-test", ["exports"], function (exports) {});
// import Ember from 'ember';
// import { moduleForComponent, test } from 'ember-qunit';
// import hbs from 'htmlbars-inline-precompile';
// const { getOwner } = Ember;
//
// let title = 'span:first';
//
// moduleForComponent('ko-info-bar/field/select-multiple', 'Integration | Component | ko-info-bar/field/select-multiple', {
//   integration: true,
//   beforeEach() {
//     let intl = getOwner(this).lookup('service:intl');
//     intl.setLocale('en-us');
//   }
// });
//
// test('renders with title', function(assert) {
//   assert.expect(1);
//
//   this.render(hbs`{{ko-info-bar/field/select-multiple
//     title='Some other field'
//   }}`);
//
//   assert.equal(this.$(title).text(), 'Some other field');
// });
define('frontend-cp/tests/integration/components/ko-info-bar/field/text/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {
  var getOwner = _ember['default'].getOwner;

  var title = 'span:first';
  var valueClass = 'input';
  var textFieldValue = 'Some other value';

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-info-bar/field/text', 'Integration | Component | ko info bar field text', {
    integration: true,
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      this.set('textFieldValue', textFieldValue);
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('renders with title and value populated', function (assert) {
    assert.expect(2);
    this.onValueChange = function () {};
    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 7,
              'column': 2
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode('\n    ');
          dom.appendChild(el0, el1);
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode('\n  ');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/text', [], ['title', 'Some other field', 'value', ['subexpr', '@mut', [['get', 'textFieldValue', ['loc', [null, [4, 12], [4, 26]]]]], [], []], 'onValueChange', ['subexpr', '@mut', [['get', 'onValueChange', ['loc', [null, [5, 20], [5, 33]]]]], [], []]], ['loc', [null, [2, 4], [6, 6]]]]],
        locals: [],
        templates: []
      };
    })()));

    assert.equal(this.$(title).text(), 'Some other field');
    assert.equal(this.$(valueClass).val(), 'Some other value');
  });

  (0, _frontendCpTestsHelpersQunit.test)('action is fired when input is changed', function (assert) {
    assert.expect(1);

    this.on('assertTextFieldValueChanged', function (value) {
      return assert.deepEqual(value, 'Khaleesi');
    });

    this.render(_ember['default'].HTMLBars.template((function () {
      return {
        meta: {
          'fragmentReason': {
            'name': 'missing-wrapper',
            'problems': ['wrong-type']
          },
          'revision': 'Ember@2.6.2',
          'loc': {
            'source': null,
            'start': {
              'line': 1,
              'column': 0
            },
            'end': {
              'line': 4,
              'column': 4
            }
          }
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment('');
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [['inline', 'ko-info-bar/field/text', [], ['title', 'Some other field', 'onValueChange', ['subexpr', 'action', ['assertTextFieldValueChanged'], [], ['loc', [null, [3, 18], [3, 56]]]]], ['loc', [null, [1, 0], [4, 4]]]]],
        locals: [],
        templates: []
      };
    })()));

    var $inputField = this.$(valueClass);

    $inputField.val('Khaleesi');

    this.$('input').trigger(new $.Event('input'));
  });
});
define('frontend-cp/tests/test-helper', ['exports', 'frontend-cp/tests/helpers/resolver', 'ember-qunit'], function (exports, _frontendCpTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_frontendCpTestsHelpersResolver['default']);
});
define('frontend-cp/tests/unit/components/ko-admin/triggers/form/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {

  var component = undefined;
  var registry = undefined;

  var virtualModelStub = _ember['default'].Service.extend({
    makeSnapshot: function makeSnapshot(theTrigger, schema) {
      return theTrigger;
    }
  });

  var theTrigger = { channel: 'TWITTER' };
  var channels = [_ember['default'].Object.create({
    id: 'TWITTER',
    name: 'TWITTER',
    values: []
  }), _ember['default'].Object.create({
    id: 'MAIL',
    name: 'MAIL',
    values: []
  }), _ember['default'].Object.create({
    id: 'FACEBOOK',
    name: 'FACEBOOK',
    values: []
  }), _ember['default'].Object.create({
    id: 'SYSTEM',
    name: 'SYSTEM',
    values: []
  }), _ember['default'].Object.create({
    id: 'MESSENGER',
    name: 'MESSENGER',
    values: []
  }), _ember['default'].Object.create({
    id: 'API',
    name: 'API',
    values: []
  })];
  var definitions = [_ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'CASES',
    inputType: 'STRING',
    label: 'Cases Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'TWITTER',
    inputType: 'STRING',
    label: 'Twitter Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'MAIL',
    inputType: 'STRING',
    label: 'Mail Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'FACEBOOK',
    inputType: 'STRING',
    label: 'Facebook Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'SYSTEM',
    inputType: 'STRING',
    label: 'System Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'MESSENGER',
    inputType: 'STRING',
    label: 'Messenger Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  }), _ember['default'].Object.create({
    definitionType: 'STRING',
    group: 'API',
    inputType: 'STRING',
    label: 'API Example',
    operators: ['string_contains', 'string_does_not_contain'],
    subType: '',
    values: ''
  })];

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-admin/triggers/form', {
    unit: true,
    setup: function setup() {
      registry = this.registry || this.container;
      registry.register('service:virtual-model', virtualModelStub);
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting twitter as a channel does not allow MAIL, FACEBOOK, SYSTEM, MESSENGER, API defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'TWITTER');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.notOk(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.ok(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.ok(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.ok(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.ok(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.ok(definition.get('disabled'), 'api disabled');
      }
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting mail as a channel does not allow TWITTER, FACEBOOK, SYSTEM, MESSENGER, API defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'MAIL');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.ok(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.notOk(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.ok(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.ok(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.ok(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.ok(definition.get('disabled'), 'api disabled');
      }
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting facebook as a channel does not allow TWITTER, MAIL, SYSTEM, MESSENGER, API defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'FACEBOOK');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.ok(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.ok(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.notOk(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.ok(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.ok(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.ok(definition.get('disabled'), 'api disabled');
      }
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting system as a channel does not allow TWITTER, MAIL, FACEBOOK, MESSENGER, API defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'SYSTEM');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.ok(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.ok(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.ok(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.notOk(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.ok(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.ok(definition.get('disabled'), 'api disabled');
      }
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting messenger as a channel does not allow TWITTER, MAIL, FACEBOOK, SYSTEM, API defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'MESSENGER');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.ok(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.ok(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.ok(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.ok(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.notOk(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.ok(definition.get('disabled'), 'api disabled');
      }
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('selecting api as a channel does not allow TWITTER, MAIL, FACEBOOK, SYSTEM, MESSENGER defintions to be selected', function (assert) {
    assert.expect(7);

    component = this.subject({ theTrigger: theTrigger, channels: channels, definitions: definitions });

    component.set('editedTrigger.channel', 'API');

    component.get('filteredDefinitions').forEach(function (definition) {
      switch (definition.get('group')) {
        case 'CASES':
          return assert.notOk(definition.get('disabled'), 'cases enabled');
        case 'TWITTER':
          return assert.ok(definition.get('disabled'), 'twitter enabled');
        case 'MAIL':
          return assert.ok(definition.get('disabled'), 'mail disabled');
        case 'FACEBOOK':
          return assert.ok(definition.get('disabled'), 'facebook disabled');
        case 'SYSTEM':
          return assert.ok(definition.get('disabled'), 'system disabled');
        case 'MESSENGER':
          return assert.ok(definition.get('disabled'), 'messenger disabled');
        case 'API':
          return assert.notOk(definition.get('disabled'), 'api disabled');
      }
    });
  });
});
define('frontend-cp/tests/unit/components/ko-admin-selectable-card/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {

  var component = undefined;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-admin-selectable-card', {
    needs: ['component:ko-checkbox'],

    setup: function setup() {
      component = this.subject();
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('setting inactive state adds class', function (assert) {
    _ember['default'].run(function () {
      component.set('isActive', false);
    });

    this.render();
    assert.ok(this.$().hasClass('ko-admin-selectable-card--inactive'));
  });

  (0, _frontendCpTestsHelpersQunit.test)('setting selected state adds class', function (assert) {
    _ember['default'].run(function () {
      component.set('isSelected', true);
    });

    this.render();
    assert.ok(this.$().hasClass('ko-admin-selectable-card--selected'));
  });
});
define('frontend-cp/tests/unit/components/ko-checkbox/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/lib/keycodes'], function (exports, _ember, _frontendCpTestsHelpersQunit, _frontendCpLibKeycodes) {

  var component = undefined;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-checkbox', {
    unit: true,
    setup: function setup() {
      component = this.subject();
      component.set('label', 'Remember my preferences');
      component.set('tabindex', 0);
    },
    teardown: function teardown() {},
    needs: ['helper:qa-cls']
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by pressing spacebar (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has been checked');
      }
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by pressing spacebar (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, false, 'it has been unchecked');
      }
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by clicking on checkbox', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by clicking on checkbox (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has been checked');
      }
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by clicking on checkbox', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by clicking on checkbox (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, false, 'it has been unchecked');
      }
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by clicking on label', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });

    assert.equal(component.checked, true, 'it has been checked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be checked by clicking on label (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has been checked');
      }
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by clicking on label', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });

    assert.equal(component.checked, false, 'it has been unchecked');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be unchecked by clicking on label (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('checked', true);
    });

    component.set('onCheck', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, false, 'it has been unchecked');
      }
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('when disabled checkbox can\'t be checked', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('disabled', true);
    });

    _ember['default'].run(function () {
      component.send('toggleCheckbox');
    });

    assert.equal(component.checked, false, 'it can\'t be checked');
  });

  // TODO: make this tests to be as Integration
  //test('when disabled checkbox can\'t be checked (DDAU)', function(assert) {
  //  assert.expect(0);
  //
  //  this.render();
  //
  //  Ember.run(() => {
  //    component.set('disabled', true);
  //  });
  //
  //  component.set('onCheck', 'checked');
  //  component.set('targetObject', {
  //    checked() {
  //      assert.equal(true, false, 'it can\'t be checked');
  //    }
  //  });
  //
  //  Ember.run(() => {
  //    this.$(checkbox).click();
  //  });
  //});
});
define('frontend-cp/tests/unit/components/ko-editable-text/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {

  var component = undefined;
  var edit = 'div:first';

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-editable-text', {
    unit: true,
    setup: function setup() {
      component = this.subject();
      component.set('value', 'I am a hunky munky');
    },
    needs: ['helper:not']
  });

  (0, _frontendCpTestsHelpersQunit.test)('is not editing by default', function (assert) {
    assert.expect(1);

    assert.equal(component.isEditing, false, 'is not editing by default');
  });

  (0, _frontendCpTestsHelpersQunit.test)('when clicked/on focus it becomes editable', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      _this.$(edit).click();
    });

    assert.equal(component.isEditing, true, 'is editable');
  });

  (0, _frontendCpTestsHelpersQunit.test)('when focused out it becomes not editable', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      _this2.$(edit).click();
    });

    _ember['default'].run(function () {
      component.focusOut();
    });

    assert.equal(component.isEditing, false, 'is not editable');
  });
});
define('frontend-cp/tests/unit/components/ko-info-bar/field/checkbox/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-info-bar/field/checkbox', {
    needs: ['component:ko-checkbox', 'template:components/ko-checkbox', 'helper:ko-helper', 'helper:qa-cls']
  });

  var options = [{ id: 1, value: 'Red' }, { id: 2, value: 'Green' }, { id: 3, value: 'Blue' }];

  (0, _frontendCpTestsHelpersQunit.test)('it has a title', function (assert) {
    assert.expect(2);

    var component = this.subject();

    assert.equal($.trim(this.$().text()), '');

    var title = 'Title Goes Here';
    _ember['default'].run(function () {
      component.set('title', title);
    });

    assert.equal($.trim(this.$('.ko-info-bar_item__header').text()), title);
  });

  (0, _frontendCpTestsHelpersQunit.test)('it has checkboxes', function (assert) {
    var component = this.subject();

    _ember['default'].run(function () {
      component.set('options', options);
    });

    assert.equal($.trim(this.$('label:eq(0)').text().trim()), options[0].value);
    assert.equal($.trim(this.$('label:eq(1)').text().trim()), options[1].value);
    assert.equal($.trim(this.$('label:eq(2)').text().trim()), options[2].value);
  });

  (0, _frontendCpTestsHelpersQunit.test)('checkbox state is in sync with the data', function (assert) {
    var _this = this;

    assert.expect(4);
    var component = this.subject();

    _ember['default'].run(function () {
      component.set('options', options);
      component.set('value', '2');
    });

    assert.equal(this.$('[aria-checked]:eq(0)').attr('aria-checked'), 'false');
    assert.equal(this.$('[aria-checked]:eq(1)').attr('aria-checked'), 'true');
    assert.equal(this.$('[aria-checked]:eq(2)').attr('aria-checked'), 'false');

    component.set('onValueChange', 'checked');
    component.set('targetObject', {
      checked: function checked(value) {
        assert.deepEqual(value, '1,2', 'it has been checked');
      }
    });

    _ember['default'].run(function () {
      _this.$('[aria-checked]:eq(0)').click();
    });
  });
});
define('frontend-cp/tests/unit/components/ko-people-popover/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit'], function (exports, _ember, _frontendCpTestsHelpersQunit) {
  var getOwner = _ember['default'].getOwner;

  var component = undefined;
  var firstListItem = '.ko-people-popover__filtered-list-item:first';
  var x = '.ko-people-popover__cross';

  var debounce = _ember['default'].run.debounce;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-people-popover', {
    needs: ['component:ko-checkbox', 'component:ko-avatar', 'component:ko-loader', 'component:ko-flag', 'helper:t', 'service:intl', 'ember-intl@adapter:default', 'ember-intl@formatter:format-message'],
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      intl.addTranslations('en-us', {
        frontend: {
          api: {
            generic: {
              add: 'Add'
            }
          }
        }
      });

      component = this.subject();
      _ember['default'].run.debounce = function () {
        _ember['default'].run.apply(_ember['default'], arguments);
      };
    },

    afterEach: function afterEach() {
      _ember['default'].run.debounce = debounce;
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('it does not show results when initialized', function (assert) {
    assert.expect(1);

    this.render();

    assert.equal(component.get('searchAttempt'), false, 'it does not show any results at initialization');
  });

  (0, _frontendCpTestsHelpersQunit.test)('changing searchTerm fires action', function (assert) {
    assert.expect(2);

    this.render();

    _ember['default'].run(function () {
      component.set('selectedPeople', []);
      component.set('suggestedPeople', null);
      component.set('attrs.onPeopleSuggestion', function (term, selected) {
        assert.equal('R', term);
        assert.equal([].length, selected);
      });
    });

    _ember['default'].run(function () {
      component.set('searchTerm', 'R');
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('clicking on search result adds it to selected people list', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('selectedPeople', []);
      component.set('suggestedPeople', null);
      component.set('attrs.onPeopleSuggestion', function () {});
      component.set('attrs.onPersonSelect', function () {
        assert.equal(1, 1);
      });
    });

    _ember['default'].run(function () {
      component.set('searchTerm', 'K');
      component.set('isLoading', false);
      component.set('suggestedPeople', [_ember['default'].Object.create({
        parent: {
          avatar: '',
          fullName: 'Demo User',
          organization: {
            name: 'Kayako'
          }
        },
        email: 'kayako-demo-1@kayako-testing.com'
      })]);
    });

    _ember['default'].run(function () {
      component.$(firstListItem).click();
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('clicking on x removes participant from selected list', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('isLoading', false);
      component.set('selectedPeople', [_ember['default'].Object.create({
        parent: {
          avatar: '',
          fullName: 'Demo User',
          organization: {
            name: 'Kayako'
          }
        },
        email: 'kayako-demo-1@kayako-testing.com'
      })]);
      component.set('onPersonRemove', function () {
        assert.equal(1, 1);
      });
    });

    _ember['default'].run(function () {
      component.$(x).click();
    });
  });
});
define('frontend-cp/tests/unit/components/ko-radio/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/lib/keycodes'], function (exports, _ember, _frontendCpTestsHelpersQunit, _frontendCpLibKeycodes) {

  var component = undefined;
  var radio = 'div:first';
  var label = 'label:first';

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-radio', {
    unit: true,
    setup: function setup() {
      component = this.subject();
      component.set('label', 'You can do this!');
      component.set('tabindex', 0);
      component.set('value', 'one');
    },
    teardown: function teardown() {}
  });

  (0, _frontendCpTestsHelpersQunit.test)('can not be unselected by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('selected', true);
    });

    _ember['default'].run(function () {
      component.keyUp({ keyCode: _frontendCpLibKeycodes.space });
    });

    assert.equal(component.checked, true, 'it has not been unselected');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be selected by clicking on radio', function (assert) {
    var _this = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      _this.$(radio).click();
    });

    assert.equal(component.checked, true, 'it has been selected');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be selected by clicking on radio (DDAU)', function (assert) {
    var _this2 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('onRadio', 'checked');
      component.set('checked', false);
    });

    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has been selected');
      }
    });

    _ember['default'].run(function () {
      _this2.$(radio).click();
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can not be unselected by clicking on radio', function (assert) {
    var _this3 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('selected', true);
    });

    _ember['default'].run(function () {
      _this3.$(radio).click();
    });

    assert.equal(component.checked, true, 'it has not been unselected');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can not be unselected by clicking on radio (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('onRadio', 'checked');
      component.set('checked', true);
    });

    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has not been unselected');
      }
    });

    this.$(radio).click();
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be selected by clicking on label', function (assert) {
    var _this4 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('selected', false);
    });

    _ember['default'].run(function () {
      _this4.$(label).click();
    });

    assert.equal(component.get('checked'), true, 'it has been selected');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be selected by clicking on label (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('onRadio', 'checked');
      component.set('checked', false);
    });

    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has been checked');
      }
    });

    this.$(label).click();
  });

  (0, _frontendCpTestsHelpersQunit.test)('can not be unselected by clicking on label', function (assert) {
    var _this5 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('selected', true);
    });

    _ember['default'].run(function () {
      _this5.$(label).click();
    });
    assert.equal(component.get('checked'), true, 'it has not been unselected');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can not be unselected by clicking on label (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('onRadio', 'checked');
      component.set('checked', true);
    });

    component.set('targetObject', {
      checked: function checked(value) {
        assert.equal(value, true, 'it has not been unselected');
      }
    });

    this.$(label).click();
  });

  (0, _frontendCpTestsHelpersQunit.test)('when disabled radio can\'t be selected', function (assert) {
    var _this6 = this;

    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('disabled', true);
    });

    _ember['default'].run(function () {
      _this6.$(radio).click();
    });

    assert.equal(component.value === component.checked, false, 'radio cant be selected');
  });

  // TODO: make this tests to be as Integration
  //test('when disabled radio can\'t be selected (DDAU)', function(assert) {
  //  assert.expect(0);
  //
  //  this.render();
  //
  //  Ember.run(() => {
  //    component.set('disabled', true);
  //  });
  //
  //  Ember.run(() => {
  //    component.set('onRadio', 'selected');
  //    component.set('checked', 'one');
  //  });
  //
  //  component.set('targetObject', {
  //    selected() {
  //      assert.equal(true, false, 'it can\'t be selected');
  //    }
  //  });
  //
  //  Ember.run(() => {
  //    this.$(radio).click();
  //  });
  //});
});
define('frontend-cp/tests/unit/components/ko-table/component-test', ['exports', 'frontend-cp/tests/helpers/qunit', 'ember'], function (exports, _frontendCpTestsHelpersQunit, _ember) {

  var component = undefined;
  var rows = undefined;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-table', 'Unit | Component | ko table', {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar']
    unit: true,
    setup: function setup() {
      component = this.subject();
      rows = [_ember['default'].Object.create({ selected: false }), _ember['default'].Object.create({ selected: false }), _ember['default'].Object.create({ selected: false })];
      rows.forEach(function (row) {
        return component.send('registerRow', row);
      });
    }
  });

  (0, _frontendCpTestsHelpersQunit.test)('it tracks the selected state of rows', function (assert) {
    assert.equal(component.get('allRowsSelected'), false);

    rows[0].set('selected', true);
    rows[1].set('selected', true);
    assert.equal(component.get('allRowsSelected'), false);

    rows[2].set('selected', true);
    assert.equal(component.get('allRowsSelected'), true);

    rows[0].set('selected', false);
    assert.equal(component.get('allRowsSelected'), false);
  });

  (0, _frontendCpTestsHelpersQunit.test)('it selects all rows', function (assert) {
    component.send('selectAll');
    rows.forEach(function (row) {
      return assert.equal(row.get('selected'), true);
    });

    component.send('deselectAll');
    rows.forEach(function (row) {
      return assert.equal(row.get('selected'), false);
    });
  });
});
define("frontend-cp/tests/unit/components/ko-table-header/component-test", ["exports"], function (exports) {});
// import { moduleForComponent, test } from 'frontend-cp/tests/helpers/qunit';
// import Ember from 'ember';
//
// let component;
// let table;
//
// moduleForComponent('ko-table/header', 'Unit | Component | ko table header', {
//   // Specify the other units that are required for this test
//   needs: ['component:ko-checkbox'],
//   setup() {
//     component = this.subject();
//     table = Ember.Object.create();
//     component.set('parentView', table);
//   }
// });
//
// test('it renders', function (assert) {
//   assert.expect(2);
//
//   // Creates the component instance
//   assert.equal(component._state, 'preRender');
//
//   // Renders the component to the page
//   this.render();
//   assert.equal(component._state, 'inDOM');
// });
//
// test('it doesn\'t have a checkbox by default', function (assert) {
//   assert.equal(this.$('th').length, 0);
// });
//
// test('it displays a checkbox when table\'s selectable=true', function (assert) {
//   Ember.run(() => {
//     table.set('selectable', true);
//   });
//   assert.equal(this.$('th').length, 1);
// });
//
// test('it emits an action on the table when checkbox is clicked', function (assert) {
//   assert.expect(2);
//   Ember.run(() => {
//     table.set('selectable', true);
//   });
//
//   table.set('send', (action) => {
//     assert.equal(action, 'selectAll');
//   });
//
//   Ember.run(() => {
//     component.send('selectAll', true);
//   });
//
//   table.set('send', (action) => {
//     assert.equal(action, 'deselectAll');
//   });
//
//   Ember.run(() => {
//     component.send('selectAll', false);
//   });
// });
//
// test('it modifies sorting order and column and emits an action when sorted', function (assert) {
//   assert.expect(14);
//   component.set('onSort', 'onSort');
//
//   // initial values
//   assert.equal(component.get('sortColumn'), '');
//   assert.equal(component.get('sortOrder'), '');
//
//   // initial sort
//   component.set('targetObject', {
//     onSort(sortColumn, sortOrder) {
//       assert.equal(sortColumn, 'foo');
//       assert.equal(sortOrder, 'asc');
//     }
//   });
//   component.send('sort', 'foo');
//   assert.equal(component.get('sortColumn'), 'foo');
//   assert.equal(component.get('sortOrder'), 'asc');
//
//   // desc sort
//   component.set('targetObject', {
//     onSort(sortColumn, sortOrder) {
//       assert.equal(sortOrder, 'desc');
//     }
//   });
//   component.send('sort', 'foo');
//   assert.equal(component.get('sortOrder'), 'desc');
//
//   // back to asc
//   component.set('targetObject', {
//     onSort(sortColumn, sortOrder) {
//       assert.equal(sortOrder, 'asc');
//     }
//   });
//   component.send('sort', 'foo');
//   assert.equal(component.get('sortOrder'), 'asc');
//
//   // different column
//   component.set('targetObject', {
//     onSort(sortColumn, sortOrder) {
//       assert.equal(sortColumn, 'bar');
//       assert.equal(sortOrder, 'asc');
//     }
//   });
//   component.send('sort', 'bar');
//   assert.equal(component.get('sortColumn'), 'bar');
//   assert.equal(component.get('sortOrder'), 'asc');
// });
define("frontend-cp/tests/unit/components/ko-table-row/component-test", ["exports"], function (exports) {});
// import { moduleForComponent, test } from 'frontend-cp/tests/helpers/qunit';
// import Ember from 'ember';
//
// let component;
// let table;
// let body;
//
// moduleForComponent('ko-table/row', 'Unit | Component | ko table row', {
//   // Specify the other units that are required for this test
//   needs: ['component:ko-checkbox'],
//   setup() {
//     component = this.subject();
//     table = Ember.Object.create({
//       send() {}
//     });
//     body = Ember.Object.create({
//       table: table
//     });
//     component.set('parentView', body);
//   }
// });
//
// test('it renders', function(assert) {
//   assert.expect(2);
//
//   // Creates the component instance
//   assert.equal(component._state, 'preRender');
//
//   // Renders the component to the page
//   this.render();
//   assert.equal(component._state, 'inDOM');
// });
//
// test('it is selectable whenever the table is', function (assert) {
//   this.render();
//   assert.equal(this.$('td').length, 0);
//
//   Ember.run(() => {
//     table.set('selectable', true);
//   });
//
//   assert.equal(this.$('td').length, 1);
// });
//
// test('it emits registerRow on the table when inserted into dom', function (assert) {
//   assert.expect(2);
//
//   table.set('send', (action, row) => {
//     assert.equal(action, 'registerRow');
//     assert.equal(row, component);
//     table.set('send', () => {});
//   });
//
//   this.render();
// });
//
// test('it emits unregisterRow on the table when removed from dom', function (assert) {
//   assert.expect(2);
//   this.render();
//
//   table.set('send', (action, row) => {
//     assert.equal(action, 'unregisterRow');
//     assert.equal(row, component);
//   });
// });
define('frontend-cp/tests/unit/components/ko-timeline/activity/utils-test', ['exports', 'qunit', 'frontend-cp/components/ko-timeline/activity/utils'], function (exports, _qunit, _frontendCpComponentsKoTimelineActivityUtils) {

  (0, _qunit.module)('Unit | Component | ko-timeline/item/activity/utils', function () {
    (0, _qunit.module)('parseSummary', function () {
      (0, _qunit.test)('parses tokens into text, actors and entities', function (assert) {
        var tokens = (0, _frontendCpComponentsKoTimelineActivityUtils.parseSummary)('<@http://user.com|Gary Test> created something <http://item.com|A Case>');

        assert.equal(tokens.length, 3);

        assert.deepEqual(tokens[0], {
          type: 'actor',
          content: 'Gary Test',
          url: 'http://user.com'
        });

        assert.deepEqual(tokens[1], {
          type: 'text',
          content: 'created something'
        });

        assert.deepEqual(tokens[2], {
          type: 'entity',
          content: 'A Case',
          url: 'http://item.com'
        });
      });

      (0, _qunit.test)('parses tokens without URLs', function (assert) {
        var tokens = (0, _frontendCpComponentsKoTimelineActivityUtils.parseSummary)('<@|Gary Test> created something <|A Case>');

        assert.equal(tokens.length, 3);

        assert.deepEqual(tokens[0], {
          type: 'actor',
          content: 'Gary Test',
          url: ''
        });

        assert.deepEqual(tokens[1], {
          type: 'text',
          content: 'created something'
        });

        assert.deepEqual(tokens[2], {
          type: 'entity',
          content: 'A Case',
          url: ''
        });
      });
    });
  });
});
define('frontend-cp/tests/unit/components/ko-timeline/item/link-to/-href-generators-test', ['exports', 'qunit', 'frontend-cp/components/ko-timeline/item/link-to/-href-generators'], function (exports, _qunit, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators) {

  (0, _qunit.module)('Unit | Component | ko-timeline/item/link-to/-href generators', function () {
    (0, _qunit.module)('emailHref', function () {
      (0, _qunit.test)('return null href', function (assert) {
        assert.expect(3);

        var result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.emailHref)(null, {});
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.emailHref)({}, null);
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.emailHref)({}, {
          constructor: {
            modelName: 'foobar'
          }
        });
        assert.equal(result, null, 'href can\'t be determined');
      });

      (0, _qunit.test)('return href pointing to original email', function (assert) {
        assert.expect(1);

        var model = {
          id: 123
        };

        var parent = {
          id: 456,
          constructor: {
            modelName: 'case'
          }
        };

        var result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.emailHref)(model, parent);

        assert.equal(result, '/agent/case/display/original/456/123', 'Generate href');
      });
    });

    (0, _qunit.module)('twitterHref', function () {
      (0, _qunit.test)('return null href', function (assert) {
        assert.expect(5);

        var result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)(null);
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)({});
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)({
          original: {}
        });
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)({
          original: {
            screenName: 'foobar'
          }
        });
        assert.equal(result, null, 'href can\'t be determined');

        result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)({
          original: {
            id: 123
          }
        });
        assert.equal(result, null, 'href can\'t be determined');
      });

      (0, _qunit.test)('return href pointing to original tweet', function (assert) {
        assert.expect(1);

        var result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.twitterHref)({
          original: {
            id: 123,
            screenName: 'foobar'
          }
        });

        assert.equal(result, 'https://twitter.com/foobar/status/123', 'Generate href');
      });
    });

    (0, _qunit.module)('nullHref', function () {
      (0, _qunit.test)('return null href', function (assert) {
        assert.expect(1);

        var result = (0, _frontendCpComponentsKoTimelineItemLinkToHrefGenerators.nullHref)('foobar');
        assert.equal(result, null, 'href is always null');
      });
    });
  });
});
define('frontend-cp/tests/unit/components/ko-toggle/component-test', ['exports', 'ember', 'frontend-cp/tests/helpers/qunit', 'frontend-cp/lib/keycodes'], function (exports, _ember, _frontendCpTestsHelpersQunit, _frontendCpLibKeycodes) {

  var component = undefined;

  (0, _frontendCpTestsHelpersQunit.moduleForComponent)('ko-toggle', {
    needs: ['helper:qa-cls'],
    unit: true,
    setup: function setup() {
      component = this.subject();
      component.set('label', 'Nuclear bomb switch');
      component.set('tabindex', 0);
    },
    teardown: function teardown() {}
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be activated by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });

    assert.equal(component.activated, true, 'it has been activated');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be activated by pressing spacebar (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    component.set('onToggle', 'activated');
    component.set('targetObject', {
      activated: function activated(value) {
        assert.equal(value, true, 'it has been activated');
      }
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be deactivated by pressing spacebar', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('activated', true);
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });

    assert.equal(component.activated, false, 'it has been deactivated');
  });

  (0, _frontendCpTestsHelpersQunit.test)('can be deactivated by pressing spacebar (DDAU)', function (assert) {
    assert.expect(1);

    this.render();

    _ember['default'].run(function () {
      component.set('activated', true);
    });

    component.set('onToggle', 'activated');
    component.set('targetObject', {
      activated: function activated(value) {
        assert.equal(value, false, 'it has been deactivated');
      }
    });

    _ember['default'].run(function () {
      component.send('keyUp', { keyCode: _frontendCpLibKeycodes.space });
    });
  });
});
define('frontend-cp/tests/unit/helpers/join-classes-test', ['exports', 'frontend-cp/helpers/join-classes', 'qunit'], function (exports, _frontendCpHelpersJoinClasses, _qunit) {

  (0, _qunit.module)('Unit | Helper | join classes');

  (0, _qunit.test)('it joins with spaces', function (assert) {
    assert.equal((0, _frontendCpHelpersJoinClasses.joinClasses)(['foo', 'bar', 'baz']), 'foo bar baz');
  });
});
define('frontend-cp/tests/unit/services/custom-fields/options-test', ['exports', 'ember', 'ember-qunit'], function (exports, _ember, _emberQunit) {
  var getOwner = _ember['default'].getOwner;

  (0, _emberQunit.moduleFor)('service:custom-fields/options', 'Unit | Service | custom-fields/options', {
    needs: ['model:user-field', 'model:field-option', 'model:field', 'model:locale', 'model:locale', 'model:locale-field', 'model:case-priority', 'model:case-status', 'model:case-type']
  });

  (0, _emberQunit.test)('it add option with sortOrder = 1, when there is no options', function (assert) {
    assert.expect(2);

    var service = this.subject();

    var options = [];

    _ember['default'].run(function () {
      service.add(options);
    });

    assert.equal(options.length, 1);
    assert.equal(options.get('firstObject').get('sortOrder'), 1);
  });

  (0, _emberQunit.test)('it add option with sortOrder = sortOrder+1, when there are options', function (assert) {
    assert.expect(2);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var option1 = undefined,
        option2 = undefined,
        option3 = undefined;

    _ember['default'].run(function () {
      option1 = store.createRecord('field-option', { sortOrder: 1, value: 'option1', tag: 'value1' });
      option2 = store.createRecord('field-option', { sortOrder: 2, value: 'option2', tag: 'value2' });
      option3 = store.createRecord('field-option', { sortOrder: 3, value: 'option3', tag: 'value3' });
    });

    var options = [option1, option2, option3];

    _ember['default'].run(function () {
      service.add(options);
    });

    assert.equal(options.length, 4);
    assert.equal(options.get('lastObject').get('sortOrder'), 4);
  });

  (0, _emberQunit.test)('it can rollback options', function (assert) {
    assert.expect(2);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var locale = undefined;
    var option = undefined;
    _ember['default'].run(function () {
      locale = store.push({
        data: {
          id: 1,
          type: 'locale-field',
          attributes: {
            locale: 'en-us',
            translation: 'translated text'
          }
        }
      });
      option = store.push({
        data: {
          id: 1,
          type: 'field-option',
          attributes: {
            sortOrder: 1,
            value: 'option1',
            tag: 'value1'
          }
        }
      });
      option.get('values').pushObject(locale);
    });

    locale.reopen({
      rollbackAttributes: function rollbackAttributes() {
        assert.equal(true, true);
      }
    });

    option.reopen({
      rollbackAttributes: function rollbackAttributes() {
        assert.equal(true, true);
      }
    });

    service.rollbackAttributes([]);
    service.rollbackAttributes([option]);
  });
});
define('frontend-cp/tests/unit/services/custom-fields-test', ['exports', 'ember', 'ember-qunit'], function (exports, _ember, _emberQunit) {
  var getOwner = _ember['default'].getOwner;

  (0, _emberQunit.moduleFor)('service:custom-fields', 'Unit | Service | custom-fields', {
    needs: ['model:user-field', 'model:field-option', 'model:field', 'model:locale', 'model:locale-field', 'model:locale-string', 'service:custom-fields/types', 'service:custom-fields/options', 'service:intl', 'service:notification', 'service:request-history', 'ember-intl@adapter:default', 'adapter:application', 'service:session', 'service:error-handler', 'service:error-handler/notification-strategy', 'service:server-clock'],
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');

      intl.setLocale('en-us');
      intl.addTranslations('en-us', {
        frontend: {
          api: {
            admin: {
              userfields: { title: 'userfields' },
              fields: {
                'new': { heading: 'New field' },
                edit: { heading: 'Edit field' },
                type: { field_options: { missing_options: 'missing_options' } }
              },
              casefields: {
                type: { dropdown: { name: 'Dropdown' } }
              }
            }
          }
        }
      });
    }
  });

  (0, _emberQunit.test)('it renders correct title breadcrumbs for new record', function (assert) {
    assert.expect(1);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var model = undefined;
    _ember['default'].run(function () {
      model = store.createRecord('user-field', {
        fieldType: 'SELECT',
        options: []
      });
    });

    assert.equal(service.getTitleBreadcrumbs(model), 'userfields / Dropdown / New field');
  });

  (0, _emberQunit.test)('it renders correct title breadcrumbs for existed record', function (assert) {
    assert.expect(1);

    var store = getOwner(this).lookup('service:store');

    var model = undefined;
    _ember['default'].run(function () {
      model = store.push({
        data: {
          id: 1,
          type: 'user-field',
          attributes: {
            title: 'Test Select',
            fieldType: 'SELECT',
            options: []
          }
        }
      });
    });
    var service = this.subject();

    assert.equal(service.getTitleBreadcrumbs(model), 'userfields / Test Select');
  });

  (0, _emberQunit.test)('it creates new records through create method', function (assert) {
    assert.expect(4);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var userField = undefined;
    _ember['default'].run(function () {
      userField = store.createRecord('user-field', {
        fieldType: 'SELECT',
        options: []
      });
    });

    _ember['default'].run(function () {
      store.createRecord('locale', {
        locale: 'en-us',
        isPublic: true
      });

      store.createRecord('locale', {
        locale: 'fr',
        isPublic: true
      });

      store.createRecord('locale', {
        locale: 'de',
        isPublic: true
      });
    });

    var returnedModel = undefined;
    _ember['default'].run(function () {
      returnedModel = service.create(userField);
    });

    assert.equal(returnedModel.get('customerTitles').length, 3);
    assert.equal(returnedModel.get('descriptions').length, 3);
    assert.equal(returnedModel.get('options').length, 1);
    assert.equal(returnedModel.get('options.firstObject.values.length'), 3);
  });

  (0, _emberQunit.test)('it persist new record through save method', function (assert) {
    assert.expect(1);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    service.reopen({
      save: function save(model) {
        assert.equal(model.get('isNew'), true);
      }
    });

    var model = undefined;
    _ember['default'].run(function () {
      model = store.createRecord('user-field', {
        fieldType: 'SELECT',
        options: []
      });
    });

    service.save(model);
  });

  (0, _emberQunit.test)('it can rollback model', function (assert) {
    assert.expect(2);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var userField = undefined;
    var fieldOption = undefined;

    _ember['default'].run(function () {
      fieldOption = store.createRecord('field-option', { value: 'value', tag: 'tag' });

      userField = store.createRecord('user-field', {
        fieldType: 'SELECT',
        options: [fieldOption]
      });
    });

    service.reopen({
      customFieldsOptions: {
        rollbackAttributes: function rollbackAttributes() {
          assert.equal(true, true);
        }
      }
    });

    userField.reopen({
      rollbackAttributes: function rollbackAttributes() {
        return new _ember['default'].RSVP.Promise(function (resolve) {
          assert.ok(true);
          return resolve();
        });
      }
    });

    service.rollback(userField);
  });

  (0, _emberQunit.test)('it can toggle enabled state on the record', function (assert) {
    assert.expect(3);

    var service = this.subject();
    var store = getOwner(this).lookup('service:store');

    var model = undefined;

    _ember['default'].run(function () {
      model = store.createRecord('user-field', {
        fieldType: 'SELECT',
        sortOrder: 1,
        options: []
      });
    });

    model.reopen({
      save: function save() {
        return new _ember['default'].RSVP.Promise(function (resolve) {
          // we need to check that save is called once
          assert.equal(true, true);
          return resolve();
        });
      }
    });

    assert.equal(model.get('isEnabled'), true);

    _ember['default'].run(function () {
      service.toggleEnabled(model);
    });

    assert.equal(model.get('isEnabled'), false);
  });
});
define('frontend-cp/tests/unit/services/error-handler-test', ['exports', 'ember', 'ember-qunit', 'frontend-cp/services/session'], function (exports, _ember, _emberQunit, _frontendCpServicesSession) {
  var getOwner = _ember['default'].getOwner;

  (0, _emberQunit.moduleFor)('service:error-handler', 'Unit | Service | error-handler', {
    needs: ['service:error-handler/session-loading-failed-strategy', 'service:error-handler/notification-strategy', 'service:error-handler/permissions-denied-strategy', 'service:error-handler/resource-not-found-strategy', 'service:error-handler/credential-expired-strategy', 'service:error-handler/generic-strategy', 'service:intl', 'service:notification', 'service:plan', 'service:localStore', 'service:session', 'service:tabStore', 'service:locale', 'service:moment', 'ember-intl@adapter:default'],
    beforeEach: function beforeEach() {
      var intl = getOwner(this).lookup('service:intl');
      intl.setLocale('en-us');
      intl.addTranslations('en-us', {
        frontend: {
          api: {
            generic: {
              user_logged_out: 'user_logged_out',
              session_expired: 'session_expired',
              generic_error: 'generic_error',
              resource_not_found: 'resource_not_found',
              user_credential_expired: 'user_credential_expired'
            }
          }
        }
      });
    }
  });

  (0, _emberQunit.test)('it skips AUTHENTICATION_FAILED error as it does not have separate handler', function (assert) {
    assert.expect(1);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'AUTHENTICATION_FAILED',
        message: 'Message: AUTHENTICATION_FAILED',
        more_info: ''
      }]
    };

    var globalProcessedCount = 0;

    service.reopen({
      processStrategy: function processStrategy(key) {
        var processedCount = this._super.apply(this, arguments);

        globalProcessedCount += processedCount;

        return processedCount;
      }
    });

    try {
      service.process(error);
    } catch (e) {}

    assert.equal(globalProcessedCount, 0, 'Processed count should be zero as AUTHENTICATION_FAILED does not have separate handler.');
  });

  (0, _emberQunit.test)('it will logout and send notification on AUTHORIZATION_REQUIRED error', function (assert) {
    assert.expect(5);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'AUTHORIZATION_REQUIRED',
        message: '',
        more_info: ''
      }]
    };

    var strategies = service.get('strategies');

    _ember['default'].run(function () {
      strategies.AUTHORIZATION_REQUIRED.set('session', _frontendCpServicesSession['default'].create({
        logout: function logout() {
          assert.ok(true);

          return _ember['default'].RSVP.Promise.resolve();
        }
      }));

      strategies.AUTHORIZATION_REQUIRED.get('notification').reopen({
        add: function add(object) {
          assert.equal('error', object.type);
          assert.equal('user_logged_out', object.title);
          assert.equal('session_expired', object.body);
          assert.equal(true, object.autodismiss);
        }
      });
    });

    try {
      service.process(error);
    } catch (e) {}
  });

  (0, _emberQunit.test)('it creates notifications for NOTIFICATION type', function (assert) {
    assert.expect(6);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'NOTIFICATION',
        type: 'ERROR',
        message: 'Message 1',
        sticky: false,
        more_info: ''
      }, {
        code: 'NOTIFICATION',
        type: 'SUCCESS',
        message: 'Message 2',
        sticky: true,
        more_info: ''
      }]
    };

    var strategies = service.get('strategies');

    _ember['default'].run(function () {
      strategies.AUTHORIZATION_REQUIRED.get('session').reopen({
        logout: function logout() {
          return _ember['default'].RSVP.Promise.resolve();
        }
      });

      strategies.NOTIFICATION.get('notification').reopen({
        add: function add(object) {
          if (object.title === 'Message 1') {
            assert.equal('error', object.type);
            assert.equal('Message 1', object.title);
            assert.equal(true, object.autodismiss);
          } else {
            assert.equal('success', object.type);
            assert.equal('Message 2', object.title);
            assert.equal(false, object.autodismiss);
          }
        }
      });
    });

    try {
      service.process(error);
    } catch (e) {}
  });

  (0, _emberQunit.test)('it send notification and transitions to the base path when RESOURCE_NOT_FOUND occurs', function (assert) {
    assert.expect(5);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'RESOURCE_NOT_FOUND',
        message: '',
        more_info: ''
      }]
    };

    var strategies = service.get('strategies');

    _ember['default'].run(function () {
      strategies.AUTHORIZATION_REQUIRED.get('session').reopen({
        logout: function logout() {
          return _ember['default'].RSVP.Promise.resolve();
        }
      });

      strategies.RESOURCE_NOT_FOUND.reopen({
        transitionTo: function transitionTo(path) {
          assert.equal('/agent', path);
        }
      });

      strategies.RESOURCE_NOT_FOUND.get('notification').reopen({
        add: function add(object) {
          assert.equal('error', object.type);
          assert.equal('resource_not_found', object.title);
          assert.equal(true, object.autodismiss);
          assert.equal(true, object.dismissable);
        }
      });
    });

    try {
      service.process(error);
    } catch (e) {}
  });

  (0, _emberQunit.test)('it creates notifications when CREDENTIAL_EXPIRED appear', function (assert) {
    assert.expect(4);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'CREDENTIAL_EXPIRED',
        message: '',
        more_info: ''
      }]
    };

    var strategies = service.get('strategies');

    _ember['default'].run(function () {
      strategies.AUTHORIZATION_REQUIRED.get('session').reopen({
        logout: function logout() {
          return _ember['default'].RSVP.Promise.resolve();
        }
      });

      strategies.CREDENTIAL_EXPIRED.get('notification').reopen({
        add: function add(object) {
          assert.equal('error', object.type);
          assert.equal('user_credential_expired', object.title);
          assert.equal(true, object.autodismiss);
          assert.equal(true, object.dismissable);
        }
      });
    });

    try {
      service.process(error);
    } catch (e) {}
  });

  (0, _emberQunit.test)('it fall backs to the _GENERIC handler if unknown error appear', function (assert) {
    assert.expect(4);

    var service = this.subject();

    var error = {
      errors: [{
        code: 'SUPER_UNKNOWN_ERROR',
        message: '',
        more_info: ''
      }]
    };

    var strategies = service.get('strategies');

    _ember['default'].run(function () {
      strategies.AUTHORIZATION_REQUIRED.get('session').reopen({
        logout: function logout() {
          return _ember['default'].RSVP.Promise.resolve();
        }
      });

      strategies._GENERIC.get('notification').reopen({
        add: function add(object) {
          assert.equal('error', object.type);
          assert.equal('generic_error', object.title);
          assert.equal(true, object.autodismiss);
          assert.equal(true, object.dismissable);
        }
      });
    });

    try {
      service.process(error);
    } catch (e) {}
  });
});
/* eslint-disable no-empty */
define('frontend-cp/tests/unit/services/plan-test', ['exports', 'ember', 'ember-qunit', 'frontend-cp/tests/helpers/setup-mirage-for-integration'], function (exports, _ember, _emberQunit, _frontendCpTestsHelpersSetupMirageForIntegration) {
  var getOwner = _ember['default'].getOwner;

  (0, _emberQunit.moduleFor)('service:plan', 'Unit | Service | plan', {
    integration: true,

    setup: function setup() {
      /* eslint-disable no-undef, camelcase */
      (0, _frontendCpTestsHelpersSetupMirageForIntegration['default'])(getOwner(this));
      var limit = server.create('plan-limit', {
        collaborators: 10
      });

      var feature = server.create('feature', {
        code: 'collaborators',
        name: 'collaborators',
        description: 'People who may log in as a team member'
      });

      server.create('plan', { limits: limit, features: [feature], account_id: '123', subscription_id: '123' });

      /* eslint-enable no-undef, camelcase */
    }
  });

  (0, _emberQunit.test)('it should return the limit for the name requested', function (assert) {
    assert.expect(1);

    var service = getOwner(this).lookup('service:plan');
    return service.fetchPlan().then(function () {
      assert.equal(service.limitFor('collaborators'), 10);
    });
  });

  (0, _emberQunit.test)('it should return true if the name of the feature is present', function (assert) {
    assert.expect(1);

    var service = getOwner(this).lookup('service:plan');
    return service.fetchPlan().then(function () {
      assert.equal(service.has('collaborators'), true);
    });
  });

  (0, _emberQunit.test)('it will fetch from the server and update', function (assert) {
    assert.expect(5);

    var service = getOwner(this).lookup('service:plan');
    service.fetchPlan().then(function () {
      assert.equal(service.limitFor('collaborators'), 10);
      assert.equal(service.has('collaborators'), true);
      assert.equal(service.has('agents'), false);
    });

    /* eslint-disable no-undef, camelcase */
    var limit = server.create('plan-limit', {
      agents: 2
    });

    var feature = server.create('feature', {
      code: 'agents',
      name: 'agents',
      description: 'People who may log in and talk to customers'
    });

    server.db.plans.remove(1);

    server.create('plan', { limits: limit, features: [feature], account_id: '123', subscription_id: '123' });

    /* eslint-enable no-undef, camelcase */
    return service.fetchPlan().then(function () {
      assert.equal(service.limitFor('agents'), 2);
      assert.equal(service.has('agents'), true);
    });
  });
});
define('frontend-cp/tests/unit/utils/promise-queue-test', ['exports', 'ember', 'qunit', 'ember-qunit', 'frontend-cp/utils/promise-queue'], function (exports, _ember, _qunit, _emberQunit, _frontendCpUtilsPromiseQueue) {

  (0, _qunit.module)('Unit | Utils | promise-queue');

  (0, _emberQunit.test)('it stores promises by term', function (assert) {
    var queue = new _frontendCpUtilsPromiseQueue['default']();

    var promise = new _ember['default'].RSVP.Promise(function (resolve, reject) {
      resolve();
    });

    queue.push('a', promise);
    queue.push('ab', promise);
    queue.push('abc', promise);

    assert.equal(3, queue.queue.length);
  });

  (0, _emberQunit.test)('it validates if promise is discarded (not the last one)', function (assert) {
    var queue = new _frontendCpUtilsPromiseQueue['default']();

    var promise = new _ember['default'].RSVP.Promise(function (resolve, reject) {
      resolve();
    });

    queue.push('a', promise);
    queue.push('ab', promise);
    queue.push('abc', promise);

    assert.equal(true, queue.isDiscarded('a'));
    assert.equal(true, queue.isDiscarded('ab'));
    assert.equal(false, queue.isDiscarded('abc'));
  });

  (0, _emberQunit.test)('it flushes all promise queue', function (assert) {
    var queue = new _frontendCpUtilsPromiseQueue['default']();

    var promise = new _ember['default'].RSVP.Promise(function (resolve, reject) {
      resolve();
    });

    queue.push('a', promise);
    queue.push('ab', promise);
    queue.push('abc', promise);

    assert.equal(3, queue.queue.length);

    queue.flush();

    assert.equal(0, queue.queue.length);
  });
});
define('frontend-cp/tests/unit/validation/service-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('service:validation', 'Unit | Service | validation', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('return false when value does not exists', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.exists(undefined), false);
  });

  (0, _emberQunit.test)('return false when value is an empty string', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.exists(''), false);
  });

  (0, _emberQunit.test)('return false when value is null', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.exists(null), false);
  });

  (0, _emberQunit.test)('return true when value does exists', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.exists('foo'), true);
  });

  (0, _emberQunit.test)('return false when value is not an email address', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.isEmail('foo'), false);
  });

  (0, _emberQunit.test)('return true when value is an email address', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.isEmail('foo@bar.com'), true);
  });

  (0, _emberQunit.test)('return false when value is not a phone number', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.isPhone('9192abc'), false);
  });

  (0, _emberQunit.test)('return true when value is a phone number', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.isPhone('9990345109'), true);
  });

  (0, _emberQunit.test)('return true when value is a phone number with dashes', function (assert) {
    assert.expect(1);

    var service = this.subject();
    assert.equal(service.isPhone('999-034-5109'), true);
  });

  (0, _emberQunit.test)('return object of errors from validateAll when validation fails', function (assert) {
    assert.expect(1);
    var data = {
      name: '',
      email: 'foo'
    };

    var rules = {
      name: ['exists'],
      email: ['exists', 'isEmail']
    };

    var messages = {
      name: 'name is required',
      email: 'enter valid email address'
    };

    var expected = {
      name: [{ message: 'name is required' }],
      email: [{ message: 'enter valid email address' }]
    };

    var service = this.subject();
    assert.deepEqual(service.validateAll(data, rules, messages), expected);
  });

  (0, _emberQunit.test)('return object of errors from validateAll when validation fails on single field', function (assert) {
    assert.expect(1);
    var data = {
      name: 'foo',
      email: 'foo'
    };

    var rules = {
      name: ['exists'],
      email: ['exists', 'isEmail']
    };

    var messages = {
      name: 'name is required',
      email: 'enter valid email address'
    };

    var expected = {
      email: [{ message: 'enter valid email address' }]
    };

    var service = this.subject();
    assert.deepEqual(service.validateAll(data, rules, messages), expected);
  });

  (0, _emberQunit.test)('return empty object when everything is good', function (assert) {
    assert.expect(1);
    var data = {
      name: 'foo',
      email: 'foo@bar.com'
    };

    var rules = {
      name: ['exists'],
      email: ['exists', 'isEmail']
    };

    var messages = {
      name: 'name is required',
      email: 'enter valid email address'
    };

    var expected = {};

    var service = this.subject();
    assert.deepEqual(service.validateAll(data, rules, messages), expected);
  });
});
/* jshint ignore:start */

require('frontend-cp/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
