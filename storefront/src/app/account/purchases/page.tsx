import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getCustomerOrders } from "@/lib/data/order";
import { formatAmount } from "@/lib/util/prices";

export const metadata: Metadata = {
  title: "My Purchases",
  description: "Download your purchased digital assets.",
};

export default async function PurchasesPage() {
  // Fetch the user's orders
  const orders = await getCustomerOrders();
  
  // Extract purchased digital assets
  const purchases = orders.flatMap(order => 
    order.items
      .filter(item => item.variant?.product?.metadata?.isDigitalAsset)
      .map(item => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        orderId: order.id,
        orderDate: order.created_at,
        downloadUrl: `/api/downloads/${item.variant_id}?order_id=${order.id}`,
        version: item.variant?.product?.metadata?.version || "1.0",
        assetType: item.variant?.product?.metadata?.assetType || "other",
        engineType: item.variant?.product?.metadata?.engineType || "other",
      }))
  );

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My Purchases</h1>
        <p className="text-base-regular">
          Download your purchased digital assets.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="unity">Unity</TabsTrigger>
          <TabsTrigger value="godot">Godot</TabsTrigger>
          <TabsTrigger value="unreal">Unreal Engine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderPurchasesList(purchases)}
        </TabsContent>
        
        <TabsContent value="unity">
          {renderPurchasesList(purchases.filter(p => p.engineType === 'unity'))}
        </TabsContent>
        
        <TabsContent value="godot">
          {renderPurchasesList(purchases.filter(p => p.engineType === 'godot'))}
        </TabsContent>
        
        <TabsContent value="unreal">
          {renderPurchasesList(purchases.filter(p => p.engineType === 'unreal'))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderPurchasesList(purchases: any[]) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No assets found in this category.</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Browse Assets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {purchases.map((purchase) => (
        <Card key={purchase.id} className="overflow-hidden">
          <div className="relative h-40 bg-gray-100">
            {purchase.thumbnail ? (
              <Image
                src={purchase.thumbnail}
                alt={purchase.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{purchase.title}</CardTitle>
              <Badge variant="outline">{purchase.engineType}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Purchased on {new Date(purchase.orderDate).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Version:</span>
                <span className="font-medium">{purchase.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Type:</span>
                <span className="font-medium">{purchase.assetType}</span>
              </div>
              <Button className="mt-2" asChild>
                <a href={purchase.downloadUrl}>Download Asset</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${purchase.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
