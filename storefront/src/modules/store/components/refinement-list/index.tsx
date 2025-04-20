// src/modules/store/components/refinement-list/index.tsx

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCategoriesList } from "@lib/data/categories";
import { getCollectionsList } from "@lib/data/collections";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const RefinementList = ({ countryCode }: { countryCode: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortBy = searchParams?.get("sortBy") || "created_at";
  const [categories, setCategories] = useState<{ title: string; handle: string }[]>([]);
  const [collections, setCollections] = useState<{ title: string; handle: string }[]>([]);

  useEffect(() => {
    getCategoriesList().then(setCategories);
    getCollectionsList().then(setCollections);
  }, []);

  const handleSortChange = (order: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || "");
    newParams.set("sortBy", order);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="text-xs uppercase tracking-wide p-4 sm:p-6">
      <div className="mb-6">
        <p className="font-semibold mb-2">Sort by</p>
        <ul className="space-y-1">
          <li>
            <button
              className={sortBy === "created_at" ? "font-semibold" : ""}
              onClick={() => handleSortChange("created_at")}
            >
              Latest Arrivals
            </button>
          </li>
          <li>
            <button
              className={sortBy === "price_asc" ? "font-semibold" : ""}
              onClick={() => handleSortChange("price_asc")}
            >
              Price: Low → High
            </button>
          </li>
          <li>
            <button
              className={sortBy === "price_desc" ? "font-semibold" : ""}
              onClick={() => handleSortChange("price_desc")}
            >
              Price: High → Low
            </button>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">Category</p>
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.handle}>
              <LocalizedClientLink
                href={`/${countryCode}/categories/${c.handle}`}
                className={`hover:underline`}
              >
                {c.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-semibold mb-2">Collection</p>
        <ul className="space-y-1">
          {collections.map((c) => (
            <li key={c.handle}>
              <LocalizedClientLink
                href={`/${countryCode}/collections/${c.handle}`}
                className={`hover:underline`}
              >
                {c.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RefinementList;
