// src/routes/api-key-management/common/utils.ts
function getApiKeyTypeFromPathname(pathname) {
  const isSecretKey = pathname.startsWith("/settings/secret-api-keys");
  switch (isSecretKey) {
    case true:
      return "secret" /* SECRET */;
    case false:
      return "publishable" /* PUBLISHABLE */;
  }
}
function getApiKeyStatusProps(revokedAt, t) {
  if (!revokedAt) {
    return {
      color: "green",
      label: t("apiKeyManagement.status.active")
    };
  }
  return {
    color: "red",
    label: t("apiKeyManagement.status.revoked")
  };
}
function getApiKeyTypeProps(type, t) {
  if (type === "publishable" /* PUBLISHABLE */) {
    return {
      color: "green",
      label: t("apiKeyManagement.type.publishable")
    };
  }
  return {
    color: "blue",
    label: t("apiKeyManagement.type.secret")
  };
}
var prettifyRedactedToken = (token) => {
  return token.replace("***", `\u2022\u2022\u2022`);
};

export {
  getApiKeyTypeFromPathname,
  getApiKeyStatusProps,
  getApiKeyTypeProps,
  prettifyRedactedToken
};
