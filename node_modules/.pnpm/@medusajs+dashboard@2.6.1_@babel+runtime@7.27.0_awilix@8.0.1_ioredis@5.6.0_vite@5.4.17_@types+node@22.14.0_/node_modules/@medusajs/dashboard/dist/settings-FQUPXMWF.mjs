import "./chunk-GH77ZQI2.mjs";

// src/routes/settings/settings.tsx
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
var Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/settings") {
      navigate("/settings/store", { replace: true });
    }
  }, [location.pathname, navigate]);
  return /* @__PURE__ */ jsx(Outlet, {});
};
export {
  Settings as Component
};
