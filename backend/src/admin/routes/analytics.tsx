import { RouteConfig } from "@medusajs/admin-shared"
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react"
import { useEffect, useState } from "react"

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch analytics data from your custom API endpoint
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/admin/analytics/financial', {
          credentials: 'include',
        })
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Financial insights and performance metrics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={analyticsData?.totalRevenue || "$0"}
          icon={<DollarSign className="h-8 w-8 text-green-600" />}
          change="+12.5%"
        />
        <MetricCard
          title="Orders"
          value={analyticsData?.totalOrders || "0"}
          icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
          change="+8.2%"
        />
        <MetricCard
          title="Average Order Value"
          value={analyticsData?.averageOrderValue || "$0"}
          icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
          change="+5.1%"
        />
        <MetricCard
          title="Customers"
          value={analyticsData?.totalCustomers || "0"}
          icon={<Users className="h-8 w-8 text-orange-600" />}
          change="+15.3%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          {/* Add your chart component here */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Revenue Chart Placeholder</p>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Order Volume</h3>
          {/* Add your chart component here */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Orders Chart Placeholder</p>
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">Financial Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.monthlyData?.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.growth > 0 ? '+' : ''}{item.growth}%
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-green-600">{change}</p>
      </div>
      <div className="flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
)

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: BarChart3,
  },
}

export default AnalyticsPage 