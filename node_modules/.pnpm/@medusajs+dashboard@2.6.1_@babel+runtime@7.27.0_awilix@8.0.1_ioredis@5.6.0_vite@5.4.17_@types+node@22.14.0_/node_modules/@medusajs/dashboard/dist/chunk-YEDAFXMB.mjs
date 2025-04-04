import {
  useSelectedParams
} from "./chunk-M3VFKDXJ.mjs";

// src/components/table/data-table/data-table-search/data-table-search.tsx
import { Input } from "@medusajs/ui";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { jsx } from "react/jsx-runtime";
var DataTableSearch = ({
  placeholder,
  prefix,
  autofocus
}) => {
  const { t } = useTranslation();
  const placeholderText = placeholder || t("general.search");
  const selectedParams = useSelectedParams({
    param: "q",
    prefix,
    multiple: false
  });
  const query = selectedParams.get();
  const debouncedOnChange = useCallback(
    debounce((e) => {
      const value = e.target.value;
      if (!value) {
        selectedParams.delete();
      } else {
        selectedParams.add(value);
      }
    }, 500),
    [selectedParams]
  );
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);
  return /* @__PURE__ */ jsx(
    Input,
    {
      autoComplete: "off",
      name: "q",
      type: "search",
      size: "small",
      autoFocus: autofocus,
      defaultValue: query?.[0] || void 0,
      onChange: debouncedOnChange,
      placeholder: placeholderText
    }
  );
};

export {
  DataTableSearch
};
