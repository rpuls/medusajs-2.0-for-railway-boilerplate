"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/tag/utils.ts
var _platform = require('@ariakit/core/utils/platform');
var _react = require('react');
function useTouchDevice() {
  const [touchDevice, setTouchDevice] = _react.useState.call(void 0, false);
  _react.useEffect.call(void 0, () => {
    setTouchDevice(_platform.isTouchDevice.call(void 0, ));
  }, []);
  return touchDevice;
}



exports.useTouchDevice = useTouchDevice;
