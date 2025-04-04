"use client";

// src/tag/utils.ts
import { isTouchDevice } from "@ariakit/core/utils/platform";
import { useEffect, useState } from "react";
function useTouchDevice() {
  const [touchDevice, setTouchDevice] = useState(false);
  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);
  return touchDevice;
}

export {
  useTouchDevice
};
