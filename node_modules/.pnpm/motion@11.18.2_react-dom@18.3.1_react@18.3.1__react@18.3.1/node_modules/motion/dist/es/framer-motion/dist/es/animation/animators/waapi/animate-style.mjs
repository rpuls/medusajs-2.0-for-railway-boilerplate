import { GroupPlaybackControls } from '../../../../../../motion-dom/dist/es/animation/controls/Group.mjs';
import '../../../../../../motion-utils/dist/es/errors.mjs';
import { animateElements } from './animate-elements.mjs';

const createScopedWaapiAnimate = (scope) => {
    function scopedAnimate(elementOrSelector, keyframes, options) {
        return new GroupPlaybackControls(animateElements(elementOrSelector, keyframes, options, scope));
    }
    return scopedAnimate;
};
const animateMini = /*@__PURE__*/ createScopedWaapiAnimate();

export { animateMini, createScopedWaapiAnimate };
