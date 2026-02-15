// pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaDollarSign,
} from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import {
  Users,
  ChevronRight,
  ChevronLeftIcon,
  ChevronRightIcon,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { LabelList, Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DatePicker, parseDate } from "@ark-ui/react/date-picker";
import StatCard from "@/components/shared/StatCard";
import DataTable from "@/components/shared/DataTable";
import LineChart from "@/components/shared/LineChart";
import { get, getCurrentUser } from "@/utils/service";
import { toast } from "sonner";
import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/pie-chart";
import Drawer from "@/components/ui/drawer";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Reservation {
  id: number;
  guest_name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  status: string;
  amount: number;
}

interface Stats {
  total_revenue: number;
  monthly_revenue: number;
  revenue_change: number;
  total_bookings: number;
  monthly_bookings: number;
  bookings_change: number;
}

interface RevenueChartData {
  sales_by_month: Array<{
    month: string;
    sales: number;
  }>;
}

interface GenderDistribution {
  total: number;
  female: number;
  male: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type?: string;
}

interface DashboardResponse {
  success: boolean;
  data: {
    stats: Stats;
    revenue_chart: RevenueChartData;
    recent_reservations: Reservation[];
    gender_distribution: GenderDistribution;
    upcoming_events: UpcomingEvent[];
  };
  message?: string;
}

// Avatar with fallback icon
function ProfileAvatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? 14 : 16;

  if (!src || imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-primary flex items-center justify-center text-white shrink-0`}
      >
        <FiUser size={iconSize} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${sizeClasses} rounded-full object-cover shrink-0`}
      onError={() => setImgError(true)}
    />
  );
}

// Gender Distribution Pie Chart with description below - NON-CLICKABLE
const genderChartConfig = {
  guests: {
    label: "Guests",
  },
  female: {
    label: "Female",
    color: "#f59e0b",
  },
  male: {
    label: "Male",
    color: "#78350f",
  },
} satisfies ChartConfig;

// Custom tooltip for gender chart
const CustomGenderTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="text-sm font-bold text-gray-600 mb-1">
          {data.gender === 'female' ? 'Female' : 'Male'}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold">Guests:</span>
            <span className="text-sm">{data.guests}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function GenderDistributionChart({
  totalGuests,
  female,
  male,
}: {
  totalGuests: number;
  female: number;
  male: number;
}) {
  const chartData = [
    { gender: "female", guests: female, fill: "#f59e0b" },
    { gender: "male", guests: male, fill: "#78350f" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="aspect-square max-h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomGenderTooltip />} />
              <Pie
                data={chartData}
                innerRadius={50}
                dataKey="guests"
                nameKey="gender"
                cornerRadius={6}
                paddingAngle={3}
                cursor="default"
                activeIndex={undefined}
                activeShape={undefined}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-gray-900 text-xs font-bold"
              >
                {totalGuests}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-gray-500 text-[8px]"
              >
                Guests
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Description below the chart */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Female:
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {female}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-900 inline-block"></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Male:
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
              {male}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Calendar Component with bg-primary and white text
function CalendarWidget({
  onDateSelect,
  reservationDates = [],
}: {
  onDateSelect?: (date: Date) => void;
  reservationDates?: string[];
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const hasReservation = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return reservationDates.includes(dateStr);
  };

  return (
    <DatePicker.Root
      inline
      defaultValue={[parseDate(todayStr)]}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
      onValueChange={(details) => {
        if (details.value && details.value.length > 0 && onDateSelect) {
          const v = details.value[0];
          onDateSelect(new Date(v.year, v.month - 1, v.day));
        }
      }}
    >
      <DatePicker.Content className="p-4 w-full">
        <DatePicker.View view="day">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="flex items-center justify-between mb-3">
                  <DatePicker.PrevTrigger className="p-1.5 bg-primary text-white hover:bg-primary/90 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-full transition-colors hover:bg-primary/90">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="p-1.5 bg-primary text-white hover:bg-primary/90 rounded-full transition-colors">
                    <ChevronRightIcon className="w-4 h-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableHead>
                    <DatePicker.TableRow>
                      {api.weekDays.map((weekDay, id) => (
                        <DatePicker.TableHeader
                          key={id}
                          className="text-xs font-medium text-white w-9 h-7 text-center"
                        >
                          {weekDay.narrow}
                        </DatePicker.TableHeader>
                      ))}
                    </DatePicker.TableRow>
                  </DatePicker.TableHead>
                  <DatePicker.TableBody>
                    {api.weeks.map((week, id) => (
                      <DatePicker.TableRow key={id}>
                        {week.map((day, id) => {
                          const date = new Date(day.year, day.month - 1, day.day);
                          const isReserved = hasReservation(date);
                          const isSelected = api.value?.[0]?.day === day.day && 
                                            api.value?.[0]?.month === day.month && 
                                            api.value?.[0]?.year === day.year;
                          
                          let cellClasses = "relative w-9 h-9 text-xs transition-colors rounded-full flex items-center justify-center font-medium ";
                          
                          if (isReserved) {
                            cellClasses += "bg-green-500 text-white border-2 border-white ";
                          } else if (isSelected) {
                            cellClasses += "bg-white text-primary ";
                          } else {
                            cellClasses += "text-white hover:bg-primary/80 ";
                          }
                          
                          return (
                            <DatePicker.TableCell
                              key={id}
                              value={day}
                              className="p-0"
                            >
                              <DatePicker.TableCellTrigger className={cellClasses}>
                                {day.day}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          );
                        })}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
      </DatePicker.Content>
    </DatePicker.Root>
  );
}

// Guest Gender Widget - No borders
function GuestGenderWidget({ distribution }: { distribution: GenderDistribution }) {
  return (
    <div className="w-full">
      <GenderDistributionChart
        totalGuests={distribution.total}
        female={distribution.female}
        male={distribution.male}
      />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_revenue: 0,
    monthly_revenue: 0,
    revenue_change: 0,
    total_bookings: 0,
    monthly_bookings: 0,
    bookings_change: 0
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartData | null>(null);
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution>({
    total: 0,
    female: 0,
    male: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [reservationDates, setReservationDates] = useState<string[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
    null
  );
  const [isCalendarDrawerOpen, setIsCalendarDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const currentUser = getCurrentUser();
  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role || "admin";

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await get<DashboardResponse>("/dashboard");

      if (response.success && response.data) {
        setStats(response.data.stats);
        setRecentReservations(response.data.recent_reservations || []);
        
        // Pass the revenue chart data exactly as received from backend
        setRevenueChartData(response.data.revenue_chart);
        
        setGenderDistribution(response.data.gender_distribution);
        setUpcomingEvents(response.data.upcoming_events || []);
        
        if (response.data.recent_reservations) {
          const dates = response.data.recent_reservations.map(r => {
            const date = new Date(r.check_in);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          });
          setReservationDates(dates);
        }
      } else {
        toast.error(response.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const reservationColumns = [
    {
      key: "guest_name",
      label: "Guest",
      render: (value: string, row: Reservation) => (
        <div className="flex items-center gap-2.5">
          <ProfileAvatar name={value} size="sm" />
          <div>
            <p
              className={`text-xs font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {value}
            </p>
            <p
              className={`text-[11px] ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "room_type",
      label: "Room",
      render: (value: string) => (
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {value}
        </p>
      ),
    },
    {
      key: "check_in",
      label: "Check In",
      render: (value: string) => (
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {value}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
          completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
        };
        const statusKey = value.toLowerCase();
        const colorClass = statusColors[statusKey] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${colorClass}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      align: "right" as const,
      render: (value: number) => (
        <p
          className={`text-xs font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {formatUSD(value)}
        </p>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-0">
        <div className="mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
            <div className="hidden lg:block space-y-6">
              <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-0">
      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Main Content */}
          <div className="space-y-6 min-w-0">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Revenue"
                value={formatUSD(stats.total_revenue)}
                icon={FaDollarSign}
                footer={{
                  label: "Monthly",
                  value: formatUSD(stats.monthly_revenue),
                }}
                change={{
                  value: stats.revenue_change,
                  label: "vs last month"
                }}
              />
              <StatCard
                title="Total Bookings"
                value={stats.total_bookings}
                icon={FaUserGraduate}
                footer={{
                  label: "This Month",
                  value: stats.monthly_bookings.toString(),
                }}
                change={{
                  value: stats.bookings_change,
                  label: "vs last month"
                }}
              />
              <StatCard
                title="Average Booking"
                value={formatUSD(stats.monthly_revenue / (stats.monthly_bookings || 1))}
                icon={FaChalkboardTeacher}
                footer={{
                  label: "Per Stay",
                  value: "",
                }}
              />
            </div>

            {/* Revenue Chart */}
            {revenueChartData && (
              <LineChart 
                dashboardData={revenueChartData}
                loading={false}
              />
            )}

            {/* Recent Reservations */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recent Reservations
              </h3>
              {recentReservations.length > 0 ? (
                <DataTable
                  columns={reservationColumns}
                  data={recentReservations.slice(0, 5)}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                  No recent reservations
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Calendar and Gender Distribution */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
            <div className="bg-primary rounded-xl p-4">
              <CalendarWidget
                reservationDates={reservationDates}
                onDateSelect={(date) => {
                  setSelectedCalendarDate(date);
                  setIsCalendarDrawerOpen(true);
                }}
              />
            </div>

            {/* Guest Gender Distribution - No border */}
            <GuestGenderWidget distribution={genderDistribution} />
          </div>
        </div>
      </div>

      {/* Calendar Date Drawer */}
      <Drawer
        isOpen={isCalendarDrawerOpen}
        onClose={() => setIsCalendarDrawerOpen(false)}
        position="right"
        size="md"
        title={
          selectedCalendarDate
            ? selectedCalendarDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Date Details"
        }
      >
        <div className="p-4 space-y-4">
          {/* Reservations for selected date */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Reservations
            </h4>
            {(() => {
              const filtered = recentReservations.filter((r) => {
                if (!selectedCalendarDate) return false;
                const checkInDate = new Date(r.check_in);
                return (
                  checkInDate.toDateString() === selectedCalendarDate.toDateString()
                );
              });

              if (filtered.length === 0) {
                return (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No reservations on this date
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <ProfileAvatar name={reservation.guest_name} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {reservation.guest_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reservation.room_type} · Check-out: {reservation.check_out}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatUSD(reservation.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </Drawer>
    </div>
  );
}