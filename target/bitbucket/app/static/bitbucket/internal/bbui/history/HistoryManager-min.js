define("bitbucket/internal/bbui/history/HistoryManager",["module","exports","bitbucket/internal/util/navigator","../widget/widget"],function(f,d,g,e){Object.defineProperty(d,"__esModule",{value:!0});e=function(d){function a(b){babelHelpers.classCallCheck(this,a);var c=babelHelpers.possibleConstructorReturn(this,(a.__proto__||Object.getPrototypeOf(a)).call(this));c._localWindow=b||window;c.titleSuffix="";c._init();return c}babelHelpers.inherits(a,d);babelHelpers.createClass(a,[{key:"pushState",value:function(b,
c,a){this._localWindow.history.pushState(b,c||"",a||"");this._maybeSetTitle(c);this.trigger("changestate",{state:b})}},{key:"replaceState",value:function(b,c,a){this._localWindow.history.replaceState(b,c||"",a||"");this._maybeSetTitle(c);this.trigger("changestate",{state:b})}},{key:"state",value:function(){return this._localWindow.history.state}},{key:"initialState",value:function(b){return this._localWindow.history.replaceState(b,"",this._localWindow.location.href)}},{key:"setTitleSuffix",value:function(b){this.titleSuffix=
b||""}},{key:"_init",value:function(){var b=this,c=(0,g.isSafari)(),a=function(a){!a||c&&null===a.state||(b.trigger("popstate",a),b.trigger("changestate",a));c&&(c=!1)};this._localWindow.addEventListener("popstate",a);this._addDestroyable(function(){b._localWindow.removeEventListener("popstate",a)})}},{key:"_maybeSetTitle",value:function(a){a&&(this._localWindow.document.title=a+this.titleSuffix)}}]);return a}(babelHelpers.interopRequireDefault(e).default);d.default=e;f.exports=d["default"]});