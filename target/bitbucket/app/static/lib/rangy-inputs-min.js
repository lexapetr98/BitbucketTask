/*
 Rangy Text Inputs, a cross-browser textarea and text input library plug-in for jQuery.

 Part of Rangy, a cross-browser JavaScript range and selection library
 http://code.google.com/p/rangy/

 Depends on jQuery 1.0 or later.

 Copyright 2010, Tim Down
 Licensed under the MIT license.
 Version: 0.1.205
 Build date: 5 November 2010

 Modified by Atlassian
*/
(function(p){function q(d,e){var g=typeof d[e];return"function"===g||!("object"!=g||!d[e])||"unknown"==g}function r(d,e){return!("object"!=typeof d[e]||!d[e])}function t(d,e,g){0>e&&(e+=d.value.length);"undefined"==typeof g&&(g=e);0>g&&(g+=d.value.length);return{start:e,end:g}}function l(){return r(document,"body")?document.body:document.getElementsByTagName("body")[0]}var k,h,u,m,v,w,x,y,n;p(document).ready(function(){function d(b,a){return function(){var c=this.jquery?this[0]:this,f=c.nodeName.toLowerCase();
if(1==c.nodeType&&("textarea"==f||"input"==f&&"text"==c.type)&&(c=[c].concat(Array.prototype.slice.call(arguments)),c=b.apply(this,c),!a))return c;if(a)return this}}var e=document.createElement("textarea");l().appendChild(e);if("undefined"!=typeof e.selectionStart&&"undefined"!=typeof e.selectionEnd)k=function(b){var a=b.selectionStart,c=b.selectionEnd;return{start:a,end:c,length:c-a,text:b.value.slice(a,c)}},h=function(b,a,c){a=t(b,a,c);b.selectionStart=a.start;b.selectionEnd=a.end},n=function(b,
a){a?b.selectionEnd=b.selectionStart:b.selectionStart=b.selectionEnd};else if(q(e,"createTextRange")&&r(document,"selection")&&q(document.selection,"createRange")){k=function(b){var a=0,c=0,f;if((f=document.selection.createRange())&&f.parentElement()==b){var d=b.value.replace(/\r\n/g,"\n");var e=d.length;c=b.createTextRange();c.moveToBookmark(f.getBookmark());f=b.createTextRange();f.collapse(!1);-1<c.compareEndPoints("StartToEnd",f)?a=c=e:(a=-c.moveStart("character",-e),a+=d.slice(0,a).split("\n").length-
1,-1<c.compareEndPoints("EndToEnd",f)?c=e:(c=-c.moveEnd("character",-e),c+=d.slice(0,c).split("\n").length-1))}return{start:a,end:c,length:c-a,text:b.value.slice(a,c)}};var g=function(b,a){return a-(b.value.slice(0,a).split("\r\n").length-1)};h=function(b,a,c){a=t(b,a,c);c=b.createTextRange();var f=g(b,a.start);c.collapse(!0);a.start==a.end?c.move("character",f):(c.moveEnd("character",g(b,a.end)),c.moveStart("character",f));c.select()};n=function(b,a){b=document.selection.createRange();b.collapse(a);
b.select()}}else{l().removeChild(e);window.console&&window.console.log&&window.console.log("TextInputs module for Rangy not supported in your browser. Reason: No means of finding text input caret position");return}l().removeChild(e);m=function(b,a,c,f){if(a!=c){var d=b.value;b.value=d.slice(0,a)+d.slice(c)}f&&h(b,a,a)};u=function(b){var a=k(b);m(b,a.start,a.end,!0)};y=function(b){var a=k(b);if(a.start!=a.end){var c=b.value;b.value=c.slice(0,a.start)+c.slice(a.end)}h(b,a.start,a.start);return a.text};
v=function(b,a,c,f){var d=b.value;b.value=d.slice(0,c)+a+d.slice(c);f&&(a=c+a.length,h(b,a,a))};w=function(b,a){var c=k(b),d=b.value;b.value=d.slice(0,c.start)+a+d.slice(c.end);a=c.start+a.length;h(b,a,a)};x=function(b,a,c){var d=k(b),e=b.value;b.value=e.slice(0,d.start)+a+d.text+c+e.slice(d.end);a=d.start+a.length;h(b,a,a+d.length)};p.fn.extend({getSelection:d(k,!1),setSelection:d(h,!0),collapseSelection:d(n,!0),deleteSelectedText:d(u,!0),deleteText:d(m,!0),extractSelectedText:d(y,!1),insertText:d(v,
!0),replaceSelectedText:d(w,!0),surroundSelectedText:d(x,!0)})})})(jQuery);