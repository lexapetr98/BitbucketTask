define("bitbucket/internal/bbui/reviewer-avatar-list/reviewer-avatar-list","module exports @atlassian/aui classnames jquery lodash prop-types react bitbucket/internal/bbui/aui-react/avatar bitbucket/internal/enums ../aui-react/inline-dialog ../reviewer-avatar/reviewer-avatar ../self-reviewer/self-reviewer".split(" "),function(t,g,l,c,u,v,w,h,x,y,n,z,A){function B(a){return a.slice().sort(function(a,b){return p[a.status]-p[b.status]||a.user.displayName.localeCompare(b.user.displayName)})}Object.defineProperty(g,
"__esModule",{value:!0});var q=babelHelpers.interopRequireDefault(c),C=babelHelpers.interopRequireDefault(u),D=babelHelpers.interopRequireDefault(v);c=babelHelpers.interopRequireDefault(w);var f=babelHelpers.interopRequireDefault(h),m=babelHelpers.interopRequireDefault(y),E=babelHelpers.interopRequireDefault(n),r=babelHelpers.interopRequireDefault(z),F=babelHelpers.interopRequireDefault(A),e;h={avatarSize:c.default.string,currentUserAsReviewer:c.default.object,currentUserAvatarSize:c.default.string,
dialogReviewersAsTooltip:c.default.bool,isWatching:c.default.bool,maxOpen:c.default.number,menuId:c.default.string.isRequired,onSelfClick:c.default.func,permissionToReview:c.default.bool.isRequired,pullRequestIsOpen:c.default.bool.isRequired,reverse:c.default.bool,reviewers:c.default.array.isRequired,triggerClass:c.default.string};var p={APPROVED:1,NEEDS_WORK:2,UNAPPROVED:3},G=(e={},babelHelpers.defineProperty(e,m.default.ApprovalStatus.APPROVED,l.I18n.getText("bitbucket.component.avatar.badge.approved")),
babelHelpers.defineProperty(e,m.default.ApprovalStatus.NEEDS_WORK,l.I18n.getText("bitbucket.component.avatar.badge.needs.work")),e);e=function(a){var c=a.avatarSize||x.AvatarTShirtSize.SMALL,b=B(a.reviewers),d=a.currentUserAsReviewer?D.default.findIndex(b,function(c){return c.user.name===(a.currentUserAsReviewer.name||a.currentUserAsReviewer.user.name)}):-1,e=a.permissionToReview&&a.pullRequestIsOpen,g=e?a.maxOpen-1:a.maxOpen;-1<d&&(d=b.splice(d,1)[0],e&&!a.currentUserAvatarSize||b.unshift(d));var h=
void 0;d=void 0;b.length>g?(h=b.slice(0,g-1),d=b.slice(g-1)):(h=b,d=[]);b=h.map(function(b){return f.default.createElement(r.default,{reviewer:b,key:b.user.name,avatarSize:a.currentUserAsReviewer&&a.currentUserAvatarSize&&b.user.name===a.currentUserAsReviewer.name?a.currentUserAvatarSize:c})}).slice();e&&b.unshift(f.default.createElement(F.default,{removeSelfModalId:"remove-self-modal",currentUserAsReviewer:a.currentUserAsReviewer,isWatching:a.isWatching,key:"self_reviewer",onSelfClick:a.onSelfClick}));
if(d.length)if(a.dialogReviewersAsTooltip){var k="";d.map(function(a,b,c){k+=(0,l.escapeHtml)(a.user.displayName);a.status!==m.default.ApprovalStatus.UNAPPROVED&&(k+=" ("+G[a.status]+")");b+1<c.length&&(k+="\x3cbr\x3e")});b.push(f.default.createElement("button",{className:"overflow-reviewers-trigger overflow-reviewers-tooltip aui-button aui-button-subtle",key:"overflow-reviewers-tooltip",title:k,ref:function(a){return(0,C.default)(a).tooltip({html:!0})}},"+",d.length))}else b.push(f.default.createElement(n.InlineDialogTrigger,
{key:"trigger",dialogId:a.menuId,className:(0,q.default)("aui-button-subtle overflow-reviewers-trigger",a.triggerClass)},"+",d.length)),b.push(f.default.createElement(E.default,{key:"dialog",id:a.menuId,className:"overflow-reviewers",alignment:a.reverse?"left top":"bottom right"},f.default.createElement("div",{className:"avatar-dropdown"},f.default.createElement("ul",{className:"aui-list-truncate"},d.map(function(a){return f.default.createElement("li",{key:a.user.name},f.default.createElement(r.default,
{reviewer:a,tooltip:!1,nameOnly:!0,withName:!0}))})))));return f.default.createElement("div",{className:(0,q.default)("reviewer-avatar-list",{reviewing:a.currentUserAsReviewer,reversed:a.reverse})},a.reverse?b.reverse():b)};e.propTypes=h;g.default=e;t.exports=g["default"]});