define("bitbucket/internal/bbui/aui-react/tabs",["exports","classnames","prop-types","react"],function(d,a,f,g){Object.defineProperty(d,"__esModule",{value:!0});d.Tabs=d.Tab=void 0;var h=babelHelpers.interopRequireDefault(a);a=babelHelpers.interopRequireDefault(f);var e=babelHelpers.interopRequireDefault(g);(d.Tab=function(a){return e.default.createElement("div",{className:"tabs-pane active-pane"},a.children)}).propTypes={title:a.default.string.isRequired,children:a.default.node.isRequired};(d.Tabs=
function(a){function c(a){babelHelpers.classCallCheck(this,c);var b=babelHelpers.possibleConstructorReturn(this,(c.__proto__||Object.getPrototypeOf(c)).call(this,a));b.onChange=function(a){b.setState(function(){return{selectedIndex:a}})};b.state={selectedIndex:a.startingIndex||0};return b}babelHelpers.inherits(c,a);babelHelpers.createClass(c,[{key:"render",value:function(){var a=this,b=this.props,c=b.children;b=b.className;var d=this.state.selectedIndex,f=e.default.Children.toArray(c)[d];return e.default.createElement("div",
{className:"aui-tabs horizontal-tabs "+(b||"")},e.default.createElement("ul",{className:"tabs-menu"},e.default.Children.map(c,function(c,b){return e.default.createElement("li",{className:(0,h.default)("menu-item",{"active-tab":b===d})},e.default.createElement("a",{onClick:function(){return a.onChange(b)},role:"button",tabIndex:0},c.props.title))})),f)}}]);return c}(e.default.Component)).propTypes={children:a.default.node.isRequired,onChange:a.default.func,startingIndex:a.default.number,className:a.default.string}});