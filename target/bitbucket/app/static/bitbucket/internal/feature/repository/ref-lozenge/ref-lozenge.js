define('bitbucket/internal/feature/repository/ref-lozenge/ref-lozenge', ['jquery'], function (_jquery) {
    'use strict';

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    // Using [title] in the selector causes tooltips not to close.
    (0, _jquery2.default)('.ref-lozenge').tooltip({
        live: true,
        title: 'data-ref-tooltip',
        hoverable: true,
        gravity: function gravity() {
            // Always position on screen
            return _jquery2.default.fn.tipsy.autoNS.call(this) + _jquery2.default.fn.tipsy.autoWE.call(this);
        },
        delayIn: 500,
        className: function className() {
            var $tipsy = (0, _jquery2.default)('.tipsy');
            var tipsyEl = $tipsy[0];

            // Tipsy sets positions before adding the class. This means the class can't affect the position or else bad things happen.
            // I know ref-lozenge affects the width, so I will reposition the tooltip with an offset relative to the width change.

            var className = $tipsy.prop('className');
            var isEast = /tipsy-[ns]?e/.test(className);
            var isSouth = /tipsy-s/.test(className);

            var oldWidth = isEast ? tipsyEl.offsetWidth : undefined;
            var oldHeight = isSouth ? tipsyEl.offsetHeight : undefined;

            $tipsy.addClass('ref-lozenge-tooltip');

            if (isEast) {
                var newWidth = tipsyEl.offsetWidth;
                var widthDiff = newWidth - oldWidth;
                var leftPosPx = parseFloat($tipsy.css('left'), 10);
                $tipsy.css('left', leftPosPx - widthDiff + 'px');
            }

            if (isSouth) {
                var newHeight = tipsyEl.offsetHeight;
                var heightDiff = newHeight - oldHeight;
                var topPosPx = parseFloat($tipsy.css('top'), 10);
                $tipsy.css('top', topPosPx - heightDiff + 'px');
            }

            return 'ref-lozenge-tooltip';
        }
    });
});