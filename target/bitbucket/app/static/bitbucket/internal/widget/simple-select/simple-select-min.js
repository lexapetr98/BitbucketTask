define("bitbucket/internal/widget/simple-select/simple-select",["module","exports","jquery"],function(e,c,f){function b(a,g,c){this.options=d.default.extend({},b.prototype.defaults,c);this.$trigger=(0,d.default)(a);this.$menu=(0,d.default)(g);this.init()}Object.defineProperty(c,"__esModule",{value:!0});var d=babelHelpers.interopRequireDefault(f);b.prototype.defaults={onSelect:d.default.noop};b.prototype.init=function(){var a=this;this._setSelectedFromList();this.$menu.on("click","li",function(b){b.preventDefault();
b=(0,d.default)(this);a._setSelected(b);a.options.onSelect(b.attr("data-value"),b.text())})};b.prototype._setSelectedFromList=function(){var a=this.$menu.find("li[data-selected]");a=a.length?a:this.$menu.find("li:first");this._setSelected(a)};b.prototype._setSelected=function(a){a&&a.length&&(this.$menu.find("li[data-selected]").removeAttr("data-selected"),a.attr("data-selected",""),this.$trigger.text(a.text()))};b.prototype.updateList=function(a){this.$menu.html(a);this._setSelectedFromList()};b.prototype.getSelectedId=
function(){return this.$menu.find("li[data-selected]").attr("data-id")};b.prototype.getSelectedValue=function(){return this.$menu.find("li[data-selected]").attr("data-value")};c.default=b;e.exports=c["default"]});