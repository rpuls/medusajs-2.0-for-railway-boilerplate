// src/lib/format-provider.ts
var formatProvider = (id) => {
  const [_, name, type] = id.split("_");
  return name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") + (type ? ` (${type.toUpperCase()})` : "");
};

export {
  formatProvider
};
