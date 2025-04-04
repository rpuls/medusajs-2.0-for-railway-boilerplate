import {
  languages
} from "./chunk-FTTSUETK.mjs";

// src/hooks/use-date.tsx
import { format, formatDistance, sub } from "date-fns";
import { enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
var useDate = () => {
  const { i18n } = useTranslation();
  const locale = languages.find((l) => l.code === i18n.language)?.date_locale || enUS;
  const getFullDate = ({
    date,
    includeTime = false
  }) => {
    const ensuredDate = new Date(date);
    if (isNaN(ensuredDate.getTime())) {
      return "";
    }
    const timeFormat = includeTime ? "p" : "";
    return format(ensuredDate, `PP ${timeFormat}`, {
      locale
    });
  };
  function getRelativeDate(date) {
    const now = /* @__PURE__ */ new Date();
    return formatDistance(sub(new Date(date), { minutes: 0 }), now, {
      addSuffix: true,
      locale
    });
  }
  return {
    getFullDate,
    getRelativeDate
  };
};

export {
  useDate
};
