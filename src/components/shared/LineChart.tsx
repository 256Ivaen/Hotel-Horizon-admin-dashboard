// components/shared/LineChart.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';

interface DashboardData {
  sales_by_month: Array<{
    month: string;
    sales: number;
  }>;
}

interface GraphComponentProps {
  dashboardData: DashboardData | null;
  loading: boolean;
  noBorder?: boolean;
}

const formatUSD = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      month: string;
      sales: number;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-xs uppercase font-semibold text-gray-600 mb-1">{data.month}</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold">Sales:</span>
            <span className="text-xs">{formatUSD(data.sales)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SkeletonGraph = () => (
  <div className="w-full bg-white rounded-xl p-6">
    <div className="flex flex-col items-stretch gap-5">
      <div className="mb-5">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="grow">
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function GraphComponent({ dashboardData, loading, noBorder = false }: GraphComponentProps) {
  if (loading || !dashboardData) {
    return <SkeletonGraph />;
  }

  const salesDataByMonth = dashboardData.sales_by_month;
  
  const chartData = salesDataByMonth.map(item => ({
    month: item.month,
    sales: item.sales,
  }));

  const totalSales = salesDataByMonth.reduce((sum, item) => sum + item.sales, 0);
  const currentMonthSales = salesDataByMonth[salesDataByMonth.length - 1]?.sales || 0;
  const previousMonthSales = salesDataByMonth[salesDataByMonth.length - 2]?.sales || 0;
  const growthPercentage = previousMonthSales > 0 
    ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100 
    : 0;

  // Calculate min and max for YAxis domain
  const maxSales = Math.max(...salesDataByMonth.map(d => d.sales));
  const minSales = Math.min(...salesDataByMonth.map(d => d.sales));
  const yAxisMax = Math.ceil(maxSales * 1.1 / 1000) * 1000;
  const yAxisMin = Math.max(0, Math.floor(minSales * 0.9 / 1000) * 1000);

  const primaryColor = '#5b3b18';
  const secondaryColor = '#fbbf24';

  return (
    <div className="w-full">
      <div className="mb-5">
          <h1 className="text-xs text-black font-semibold font-light mb-1">Monthly Sales Performance</h1>
        </div>
      <div className='p-4 rounded-lg border border-primary'>
        <div className="grow">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={secondaryColor}
                  strokeOpacity={0.2}
                  horizontal={true}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickMargin={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickFormatter={(value) => formatUSD(value)}
                  tickMargin={10}
                  domain={[yAxisMin, yAxisMax]}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: '#d1d5db', strokeOpacity: 0.3 }}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="transparent"
                  fill="url(#areaGradient)"
                  fillOpacity={1}
                />

                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke={primaryColor}
                  strokeWidth={2}
                  dot={{ 
                    fill: primaryColor,
                    strokeWidth: 2, 
                    r: 4,
                    stroke: "#ffffff"
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: primaryColor, 
                    stroke: "#ffffff", 
                    strokeWidth: 2 
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}