// src/components/common/progress-bar/progress-bar.tsx
import { motion } from "motion/react";
import { jsx } from "react/jsx-runtime";
var ProgressBar = ({ duration = 2 }) => {
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "bg-ui-fg-subtle size-full",
      initial: {
        width: "0%"
      },
      transition: {
        delay: 0.2,
        duration,
        ease: "linear"
      },
      animate: {
        width: "90%"
      },
      exit: {
        width: "100%",
        transition: { duration: 0.2, ease: "linear" }
      }
    }
  );
};

export {
  ProgressBar
};
