"no use strict"
!function(t){function e(t,e){for(var n=t,r="";n;){var i=e[n]
if("string"==typeof i)return i+r
if(i)return i.location.replace(/\/*$/,"/")+(r||i.main||i.name)
if(!1===i)return""
var o=n.lastIndexOf("/")
if(-1===o)break
r=n.substr(o)+r,n=n.slice(0,o)}return t}if(!(void 0!==t.window&&t.document||t.require&&t.define)){t.console||(t.console=function(){var t=Array.prototype.slice.call(arguments,0)
postMessage({type:"log",data:t})},t.console.error=t.console.warn=t.console.log=t.console.trace=t.console),t.window=t,t.ace=t,t.onerror=function(t,e,n,r,i){postMessage({type:"error",data:{message:t,data:i.data,file:e,line:n,col:r,stack:i.stack}})},t.normalizeModule=function(e,n){if(-1!==n.indexOf("!")){var r=n.split("!")
return t.normalizeModule(e,r[0])+"!"+t.normalizeModule(e,r[1])}if("."==n.charAt(0)){var i=e.split("/").slice(0,-1).join("/")
for(n=(i?i+"/":"")+n;-1!==n.indexOf(".")&&o!=n;){var o=n
n=n.replace(/^\.\//,"").replace(/\/\.\//,"/").replace(/[^\/]+\/\.\.\//,"")}}return n},t.require=function(n,r){if(r||(r=n,n=null),!r.charAt)throw new Error("worker.js require() accepts only (parentId, id) as arguments")
r=t.normalizeModule(n,r)
var i=t.require.modules[r]
if(i)return i.initialized||(i.initialized=!0,i.exports=i.factory().exports),i.exports
if(!t.require.tlns)return console.log("unable to load "+r)
var o=e(r,t.require.tlns)
return".js"!=o.slice(-3)&&(o+=".js"),t.require.id=r,t.require.modules[r]={},importScripts(o),t.require(n,r)},t.require.modules={},t.require.tlns={},t.define=function(e,n,r){if(2==arguments.length?(r=n,"string"!=typeof e&&(n=e,e=t.require.id)):1==arguments.length&&(r=e,n=[],e=t.require.id),"function"==typeof r){n.length||(n=["require","exports","module"])
var i=function(n){return t.require(e,n)}
t.require.modules[e]={exports:{},factory:function(){var t=this,e=r.apply(this,n.map(function(e){switch(e){case"require":return i
case"exports":return t.exports
case"module":return t
default:return i(e)}}))
return e&&(t.exports=e),t}}}else t.require.modules[e]={exports:r,initialized:!0}},t.define.amd={},require.tlns={},t.initBaseUrls=function(t){for(var e in t)require.tlns[e]=t[e]},t.initSender=function(){var e=t.require("ace/lib/event_emitter").EventEmitter,n=t.require("ace/lib/oop"),r=function(){}
return function(){n.implement(this,e),this.callback=function(t,e){postMessage({type:"call",id:e,data:t})},this.emit=function(t,e){postMessage({type:"event",name:t,data:e})}}.call(r.prototype),new r}
var n=t.main=null,r=t.sender=null
t.onmessage=function(e){var i=e.data
if(i.event&&r)r._signal(i.event,i.data)
else if(i.command)if(n[i.command])n[i.command].apply(n,i.args)
else{if(!t[i.command])throw new Error("Unknown command:"+i.command)
t[i.command].apply(t,i.args)}else if(i.init){t.initBaseUrls(i.tlns),require("ace/lib/es5-shim"),r=t.sender=t.initSender()
var o=require(i.module)[i.classname]
n=t.main=new o(r)}}}}(this),ace.define("ace/lib/oop",["require","exports","module"],function(t,e,n){"use strict"
e.inherits=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})},e.mixin=function(t,e){for(var n in e)t[n]=e[n]
return t},e.implement=function(t,n){e.mixin(t,n)}}),ace.define("ace/range",["require","exports","module"],function(t,e,n){"use strict"
var r=function(t,e,n,r){this.start={row:t,column:e},this.end={row:n,column:r}};(function(){this.isEqual=function(t){return this.start.row===t.start.row&&this.end.row===t.end.row&&this.start.column===t.start.column&&this.end.column===t.end.column},this.toString=function(){return"Range: ["+this.start.row+"/"+this.start.column+"] -> ["+this.end.row+"/"+this.end.column+"]"},this.contains=function(t,e){return 0==this.compare(t,e)},this.compareRange=function(t){var e,n=t.end,r=t.start
return 1==(e=this.compare(n.row,n.column))?1==(e=this.compare(r.row,r.column))?2:0==e?1:0:-1==e?-2:-1==(e=this.compare(r.row,r.column))?-1:1==e?42:0},this.comparePoint=function(t){return this.compare(t.row,t.column)},this.containsRange=function(t){return 0==this.comparePoint(t.start)&&0==this.comparePoint(t.end)},this.intersects=function(t){var e=this.compareRange(t)
return-1==e||0==e||1==e},this.isEnd=function(t,e){return this.end.row==t&&this.end.column==e},this.isStart=function(t,e){return this.start.row==t&&this.start.column==e},this.setStart=function(t,e){"object"==typeof t?(this.start.column=t.column,this.start.row=t.row):(this.start.row=t,this.start.column=e)},this.setEnd=function(t,e){"object"==typeof t?(this.end.column=t.column,this.end.row=t.row):(this.end.row=t,this.end.column=e)},this.inside=function(t,e){return 0==this.compare(t,e)&&(!this.isEnd(t,e)&&!this.isStart(t,e))},this.insideStart=function(t,e){return 0==this.compare(t,e)&&!this.isEnd(t,e)},this.insideEnd=function(t,e){return 0==this.compare(t,e)&&!this.isStart(t,e)},this.compare=function(t,e){return this.isMultiLine()||t!==this.start.row?t<this.start.row?-1:t>this.end.row?1:this.start.row===t?e>=this.start.column?0:-1:this.end.row===t?e<=this.end.column?0:1:0:e<this.start.column?-1:e>this.end.column?1:0},this.compareStart=function(t,e){return this.start.row==t&&this.start.column==e?-1:this.compare(t,e)},this.compareEnd=function(t,e){return this.end.row==t&&this.end.column==e?1:this.compare(t,e)},this.compareInside=function(t,e){return this.end.row==t&&this.end.column==e?1:this.start.row==t&&this.start.column==e?-1:this.compare(t,e)},this.clipRows=function(t,e){if(this.end.row>e)n={row:e+1,column:0}
else if(this.end.row<t)var n={row:t,column:0}
if(this.start.row>e)i={row:e+1,column:0}
else if(this.start.row<t)var i={row:t,column:0}
return r.fromPoints(i||this.start,n||this.end)},this.extend=function(t,e){var n=this.compare(t,e)
if(0==n)return this
if(-1==n)var i={row:t,column:e}
else var o={row:t,column:e}
return r.fromPoints(i||this.start,o||this.end)},this.isEmpty=function(){return this.start.row===this.end.row&&this.start.column===this.end.column},this.isMultiLine=function(){return this.start.row!==this.end.row},this.clone=function(){return r.fromPoints(this.start,this.end)},this.collapseRows=function(){return 0==this.end.column?new r(this.start.row,0,Math.max(this.start.row,this.end.row-1),0):new r(this.start.row,0,this.end.row,0)},this.toScreenRange=function(t){var e=t.documentToScreenPosition(this.start),n=t.documentToScreenPosition(this.end)
return new r(e.row,e.column,n.row,n.column)},this.moveBy=function(t,e){this.start.row+=t,this.start.column+=e,this.end.row+=t,this.end.column+=e}}).call(r.prototype),r.fromPoints=function(t,e){return new r(t.row,t.column,e.row,e.column)},r.comparePoints=function(t,e){return t.row-e.row||t.column-e.column},r.comparePoints=function(t,e){return t.row-e.row||t.column-e.column},e.Range=r}),ace.define("ace/apply_delta",["require","exports","module"],function(t,e,n){"use strict"
e.applyDelta=function(t,e,n){var r=e.start.row,i=e.start.column,o=t[r]||""
switch(e.action){case"insert":if(1===e.lines.length)t[r]=o.substring(0,i)+e.lines[0]+o.substring(i)
else{var s=[r,1].concat(e.lines)
t.splice.apply(t,s),t[r]=o.substring(0,i)+t[r],t[r+e.lines.length-1]+=o.substring(i)}break
case"remove":var a=e.end.column,c=e.end.row
r===c?t[r]=o.substring(0,i)+o.substring(a):t.splice(r,c-r+1,o.substring(0,i)+t[c].substring(a))}}}),ace.define("ace/lib/event_emitter",["require","exports","module"],function(t,e,n){"use strict"
var r={},i=function(){this.propagationStopped=!0},o=function(){this.defaultPrevented=!0}
r._emit=r._dispatchEvent=function(t,e){this._eventRegistry||(this._eventRegistry={}),this._defaultHandlers||(this._defaultHandlers={})
var n=this._eventRegistry[t]||[],r=this._defaultHandlers[t]
if(n.length||r){"object"==typeof e&&e||(e={}),e.type||(e.type=t),e.stopPropagation||(e.stopPropagation=i),e.preventDefault||(e.preventDefault=o),n=n.slice()
for(var s=0;s<n.length&&(n[s](e,this),!e.propagationStopped);s++);return r&&!e.defaultPrevented?r(e,this):void 0}},r._signal=function(t,e){var n=(this._eventRegistry||{})[t]
if(n){n=n.slice()
for(var r=0;r<n.length;r++)n[r](e,this)}},r.once=function(t,e){var n=this
e&&this.addEventListener(t,function r(){n.removeEventListener(t,r),e.apply(null,arguments)})},r.setDefaultHandler=function(t,e){var n=this._defaultHandlers
if(n||(n=this._defaultHandlers={_disabled_:{}}),n[t]){var r=n[t],i=n._disabled_[t]
i||(n._disabled_[t]=i=[]),i.push(r)
var o=i.indexOf(e);-1!=o&&i.splice(o,1)}n[t]=e},r.removeDefaultHandler=function(t,e){var n=this._defaultHandlers
if(n){var r=n._disabled_[t]
if(n[t]==e){n[t]
r&&this.setDefaultHandler(t,r.pop())}else if(r){var i=r.indexOf(e);-1!=i&&r.splice(i,1)}}},r.on=r.addEventListener=function(t,e,n){this._eventRegistry=this._eventRegistry||{}
var r=this._eventRegistry[t]
return r||(r=this._eventRegistry[t]=[]),-1==r.indexOf(e)&&r[n?"unshift":"push"](e),e},r.off=r.removeListener=r.removeEventListener=function(t,e){this._eventRegistry=this._eventRegistry||{}
var n=this._eventRegistry[t]
if(n){var r=n.indexOf(e);-1!==r&&n.splice(r,1)}},r.removeAllListeners=function(t){this._eventRegistry&&(this._eventRegistry[t]=[])},e.EventEmitter=r}),ace.define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(t,e,n){"use strict"
var r=t("./lib/oop"),i=t("./lib/event_emitter").EventEmitter,o=e.Anchor=function(t,e,n){this.$onChange=this.onChange.bind(this),this.attach(t),void 0===n?this.setPosition(e.row,e.column):this.setPosition(e,n)};(function(){function t(t,e,n){var r=n?t.column<=e.column:t.column<e.column
return t.row<e.row||t.row==e.row&&r}function e(e,n,r){var i="insert"==e.action,o=(i?1:-1)*(e.end.row-e.start.row),s=(i?1:-1)*(e.end.column-e.start.column),a=e.start,c=i?a:e.end
return t(n,a,r)?{row:n.row,column:n.column}:t(c,n,!r)?{row:n.row+o,column:n.column+(n.row==c.row?s:0)}:{row:a.row,column:a.column}}r.implement(this,i),this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column)},this.getDocument=function(){return this.document},this.$insertRight=!1,this.onChange=function(t){if(!(t.start.row==t.end.row&&t.start.row!=this.row||t.start.row>this.row)){var n=e(t,{row:this.row,column:this.column},this.$insertRight)
this.setPosition(n.row,n.column,!0)}},this.setPosition=function(t,e,n){var r
if(r=n?{row:t,column:e}:this.$clipPositionToDocument(t,e),this.row!=r.row||this.column!=r.column){var i={row:this.row,column:this.column}
this.row=r.row,this.column=r.column,this._signal("change",{old:i,value:r})}},this.detach=function(){this.document.removeEventListener("change",this.$onChange)},this.attach=function(t){this.document=t||this.document,this.document.on("change",this.$onChange)},this.$clipPositionToDocument=function(t,e){var n={}
return t>=this.document.getLength()?(n.row=Math.max(0,this.document.getLength()-1),n.column=this.document.getLine(n.row).length):t<0?(n.row=0,n.column=0):(n.row=t,n.column=Math.min(this.document.getLine(n.row).length,Math.max(0,e))),e<0&&(n.column=0),n}}).call(o.prototype)}),ace.define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"],function(t,e,n){"use strict"
var r=t("./lib/oop"),i=t("./apply_delta").applyDelta,o=t("./lib/event_emitter").EventEmitter,s=t("./range").Range,a=t("./anchor").Anchor,c=function(t){this.$lines=[""],0===t.length?this.$lines=[""]:Array.isArray(t)?this.insertMergedLines({row:0,column:0},t):this.insert({row:0,column:0},t)};(function(){r.implement(this,o),this.setValue=function(t){var e=this.getLength()-1
this.remove(new s(0,0,e,this.getLine(e).length)),this.insert({row:0,column:0},t)},this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter())},this.createAnchor=function(t,e){return new a(this,t,e)},0==="aaa".split(/a/).length?this.$split=function(t){return t.replace(/\r\n|\r/g,"\n").split("\n")}:this.$split=function(t){return t.split(/\r\n|\r|\n/)},this.$detectNewLine=function(t){var e=t.match(/^.*?(\r\n|\r|\n)/m)
this.$autoNewLine=e?e[1]:"\n",this._signal("changeNewLineMode")},this.getNewLineCharacter=function(){switch(this.$newLineMode){case"windows":return"\r\n"
case"unix":return"\n"
default:return this.$autoNewLine||"\n"}},this.$autoNewLine="",this.$newLineMode="auto",this.setNewLineMode=function(t){this.$newLineMode!==t&&(this.$newLineMode=t,this._signal("changeNewLineMode"))},this.getNewLineMode=function(){return this.$newLineMode},this.isNewLine=function(t){return"\r\n"==t||"\r"==t||"\n"==t},this.getLine=function(t){return this.$lines[t]||""},this.getLines=function(t,e){return this.$lines.slice(t,e+1)},this.getAllLines=function(){return this.getLines(0,this.getLength())},this.getLength=function(){return this.$lines.length},this.getTextRange=function(t){return this.getLinesForRange(t).join(this.getNewLineCharacter())},this.getLinesForRange=function(t){var e
if(t.start.row===t.end.row)e=[this.getLine(t.start.row).substring(t.start.column,t.end.column)]
else{(e=this.getLines(t.start.row,t.end.row))[0]=(e[0]||"").substring(t.start.column)
var n=e.length-1
t.end.row-t.start.row==n&&(e[n]=e[n].substring(0,t.end.column))}return e},this.insertLines=function(t,e){return console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead."),this.insertFullLines(t,e)},this.removeLines=function(t,e){return console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead."),this.removeFullLines(t,e)},this.insertNewLine=function(t){return console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead."),this.insertMergedLines(t,["",""])},this.insert=function(t,e){return this.getLength()<=1&&this.$detectNewLine(e),this.insertMergedLines(t,this.$split(e))},this.insertInLine=function(t,e){var n=this.clippedPos(t.row,t.column),r=this.pos(t.row,t.column+e.length)
return this.applyDelta({start:n,end:r,action:"insert",lines:[e]},!0),this.clonePos(r)},this.clippedPos=function(t,e){var n=this.getLength()
void 0===t?t=n:t<0?t=0:t>=n&&(t=n-1,e=void 0)
var r=this.getLine(t)
return void 0==e&&(e=r.length),e=Math.min(Math.max(e,0),r.length),{row:t,column:e}},this.clonePos=function(t){return{row:t.row,column:t.column}},this.pos=function(t,e){return{row:t,column:e}},this.$clipPosition=function(t){var e=this.getLength()
return t.row>=e?(t.row=Math.max(0,e-1),t.column=this.getLine(e-1).length):(t.row=Math.max(0,t.row),t.column=Math.min(Math.max(t.column,0),this.getLine(t.row).length)),t},this.insertFullLines=function(t,e){var n=0;(t=Math.min(Math.max(t,0),this.getLength()))<this.getLength()?(e=e.concat([""]),n=0):(e=[""].concat(e),t--,n=this.$lines[t].length),this.insertMergedLines({row:t,column:n},e)},this.insertMergedLines=function(t,e){var n=this.clippedPos(t.row,t.column),r={row:n.row+e.length-1,column:(1==e.length?n.column:0)+e[e.length-1].length}
return this.applyDelta({start:n,end:r,action:"insert",lines:e}),this.clonePos(r)},this.remove=function(t){var e=this.clippedPos(t.start.row,t.start.column),n=this.clippedPos(t.end.row,t.end.column)
return this.applyDelta({start:e,end:n,action:"remove",lines:this.getLinesForRange({start:e,end:n})}),this.clonePos(e)}
this.removeInLine=function(t,e,n){var r=this.clippedPos(t,e),i=this.clippedPos(t,n)
return this.applyDelta({start:r,end:i,action:"remove",lines:this.getLinesForRange({start:r,end:i})},!0),this.clonePos(r)},this.removeFullLines=function(t,e){t=Math.min(Math.max(0,t),this.getLength()-1)
var n=(e=Math.min(Math.max(0,e),this.getLength()-1))==this.getLength()-1&&t>0,r=e<this.getLength()-1,i=n?t-1:t,o=n?this.getLine(i).length:0,a=r?e+1:e,c=r?0:this.getLine(a).length,u=new s(i,o,a,c),l=this.$lines.slice(t,e+1)
return this.applyDelta({start:u.start,end:u.end,action:"remove",lines:this.getLinesForRange(u)}),l},this.removeNewLine=function(t){t<this.getLength()-1&&t>=0&&this.applyDelta({start:this.pos(t,this.getLine(t).length),end:this.pos(t+1,0),action:"remove",lines:["",""]})},this.replace=function(t,e){if(t instanceof s||(t=s.fromPoints(t.start,t.end)),0===e.length&&t.isEmpty())return t.start
if(e==this.getTextRange(t))return t.end
this.remove(t)
return e?this.insert(t.start,e):t.start},this.applyDeltas=function(t){for(var e=0;e<t.length;e++)this.applyDelta(t[e])},this.revertDeltas=function(t){for(var e=t.length-1;e>=0;e--)this.revertDelta(t[e])},this.applyDelta=function(t,e){var n="insert"==t.action;(n?t.lines.length<=1&&!t.lines[0]:!s.comparePoints(t.start,t.end))||(n&&t.lines.length>2e4&&this.$splitAndapplyLargeDelta(t,2e4),i(this.$lines,t,e),this._signal("change",t))},this.$splitAndapplyLargeDelta=function(t,e){for(var n=t.lines,r=n.length,i=t.start.row,o=t.start.column,s=0,a=0;;){s=a,a+=e-1
var c=n.slice(s,a)
if(a>r){t.lines=c,t.start.row=i+s,t.start.column=o
break}c.push(""),this.applyDelta({start:this.pos(i+s,o),end:this.pos(i+a,o=0),action:t.action,lines:c},!0)}},this.revertDelta=function(t){this.applyDelta({start:this.clonePos(t.start),end:this.clonePos(t.end),action:"insert"==t.action?"remove":"insert",lines:t.lines.slice()})},this.indexToPosition=function(t,e){for(var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length,i=e||0,o=n.length;i<o;i++)if((t-=n[i].length+r)<0)return{row:i,column:t+n[i].length+r}
return{row:o-1,column:n[o-1].length}},this.positionToIndex=function(t,e){for(var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length,i=0,o=Math.min(t.row,n.length),s=e||0;s<o;++s)i+=n[s].length+r
return i+t.column}}).call(c.prototype),e.Document=c}),ace.define("ace/lib/lang",["require","exports","module"],function(t,e,n){"use strict"
e.last=function(t){return t[t.length-1]},e.stringReverse=function(t){return t.split("").reverse().join("")},e.stringRepeat=function(t,e){for(var n="";e>0;)1&e&&(n+=t),(e>>=1)&&(t+=t)
return n}
var r=/^\s\s*/,i=/\s\s*$/
e.stringTrimLeft=function(t){return t.replace(r,"")},e.stringTrimRight=function(t){return t.replace(i,"")},e.copyObject=function(t){var e={}
for(var n in t)e[n]=t[n]
return e},e.copyArray=function(t){for(var e=[],n=0,r=t.length;n<r;n++)t[n]&&"object"==typeof t[n]?e[n]=this.copyObject(t[n]):e[n]=t[n]
return e},e.deepCopy=function t(e){if("object"!=typeof e||!e)return e
var n
if(Array.isArray(e)){n=[]
for(r=0;r<e.length;r++)n[r]=t(e[r])
return n}if("[object Object]"!==Object.prototype.toString.call(e))return e
n={}
for(var r in e)n[r]=t(e[r])
return n},e.arrayToMap=function(t){for(var e={},n=0;n<t.length;n++)e[t[n]]=1
return e},e.createMap=function(t){var e=Object.create(null)
for(var n in t)e[n]=t[n]
return e},e.arrayRemove=function(t,e){for(var n=0;n<=t.length;n++)e===t[n]&&t.splice(n,1)},e.escapeRegExp=function(t){return t.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")},e.escapeHTML=function(t){return t.replace(/&/g,"&#38;").replace(/"/g,"&#34;").replace(/'/g,"&#39;").replace(/</g,"&#60;")},e.getMatchOffsets=function(t,e){var n=[]
return t.replace(e,function(t){n.push({offset:arguments[arguments.length-2],length:t.length})}),n},e.deferredCall=function(t){var e=null,n=function(){e=null,t()},r=function(t){return r.cancel(),e=setTimeout(n,t||0),r}
return r.schedule=r,r.call=function(){return this.cancel(),t(),r},r.cancel=function(){return clearTimeout(e),e=null,r},r.isPending=function(){return e},r},e.delayedCall=function(t,e){var n=null,r=function(){n=null,t()},i=function(t){null==n&&(n=setTimeout(r,t||e))}
return i.delay=function(t){n&&clearTimeout(n),n=setTimeout(r,t||e)},i.schedule=i,i.call=function(){this.cancel(),t()},i.cancel=function(){n&&clearTimeout(n),n=null},i.isPending=function(){return n},i}}),ace.define("ace/worker/mirror",["require","exports","module","ace/range","ace/document","ace/lib/lang"],function(t,e,n){"use strict"
t("../range").Range
var r=t("../document").Document,i=t("../lib/lang"),o=e.Mirror=function(t){this.sender=t
var e=this.doc=new r(""),n=this.deferredUpdate=i.delayedCall(this.onUpdate.bind(this)),o=this
t.on("change",function(t){var r=t.data
if(r[0].start)e.applyDeltas(r)
else for(var i=0;i<r.length;i+=2){if(Array.isArray(r[i+1]))s={action:"insert",start:r[i],lines:r[i+1]}
else var s={action:"remove",start:r[i],end:r[i+1]}
e.applyDelta(s,!0)}if(o.$timeout)return n.schedule(o.$timeout)
o.onUpdate()})};(function(){this.$timeout=500,this.setTimeout=function(t){this.$timeout=t},this.setValue=function(t){this.doc.setValue(t),this.deferredUpdate.schedule(this.$timeout)},this.getValue=function(t){this.sender.callback(this.doc.getValue(),t)},this.onUpdate=function(){},this.isPending=function(){return this.deferredUpdate.isPending()}}).call(o.prototype)}),ace.define("ace/mode/json/json_parse",["require","exports","module"],function(t,e,n){"use strict"
var r,i,o,s,a={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},c=function(t){throw{name:"SyntaxError",message:t,at:r,text:o}},u=function(t){return t&&t!==i&&c("Expected '"+t+"' instead of '"+i+"'"),i=o.charAt(r),r+=1,i},l=function(){var t,e=""
for("-"===i&&(e="-",u("-"));i>="0"&&i<="9";)e+=i,u()
if("."===i)for(e+=".";u()&&i>="0"&&i<="9";)e+=i
if("e"===i||"E"===i)for(e+=i,u(),"-"!==i&&"+"!==i||(e+=i,u());i>="0"&&i<="9";)e+=i,u()
if(t=+e,!isNaN(t))return t
c("Bad number")},h=function(){var t,e,n,r=""
if('"'===i)for(;u();){if('"'===i)return u(),r
if("\\"===i)if(u(),"u"===i){for(n=0,e=0;e<4&&(t=parseInt(u(),16),isFinite(t));e+=1)n=16*n+t
r+=String.fromCharCode(n)}else{if("string"!=typeof a[i])break
r+=a[i]}else r+=i}c("Bad string")},f=function(){for(;i&&i<=" ";)u()},p=function(){switch(i){case"t":return u("t"),u("r"),u("u"),u("e"),!0
case"f":return u("f"),u("a"),u("l"),u("s"),u("e"),!1
case"n":return u("n"),u("u"),u("l"),u("l"),null}c("Unexpected '"+i+"'")},d=function(){var t=[]
if("["===i){if(u("["),f(),"]"===i)return u("]"),t
for(;i;){if(t.push(s()),f(),"]"===i)return u("]"),t
u(","),f()}}c("Bad array")},m=function(){var t,e={}
if("{"===i){if(u("{"),f(),"}"===i)return u("}"),e
for(;i;){if(t=h(),f(),u(":"),Object.hasOwnProperty.call(e,t)&&c('Duplicate key "'+t+'"'),e[t]=s(),f(),"}"===i)return u("}"),e
u(","),f()}}c("Bad object")}
return s=function(){switch(f(),i){case"{":return m()
case"[":return d()
case'"':return h()
case"-":return l()
default:return i>="0"&&i<="9"?l():p()}},function(t,e){var n
return o=t,r=0,i=" ",n=s(),f(),i&&c("Syntax error"),"function"==typeof e?function t(n,r){var i,o,s=n[r]
if(s&&"object"==typeof s)for(i in s)Object.hasOwnProperty.call(s,i)&&(void 0!==(o=t(s,i))?s[i]=o:delete s[i])
return e.call(n,r,s)}({"":n},""):n}}),ace.define("ace/mode/json_worker",["require","exports","module","ace/lib/oop","ace/worker/mirror","ace/mode/json/json_parse"],function(t,e,n){"use strict"
var r=t("../lib/oop"),i=t("../worker/mirror").Mirror,o=t("./json/json_parse"),s=e.JsonWorker=function(t){i.call(this,t),this.setTimeout(200)}
r.inherits(s,i),function(){this.onUpdate=function(){var t=this.doc.getValue(),e=[]
try{t&&o(t)}catch(t){var n=this.doc.indexToPosition(t.at-1)
e.push({row:n.row,column:n.column,text:t.message,type:"error"})}this.sender.emit("annotate",e)}}.call(s.prototype)}),ace.define("ace/lib/es5-shim",["require","exports","module"],function(t,e,n){function r(){}function i(t){try{return Object.defineProperty(t,"sentinel",{}),"sentinel"in t}catch(t){}}function o(t){return(t=+t)!==t?t=0:0!==t&&t!==1/0&&t!==-1/0&&(t=(t>0||-1)*Math.floor(Math.abs(t))),t}Function.prototype.bind||(Function.prototype.bind=function(t){var e=this
if("function"!=typeof e)throw new TypeError("Function.prototype.bind called on incompatible "+e)
var n=d.call(arguments,1),i=function(){if(this instanceof i){var r=e.apply(this,n.concat(d.call(arguments)))
return Object(r)===r?r:this}return e.apply(t,n.concat(d.call(arguments)))}
return e.prototype&&(r.prototype=e.prototype,i.prototype=new r,r.prototype=null),i})
var s,a,c,u,l,h=Function.prototype.call,f=Array.prototype,p=Object.prototype,d=f.slice,m=h.bind(p.toString),g=h.bind(p.hasOwnProperty)
if((l=g(p,"__defineGetter__"))&&(s=h.bind(p.__defineGetter__),a=h.bind(p.__defineSetter__),c=h.bind(p.__lookupGetter__),u=h.bind(p.__lookupSetter__)),2!=[1,2].splice(0).length)if(function(){function t(t){var e=new Array(t+2)
return e[0]=e[1]=0,e}var e,n=[]
if(n.splice.apply(n,t(20)),n.splice.apply(n,t(26)),e=n.length,n.splice(5,0,"XXX"),n.length,e+1==n.length)return!0}()){var w=Array.prototype.splice
Array.prototype.splice=function(t,e){return arguments.length?w.apply(this,[void 0===t?0:t,void 0===e?this.length-t:e].concat(d.call(arguments,2))):[]}}else Array.prototype.splice=function(t,e){var n=this.length
t>0?t>n&&(t=n):void 0==t?t=0:t<0&&(t=Math.max(n+t,0)),t+e<n||(e=n-t)
var r=this.slice(t,t+e),i=d.call(arguments,2),o=i.length
if(t===n)o&&this.push.apply(this,i)
else{var s=Math.min(e,n-t),a=t+s,c=a+o-s,u=n-a,l=n-s
if(c<a)for(var h=0;h<u;++h)this[c+h]=this[a+h]
else if(c>a)for(h=u;h--;)this[c+h]=this[a+h]
if(o&&t===l)this.length=l,this.push.apply(this,i)
else for(this.length=l+o,h=0;h<o;++h)this[t+h]=i[h]}return r}
Array.isArray||(Array.isArray=function(t){return"[object Array]"==m(t)})
var v=Object("a"),y="a"!=v[0]||!(0 in v)
if(Array.prototype.forEach||(Array.prototype.forEach=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=arguments[1],i=-1,o=n.length>>>0
if("[object Function]"!=m(t))throw new TypeError
for(;++i<o;)i in n&&t.call(r,n[i],i,e)}),Array.prototype.map||(Array.prototype.map=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=n.length>>>0,i=Array(r),o=arguments[1]
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
for(var s=0;s<r;s++)s in n&&(i[s]=t.call(o,n[s],s,e))
return i}),Array.prototype.filter||(Array.prototype.filter=function(t){var e,n=R(this),r=y&&"[object String]"==m(this)?this.split(""):n,i=r.length>>>0,o=[],s=arguments[1]
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
for(var a=0;a<i;a++)a in r&&(e=r[a],t.call(s,e,a,n)&&o.push(e))
return o}),Array.prototype.every||(Array.prototype.every=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=n.length>>>0,i=arguments[1]
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
for(var o=0;o<r;o++)if(o in n&&!t.call(i,n[o],o,e))return!1
return!0}),Array.prototype.some||(Array.prototype.some=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=n.length>>>0,i=arguments[1]
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
for(var o=0;o<r;o++)if(o in n&&t.call(i,n[o],o,e))return!0
return!1}),Array.prototype.reduce||(Array.prototype.reduce=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=n.length>>>0
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
if(!r&&1==arguments.length)throw new TypeError("reduce of empty array with no initial value")
var i,o=0
if(arguments.length>=2)i=arguments[1]
else for(;;){if(o in n){i=n[o++]
break}if(++o>=r)throw new TypeError("reduce of empty array with no initial value")}for(;o<r;o++)o in n&&(i=t.call(void 0,i,n[o],o,e))
return i}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(t){var e=R(this),n=y&&"[object String]"==m(this)?this.split(""):e,r=n.length>>>0
if("[object Function]"!=m(t))throw new TypeError(t+" is not a function")
if(!r&&1==arguments.length)throw new TypeError("reduceRight of empty array with no initial value")
var i,o=r-1
if(arguments.length>=2)i=arguments[1]
else for(;;){if(o in n){i=n[o--]
break}if(--o<0)throw new TypeError("reduceRight of empty array with no initial value")}do{o in this&&(i=t.call(void 0,i,n[o],o,e))}while(o--)
return i}),Array.prototype.indexOf&&-1==[0,1].indexOf(1,2)||(Array.prototype.indexOf=function(t){var e=y&&"[object String]"==m(this)?this.split(""):R(this),n=e.length>>>0
if(!n)return-1
var r=0
for(arguments.length>1&&(r=o(arguments[1])),r=r>=0?r:Math.max(0,n+r);r<n;r++)if(r in e&&e[r]===t)return r
return-1}),Array.prototype.lastIndexOf&&-1==[0,1].lastIndexOf(0,-3)||(Array.prototype.lastIndexOf=function(t){var e=y&&"[object String]"==m(this)?this.split(""):R(this),n=e.length>>>0
if(!n)return-1
var r=n-1
for(arguments.length>1&&(r=Math.min(r,o(arguments[1]))),r=r>=0?r:n-Math.abs(r);r>=0;r--)if(r in e&&t===e[r])return r
return-1}),Object.getPrototypeOf||(Object.getPrototypeOf=function(t){return t.__proto__||(t.constructor?t.constructor.prototype:p)}),!Object.getOwnPropertyDescriptor){Object.getOwnPropertyDescriptor=function(t,e){if("object"!=typeof t&&"function"!=typeof t||null===t)throw new TypeError("Object.getOwnPropertyDescriptor called on a non-object: "+t)
if(g(t,e)){var n
if(n={enumerable:!0,configurable:!0},l){var r=t.__proto__
t.__proto__=p
var i=c(t,e),o=u(t,e)
if(t.__proto__=r,i||o)return i&&(n.get=i),o&&(n.set=o),n}return n.value=t[e],n}}}if(Object.getOwnPropertyNames||(Object.getOwnPropertyNames=function(t){return Object.keys(t)}),!Object.create){var b
b=null===Object.prototype.__proto__?function(){return{__proto__:null}}:function(){var t={}
for(var e in t)t[e]=null
return t.constructor=t.hasOwnProperty=t.propertyIsEnumerable=t.isPrototypeOf=t.toLocaleString=t.toString=t.valueOf=t.__proto__=null,t},Object.create=function(t,e){var n
if(null===t)n=b()
else{if("object"!=typeof t)throw new TypeError("typeof prototype["+typeof t+"] != 'object'")
var r=function(){}
r.prototype=t,(n=new r).__proto__=t}return void 0!==e&&Object.defineProperties(n,e),n}}if(Object.defineProperty){var _=i({}),j="undefined"==typeof document||i(document.createElement("div"))
if(!_||!j)var L=Object.defineProperty}if(!Object.defineProperty||L){Object.defineProperty=function(t,e,n){if("object"!=typeof t&&"function"!=typeof t||null===t)throw new TypeError("Object.defineProperty called on non-object: "+t)
if("object"!=typeof n&&"function"!=typeof n||null===n)throw new TypeError("Property description must be an object: "+n)
if(L)try{return L.call(Object,t,e,n)}catch(t){}if(g(n,"value"))if(l&&(c(t,e)||u(t,e))){var r=t.__proto__
t.__proto__=p,delete t[e],t[e]=n.value,t.__proto__=r}else t[e]=n.value
else{if(!l)throw new TypeError("getters & setters can not be defined on this javascript engine")
g(n,"get")&&s(t,e,n.get),g(n,"set")&&a(t,e,n.set)}return t}}Object.defineProperties||(Object.defineProperties=function(t,e){for(var n in e)g(e,n)&&Object.defineProperty(t,n,e[n])
return t}),Object.seal||(Object.seal=function(t){return t}),Object.freeze||(Object.freeze=function(t){return t})
try{Object.freeze(function(){})}catch(t){Object.freeze=function(t){return function(e){return"function"==typeof e?e:t(e)}}(Object.freeze)}if(Object.preventExtensions||(Object.preventExtensions=function(t){return t}),Object.isSealed||(Object.isSealed=function(t){return!1}),Object.isFrozen||(Object.isFrozen=function(t){return!1}),Object.isExtensible||(Object.isExtensible=function(t){if(Object(t)===t)throw new TypeError
for(var e="";g(t,e);)e+="?"
t[e]=!0
var n=g(t,e)
return delete t[e],n}),!Object.keys){var O=!0,P=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],x=P.length
for(var E in{toString:null})O=!1
Object.keys=function(t){if("object"!=typeof t&&"function"!=typeof t||null===t)throw new TypeError("Object.keys called on a non-object")
var e=[]
for(var n in t)g(t,n)&&e.push(n)
if(O)for(var r=0,i=x;r<i;r++){var o=P[r]
g(t,o)&&e.push(o)}return e}}Date.now||(Date.now=function(){return(new Date).getTime()})
var M="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"
if(!String.prototype.trim||M.trim()){M="["+M+"]"
var A=new RegExp("^"+M+M+"*"),$=new RegExp(M+M+"*$")
String.prototype.trim=function(){return String(this).replace(A,"").replace($,"")}}var R=function(t){if(null==t)throw new TypeError("can't convert "+t+" to object")
return Object(t)}})

//# sourceMappingURL=https://assets.kayako.com/assets/ace/worker-json-897c520de415f570147daf0ff6ec1f80.map