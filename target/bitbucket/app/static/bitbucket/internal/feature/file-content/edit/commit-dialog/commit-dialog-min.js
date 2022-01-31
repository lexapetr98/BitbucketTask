define("bitbucket/internal/feature/file-content/edit/commit-dialog/commit-dialog","exports @atlassian/aui jquery lodash bitbucket/util/navbuilder bitbucket/util/server bitbucket/util/state bitbucket/internal/util/analytics bitbucket/internal/util/commit bitbucket/internal/util/dom-event bitbucket/internal/widget/commit-message-editor/commit-message-editor".split(" "),function(f,b,A,B,C,D,E,F,G,H,I){function J(a,n){var c=h.default.getCurrentUser().slug,d=Date.now(),g=h.default.getFilePath().name;c=
(c+"/"+g+"-"+d).replace(/\s/g,"").replace(".","");var e=(0,b.dialog2)(bitbucket.internal.feature.edit.commitDialog.dialog({fileName:g,branchName:c}));e.$el.on("click","#create-pr-checkbox",function(){e.$el.find(".pull-request-fields").toggle(this.checked);e.$el.find(".commit-button").text(this.checked?b.I18n.getText("bitbucket.web.sourceview.button.edit.commitDialog.createPullRequest"):b.I18n.getText("bitbucket.web.sourceview.button.edit.toolbar.commit"))}).on("click",".commit-button",function(){return a(e.$el)}).on("keydown",
function(b){K.default.isCtrlEnter(b)&&(b.preventDefault(),a(e.$el))}).on("click",".cancel-button",n).on("submit",function(a){return!1});return e}function p(a,b){a=a.find("#branch-name");a.closest(".field-group").replaceWith(bitbucket.internal.feature.edit.commitDialog.branchName({errorTexts:[b],branchName:a.val()}))}function k(a,b,c,d){a.find(".aui-dialog2-content").prepend(bitbucket.internal.feature.edit.commitDialog.genericErrorMessage({errorMessage:c,errorTitle:d}));b&&(a=a.find("#create-pr-checkbox"),
a.filter(":not(:checked)").click(),a.prop("disabled",!0))}function L(a){var b=u.default.rest("branch-utils").currentRepo().addPathComponents("branches").build();return M.default.rest({url:b,type:"POST",data:{name:a,startPoint:h.default.getRef().latestCommit},statusCode:{400:!1}})}function N(a){var b=a.content,c=a.ref,d=a.message,g=a.branchName,e=a.filePath;return(a.createPullRequest?L(g):l.default.Deferred().resolve(c)).then(function(a){return(0,G.create)({branchId:a.id,sourceCommitId:c.latestCommit,
content:b,message:d,filePath:e,handledStatusCodes:[400,404,409]})})}function O(a,n,c){function d(a,b){a.attr("disabled",!b).attr("aria-disabled",!b)}a.find(".field-group .error, .aui-message.error-message").remove();var g=!0,e=a.find("#commit-message"),f=e.val(),m=a.find("#create-pr-checkbox").prop("checked"),q=a.find("#branch-name").val(),v=a.find(".button-spinner"),r=a.find(".commit-button"),t=a.find(".cancel-button");d(r,!1);d(t,!1);if(!f||/^\s*$/.test(f))e.closest(".field-group").replaceWith(bitbucket.internal.feature.edit.commitDialog.commitMessage({errorTexts:[b.I18n.getText("bitbucket.web.sourceview.edit.error.commitMessageRequired")]})),
g=!1;m&&!q&&(p(a,b.I18n.getText("bitbucket.web.sourceview.edit.error.branchNameRequired")),g=!1);if(g){v.spin();var w=h.default.getRef(),x=h.default.getFilePath();return N({content:n,ref:w,createPullRequest:m,message:f,branchName:q,filePath:x.components}).then(function(a){y.default.add("sourceEdit.edit.success",{type:m?z.PULL_REQUEST:z.COMMIT,extension:x.extension.toUpperCase()});return m?(c(),a=w.id,window.location=u.default.currentRepo().createPullRequest().sourceBranch(q).targetBranch(a).build(),
l.default.Deferred()):a},function(c){c=P.default.get(c,"responseJSON.errors[0]","");var d=c.exceptionName.split(".").pop();y.default.add("sourceEdit.edit.failed",{reason:d});switch(d){case "DuplicateRefException":p(a,b.I18n.getText("bitbucket.web.sourceview.edit.error.branchNameTaken"));break;case "InvalidRefNameException":p(a,b.I18n.getText("bitbucket.web.sourceview.edit.error.branchNameInvalid"));break;case "NoSuchObjectException":case "NoSuchBranchException":k(a,!1,(0,b.escapeHtml)(b.I18n.getText("bitbucket.web.sourceview.edit.error.branchDeleted.message")),
(0,b.escapeHtml)(b.I18n.getText("bitbucket.web.sourceview.edit.error.branchDeleted.title")));break;case "FileOutOfDateException":k(a,!0,(0,b.escapeHtml)(b.I18n.getText("bitbucket.web.sourceview.edit.error.forcePR.message")),(0,b.escapeHtml)(b.I18n.getText("bitbucket.web.sourceview.edit.error.branchMoved.title")));break;case "RepositoryHookVetoedException":d=0<=c.details.length?1<c.details.length?bitbucket.internal.feature.edit.commitDialog.errorList({details:c.details}):1===c.details.length?(0,b.escapeHtml)(c.details[0]):
"":(0,b.escapeHtml)(c.details);k(a,!0,d,(0,b.escapeHtml)(b.I18n.getText("bitbucket.web.sourceview.edit.error.hook.title")));break;default:k(a,!0,c.message)}return{error:c.exceptionName}}).always(function(){v.spinStop();d(r,!0);d(t,!0)})}d(r,!0);d(t,!0);return l.default.Deferred().resolve({error:"invalid form"})}Object.defineProperty(f,"__esModule",{value:!0});f.CommitMethods=void 0;f.show=function(a,b){var c=l.default.Deferred(),d=J(function(d){return O(d,a,b).then(function(a){a.error||c.resolve(a)})},
function(){return c.reject()}).show();(0,I.getCommitMessageEditor)(d.$el.find("#commit-message")[0]);c.always(function(){return d.remove()});return c};var l=babelHelpers.interopRequireDefault(A),P=babelHelpers.interopRequireDefault(B),u=babelHelpers.interopRequireDefault(C),M=babelHelpers.interopRequireDefault(D),h=babelHelpers.interopRequireDefault(E),y=babelHelpers.interopRequireDefault(F),K=babelHelpers.interopRequireDefault(H),z=f.CommitMethods={COMMIT:"COMMIT",PULL_REQUEST:"PULL_REQUEST"}});