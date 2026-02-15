import React from 'react';
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Series {
  name: string;
  data: number[];
}

interface LineChartProps {
  series?: Series[];
  categories?: string[];
  isDarkMode?: boolean;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  series = [],
  categories = [],
  isDarkMode = false,
  height = 320
}) => {
  const chartData = categories.map((category, index) => {
    const dataPoint: Record<string, any> = { name: category };
    series.forEach(s => {
      dataPoint[s.name] = s.data[index];
    });
    return dataPoint;
  });

  const colors = ['#FF6900', '#3B82F6', '#10B981'];

  interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } p-3 shadow-lg`}>
          <div className={`text-xs font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>{label}</div>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div 
                  className="size-2.5 rounded-full border-2 border-background"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {entry.name}:
                </span>
                <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="4 8"
          stroke={isDarkMode ? '#374151' : '#E5E7EB'}
          strokeOpacity={1}
          horizontal={true}
          vertical={false}
        />
        
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 11, 
            fill: isDarkMode ? '#9CA3AF' : '#6B7280' 
          }}
          tickMargin={10}
        />
        
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 11, 
            fill: isDarkMode ? '#9CA3AF' : '#6B7280' 
          }}
          tickMargin={10}
        />
        
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ 
            strokeDasharray: '3 3', 
            stroke: isDarkMode ? '#374151' : '#E5E7EB' 
          }}
        />
        
        {series.map((s, index) => (
          <Line
            key={s.name}
            dataKey={s.name}
            type="monotone"
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;