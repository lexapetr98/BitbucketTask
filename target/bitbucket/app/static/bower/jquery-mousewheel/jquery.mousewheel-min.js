/*
 Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
 Licensed under the MIT License (LICENSE.txt).

 Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 Thanks to: Seamus Leahy for adding deltaX and deltaY

 Version: 3.1.1

 Requires: 1.2.2+
*/
(function(c){"function"===typeof define&&define.amd?define(["jquery"],c):c(jQuery)})(function(c){function l(b){var a=b||window.event,f=[].slice.call(arguments,1),d=0,e=0,g=0;b=c.event.fix(a);b.type="mousewheel";a.wheelDelta&&(d=a.wheelDelta);a.detail&&(d=-1*a.detail);a.deltaY&&(d=g=-1*a.deltaY);a.deltaX&&(e=a.deltaX,d=-1*e);void 0!==a.wheelDeltaY&&(g=a.wheelDeltaY);void 0!==a.wheelDeltaX&&(e=-1*a.wheelDeltaX);a=Math.abs(d);if(!k||a<k)k=a;a=Math.max(Math.abs(g),Math.abs(e));if(!h||a<h)h=a;a=0<d?"floor":
"ceil";d=Math[a](d/k);e=Math[a](e/h);g=Math[a](g/h);f.unshift(b,d,e,g);return(c.event.dispatch||c.event.handle).apply(this,f)}var m=["wheel","mousewheel","DOMMouseScroll"],f="onwheel"in document||9<=document.documentMode?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],k,h;if(c.event.fixHooks)for(var n=m.length;n;)c.event.fixHooks[m[--n]]=c.event.mouseHooks;c.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var b=f.length;b;)this.addEventListener(f[--b],l,!1);
else this.onmousewheel=l},teardown:function(){if(this.removeEventListener)for(var b=f.length;b;)this.removeEventListener(f[--b],l,!1);else this.onmousewheel=null}};c.fn.extend({mousewheel:function(b){return b?this.bind("mousewheel",b):this.trigger("mousewheel")},unmousewheel:function(b){return this.unbind("mousewheel",b)}})});