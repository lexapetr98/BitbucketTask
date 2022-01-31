define("bitbucket/internal/feature/watch/watch","module exports @atlassian/aui jquery lodash bitbucket/internal/model/page-state bitbucket/internal/util/ajax bitbucket/internal/util/events".split(" "),function(h,d,k,l,m,n,p,q){function b(a,b){var c=this;this.url=b;this.$watch=a;this.isWatching=e.default.getIsWatching();this.$watch.on("click",function(a,b){a.preventDefault();var d=!c.isWatching;c.toggleTrigger(d);return r.default.rest({url:c.url,type:c.isWatching?"DELETE":"POST",statusCode:{401:function(a,
b,c,d,e){return g.default.extend({},e,{title:f.default.I18n.getText("bitbucket.web.watch.default.error.401.title"),message:f.default.I18n.getText("bitbucket.web.watch.default.error.401.message"),fallbackUrl:!1,shouldReload:!0})},409:function(a,b,c,d,e){return g.default.extend({},e,{title:f.default.I18n.getText("bitbucket.web.watch.default.error.409.title"),fallbackUrl:!1,shouldReload:!0})}}}).done(function(){c.isWatching=d;e.default.setIsWatching(d);var a=c.isWatching?"bitbucket.internal.web.watch-button.added":
"bitbucket.internal.web.watch-button.removed",f=g.default.extend({watched:c.isWatching},b);t.default.trigger(a,c,f)}).fail(function(){c.toggleTrigger(c.isWatching)})});u.default.bindAll(this,"toggleWatch","toggleUnwatch","toggleTrigger")}Object.defineProperty(d,"__esModule",{value:!0});var f=babelHelpers.interopRequireDefault(k),g=babelHelpers.interopRequireDefault(l),u=babelHelpers.interopRequireDefault(m),e=babelHelpers.interopRequireDefault(n),r=babelHelpers.interopRequireDefault(p),t=babelHelpers.interopRequireDefault(q);
b.prototype.setIsWatching=function(a){this.toggleTrigger(a);this.isWatching=a;e.default.getIsWatching()!==a&&e.default.setIsWatching(a)};b.prototype.toggleWatch=function(){this.toggleTrigger(!0)};b.prototype.toggleUnwatch=function(){this.toggleTrigger(!1)};b.prototype.toggleTrigger=function(a){this.$watch.fadeOut(200,function(){var b=(0,g.default)(this);b.find(".aui-icon").toggleClass("aui-iconfont-watch",a).toggleClass("aui-iconfont-unwatch",!a).end().find(".watch-text").html(bitbucket.internal.feature.watch.commitLabel({isWatching:a}));
b.fadeIn(200)})};b.prototype.destroy=function(){this.isWatching=this.$watch=this.url=null};d.default=b;h.exports=d["default"]});