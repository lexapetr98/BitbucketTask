define("bitbucket/internal/page/commit/commit","module exports @atlassian/aui jquery lodash bitbucket/util/navbuilder bitbucket/internal/feature/comments/comments bitbucket/internal/feature/commit/tree-and-diff-view/tree-and-diff-view bitbucket/internal/feature/discussion/participants-list/participants-list bitbucket/internal/feature/watch/watch bitbucket/internal/layout/page-scrolling-manager bitbucket/internal/model/commit-range bitbucket/internal/model/page-state bitbucket/internal/model/participant bitbucket/internal/model/participant-collection bitbucket/internal/model/revision bitbucket/internal/model/stash-user bitbucket/internal/page/commit/commit-page-message-enricher bitbucket/internal/util/events bitbucket/internal/util/history".split(" "),
function(r,h,k,t,u,v,w,x,J,K,L,M,N,O,P,Q,R,S,T,U){function V(a){n.each(function(){var b=(0,d.default)(this),c=b.find("a").attr("data-id")===a.getId();b.toggleClass("selected",c);c&&z.text(b.find(".commitid").text())})}function A(a){f=Object.prototype.hasOwnProperty.call(l,a)?l[a]:e[0];V(f)}function B(a){return p.default.parse(window.location.href).getQueryParamValue("to")||a.length&&a[0].getId()||"ROOT"}function W(){var a=B(e);a&&a!==f.getId()&&(m.default.stop(),A(a),C.default.updateCommitRange(new D.default({untilRevision:g,
sinceRevision:f})))}function X(){m.default.on("bitbucket.internal.widget.keyboard-shortcuts.register-contexts",function(a){a.enableContext("commit");a.enableContext("diff-tree");a.enableContext("diff-view")});m.default.on("bitbucket.internal.keyboard.shortcuts.requestReturnToCommits",function(a){(this.execute?this:(0,k.whenIType)(a)).execute(function(){window.location.href=(0,d.default)("#repository-nav-commits").attr("href")})})}function Y(){var a=c.default.getCommit();a=p.default.rest().currentRepo().commit(a.getId()).watch().build();
var b=(0,d.default)(".watch a"),e=new Z.default(b,a);c.default.getCommitParticipants().on("add",function(a){var b=c.default.getCurrentUser();b&&b.getName()===a.getUser().getName()&&e.setIsWatching(!0)})}function aa(a){m.default.on("bitbucket.internal.feature.comments.commentAdded",function(b){b=new ba.default(b.author);b.getEmailAddress()===c.default.getCommit().getAuthor().emailAddress||a.findByUser(b)||a.add(new ca.default({user:b}))});new da.default(a,(0,d.default)(".participants-dropdown ul"),
(0,d.default)(".participants.plugin-item"))}function ea(a,b){fa.default.process(a.text(),b,k.escapeHtml).then(function(b){a.html(b)})}Object.defineProperty(h,"__esModule",{value:!0});var d=babelHelpers.interopRequireDefault(t),E=babelHelpers.interopRequireDefault(u),p=babelHelpers.interopRequireDefault(v),F=babelHelpers.interopRequireDefault(w),C=babelHelpers.interopRequireDefault(x),da=babelHelpers.interopRequireDefault(J),Z=babelHelpers.interopRequireDefault(K),ha=babelHelpers.interopRequireDefault(L),
D=babelHelpers.interopRequireDefault(M),c=babelHelpers.interopRequireDefault(N),ca=babelHelpers.interopRequireDefault(O),ia=babelHelpers.interopRequireDefault(P),y=babelHelpers.interopRequireDefault(Q),ba=babelHelpers.interopRequireDefault(R),fa=babelHelpers.interopRequireDefault(S),m=babelHelpers.interopRequireDefault(T),ja=babelHelpers.interopRequireDefault(U),g,e,l,f,z,n;h.default={onReady:function(a,b,h,r,t,u,G,q,v,w){q=new ia.default(E.default.reject(q,function(a){return a.user.emailAddress===
G.author.emailAddress}));c.default.extend("isWatching");c.default.extend("commitParticipants");c.default.setCommitParticipants(q);var H=d.default.Deferred();_PageDataPlugin.ready("com.atlassian.bitbucket.server.bitbucket-web:iswatching-provider","bitbucket.page.commit",function(a){c.default.setIsWatching(a.isWatching);H.resolve(a.isWatching)});g=new y.default(a);c.default.setRevisionRef(g.getRevisionReference());c.default.setCommit(g);e=E.default.map(b,function(a){return new y.default(a)});l={};if(e.length){var x=
e.length;for(b=0;b<x;b++){var I=e[b];l[I.getId()]=I}}else l.ROOT=new y.default({id:"ROOT"});(0,d.default)(document).ready(function(){return ea((0,d.default)(".commit-metadata-details .commit-message pre"),a)});(0,d.default)(".aui-page-panel-content").append(bitbucket.internal.feature.treeAndDiffView({}));(0,d.default)(".commit-metadata-details .commit-badge-oneline .commitid").tooltip({title:"data-commitid",className:"commitid-tooltip"});b=(0,d.default)(".commit-metadata-diff-to");n=b.find(".aui-dropdown2 .commit-list-item");
z=b.find(".aui-dropdown2-trigger");n.click(function(a){a.preventDefault();a=(0,d.default)(this);var b=a.find("a").attr("data-id");n.removeClass("selected");a.addClass("selected");b!==f.getId()&&(a=p.default.currentRepo().commit(g.getId()).withParams({to:b}).build(),ja.default.pushState(null,null,a),(0,d.default)(this).closest(".aui-dropdown2")[0].hide())});m.default.on("bitbucket.internal.history.changestate",W);ha.default.acceptScrollForwardingRequests();A(B(e));C.default.init(new D.default({untilRevision:g,
sinceRevision:f}),{maxChanges:h,relevantContextLines:r,numberOfParents:e.length,toolbarWebFragmentLocationPrimary:"bitbucket.commit.diff.toolbar.primary",toolbarWebFragmentLocationSecondary:"bitbucket.commit.diff.toolbar.secondary",commentMode:c.default.getCurrentUser()?F.default.commentMode.CREATE_NEW:F.default.commentMode.NONE,diffUrlBuilder:function(a){return p.default.rest().currentRepo().commit(a.commitRange).diff(a)}});X();(0,d.default)(t+" .plugin-section-primary").append(bitbucket.internal.page.commitRelatedEntityWebPanels({repository:u,
commit:G,hasRepoWrite:w}));c.default.getCurrentUser()&&(aa(q),H.done(Y));v&&(0,k.flag)({type:"success",title:k.I18n.getText("bitbucket.web.commit.unwatched.header",c.default.getCommit().getDisplayId()),close:"auto",body:k.I18n.getText("bitbucket.web.commit.unwatched.content")})}};r.exports=h["default"]});