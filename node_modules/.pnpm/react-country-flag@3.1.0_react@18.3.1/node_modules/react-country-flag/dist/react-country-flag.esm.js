import { createElement } from 'react';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

var _excluded = ["cdnSuffix", "cdnUrl", "countryCode", "style", "svg"];
var DEFAULT_CDN_URL = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/';
var DEFAULT_CDN_SUFFIX = 'svg';
// offset between uppercase ascii and regional indicator symbols
var OFFSET = 127397;
var ReactCountryFlag = function ReactCountryFlag(_ref) {
  var _ref$cdnSuffix = _ref.cdnSuffix,
    cdnSuffix = _ref$cdnSuffix === void 0 ? DEFAULT_CDN_SUFFIX : _ref$cdnSuffix,
    _ref$cdnUrl = _ref.cdnUrl,
    cdnUrl = _ref$cdnUrl === void 0 ? DEFAULT_CDN_URL : _ref$cdnUrl,
    countryCode = _ref.countryCode,
    style = _ref.style,
    _ref$svg = _ref.svg,
    svg = _ref$svg === void 0 ? false : _ref$svg,
    props = _objectWithoutPropertiesLoose(_ref, _excluded);
  if (typeof countryCode !== 'string') {
    return null;
  }
  if (svg) {
    var flagUrl = "" + cdnUrl + countryCode.toLowerCase() + "." + cdnSuffix;
    return createElement("img", Object.assign({}, props, {
      src: flagUrl,
      style: _extends({
        display: 'inline-block',
        width: '1em',
        height: '1em',
        verticalAlign: 'middle'
      }, style)
    }));
  }
  var emoji = countryCode.toUpperCase().replace(/./g, function (_char) {
    return String.fromCodePoint(_char.charCodeAt(0) + OFFSET);
  });
  return createElement("span", Object.assign({
    role: "img"
  }, props, {
    style: _extends({
      display: 'inline-block',
      fontSize: '1em',
      lineHeight: '1em',
      verticalAlign: 'middle'
    }, style)
  }), emoji);
};

export default ReactCountryFlag;
export { ReactCountryFlag };
//# sourceMappingURL=react-country-flag.esm.js.map
