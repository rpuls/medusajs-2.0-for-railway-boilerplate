"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function SellerNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/account/seller" },
    { name: "Assets", href: "/account/seller/assets" },
    { name: "Orders", href: "/account/seller/orders" },
    { name: "Payouts", href: "/account/seller/payouts" },
    { name: "Profile", href: "/account/seller/profile" },
    { name: "Settings", href: "/account/seller/settings" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between py-4 border-b">
        <h1 className="text-2xl-semi">Seller Dashboard</h1>
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>
      
      <nav className={`${isOpen ? "block" : "hidden"} md:block mt-4`}>
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${
                  pathname === item.href
                    ? "text-black font-medium"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
