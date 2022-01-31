define("bitbucket/internal/feature/repository/search-results/search-results-list","module exports prop-types react react-dom ./search-results-item".split(" "),function(g,f,c,e,l,m){Object.defineProperty(f,"__esModule",{value:!0});c=babelHelpers.interopRequireDefault(c);var h=babelHelpers.interopRequireDefault(e),n=babelHelpers.interopRequireDefault(l),p=babelHelpers.interopRequireDefault(m);e=function(c){function d(){babelHelpers.classCallCheck(this,d);return babelHelpers.possibleConstructorReturn(this,
(d.__proto__||Object.getPrototypeOf(d)).apply(this,arguments))}babelHelpers.inherits(d,c);babelHelpers.createClass(d,[{key:"shouldComponentUpdate",value:function(a){return a.query!==this.props.query||a.repositories!==this.props.repositories||a.focusedIndex!==this.props.focusedIndex}},{key:"componentDidUpdate",value:function(a){if(!a||this.props.focusedIndex!==a.focusedIndex)if(a=this.focusedListEl){var b=a.previousSibling;a.previousSibling&&a.nextSibling?this.scrollIntoView(b,b):this.scrollIntoView(a,
b)}}},{key:"scrollIntoView",value:function(a,b){this.repoList&&(this.repoList.scrollTop=b?a.offsetTop-20:0)}},{key:"renderListWrapper",value:function(a,b,c){var d=this;return h.default.createElement("ul",{className:"repository-list search-results-container"},a.map(function(a,e){return h.default.createElement(p.default,{focused:b===e,key:a.id,repository:a,onItemClick:c,query:d.props.query,ref:function(a){b===e?d.focusedListEl=n.default.findDOMNode(a):null}})}))}},{key:"render",value:function(){var a=
this,b=this.props,c=b.EmptyState,d=b.focusedIndex,e=b.LoadMore,f=b.onItemClick,g=b.onScroll,k=b.repositories;return h.default.createElement("div",{className:"repository-list-container",ref:function(b){a.repoList=b},onScroll:function(a){return g(a.target.scrollTop)}},b.title,k&&0<k.length?this.renderListWrapper(k,d,f):c,e)}}]);return d}(e.Component);e.propTypes={repositories:c.default.array,title:c.default.node,focusedIndex:c.default.number,onItemClick:c.default.func,EmptyState:c.default.element,LoadMore:c.default.element,
query:c.default.string};f.default=e;g.exports=f["default"]});