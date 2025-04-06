'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AssetUploadForm } from './asset-upload-form'
import { BundleCreator } from './bundle-creator'
import { SellerProfileEditor } from './seller-profile-editor'
import { AssetsList } from './assets-list'
import { OrdersList } from './orders-list'
import { AnalyticsDashboard } from './analytics-dashboard'

// Mock data for demonstration
const mockSalesData = [
  { day: 'Mon', sales: 12 },
  { day: 'Tue', sales: 19 },
  { day: 'Wed', sales: 15 },
  { day: 'Thu', sales: 27 },
  { day: 'Fri', sales: 32 },
  { day: 'Sat', sales: 24 },
  { day: 'Sun', sales: 18 },
]

export default function SellerDashboardElements() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">My Assets</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <Button onClick={() => setActiveTab('upload')}>Upload New Asset</Button>
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
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Out of 28 total assets</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Your sales performance for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalesData}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your most recent sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock recent orders */}
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">3D Character Pack</p>
                      <p className="text-sm text-gray-500">Order #12345</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$49.99</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">Environment Assets</p>
                      <p className="text-sm text-gray-500">Order #12344</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">$29.99</p>
                      <p className="text-sm text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Assets</CardTitle>
                <CardDescription>Your best selling assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock top assets */}
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">Fantasy Character Pack</p>
                      <p className="text-sm text-gray-500">3D Models</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">68 sales</p>
                      <p className="text-sm text-green-600">$3,399.32</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <p className="font-medium">Sci-Fi UI Kit</p>
                      <p className="text-sm text-gray-500">UI/UX</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">42 sales</p>
                      <p className="text-sm text-green-600">$1,259.58</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('assets')}>
                    View All Assets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Assets Tab */}
        <TabsContent value="assets">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Assets</h1>
            <Button onClick={() => setActiveTab('upload')}>Upload New Asset</Button>
          </div>
          
          {/* This would be replaced with the actual AssetsList component */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-500">Assets list component would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">Showing all your uploaded assets with sales data and management options</p>
          </div>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Upload New Asset</h1>
            <p className="text-gray-500">Fill out the form below to upload a new digital asset to your store.</p>
          </div>
          
          {/* This would be replaced with the actual AssetUploadForm component */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-500">Asset upload form would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">With fields for title, description, price, files, categories, etc.</p>
          </div>
        </TabsContent>
        
        {/* Bundles Tab */}
        <TabsContent value="bundles">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Asset Bundles</h1>
            <p className="text-gray-500">Create and manage bundles of your digital assets.</p>
          </div>
          
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">My Bundles</TabsTrigger>
              <TabsTrigger value="create">Create Bundle</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              {/* This would be replaced with the actual BundlesList component */}
              <div className="bg-gray-100 p-8 rounded-lg text-center mt-4">
                <p className="text-gray-500">Bundles list would be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">Showing all your created bundles with sales data</p>
              </div>
            </TabsContent>
            <TabsContent value="create">
              {/* This would be replaced with the actual BundleCreator component */}
              <div className="bg-gray-100 p-8 rounded-lg text-center mt-4">
                <p className="text-gray-500">Bundle creator form would be displayed here</p>
                <p className="text-sm text-gray-400 mt-2">With fields to select assets, set pricing, etc.</p>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Orders</h1>
            <p className="text-gray-500">View and manage orders for your digital assets.</p>
          </div>
          
          {/* This would be replaced with the actual OrdersList component */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-500">Orders list would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">Showing all orders with customer details and status</p>
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-500">Detailed insights about your sales and performance.</p>
          </div>
          
          {/* This would be replaced with the actual AnalyticsDashboard component */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-500">Analytics dashboard would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">With charts, graphs, and detailed metrics</p>
          </div>
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Seller Profile</h1>
            <p className="text-gray-500">Manage your seller profile and settings.</p>
          </div>
          
          {/* This would be replaced with the actual SellerProfileEditor component */}
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <p className="text-gray-500">Seller profile editor would be displayed here</p>
            <p className="text-sm text-gray-400 mt-2">With fields for bio, profile image, banner, etc.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
