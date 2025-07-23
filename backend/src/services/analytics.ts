import { TransactionBaseService } from "@medusajs/framework";

interface AnalyticsData {
  totalRevenue: string;
  totalOrders: string;
  averageOrderValue: string;
  totalCustomers: string;
  monthlyData: Array<{
    period: string;
    orders: number;
    revenue: string;
    growth: number;
  }>;
  conversionRate: string;
  returningCustomerRate: string;
  averageSessionDuration: string;
}

export default class AnalyticsService extends TransactionBaseService {
  async getFinancialAnalytics(): Promise<AnalyticsData> {
    try {
      // Get orders using the query service
      const query = this.container.resolve("query");
      
      // Fetch orders
      const ordersResult = await query.graph({
        entity: "order",
        fields: ["id", "total", "status", "created_at", "customer_id"],
        filters: {
          status: {
            $ne: "canceled"
          }
        }
      });

      // Fetch customers
      const customersResult = await query.graph({
        entity: "customer", 
        fields: ["id", "created_at"]
      });

      const orders = ordersResult.data;
      const customers = customersResult.data;

      // Calculate basic metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const totalCustomers = customers.length;

      // Calculate monthly data
      const monthlyData = this.calculateMonthlyData(orders);

      // Calculate additional metrics
      const conversionRate = this.calculateConversionRate(orders, customers);
      const returningCustomerRate = this.calculateReturningCustomerRate(orders);

      return {
        totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
        totalOrders: totalOrders.toString(),
        averageOrderValue: `$${(averageOrderValue / 100).toFixed(2)}`,
        totalCustomers: totalCustomers.toString(),
        monthlyData,
        conversionRate: `${conversionRate}%`,
        returningCustomerRate: `${returningCustomerRate}%`,
        averageSessionDuration: "4m 32s" // This would come from your analytics platform
      };
    } catch (error) {
      console.error("Error calculating analytics:", error);
      throw new Error("Failed to calculate analytics");
    }
  }

  private calculateMonthlyData(orders: any[]): Array<{
    period: string;
    orders: number;
    revenue: string;
    growth: number;
  }> {
    const now = new Date();
    const monthlyData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });

      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Calculate growth compared to previous month
      let growth = 0;
      if (i < 5) {
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);
        
        const prevMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
        });

        const prevMonthRevenue = prevMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        if (prevMonthRevenue > 0) {
          growth = ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
        }
      }
      
      monthlyData.push({
        period: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        orders: monthOrders.length,
        revenue: `$${(monthRevenue / 100).toFixed(2)}`,
        growth: Math.round(growth * 100) / 100
      });
    }

    return monthlyData;
  }

  private calculateConversionRate(orders: any[], customers: any[]): number {
    // Simple conversion rate calculation
    // You might want to implement more sophisticated logic based on your analytics needs
    if (customers.length === 0) return 0;
    
    const customersWithOrders = new Set(orders.map(order => order.customer_id)).size;
    return Math.round((customersWithOrders / customers.length) * 100 * 100) / 100;
  }

  private calculateReturningCustomerRate(orders: any[]): number {
    // Calculate customers who have made more than one order
    const customerOrderCounts = {};
    
    orders.forEach(order => {
      if (order.customer_id) {
        customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1;
      }
    });

    const totalCustomersWithOrders = Object.keys(customerOrderCounts).length;
    const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

    if (totalCustomersWithOrders === 0) return 0;
    
    return Math.round((returningCustomers / totalCustomersWithOrders) * 100 * 100) / 100;
  }

  // Additional analytics methods you can add:
  
  async getProductAnalytics(): Promise<any> {
    // Implement product-specific analytics
    // Top selling products, inventory turnover, etc.
  }

  async getCustomerAnalytics(): Promise<any> {
    // Implement customer-specific analytics
    // Customer lifetime value, acquisition cost, etc.
  }

  async getRevenueByRegion(): Promise<any> {
    // Implement regional revenue analytics
  }
} 