define("bitbucket/internal/widget/async-web-panel",["module","exports","bitbucket/internal/util/promise"],function(c,a,d){Object.defineProperty(a,"__esModule",{value:!0});a.default=function(a){b++;var c="#async-web-panel-"+b;e.default.waitFor({predicate:function(){return document.querySelector(c)||!1},name:"Async web panel "+b,interval:50}).then(a,function(a){return console.error(Error(a))});return'\x3cdiv id\x3d"async-web-panel-'+b+'"\x3e\x3c/div\x3e'};var e=babelHelpers.interopRequireDefault(d),
b=0;c.exports=a["default"]});