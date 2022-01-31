'use strict';

require(['codemirror'], function (CodeMirror) {
    var OVERLAY_NAME = 'whitespace-characters';
    var MAX_SEQ_LENGTH = 4; //Break long sequences of whitespace into groups of 4 to make populating the ::after content easier

    CodeMirror.defineOption('showWhiteSpaceCharacters', false, function (cm, currVal, prevVal) {
        if (prevVal && !currVal) {
            cm.removeOverlay(OVERLAY_NAME);
        } else if (!prevVal && currVal) {
            cm.addOverlay({
                name: OVERLAY_NAME,
                flattenSpans: false, //required to prevent adjacent whitespace spans from being merged
                token: function token(stream) {
                    var seqLength = 0;

                    if (stream.match(' ', false)) {
                        stream.eatWhile(function (char) {
                            return char === ' ' && seqLength++ < MAX_SEQ_LENGTH;
                        });
                        return 'whitespace';
                    }
                    stream.eatWhile(/[^ ]/);
                    return null;
                }
            });
        }
    });
});