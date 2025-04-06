'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { sdk } from '@/lib/config'
import { toast } from 'sonner'

// Define types for sales data
type SalesData = {
  day: string
  sales: number
}

type AssetData = {
  id: string
  title: string
  thumbnail?: string
  sales: number
  revenue: number
  status: string
}

export default function SellerDashboard() {
  const router = useRouter()
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [assets, setAssets] = useState<AssetData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')

  // Fetch sales data and assets on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch sales data
        const response = await fetch(`/api/seller/sales?timeframe=${timeframe}`)
        if (!response.ok) throw new Error('Failed to fetch sales data')
        const data = await response.json()
        setSalesData(data.salesData)

        // Fetch seller's assets
        const { products } = await sdk.products.list({
          is_giftcard: false,
          limit: 100,
          // In a real implementation, you would filter by seller ID
        })

        // Transform products into asset data
        const assetData = products.map(product => ({
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          sales: Math.floor(Math.random() * 100), // Mock data, replace with actual sales
          revenue: Math.floor(Math.random() * 1000), // Mock data, replace with actual revenue
          status: product.status,
        }))

        setAssets(assetData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeframe])

  // Generate mock sales data if none is available
  useEffect(() => {
    if (salesData.length === 0 && !isLoading) {
      const mockData: SalesData[] = []
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12
      const labels = timeframe === 'year' ? [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ] : []

      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        
        let day
        if (timeframe === 'year') {
          day = labels[i]
        } else {
          day = `${date.getMonth() + 1}/${date.getDate()}`
        }
        
        mockData.push({
          day,
          sales: Math.floor(Math.random() * 100),
        })
      }
      
      setSalesData(mockData)
    }
  }, [salesData, isLoading, timeframe])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Button onClick={() => router.push('/account/seller/assets/new')}>
          Upload New Asset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,245.89</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assets Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.filter(a => a.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground">Out of {assets.length} total assets</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            <div className="flex space-x-4">
              <Button 
                variant={timeframe === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('week')}
              >
                Week
              </Button>
              <Button 
                variant={timeframe === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('month')}
              >
                Month
              </Button>
              <Button 
                variant={timeframe === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setTimeframe('year')}
              >
                Year
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
          <CardDescription>
            Manage your digital assets and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Assets</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="review">Under Review</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {assets.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 font-medium border-b">
                    <div className="col-span-5">Asset</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Sales</div>
                    <div className="col-span-2 text-center">Revenue</div>
                    <div className="col-span-1"></div>
                  </div>
                  {assets.map((asset) => (
                    <div key={asset.id} className="grid grid-cols-12 p-4 border-b last:border-0 items-center">
                      <div className="col-span-5 font-medium">{asset.title}</div>
                      <div className="col-span-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          asset.status === 'published' ? 'bg-green-100 text-green-800' :
                          asset.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {asset.status}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">{asset.sales}</div>
                      <div className="col-span-2 text-center">${asset.revenue.toFixed(2)}</div>
                      <div className="col-span-1 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/account/seller/assets/${asset.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't uploaded any assets yet.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/account/seller/assets/new">Upload Your First Asset</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="published" className="mt-4">
              {/* Similar content for published assets */}
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              {/* Similar content for draft assets */}
            </TabsContent>
            <TabsContent value="review" className="mt-4">
              {/* Similar content for assets under review */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            View your most recent sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent orders to display.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
