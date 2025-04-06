import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller Dashboard",
  description: "Manage your assets and sales.",
};

export default async function SellerDashboardPage() {
  const t = await getTranslations("account");

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Seller Dashboard</h1>
        <p className="text-base-regular">
          Manage your digital assets, track sales, and update your seller profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl-semi mb-2">Sales Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Today</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div>
              <p className="text-gray-500">This Month</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div>
              <p className="text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div>
              <p className="text-gray-500">Assets Sold</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl-semi mb-2">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link href="/account/seller/assets/new" className="btn-primary">
              Upload New Asset
            </Link>
            <Link href="/account/seller/profile" className="btn-secondary">
              Edit Seller Profile
            </Link>
            <Link href="/account/seller/payouts" className="btn-secondary">
              Manage Payouts
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl-semi mb-4">Your Assets</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 italic">You haven't uploaded any assets yet.</p>
          <Link href="/account/seller/assets/new" className="btn-primary mt-4">
            Upload Your First Asset
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl-semi mb-4">Recent Orders</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 italic">No recent orders.</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl-semi mb-4">Seller Settings</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-medium mb-2">Square Payment Account</h3>
              <p className="text-gray-500 mb-2">
                Connect your Square account to receive payments for your assets.
              </p>
              <button className="btn-primary">Connect Square Account</button>
            </div>
            <div>
              <h3 className="font-medium mb-2">Notification Settings</h3>
              <p className="text-gray-500 mb-2">
                Configure how you receive notifications about sales and reviews.
              </p>
              <button className="btn-secondary">Manage Notifications</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
