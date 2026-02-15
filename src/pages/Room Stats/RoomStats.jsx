import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { get } from '../../utils/service';
import DataTable from '../../components/ui/table/DataTable';
import { toast } from 'sonner';
import StatCard from '../../components/shared/StatCard';

const RoomAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isGooeyEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Generate last 4 months including current
  const getLast4Months = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push({
        title: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: `${year}-${month}`,
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${new Date(year, parseInt(month), 0).getDate()}`
      });
    }
    return months;
  };

  const months = getLast4Months();

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
    fetchRoomAnalytics();
  }, [activeTab]);

  const fetchRoomAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        start_date: months[activeTab].startDate,
        end_date: months[activeTab].endDate
      });

      const response = await get(`/reservations/room-stats?${params.toString()}`);

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError('Failed to fetch room analytics');
      }
    } catch (err) {
      console.error('Error fetching room analytics:', err);
      setError('Failed to load room analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    if (!analyticsData) return;

    const csvContent = [
      ['Room Type', 'Booking Count', 'Total Revenue'],
      ...analyticsData.roomTypes.map(room => [
        room.room_type,
        room.booking_count,
        formatCurrency(room.total_revenue)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-analytics-${months[activeTab].title.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTotals = () => {
    if (!analyticsData?.roomTypes) return { totalBookings: 0, totalRevenue: 0 };
    
    return analyticsData.roomTypes.reduce((acc, room) => ({
      totalBookings: acc.totalBookings + room.booking_count,
      totalRevenue: acc.totalRevenue + parseFloat(room.total_revenue)
    }), { totalBookings: 0, totalRevenue: 0 });
  };

  const totals = calculateTotals();

  const columns = [
    {
      key: 'room_type',
      label: 'Room Type',
      render: (value, row) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {row.room_type}
        </p>
      )
    },
    {
      key: 'booking_count',
      label: 'Bookings',
      render: (value) => (
        <p className={`text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {value}
        </p>
      )
    },
    {
      key: 'total_revenue',
      label: 'Revenue',
      render: (value) => (
        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {formatCurrency(value)}
        </p>
      )
    }
  ];

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
      ))}
    </div>
  );

  // Gooey Filter SVG
  const GooeyFilter = ({ id = "gooey-filter", strength = 15 }) => (
    <svg className="hidden absolute">
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Room Analytics
            </h1>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              View booking statistics by room type
            </p>
          </div>
        </div>
      </div>

      {/* Gooey Filter Tabs */}
      <div className="relative w-full flex justify-center">
        <GooeyFilter id="gooey-filter" strength={15} />

        <div className="w-full relative">
          <div
            className="absolute inset-0"
            style={{ filter: isGooeyEnabled ? "url(#gooey-filter)" : "none" }}
          >
            <div className="flex w-full">
              {months.map((_, index) => (
                <div key={index} className="relative flex-1 h-10 md:h-12">
                  {activeTab === index && (
                    <motion.div
                      layoutId="active-tab"
                      className={`absolute inset-0 ${isDarkMode ? 'bg-gray-700' : 'bg-primary'}`}
                      transition={{
                        type: "spring",
                        bounce: 0.0,
                        duration: 0.4,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Content panel */}
            <div className={`w-full min-h-[200px] ${isDarkMode ? 'bg-gray-700' : 'bg-primary'} overflow-hidden`}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeTab}
                  initial={{
                    opacity: 0,
                    y: 50,
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -50,
                    filter: "blur(10px)",
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  className="p-6 md:p-8"
                >
                  {/* Stats Cards */}
                  {analyticsData && !loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <StatCard
                        title="Total Bookings"
                        value={totals.totalBookings}
                        icon={FiBarChart2}
                        bgColor="bg-white"
                        textColor="text-black"
                      />
                      <StatCard
                        title="Total Revenue"
                        value={formatCurrency(totals.totalRevenue)}
                        icon={FiBarChart2}
                        bgColor="bg-white"
                        textColor="text-black"
                      />
                    </div>
                  )}

                  {/* Export Button */}
                  <div className="flex justify-end mb-4">
                    {analyticsData && (
                      <button
                        onClick={handleExport}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium ${
                          isDarkMode
                            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } transition-colors border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <FiDownload className="mr-2" size={14} />
                        Export CSV
                      </button>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        <FiShield className={`mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Room Types Table */}
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  } overflow-hidden`}>
                    {loading ? (
                      <TableSkeleton />
                    ) : analyticsData?.roomTypes?.length > 0 ? (
                      <DataTable
                        columns={columns}
                        data={analyticsData.roomTypes}
                        isDarkMode={isDarkMode}
                      />
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <div className={`flex flex-col items-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <FiBarChart2 size={32} className="mb-2 opacity-50" />
                          <p className="text-sm">No booking data available for this period</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Interactive text overlay, no filter */}
          <div className="relative flex w-full">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className="flex-1 h-10 md:h-12"
              >
                <span
                  className={`
                    w-full h-full flex items-center justify-center text-xs md:text-sm font-medium
                    ${activeTab === index 
                      ? isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }
                  `}
                >
                  {month.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAnalytics;