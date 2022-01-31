/*
 jQuery Browser Plugin 0.1.0
 https://github.com/gabceb/jquery-browser-plugin

 Original jquery-browser code Copyright 2005, 2015 jQuery Foundation, Inc. and other contributors
 http://jquery.org/license

 Modifications Copyright 2015 Gabriel Cebrian
 https://github.com/gabceb

 Released under the MIT license

 Date: 05-07-2015
*/
(function(b){"function"===typeof define&&define.amd?define(["jquery"],function(e){return b(e)}):"object"===typeof module&&"object"===typeof module.exports?module.exports=b(require("jquery")):b(window.jQuery)})(function(b){function e(a){void 0===a&&(a=window.navigator.userAgent);a=a.toLowerCase();var d=/(edge)\/([\w.]+)/.exec(a)||/(opr)[\/]([\w.]+)/.exec(a)||/(chrome)[ \/]([\w.]+)/.exec(a)||/(iemobile)[\/]([\w.]+)/.exec(a)||/(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(a)||
/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||0<=a.indexOf("trident")&&/(rv)(?::| )([\w.]+)/.exec(a)||0>a.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[],b=/(ipad)/.exec(a)||/(ipod)/.exec(a)||/(windows phone)/.exec(a)||/(iphone)/.exec(a)||/(kindle)/.exec(a)||/(silk)/.exec(a)||/(android)/.exec(a)||/(win)/.exec(a)||/(mac)/.exec(a)||/(linux)/.exec(a)||/(cros)/.exec(a)||/(playbook)/.exec(a)||/(bb)/.exec(a)||/(blackberry)/.exec(a)||
[];a={};var c=d[5]||d[3]||d[1]||"",e=d[2]||d[4]||"0";d=d[4]||d[2]||"0";b=b[0]||"";c&&(a[c]=!0,a.version=e,a.versionNumber=parseInt(d,10));b&&(a[b]=!0);if(a.android||a.bb||a.blackberry||a.ipad||a.iphone||a.ipod||a.kindle||a.playbook||a.silk||a["windows phone"])a.mobile=!0;if(a.cros||a.mac||a.linux||a.win)a.desktop=!0;if(a.chrome||a.opr||a.safari)a.webkit=!0;if(a.rv||a.iemobile)c="msie",a.msie=!0;a.edge&&(delete a.edge,c="msedge",a.msedge=!0);a.safari&&a.blackberry&&(c="blackberry",a.blackberry=!0);
a.safari&&a.playbook&&(c="playbook",a.playbook=!0);a.bb&&(c="blackberry",a.blackberry=!0);a.opr&&(c="opera",a.opera=!0);a.safari&&a.android&&(c="android",a.android=!0);a.safari&&a.kindle&&(c="kindle",a.kindle=!0);a.safari&&a.silk&&(c="silk",a.silk=!0);a.name=c;a.platform=b;return a}window.jQBrowser=e(window.navigator.userAgent);window.jQBrowser.uaMatch=e;b&&(b.browser=window.jQBrowser);return window.jQBrowser});