define("bitbucket/internal/feature/changeset/diff-tree/store/action-creators",["exports","./constants"],function(a,b){Object.defineProperty(a,"__esModule",{value:!0});a.toggleCollapse=a.selectItem=a.selectPrevItem=a.selectNextItem=a.updateParentsMap=a.updateList=void 0;a.updateList=function(a){var c=a.defaultSelected;return{type:b.UPDATE_LIST,list:a.list,defaultSelected:void 0===c?null:c}};a.updateParentsMap=function(a){return{type:b.UPDATE_PARENTS_MAP,parents:a.parents}};a.selectNextItem=function(){return{type:b.SELECT_NEXT_ITEM}};
a.selectPrevItem=function(){return{type:b.SELECT_PREV_ITEM}};a.selectItem=function(a){return{type:b.SELECT_ITEM,selectedId:a}};a.toggleCollapse=function(a){return{type:b.TOGGLE_COLLAPSE,nodeId:a}}});