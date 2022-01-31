"use strict";

/* global AppLinks:true, AJS:false, jQuery:false */
AppLinks = window.AppLinks || {};
AppLinks.SPI = jQuery.extend(AppLinks.SPI || {}, {
    showCreateEntityLinkSuggestion: function showCreateEntityLinkSuggestion() {
        return false;
    }
});