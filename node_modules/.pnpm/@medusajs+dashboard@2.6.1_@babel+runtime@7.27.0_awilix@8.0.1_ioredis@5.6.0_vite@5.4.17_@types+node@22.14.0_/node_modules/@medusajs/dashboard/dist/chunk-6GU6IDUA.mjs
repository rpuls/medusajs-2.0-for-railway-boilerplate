// src/lib/cast-number.ts
var castNumber = (number) => {
  return typeof number === "string" ? Number(number.replace(",", ".")) : number;
};

export {
  castNumber
};
