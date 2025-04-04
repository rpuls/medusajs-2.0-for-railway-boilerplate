import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/components/modals/route-drawer/route-drawer.tsx
import { Drawer, clx } from "@medusajs/ui";
import { useEffect, useState as useState3 } from "react";
import { useNavigate as useNavigate2 } from "react-router-dom";

// src/components/modals/hooks/use-state-aware-to.tsx
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
var useStateAwareTo = (prev) => {
  const location = useLocation();
  const to = useMemo(() => {
    const params = location.state?.restore_params;
    if (!params) {
      return prev;
    }
    return `${prev}?${params.toString()}`;
  }, [location.state, prev]);
  return to;
};

// src/components/modals/route-modal-form/route-modal-form.tsx
import { Prompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var RouteModalForm = ({
  form,
  blockSearchParams: blockSearch = false,
  children,
  onClose
}) => {
  const { t } = useTranslation();
  const {
    formState: { isDirty }
  } = form;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const { isSubmitSuccessful } = nextLocation.state || {};
    if (isSubmitSuccessful) {
      onClose?.(true);
      return false;
    }
    const isPathChanged = currentLocation.pathname !== nextLocation.pathname;
    const isSearchChanged = currentLocation.search !== nextLocation.search;
    if (blockSearch) {
      const ret2 = isDirty && (isPathChanged || isSearchChanged);
      if (!ret2) {
        onClose?.(isSubmitSuccessful);
      }
      return ret2;
    }
    const ret = isDirty && isPathChanged;
    if (!ret) {
      onClose?.(isSubmitSuccessful);
    }
    return ret;
  });
  const handleCancel = () => {
    blocker?.reset?.();
  };
  const handleContinue = () => {
    blocker?.proceed?.();
    onClose?.(false);
  };
  return /* @__PURE__ */ jsxs(Form, { ...form, children: [
    children,
    /* @__PURE__ */ jsx(Prompt, { open: blocker.state === "blocked", variant: "confirmation", children: /* @__PURE__ */ jsxs(Prompt.Content, { children: [
      /* @__PURE__ */ jsxs(Prompt.Header, { children: [
        /* @__PURE__ */ jsx(Prompt.Title, { children: t("general.unsavedChangesTitle") }),
        /* @__PURE__ */ jsx(Prompt.Description, { children: t("general.unsavedChangesDescription") })
      ] }),
      /* @__PURE__ */ jsxs(Prompt.Footer, { children: [
        /* @__PURE__ */ jsx(Prompt.Cancel, { onClick: handleCancel, type: "button", children: t("actions.cancel") }),
        /* @__PURE__ */ jsx(Prompt.Action, { onClick: handleContinue, type: "button", children: t("actions.continue") })
      ] })
    ] }) })
  ] });
};

// src/components/modals/route-modal-provider/route-provider.tsx
import { useCallback, useMemo as useMemo2, useState } from "react";
import { useNavigate } from "react-router-dom";

// src/components/modals/route-modal-provider/route-modal-context.tsx
import { createContext } from "react";
var RouteModalProviderContext = createContext(null);

// src/components/modals/route-modal-provider/route-provider.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var RouteModalProvider = ({
  prev,
  children
}) => {
  const navigate = useNavigate();
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const handleSuccess = useCallback(
    (path) => {
      const to = path || prev;
      navigate(to, { replace: true, state: { isSubmitSuccessful: true } });
    },
    [navigate, prev]
  );
  const value = useMemo2(
    () => ({
      handleSuccess,
      setCloseOnEscape,
      __internal: { closeOnEscape }
    }),
    [handleSuccess, setCloseOnEscape, closeOnEscape]
  );
  return /* @__PURE__ */ jsx2(RouteModalProviderContext.Provider, { value, children });
};

// src/components/modals/stacked-modal-provider/stacked-modal-provider.tsx
import { useState as useState2 } from "react";

// src/components/modals/stacked-modal-provider/stacked-modal-context.tsx
import { createContext as createContext2 } from "react";
var StackedModalContext = createContext2(null);

// src/components/modals/stacked-modal-provider/stacked-modal-provider.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var StackedModalProvider = ({
  children,
  onOpenChange
}) => {
  const [state, setState] = useState2({});
  const getIsOpen = (id) => {
    return state[id] || false;
  };
  const setIsOpen = (id, open) => {
    setState((prevState) => ({
      ...prevState,
      [id]: open
    }));
    onOpenChange(open);
  };
  const register = (id) => {
    setState((prevState) => ({
      ...prevState,
      [id]: false
    }));
  };
  const unregister = (id) => {
    setState((prevState) => {
      const newState = { ...prevState };
      delete newState[id];
      return newState;
    });
  };
  return /* @__PURE__ */ jsx3(
    StackedModalContext.Provider,
    {
      value: {
        getIsOpen,
        setIsOpen,
        register,
        unregister
      },
      children
    }
  );
};

// src/components/modals/stacked-modal-provider/use-stacked-modal.ts
import { useContext } from "react";
var useStackedModal = () => {
  const context = useContext(StackedModalContext);
  if (!context) {
    throw new Error(
      "useStackedModal must be used within a StackedModalProvider"
    );
  }
  return context;
};

// src/components/modals/route-drawer/route-drawer.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var Root = ({ prev = "..", children }) => {
  const navigate = useNavigate2();
  const [open, setOpen] = useState3(false);
  const [stackedModalOpen, onStackedModalOpen] = useState3(false);
  const to = useStateAwareTo(prev);
  useEffect(() => {
    setOpen(true);
    return () => {
      setOpen(false);
      onStackedModalOpen(false);
    };
  }, []);
  const handleOpenChange = (open2) => {
    if (!open2) {
      document.body.style.pointerEvents = "auto";
      navigate(to, { replace: true });
      return;
    }
    setOpen(open2);
  };
  return /* @__PURE__ */ jsx4(Drawer, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsx4(RouteModalProvider, { prev: to, children: /* @__PURE__ */ jsx4(StackedModalProvider, { onOpenChange: onStackedModalOpen, children: /* @__PURE__ */ jsx4(
    Drawer.Content,
    {
      "aria-describedby": void 0,
      className: clx({
        "!bg-ui-bg-disabled !inset-y-5 !right-5": stackedModalOpen
      }),
      children
    }
  ) }) }) });
};
var Header = Drawer.Header;
var Title = Drawer.Title;
var Description = Drawer.Description;
var Body = Drawer.Body;
var Footer = Drawer.Footer;
var Close = Drawer.Close;
var Form2 = RouteModalForm;
var RouteDrawer = Object.assign(Root, {
  Header,
  Title,
  Body,
  Description,
  Footer,
  Close,
  Form: Form2
});

// src/components/modals/route-modal-provider/use-route-modal.tsx
import { useContext as useContext2 } from "react";
var useRouteModal = () => {
  const context = useContext2(RouteModalProviderContext);
  if (!context) {
    throw new Error("useRouteModal must be used within a RouteModalProvider");
  }
  return context;
};

// src/components/modals/route-focus-modal/route-focus-modal.tsx
import { FocusModal, clx as clx2 } from "@medusajs/ui";
import { useEffect as useEffect2, useState as useState4 } from "react";
import { useNavigate as useNavigate3 } from "react-router-dom";
import { jsx as jsx5 } from "react/jsx-runtime";
var Root2 = ({ prev = "..", children }) => {
  const navigate = useNavigate3();
  const [open, setOpen] = useState4(false);
  const [stackedModalOpen, onStackedModalOpen] = useState4(false);
  const to = useStateAwareTo(prev);
  useEffect2(() => {
    setOpen(true);
    return () => {
      setOpen(false);
      onStackedModalOpen(false);
    };
  }, []);
  const handleOpenChange = (open2) => {
    if (!open2) {
      document.body.style.pointerEvents = "auto";
      navigate(to, { replace: true });
      return;
    }
    setOpen(open2);
  };
  return /* @__PURE__ */ jsx5(FocusModal, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsx5(RouteModalProvider, { prev: to, children: /* @__PURE__ */ jsx5(StackedModalProvider, { onOpenChange: onStackedModalOpen, children: /* @__PURE__ */ jsx5(Content, { stackedModalOpen, children }) }) }) });
};
var Content = ({ stackedModalOpen, children }) => {
  const { __internal } = useRouteModal();
  const shouldPreventClose = !__internal.closeOnEscape;
  return /* @__PURE__ */ jsx5(
    FocusModal.Content,
    {
      onEscapeKeyDown: shouldPreventClose ? (e) => {
        e.preventDefault();
      } : void 0,
      className: clx2({
        "!bg-ui-bg-disabled !inset-x-5 !inset-y-3": stackedModalOpen
      }),
      children
    }
  );
};
var Header2 = FocusModal.Header;
var Title2 = FocusModal.Title;
var Description2 = FocusModal.Description;
var Footer2 = FocusModal.Footer;
var Body2 = FocusModal.Body;
var Close2 = FocusModal.Close;
var Form3 = RouteModalForm;
var RouteFocusModal = Object.assign(Root2, {
  Header: Header2,
  Title: Title2,
  Body: Body2,
  Description: Description2,
  Footer: Footer2,
  Close: Close2,
  Form: Form3
});

// src/components/modals/stacked-drawer/stacked-drawer.tsx
import { Drawer as Drawer2, clx as clx3 } from "@medusajs/ui";
import {
  forwardRef,
  useEffect as useEffect3
} from "react";
import { jsx as jsx6 } from "react/jsx-runtime";
var Root3 = ({ id, children }) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();
  useEffect3(() => {
    register(id);
    return () => unregister(id);
  }, []);
  return /* @__PURE__ */ jsx6(Drawer2, { open: getIsOpen(id), onOpenChange: (open) => setIsOpen(id, open), children });
};
var Close3 = Drawer2.Close;
Close3.displayName = "StackedDrawer.Close";
var Header3 = Drawer2.Header;
Header3.displayName = "StackedDrawer.Header";
var Body3 = Drawer2.Body;
Body3.displayName = "StackedDrawer.Body";
var Trigger = Drawer2.Trigger;
Trigger.displayName = "StackedDrawer.Trigger";
var Footer3 = Drawer2.Footer;
Footer3.displayName = "StackedDrawer.Footer";
var Title3 = Drawer2.Title;
Title3.displayName = "StackedDrawer.Title";
var Description3 = Drawer2.Description;
Description3.displayName = "StackedDrawer.Description";
var Content2 = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx6(
    Drawer2.Content,
    {
      ref,
      className: clx3(className),
      overlayProps: {
        className: "bg-transparent"
      },
      ...props
    }
  );
});
Content2.displayName = "StackedDrawer.Content";
var StackedDrawer = Object.assign(Root3, {
  Close: Close3,
  Header: Header3,
  Body: Body3,
  Content: Content2,
  Trigger,
  Footer: Footer3,
  Description: Description3,
  Title: Title3
});

// src/components/modals/stacked-focus-modal/stacked-focus-modal.tsx
import { FocusModal as FocusModal2, clx as clx4 } from "@medusajs/ui";
import {
  forwardRef as forwardRef2,
  useEffect as useEffect4
} from "react";
import { jsx as jsx7 } from "react/jsx-runtime";
var Root4 = ({
  id,
  onOpenChangeCallback,
  children
}) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();
  useEffect4(() => {
    register(id);
    return () => unregister(id);
  }, []);
  const handleOpenChange = (open) => {
    setIsOpen(id, open);
    onOpenChangeCallback?.(open);
  };
  return /* @__PURE__ */ jsx7(FocusModal2, { open: getIsOpen(id), onOpenChange: handleOpenChange, children });
};
var Close4 = FocusModal2.Close;
Close4.displayName = "StackedFocusModal.Close";
var Header4 = FocusModal2.Header;
Header4.displayName = "StackedFocusModal.Header";
var Body4 = FocusModal2.Body;
Body4.displayName = "StackedFocusModal.Body";
var Trigger2 = FocusModal2.Trigger;
Trigger2.displayName = "StackedFocusModal.Trigger";
var Footer4 = FocusModal2.Footer;
Footer4.displayName = "StackedFocusModal.Footer";
var Title4 = FocusModal2.Title;
Title4.displayName = "StackedFocusModal.Title";
var Description4 = FocusModal2.Description;
Description4.displayName = "StackedFocusModal.Description";
var Content3 = forwardRef2(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx7(
    FocusModal2.Content,
    {
      ref,
      className: clx4("!top-6", className),
      overlayProps: {
        className: "bg-transparent"
      },
      ...props
    }
  );
});
Content3.displayName = "StackedFocusModal.Content";
var StackedFocusModal = Object.assign(Root4, {
  Close: Close4,
  Header: Header4,
  Body: Body4,
  Content: Content3,
  Trigger: Trigger2,
  Footer: Footer4,
  Description: Description4,
  Title: Title4
});

export {
  useStackedModal,
  RouteDrawer,
  useRouteModal,
  RouteFocusModal,
  StackedDrawer,
  StackedFocusModal
};
