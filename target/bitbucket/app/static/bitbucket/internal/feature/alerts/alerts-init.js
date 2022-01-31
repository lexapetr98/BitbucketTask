'use strict';

/* globals jQuery:false */
document.addEventListener('DOMContentLoaded', function () {
    var $trigger = jQuery('#alerts-trigger');
    if ($trigger.length) {
        require('bitbucket/internal/feature/alerts/alerts').onReady($trigger);
    }
});