import {
  useUser
} from "./chunk-ZMMQPAR2.mjs";

// src/components/common/user-link/user-link.tsx
import { Avatar, Text } from "@medusajs/ui";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var UserLink = ({
  id,
  first_name,
  last_name,
  email,
  type = "user"
}) => {
  const name = [first_name, last_name].filter(Boolean).join(" ");
  const fallback = name ? name.slice(0, 1) : email.slice(0, 1);
  const link = type === "user" ? `/settings/users/${id}` : `/customers/${id}`;
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: link,
      className: "flex items-center gap-x-2 w-fit transition-fg hover:text-ui-fg-subtle outline-none focus-visible:shadow-borders-focus rounded-md",
      children: [
        /* @__PURE__ */ jsx(Avatar, { size: "2xsmall", fallback: fallback.toUpperCase() }),
        /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", weight: "regular", children: name || email })
      ]
    }
  );
};
var By = ({ id }) => {
  const { user } = useUser(id);
  if (!user) {
    return null;
  }
  return /* @__PURE__ */ jsx(UserLink, { ...user });
};

export {
  UserLink,
  By
};
