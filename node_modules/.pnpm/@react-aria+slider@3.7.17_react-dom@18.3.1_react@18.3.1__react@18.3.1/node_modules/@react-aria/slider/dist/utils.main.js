
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "sliderData", () => $28db8d634be2fa58$export$d6c8d9636a3dc49c);
$parcel$export(module.exports, "getSliderThumbId", () => $28db8d634be2fa58$export$68e648cbec363a18);
const $28db8d634be2fa58$export$d6c8d9636a3dc49c = new WeakMap();
function $28db8d634be2fa58$export$68e648cbec363a18(state, index) {
    let data = $28db8d634be2fa58$export$d6c8d9636a3dc49c.get(state);
    if (!data) throw new Error('Unknown slider state');
    return `${data.id}-${index}`;
}


//# sourceMappingURL=utils.main.js.map
