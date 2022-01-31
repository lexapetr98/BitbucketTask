define('bitbucket/internal/feature/repository/branch-diagram/branch-diagram', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/model/repository', 'bitbucket/internal/model/revision-reference'], function (module, exports, _jquery, _lodash, _repository, _revisionReference) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _repository2 = babelHelpers.interopRequireDefault(_repository);

    var _revisionReference2 = babelHelpers.interopRequireDefault(_revisionReference);

    function BranchDiagram(el) {
        this.$el = (0, _jquery2.default)(el);
    }

    BranchDiagram.prototype._updateRefLozenge = function (refLozengeClass, newRef, repo) {
        var $refLozenge = this.$el.find('.' + refLozengeClass);
        $refLozenge.trigger('mouseout'); // This is to hide any visible Tipsy tooltips

        if (newRef && newRef instanceof _revisionReference2.default) {
            if (!newRef.getDisplayId() && !newRef.getId()) {
                $refLozenge.addClass('invisible');
            } else {
                var newRefLozenge = bitbucket.internal.feature.repository.refLozenge({
                    ref: newRef.toJSON(),
                    repository: repo && repo instanceof _repository2.default ? repo.toJSON() : null,
                    extraClasses: refLozengeClass
                });

                if ($refLozenge.length) {
                    $refLozenge.replaceWith(newRefLozenge).removeClass('invisible');
                } else {
                    this.$el.append(newRefLozenge);
                }
            }
        } else if (newRef == null || newRef === '') {
            $refLozenge.addClass('invisible');
        }

        var isSourceAndTargetSet = this.$el.find('.source-ref').length && this.$el.find('.target-ref').length;
        this.$el.toggleClass('disabled', !isSourceAndTargetSet);
    };

    BranchDiagram.prototype.updateSourceRef = _lodash2.default.partial(BranchDiagram.prototype._updateRefLozenge, 'source-ref');
    BranchDiagram.prototype.updateTargetRef = _lodash2.default.partial(BranchDiagram.prototype._updateRefLozenge, 'target-ref');

    exports.default = BranchDiagram;
    module.exports = exports['default'];
});