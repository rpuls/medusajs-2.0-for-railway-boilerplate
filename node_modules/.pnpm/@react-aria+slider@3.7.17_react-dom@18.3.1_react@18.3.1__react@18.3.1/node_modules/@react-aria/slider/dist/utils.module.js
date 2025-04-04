const $aa519ee6cf463259$export$d6c8d9636a3dc49c = new WeakMap();
function $aa519ee6cf463259$export$68e648cbec363a18(state, index) {
    let data = $aa519ee6cf463259$export$d6c8d9636a3dc49c.get(state);
    if (!data) throw new Error('Unknown slider state');
    return `${data.id}-${index}`;
}


export {$aa519ee6cf463259$export$d6c8d9636a3dc49c as sliderData, $aa519ee6cf463259$export$68e648cbec363a18 as getSliderThumbId};
//# sourceMappingURL=utils.module.js.map
