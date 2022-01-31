/*
 Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
(function(){function b(){for(var c=[],d=0;d<arguments.length;d++){var a=arguments[d];if(a){var e=typeof a;if("string"===e||"number"===e)c.push(a);else if(Array.isArray(a)&&a.length)(a=b.apply(null,a))&&c.push(a);else if("object"===e)for(var f in a)g.call(a,f)&&a[f]&&c.push(f)}}return c.join(" ")}var g={}.hasOwnProperty;"undefined"!==typeof module&&module.exports?(b.default=b,module.exports=b):"function"===typeof define&&"object"===typeof define.amd&&define.amd?define("classnames",[],function(){return b}):
window.classNames=b})();