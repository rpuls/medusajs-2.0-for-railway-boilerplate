import {
  optionalFloat,
  optionalInt
} from "./chunk-ZQRKUG6J.mjs";
import {
  i18n
} from "./chunk-4SVUQSQ5.mjs";
import {
  FileUpload
} from "./chunk-TYTNUPXB.mjs";
import {
  castNumber
} from "./chunk-6GU6IDUA.mjs";
import {
  Form
} from "./chunk-WAYDNCEG.mjs";

// src/routes/products/product-create/utils.ts
var normalizeProductFormValues = (values) => {
  const thumbnail = values.media?.find((media) => media.isThumbnail)?.url;
  const images = values.media?.filter((media) => !media.isThumbnail).map((media) => ({ url: media.url }));
  return {
    status: values.status,
    is_giftcard: false,
    tags: values?.tags?.length ? values.tags?.map((tag) => ({ id: tag })) : void 0,
    sales_channels: values?.sales_channels?.length ? values.sales_channels?.map((sc) => ({ id: sc.id })) : void 0,
    images,
    collection_id: values.collection_id || void 0,
    shipping_profile_id: values.shipping_profile_id || void 0,
    categories: values.categories.map((id) => ({ id })),
    type_id: values.type_id || void 0,
    handle: values.handle || void 0,
    origin_country: values.origin_country || void 0,
    material: values.material || void 0,
    mid_code: values.mid_code || void 0,
    hs_code: values.hs_code || void 0,
    thumbnail,
    title: values.title,
    subtitle: values.subtitle || void 0,
    description: values.description || void 0,
    discountable: values.discountable || void 0,
    width: values.width ? parseFloat(values.width) : void 0,
    length: values.length ? parseFloat(values.length) : void 0,
    height: values.height ? parseFloat(values.height) : void 0,
    weight: values.weight ? parseFloat(values.weight) : void 0,
    options: values.options.filter((o) => o.title),
    // clean temp. values
    variants: normalizeVariants(
      values.variants.filter((variant) => variant.should_create),
      values.regionsCurrencyMap
    )
  };
};
var normalizeVariants = (variants, regionsCurrencyMap) => {
  return variants.map((variant) => ({
    title: variant.title || Object.values(variant.options || {}).join(" / "),
    options: variant.options,
    sku: variant.sku || void 0,
    manage_inventory: !!variant.manage_inventory,
    allow_backorder: !!variant.allow_backorder,
    variant_rank: variant.variant_rank,
    inventory_items: variant.inventory.map((i) => {
      const quantity = i.required_quantity ? castNumber(i.required_quantity) : null;
      if (!i.inventory_item_id || !quantity) {
        return false;
      }
      return {
        ...i,
        required_quantity: quantity
      };
    }).filter(
      (item) => item !== false
    ),
    prices: Object.entries(variant.prices || {}).map(([key, value]) => {
      if (value === "" || value === void 0) {
        return void 0;
      }
      if (key.startsWith("reg_")) {
        return {
          currency_code: regionsCurrencyMap[key],
          amount: castNumber(value),
          rules: { region_id: key }
        };
      } else {
        return {
          currency_code: key,
          amount: castNumber(value)
        };
      }
    }).filter((v) => !!v)
  }));
};
var decorateVariantsWithDefaultValues = (variants) => {
  return variants.map((variant) => ({
    ...variant,
    title: variant.title || "",
    sku: variant.sku || "",
    manage_inventory: variant.manage_inventory || false,
    allow_backorder: variant.allow_backorder || false,
    inventory_kit: variant.inventory_kit || false
  }));
};

// src/routes/products/product-create/constants.ts
import { z } from "zod";
var MediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  isThumbnail: z.boolean(),
  file: z.any().nullable()
  // File
});
var ProductCreateVariantSchema = z.object({
  should_create: z.boolean(),
  is_default: z.boolean().optional(),
  title: z.string(),
  upc: z.string().optional(),
  ean: z.string().optional(),
  barcode: z.string().optional(),
  mid_code: z.string().optional(),
  hs_code: z.string().optional(),
  width: optionalInt,
  height: optionalInt,
  length: optionalInt,
  weight: optionalInt,
  material: z.string().optional(),
  origin_country: z.string().optional(),
  sku: z.string().optional(),
  manage_inventory: z.boolean().optional(),
  allow_backorder: z.boolean().optional(),
  inventory_kit: z.boolean().optional(),
  options: z.record(z.string(), z.string()),
  variant_rank: z.number(),
  prices: z.record(z.string(), optionalFloat).optional(),
  inventory: z.array(
    z.object({
      inventory_item_id: z.string(),
      required_quantity: optionalInt
    })
  ).optional()
});
var ProductCreateOptionSchema = z.object({
  title: z.string(),
  values: z.array(z.string()).min(1)
});
var ProductCreateSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  handle: z.string().optional(),
  description: z.string().optional(),
  discountable: z.boolean(),
  type_id: z.string().optional(),
  collection_id: z.string().optional(),
  shipping_profile_id: z.string().optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  sales_channels: z.array(
    z.object({
      id: z.string(),
      name: z.string()
    })
  ).optional(),
  origin_country: z.string().optional(),
  material: z.string().optional(),
  width: z.string().optional(),
  length: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  mid_code: z.string().optional(),
  hs_code: z.string().optional(),
  options: z.array(ProductCreateOptionSchema).min(1),
  enable_variants: z.boolean(),
  variants: z.array(ProductCreateVariantSchema).min(1),
  media: z.array(MediaSchema).optional()
}).superRefine((data, ctx) => {
  if (data.variants.every((v) => !v.should_create)) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["variants"],
      message: "invalid_length"
    });
  }
  const skus = /* @__PURE__ */ new Set();
  data.variants.forEach((v, index) => {
    if (v.sku) {
      if (skus.has(v.sku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`variants.${index}.sku`],
          message: i18n.t("products.create.errors.uniqueSku")
        });
      }
      skus.add(v.sku);
    }
  });
});
var EditProductMediaSchema = z.object({
  media: z.array(MediaSchema)
});
var PRODUCT_CREATE_FORM_DEFAULTS = {
  discountable: true,
  tags: [],
  sales_channels: [],
  options: [
    {
      title: "Default option",
      values: ["Default option value"]
    }
  ],
  variants: decorateVariantsWithDefaultValues([
    {
      title: "Default variant",
      should_create: true,
      variant_rank: 0,
      options: {
        "Default option": "Default option value"
      },
      inventory: [{ inventory_item_id: "", required_quantity: "" }],
      is_default: true
    }
  ]),
  enable_variants: false,
  media: [],
  categories: [],
  collection_id: "",
  shipping_profile_id: "",
  description: "",
  handle: "",
  height: "",
  hs_code: "",
  length: "",
  material: "",
  mid_code: "",
  origin_country: "",
  subtitle: "",
  title: "",
  type_id: "",
  weight: "",
  width: ""
};

// src/routes/products/common/components/upload-media-form-item/upload-media-form-item.tsx
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/svg+xml"
];
var SUPPORTED_FORMATS_FILE_EXTENSIONS = [
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".svg"
];
var UploadMediaFormItem = ({
  form,
  append,
  showHint = true
}) => {
  const { t } = useTranslation();
  const hasInvalidFiles = useCallback(
    (fileList) => {
      const invalidFile = fileList.find(
        (f) => !SUPPORTED_FORMATS.includes(f.file.type)
      );
      if (invalidFile) {
        form.setError("media", {
          type: "invalid_file",
          message: t("products.media.invalidFileType", {
            name: invalidFile.file.name,
            types: SUPPORTED_FORMATS_FILE_EXTENSIONS.join(", ")
          })
        });
        return true;
      }
      return false;
    },
    [form, t]
  );
  const onUploaded = useCallback(
    (files) => {
      form.clearErrors("media");
      if (hasInvalidFiles(files)) {
        return;
      }
      files.forEach((f) => append({ ...f, isThumbnail: false }));
    },
    [form, append, hasInvalidFiles]
  );
  return /* @__PURE__ */ jsx(
    Form.Field,
    {
      control: form.control,
      name: "media",
      render: () => {
        return /* @__PURE__ */ jsx(Form.Item, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-y-1", children: [
            /* @__PURE__ */ jsx(Form.Label, { optional: true, children: t("products.media.label") }),
            showHint && /* @__PURE__ */ jsx(Form.Hint, { children: t("products.media.editHint") })
          ] }),
          /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(
            FileUpload,
            {
              label: t("products.media.uploadImagesLabel"),
              hint: t("products.media.uploadImagesHint"),
              hasError: !!form.formState.errors.media,
              formats: SUPPORTED_FORMATS,
              onUploaded
            }
          ) }),
          /* @__PURE__ */ jsx(Form.ErrorMessage, {})
        ] }) });
      }
    }
  );
};

export {
  normalizeProductFormValues,
  decorateVariantsWithDefaultValues,
  ProductCreateSchema,
  EditProductMediaSchema,
  PRODUCT_CREATE_FORM_DEFAULTS,
  UploadMediaFormItem
};
