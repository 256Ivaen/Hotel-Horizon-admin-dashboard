// WebsiteAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiMonitor,
  FiSmartphone,
  FiShield,
  FiClock
} from 'react-icons/fi';
import { TrendingUp as TrendingUpIcon } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { get } from '../../utils/service';
import DataTable from '../../components/ui/table/DataTable';
import { toast } from 'sonner';
import StatCard from '../../components/shared/StatCard';

interface WebAnalyticData {
  success: boolean;
  message: string;
  data: {
    webAnalytic: {
      pageViews: number;
      pageViewsChange: number;
      avgTime: string;
      avgTimeChange: number;
      chart: {
        series: Array<{
          name: string;
          data: number[];
        }>;
        categories: string[];
      };
    };
    visitor: {
      value: number;
      change: number;
      tip: string;
    };
    conversionRate: {
      value: number;
      change: number;
      tip: string;
    };
    adCampaign: {
      value: number;
      change: number;
      tip: string;
    };
    topPages: Array<{
      url: string;
      views: number;
      viewsChange: number;
      unique: number;
      uniqueChange: number;
    }>;
    sessionDevices: Array<{
      label: string;
      value: number;
      color: string;
      icon: string;
    }>;
    topChannels: Array<{
      name: string;
      percent: number;
      total: number;
      icon: string;
    }>;
    trafficData: Array<{
      source: string;
      visits: number;
      unique: number;
      bounce: number;
      duration: string;
      progress: number;
    }>;
  };
}

const WebsiteAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<WebAnalyticData['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: selectedPeriod
      });

      const response = await get<WebAnalyticData>(`/analytics/dashboard?${params.toString()}`);

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number = 0) => {
    return num?.toLocaleString() || '0';
  };

  const getChangeIcon = (change: number = 0) => {
    if (change > 0) return <FiTrendingUp className="text-green-500" size={14} />;
    if (change < 0) return <FiTrendingDown className="text-red-500" size={14} />;
    return null;
  };

  const getChangeColor = (change: number = 0) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  // Prepare chart data for traffic chart
  const chartData = analyticsData?.webAnalytic?.chart?.categories?.map((category, index) => {
    const totalValue = analyticsData.webAnalytic.chart.series.reduce(
      (sum, series) => sum + (series.data[index] || 0), 
      0
    );
    return {
      date: category,
      visitors: totalValue,
      natural: analyticsData.webAnalytic.chart.series[0]?.data[index] || 0,
      referral: analyticsData.webAnalytic.chart.series[1]?.data[index] || 0,
      direct: analyticsData.webAnalytic.chart.series[2]?.data[index] || 0
    };
  }) || [];

  const totalVisitors = chartData.reduce((sum, item) => sum + item.visitors, 0);
  const lastValue = chartData[chartData.length - 1]?.visitors || 0;
  const previousValue = chartData[chartData.length - 2]?.visitors || 0;
  const percentageChange = previousValue > 0 ? ((lastValue - previousValue) / previousValue) * 100 : 0;

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        date: string;
        visitors: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="text-sm font-bold text-gray-600 mb-1">{label}</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-bold">Visitors:</span>
              <span className="text-sm">{payload[0].value.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const columns = [
    {
      key: 'source',
      label: 'Source',
      render: (value: string) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    },
    {
      key: 'visits',
      label: 'Visits',
      render: (value: number) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    },
    {
      key: 'unique',
      label: 'Unique',
      render: (value: number) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    },
    {
      key: 'bounce',
      label: 'Bounce %',
      render: (value: number) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}%
        </p>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (value: string) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    }
  ];

  const topPagesColumns = [
    {
      key: 'url',
      label: 'Page URL',
      render: (value: string) => (
        <p className={`text-xs truncate max-w-[200px] ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    },
    {
      key: 'views',
      label: 'Views',
      render: (value: number, row: any) => (
        <div className="flex items-center gap-1">
          <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {value}
          </p>
          {getChangeIcon(row.viewsChange)}
          <span className={`text-[10px] ${getChangeColor(row.viewsChange)}`}>
            {row.viewsChange > 0 ? '+' : ''}{row.viewsChange}%
          </span>
        </div>
      )
    },
    {
      key: 'unique',
      label: 'Unique',
      render: (value: number, row: any) => (
        <div className="flex items-center gap-1">
          <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {value}
          </p>
          {getChangeIcon(row.uniqueChange)}
          <span className={`text-[10px] ${getChangeColor(row.uniqueChange)}`}>
            {row.uniqueChange > 0 ? '+' : ''}{row.uniqueChange}%
          </span>
        </div>
      )
    }
  ];

  const periodTabs = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      ))}
    </div>
  );

  const ChartSkeleton = () => (
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Website Analytics
            </h1>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Track your website performance and visitor insights
            </p>
          </div>
        </div>

        {/* Period Tabs */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            {periodTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedPeriod(tab.value)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  selectedPeriod === tab.value
                    ? isDarkMode 
                      ? 'bg-gray-700 text-gray-100' 
                      : 'bg-primary text-white'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <FiShield className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            <span className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</span>
          </div>
        </div>
      )}

      {analyticsData && !loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Page Views"
              value={formatNumber(analyticsData.webAnalytic?.pageViews)}
              icon={FiBarChart2}
              bgColor="bg-blue-600"
              textColor="text-white"
              footer={{
                label: "Change",
                value: `${analyticsData.webAnalytic?.pageViewsChange > 0 ? '+' : ''}${analyticsData.webAnalytic?.pageViewsChange}%`
              }}
            />
            <StatCard
              title="Avg. Time on Site"
              value={analyticsData.webAnalytic?.avgTime || '0s'}
              icon={FiClock}
              bgColor="bg-green-600"
              textColor="text-white"
              footer={{
                label: "Change",
                value: `${analyticsData.webAnalytic?.avgTimeChange > 0 ? '+' : ''}${analyticsData.webAnalytic?.avgTimeChange}%`
              }}
            />
            <StatCard
              title="Visitors"
              value={formatNumber(analyticsData.visitor?.value)}
              icon={FiUsers}
              bgColor="bg-purple-600"
              textColor="text-white"
              footer={{
                label: analyticsData.visitor?.tip || "vs last period",
                value: `${analyticsData.visitor?.change > 0 ? '+' : ''}${analyticsData.visitor?.change}%`
              }}
            />
            <StatCard
              title="Conversion Rate"
              value={`${analyticsData.conversionRate?.value}%`}
              icon={FiTrendingUp}
              bgColor="bg-amber-600"
              textColor="text-white"
              footer={{
                label: analyticsData.conversionRate?.tip || "vs last period",
                value: `${analyticsData.conversionRate?.change > 0 ? '+' : ''}${analyticsData.conversionRate?.change}%`
              }}
            />
            <StatCard
              title="Ad Campaign"
              value={formatNumber(analyticsData.adCampaign?.value)}
              icon={FiTrendingUp}
              bgColor="bg-indigo-600"
              textColor="text-white"
              footer={{
                label: analyticsData.adCampaign?.tip || "vs last period",
                value: `${analyticsData.adCampaign?.change > 0 ? '+' : ''}${analyticsData.adCampaign?.change}%`
              }}
            />
          </div>

          {/* Traffic Chart - Using the same chart style as dashboard */}
          <div className="">
            <div>
              <div className="mb-5">
                <h1 className="text-xs text-gray-600 font-light mb-1">Website Traffic</h1>
              </div>

              <div className="grow">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <defs>
                        <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#fbbf24"
                        strokeOpacity={0.2}
                        horizontal={true}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickMargin={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickFormatter={(value) => `${Math.round(value / 1000)}K`}
                        tickMargin={10}
                      />

                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ strokeDasharray: '3 3', stroke: '#d1d5db', strokeOpacity: 0.3 }}
                      />

                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="transparent"
                        fill="url(#trafficGradient)"
                        fillOpacity={1}
                      />

                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ 
                          fill: "#dc2626",
                          strokeWidth: 2, 
                          r: 4,
                          stroke: "#ffffff"
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: "#dc2626", 
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

          {/* Session Devices */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Session Devices
            </h3>
            <div className="space-y-3">
              {analyticsData.sessionDevices?.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {device.icon === "mdi:desktop-mac" ? (
                      <FiMonitor size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    ) : (
                      <FiSmartphone size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    )}
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {device.label}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {device.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Channels */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
            <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Top Channels
            </h3>
            <div className="space-y-3">
              {analyticsData.topChannels?.map((channel, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {channel.name}
                    </span>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {channel.percent}% ({channel.total})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${channel.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages Table */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Top Pages
              </h3>
            </div>
            <DataTable
              columns={topPagesColumns}
              data={analyticsData.topPages || []}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Traffic Data Table */}
          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Traffic Sources
              </h3>
            </div>
            <DataTable
              columns={columns}
              data={analyticsData.trafficData || []}
              isDarkMode={isDarkMode}
            />
          </div>
        </>
      )}

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            ))}
          </div>
          <ChartSkeleton />
          <TableSkeleton />
          <TableSkeleton />
        </div>
      )}
    </div>
  );
};

export default WebsiteAnalytics;