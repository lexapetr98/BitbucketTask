define("bitbucket/internal/feature/project/project-avatar-picker/project-avatar-picker",["module","exports","@atlassian/aui","jquery","bitbucket/internal/widget/avatar-picker-dialog/avatar-picker-dialog"],function(g,a,h,k,l){function c(b,d){this.init.apply(this,arguments)}Object.defineProperty(a,"__esModule",{value:!0});var m=babelHelpers.interopRequireDefault(h),e=babelHelpers.interopRequireDefault(k),f=babelHelpers.interopRequireDefault(l);c.prototype.init=function(b,d){this.$container=(0,e.default)(b);
var a=this.$container.find(".project-avatar-preview .aui-avatar-project img"),c=this.$container.find(".project-avatar-upload input[name\x3davatar]");b=this.$container.find(".project-avatar-upload button");a.attr("src")||(0,e.default)('\x3cdiv class\x3d"project-avatar-default-preview"\x3e\x3c/div\x3e').insertAfter(a);new f.default({dialogTitle:m.default.I18n.getText("bitbucket.web.project.avatar.picker.title"),maskShape:f.default.maskShapes.ROUNDED_SQUARE,trigger:b,onCrop:function(b){a.attr("src",
b);c.val(b)},xsrfToken:d&&d.xsrfToken?d.xsrfToken:null})};a.default=c;g.exports=a["default"]});