'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { sdk } from '@/lib/config'

type Asset = {
  id: string
  title: string
  thumbnail?: string
  price: number
  status: 'published' | 'draft' | 'pending_review' | 'rejected'
  sales: number
  revenue: number
  rating: number
  createdAt: string
  updatedAt: string
  engineType: string
  assetType: string
}

export function AssetsList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, you would fetch assets from your API
        // const response = await fetch('/api/seller/assets')
        // const data = await response.json()
        
        // For now, we'll use mock data
        const { products } = await sdk.products.list({
          limit: 100,
          // In a real implementation, you would filter by seller ID
        })
        
        // Transform products into assets
        const mockAssets: Asset[] = products.map(product => ({
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.variants[0]?.prices[0]?.amount / 100 || 0,
          status: product.status as any,
          sales: Math.floor(Math.random() * 100), // Mock data
          revenue: Math.floor(Math.random() * 1000), // Mock data
          rating: Math.random() * 5, // Mock data
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          engineType: product.metadata?.engineType || 'unity',
          assetType: product.metadata?.assetType || '3d',
        }))
        
        setAssets(mockAssets)
        setFilteredAssets(mockAssets)
      } catch (error) {
        console.error('Error fetching assets:', error)
        toast.error('Failed to load assets')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [])

  // Filter and sort assets when filters change
  useEffect(() => {
    let result = [...assets]
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(asset => asset.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(asset => 
        asset.title.toLowerCase().includes(query) ||
        asset.engineType.toLowerCase().includes(query) ||
        asset.assetType.toLowerCase().includes(query)
      )
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'sales-asc':
          return a.sales - b.sales
        case 'sales-desc':
          return b.sales - a.sales
        case 'revenue-asc':
          return a.revenue - b.revenue
        case 'revenue-desc':
          return b.revenue - a.revenue
        default:
          return 0
      }
    })
    
    setFilteredAssets(result)
  }, [assets, statusFilter, searchQuery, sortBy])

  const handleStatusChange = async (assetId: string, newStatus: string) => {
    try {
      // In a real implementation, you would update the asset status via API
      // await fetch(`/api/seller/assets/${assetId}/status`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // })
      
      // For now, we'll just update the local state
      setAssets(prev => 
        prev.map(asset => 
          asset.id === assetId 
            ? { ...asset, status: newStatus as any } 
            : asset
        )
      )
      
      toast.success(`Asset status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating asset status:', error)
      toast.error('Failed to update asset status')
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return
    }
    
    try {
      // In a real implementation, you would delete the asset via API
      // await fetch(`/api/seller/assets/${assetId}`, {
      //   method: 'DELETE',
      // })
      
      // For now, we'll just update the local state
      setAssets(prev => prev.filter(asset => asset.id !== assetId))
      
      toast.success('Asset deleted successfully')
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Failed to delete asset')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading assets...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low to High)</SelectItem>
              <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              <SelectItem value="sales-asc">Sales (Low to High)</SelectItem>
              <SelectItem value="sales-desc">Sales (High to Low)</SelectItem>
              <SelectItem value="revenue-asc">Revenue (Low to High)</SelectItem>
              <SelectItem value="revenue-desc">Revenue (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-40 bg-gray-100">
                    {asset.thumbnail ? (
                      <Image
                        src={asset.thumbnail}
                        alt={asset.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate">{asset.title}</h3>
                      {getStatusBadge(asset.status)}
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold">${asset.price.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">{asset.sales} sales</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{asset.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">${asset.revenue.toFixed(2)} revenue</span>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/seller/assets/${asset.id}`}>Edit</Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {asset.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'published')}>
                              Publish
                            </DropdownMenuItem>
                          )}
                          {asset.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'draft')}>
                              Move to Draft
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${asset.id}`}>View Public Page</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No assets found matching your filters.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list">
          {filteredAssets.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 p-4 font-medium border-b bg-gray-50">
                <div className="col-span-4">Asset</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Price</div>
                <div className="col-span-1 text-center">Sales</div>
                <div className="col-span-2 text-center">Revenue</div>
                <div className="col-span-1 text-center">Rating</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="grid grid-cols-12 p-4 border-b items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    {asset.thumbnail ? (
                      <div className="relative w-10 h-10 rounded overflow-hidden">
                        <Image
                          src={asset.thumbnail}
                          alt={asset.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        ?
                      </div>
                    )}
                    <span className="font-medium truncate">{asset.title}</span>
                  </div>
                  <div className="col-span-1 text-center">
                    {getStatusBadge(asset.status)}
                  </div>
                  <div className="col-span-1 text-center font-medium">
                    ${asset.price.toFixed(2)}
                  </div>
                  <div className="col-span-1 text-center">
                    {asset.sales}
                  </div>
                  <div className="col-span-2 text-center">
                    ${asset.revenue.toFixed(2)}
                  </div>
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{asset.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/account/seller/assets/${asset.id}`}>Edit</Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">Actions</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {asset.status !== 'published' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'published')}>
                              Publish
                            </DropdownMenuItem>
                          )}
                          {asset.status !== 'draft' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(asset.id, 'draft')}>
                              Move to Draft
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${asset.id}`}>View Public Page</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAsset(asset.id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No assets found matching your filters.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
