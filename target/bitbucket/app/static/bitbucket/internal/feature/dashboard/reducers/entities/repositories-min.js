define("bitbucket/internal/feature/dashboard/reducers/entities/repositories",["module","exports","bitbucket/internal/util/reducers","../../actions"],function(d,a,e,f){Object.defineProperty(a,"__esModule",{value:!0});a.default=(0,e.reduceByType)({},babelHelpers.defineProperty({},f.LOAD_REPOSITORIES_SUCCESS,function(a,b){b=b.payload.values.reduce(function(b,c){a.hasOwnProperty(c.id)?b[c.id]=babelHelpers.extends({},a[c.id],c):b[c.id]=c;return b},{});return babelHelpers.extends({},a,b)}));d.exports=a["default"]});