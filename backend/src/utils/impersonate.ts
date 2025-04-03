const IMPERSIONATED_AS_KEY = "IMPERSIONATED_AS";

export const storeImpersonation= (email: string) => {
  localStorage.setItem(IMPERSIONATED_AS_KEY, email);
};

export const isImpersonated = () => {
  return !!localStorage.getItem(IMPERSIONATED_AS_KEY);
};
