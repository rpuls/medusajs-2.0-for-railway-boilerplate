"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useHighlight = useHighlight;
exports.usePrevious = usePrevious;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _react = require("react");
function usePrevious(value) {
  var ref = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    ref.current = value;
  });
  return ref.current;
}
function useHighlight(_ref) {
  var value = _ref.value,
    highlightUpdates = _ref.highlightUpdates,
    highlightContainer = _ref.highlightContainer;
  var prevValue = usePrevious(value);
  var isHighlight = (0, _react.useMemo)(function () {
    if (!highlightUpdates || prevValue === undefined) return false;
    // highlight if value type changed
    if ((0, _typeof2["default"])(value) !== (0, _typeof2["default"])(prevValue)) {
      return true;
    }
    if (typeof value === 'number') {
      // notice: NaN !== NaN
      if (isNaN(value) && isNaN(prevValue)) return false;
      return value !== prevValue;
    }
    // highlight if isArray changed
    if (Array.isArray(value) !== Array.isArray(prevValue)) {
      return true;
    }
    // not highlight object/function
    // deep compare they will be slow
    if ((0, _typeof2["default"])(value) === 'object' || typeof value === 'function') {
      return false;
    }

    // highlight if not equal
    if (value !== prevValue) {
      return true;
    }
  }, [highlightUpdates, value]);
  (0, _react.useEffect)(function () {
    if (highlightContainer && highlightContainer.current && isHighlight && 'animate' in highlightContainer.current) {
      highlightContainer.current.animate([{
        backgroundColor: 'var(--w-rjv-update-color, #ebcb8b)'
      }, {
        backgroundColor: ''
      }], {
        duration: 1000,
        easing: 'ease-in'
      });
    }
  }, [isHighlight, value, highlightContainer]);
}