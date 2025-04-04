import {
  getCountryByIso2
} from "./chunk-VDBOSWVE.mjs";
import {
  taxRegionsQueryKeys,
  useTaxRegion
} from "./chunk-VJRTPNEA.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/routes/tax-regions/tax-region-detail/breadcrumb.tsx
import { jsx } from "react/jsx-runtime";
var TaxRegionDetailBreadcrumb = (props) => {
  const { id } = props.params || {};
  const { tax_region } = useTaxRegion(id, void 0, {
    initialData: props.data,
    enabled: Boolean(id)
  });
  if (!tax_region) {
    return null;
  }
  return /* @__PURE__ */ jsx("span", { children: getCountryByIso2(tax_region.country_code)?.display_name || tax_region.country_code?.toUpperCase() });
};

// src/routes/tax-regions/tax-region-detail/loader.ts
var taxRegionDetailQuery = (id) => ({
  queryKey: taxRegionsQueryKeys.detail(id),
  queryFn: async () => sdk.admin.taxRegion.retrieve(id)
});
var taxRegionLoader = async ({ params }) => {
  const id = params.id;
  const query = taxRegionDetailQuery(id);
  return queryClient.ensureQueryData(query);
};

export {
  TaxRegionDetailBreadcrumb,
  taxRegionLoader
};
