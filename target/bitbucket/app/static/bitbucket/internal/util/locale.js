define('bitbucket/internal/util/locale', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var getDocumentLocale = exports.getDocumentLocale = function getDocumentLocale() {
    return document.documentElement.lang || 'en';
  };
});