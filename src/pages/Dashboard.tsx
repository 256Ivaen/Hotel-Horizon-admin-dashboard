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
import { LabelList, Pie, PieChart } from "recharts";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Student {
  id: string;
  full_name: string;
  student_number: string;
  intake_name: string;
  created_at: string;
  status: string;
}

interface Payment {
  id: string;
  payment_reference: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  student_name: string;
}

interface Stats {
  total_students: number;
  students_added_last_year: number;
  total_instructors: number;
  instructors_added_last_year: number;
  total_staff: number;
  total_intakes: number;
  active_intakes: number;
  upcoming_intakes: number;
  completed_intakes: number;
  pending_invoices: number;
  total_revenue: number;
  monthly_revenue: number;
  outstanding_fees: number;
  total_male_students?: number;
  total_female_students?: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface ProgramDistribution {
  labels: string[];
  data: number[];
  percentages: number[];
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type?: string;
}

interface DashboardResponse {
  success: boolean;
  data?: {
    stats?: Stats;
    student_participation?: ChartData;
    revenue_chart?: {
      sales_by_month: Array<{
        month: string;
        sales: number;
        leads: number;
        conversions: number;
      }>;
    };
    program_distribution?: ProgramDistribution;
    recent_students?: Student[];
    recent_payments?: Payment[];
    upcoming_events?: UpcomingEvent[];
  };
  auth?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profile_picture: string;
      profile_picture_url: string;
    };
  };
  message?: string;
}

// Welcome Card Component - FIXED: Date top left, image right, white text, text-xs date
interface WelcomeCardProps {
  userType: string;
  userName?: string;
  className?: string;
}

function getFirstName(fullName?: string) {
  if (!fullName) return "";
  return fullName.split(' ')[0];
}

function getCurrentFormattedDate() {
  const date = new Date();
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function WelcomeCard({ userType, userName, className }: WelcomeCardProps) {
  const firstName = userName ? getFirstName(userName) : '';
  const currentDate = getCurrentFormattedDate();
  
  // Role-specific content with WORKING image URLs
  const roleContent = {
    admin: {
      title: `Welcome back, ${firstName || 'Admin'}`,
      subtitle: "Stay up to date with your portal.",
      illustration: "	https://www.thiings.co/_next/image?url=https%3A%2F…ge-Zx1NaF1IKpAnBA6OXF2LOWL7DDOWcG.png&w=1000&q=75"
    },
    systemadmin: {
      title: `Welcome back, ${firstName || 'Admin'}`,
      subtitle: "Stay up to date with your portal.",
      illustration: "https://img.icons8.com/3d-fluency/94/school-building.png"
    },
    instructor: {
      title: `Welcome back, ${firstName || 'Instructor'}`,
      subtitle: "Stay up to date with your classes.",
      illustration: "https://img.icons8.com/3d-fluency/94/teacher.png"
    },
    student: {
      title: `Welcome back, ${firstName || 'Student'}`,
      subtitle: "Stay up to date with your courses.",
      illustration: "https://img.icons8.com/3d-fluency/94/student.png"
    },
    accounts: {
      title: `Welcome back, ${firstName || 'Finance'}`,
      subtitle: "Stay up to date with your portal.",
      illustration: "https://img.icons8.com/3d-fluency/94/school-building.png"
    },
    management: {
      title: `Welcome back, ${firstName || 'Manager'}`,
      subtitle: "Stay up to date with your portal.",
      illustration: "https://img.icons8.com/3d-fluency/94/school-building.png"
    }
  };

  const content = roleContent[userType as keyof typeof roleContent] || roleContent.admin;

  return (
    <motion.div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-primary p-6 shadow-md",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ height: "200px" }}
    >
      <div className="flex h-full">
        {/* LEFT CONTENT - Date top left, Welcome message below */}
        <div className="flex-1 flex flex-col h-full">
          {/* Date - TOP LEFT CORNER with text-xs */}
          <div className="flex justify-start">
            <span className="text-xs font-medium text-white">
              {currentDate}
            </span>
          </div>
          
          {/* Welcome message - positioned at bottom */}
          <div className="flex-1 flex flex-col justify-end pb-1">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {content.title}
            </h2>
            <p className="text-sm text-white/90 mt-1">
              {content.subtitle}
            </p>
          </div>
        </div>
        
        {/* RIGHT CONTENT - Image only, full height, centered */}
        <div className="w-28 h-full flex items-center justify-end pointer-events-none">
          <img
            src={content.illustration}
            alt=""
            className="w-24 h-24 object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </motion.div>
  );
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

// Gender Distribution Pie Chart
const genderChartConfig = {
  students: {
    label: "Students",
  },
  girls: {
    label: "Girls",
    color: "#f59e0b",
  },
  boys: {
    label: "Boys",
    color: "#78350f",
  },
} satisfies ChartConfig;

function GenderDistributionChart({
  totalStudents,
  girls,
  boys,
}: {
  totalStudents: number;
  girls: number;
  boys: number;
}) {
  const chartData = [
    { gender: "girls", students: girls, fill: "var(--color-girls)" },
    { gender: "boys", students: boys, fill: "var(--color-boys)" },
  ];

  return (
    <div className="flex justify-between items-center gap-4">
      {" "}
      <ChartContainer
        config={genderChartConfig}
        className="[&_.recharts-text]:fill-background aspect-square max-h-[200px] min-w-[200px]"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="students" hideLabel />}
          />
          <Pie
            data={chartData}
            innerRadius={50}
            dataKey="students"
            nameKey="gender"
            cornerRadius={6}
            paddingAngle={3}
          >
            <LabelList
              dataKey="students"
              stroke="none"
              fontSize={11}
              fontWeight={600}
              fill="white"
              formatter={(value: number) => value.toString()}
            />
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-900 text-xs font-bold"
          >
            {totalStudents}
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-500 text-[8px]"
          >
            Students
          </text>
        </PieChart>
      </ChartContainer>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Girls:
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {girls}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-900 inline-block"></span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Boys:
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {boys}
          </span>
        </div>
      </div>
    </div>
  );
}

// Calendar Component using Ark UI DatePicker
function CalendarWidget({
  onDateSelect,
}: {
  onDateSelect?: (date: Date) => void;
}) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
      <DatePicker.Content className="rounded-xl p-4 w-full bg-card border shadow-sm">
        <DatePicker.View view="day">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="flex items-center justify-between mb-3">
                  <DatePicker.PrevTrigger className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronRightIcon className="w-4 h-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableHead>
                    <DatePicker.TableRow>
                      {api.weekDays.map((weekDay, id) => (
                        <DatePicker.TableHeader
                          key={id}
                          className="text-xs font-medium text-gray-500 dark:text-gray-400 w-9 h-7 text-center"
                        >
                          {weekDay.narrow}
                        </DatePicker.TableHeader>
                      ))}
                    </DatePicker.TableRow>
                  </DatePicker.TableHead>
                  <DatePicker.TableBody>
                    {api.weeks.map((week, id) => (
                      <DatePicker.TableRow key={id}>
                        {week.map((day, id) => (
                          <DatePicker.TableCell
                            key={id}
                            value={day}
                            className="p-0"
                          >
                            <DatePicker.TableCellTrigger className="relative w-9 h-9 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[selected]:bg-gray-900 data-[selected]:text-white rounded-lg dark:data-[selected]:bg-gray-200 dark:data-[selected]:text-gray-900 data-[outside-range]:text-gray-400 dark:data-[outside-range]:text-gray-500 flex items-center justify-center font-medium data-[today]:after:content-[''] data-[today]:after:absolute data-[today]:after:bottom-0.5 data-[today]:after:w-1 data-[today]:after:h-1 data-[today]:after:bg-gray-900 data-[today]:after:rounded-full dark:data-[today]:after:bg-gray-300 data-[selected]:data-[today]:after:bg-white dark:data-[selected]:data-[today]:after:bg-gray-900">
                              {day.day}
                            </DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
                      </DatePicker.TableRow>
                    ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
        <DatePicker.View view="month">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="flex items-center justify-between mb-4">
                  <DatePicker.PrevTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronRightIcon className="w-4 h-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableBody>
                    {api
                      .getMonthsGrid({ columns: 4, format: "short" })
                      .map((months, id) => (
                        <DatePicker.TableRow key={id}>
                          {months.map((month, id) => (
                            <DatePicker.TableCell key={id} value={month.value}>
                              <DatePicker.TableCellTrigger className="w-16 h-10 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 hover:rounded-lg dark:hover:bg-gray-700 rounded-lg transition-colors data-[selected]:bg-gray-900 data-[selected]:text-white data-[selected]:rounded-lg dark:data-[selected]:bg-gray-200 dark:data-[selected]:text-gray-900 flex items-center justify-center font-medium">
                                {month.label}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                  </DatePicker.TableBody>
                </DatePicker.Table>
              </>
            )}
          </DatePicker.Context>
        </DatePicker.View>
        <DatePicker.View view="year">
          <DatePicker.Context>
            {(api) => (
              <>
                <DatePicker.ViewControl className="flex items-center justify-between mb-4">
                  <DatePicker.PrevTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </DatePicker.PrevTrigger>
                  <DatePicker.ViewTrigger className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors">
                    <DatePicker.RangeText />
                  </DatePicker.ViewTrigger>
                  <DatePicker.NextTrigger className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-700 dark:text-gray-300">
                    <ChevronRightIcon className="w-4 h-4" />
                  </DatePicker.NextTrigger>
                </DatePicker.ViewControl>
                <DatePicker.Table className="w-full border-separate border-spacing-y-0.5">
                  <DatePicker.TableBody>
                    {api.getYearsGrid({ columns: 4 }).map((years, id) => (
                      <DatePicker.TableRow key={id}>
                        {years.map((year, id) => (
                          <DatePicker.TableCell key={id} value={year.value}>
                            <DatePicker.TableCellTrigger className="w-16 h-10 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 hover:rounded-lg dark:hover:bg-gray-700 rounded-lg transition-colors data-[selected]:bg-gray-900 data-[selected]:text-white data-[selected]:rounded-lg dark:data-[selected]:bg-gray-200 dark:data-[selected]:text-gray-900 flex items-center justify-center font-medium">
                              {year.label}
                            </DatePicker.TableCellTrigger>
                          </DatePicker.TableCell>
                        ))}
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

// Upcoming Events Component
function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayEvents =
    events.length > 0
      ? events
      : [
          {
            id: "1",
            title: "No upcoming events",
            date: new Date().toISOString(),
            type: "info",
          },
        ];

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Upcoming Events
      </h3>
      <div className="space-y-1">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 py-2.5 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {event.title}
                </p>
              </div>
            </div>
            {events.length > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_students: 0,
    students_added_last_year: 0,
    total_instructors: 0,
    instructors_added_last_year: 0,
    total_staff: 0,
    total_intakes: 0,
    active_intakes: 0,
    upcoming_intakes: 0,
    completed_intakes: 0,
    pending_invoices: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    outstanding_fees: 0,
    total_male_students: 0,
    total_female_students: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
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
      let endpoint = "/admin/dashboard";

      switch (userRole) {
        case "admin":
          endpoint = "/admin/dashboard";
          break;
        case "accounts":
          endpoint = "/accounts/dashboard";
          break;
        case "management":
          endpoint = "/management/dashboard";
          break;
        case "instructor":
          endpoint = "/instructor/dashboard";
          break;
        case "student":
          endpoint = "/student/dashboard";
          break;
        default:
          endpoint = "/admin/dashboard";
      }

      const response = await get<DashboardResponse>(endpoint);

      if (response.success && response.data) {
        if (response.data.stats) {
          setStats(response.data.stats);
        }

        if (response.data.revenue_chart) {
          setRevenueChartData(response.data.revenue_chart);
        }

        if (response.data.recent_payments) {
          setRecentPayments(response.data.recent_payments);
        }

        if (response.data.upcoming_events) {
          setUpcomingEvents(response.data.upcoming_events);
        }

        if (response.auth?.user) {
          setUserProfile(response.auth.user);
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

  const formatCurrency = (amount: number): string => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getProfilePicture = () => {
    if (userProfile?.profile_picture_url) {
      return userProfile.profile_picture_url;
    }
    return null;
  };

  const paymentColumns = [
    {
      key: "student_name",
      label: "Student",
      render: (value: string, row: Payment) => (
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
              {row.payment_reference}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (value: number) => (
        <p
          className={`text-xs font-semibold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {formatCurrency(value)}
        </p>
      ),
    },
    {
      key: "payment_date",
      label: "Date",
      align: "right" as const,
      render: (value: string) => (
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {value}
        </p>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
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
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const girlsCount =
    stats.total_female_students || Math.round(stats.total_students * 0.4);
  const boysCount =
    stats.total_male_students || stats.total_students - girlsCount;

  return (
    <div className="p-4 sm:p-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Main Content */}
          <div className="space-y-6 min-w-0">
            
            {/* ✅ WELCOME CARD - Date top left, image right, white text, text-xs date */}
            <WelcomeCard 
              userType={userRole} 
              userName={userName}
            />
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Students"
                value={stats.total_students}
                icon={FaUserGraduate}
                footer={{
                  label: "Added last year",
                  value: stats.students_added_last_year.toLocaleString(),
                }}
              />
              <StatCard
                title="Total Teachers"
                value={stats.total_instructors}
                icon={FaChalkboardTeacher}
                footer={{
                  label: "Added Last Year",
                  value: stats.instructors_added_last_year.toLocaleString(),
                }}
              />
              <StatCard
                title="Active Intakes"
                value={stats.active_intakes}
                icon={FaChalkboardTeacher}
                footer={{
                  label: "Total Intakes",
                  value: stats.total_intakes,
                }}
              />
            </div>

            {/* Chart */}
            {revenueChartData && revenueChartData.sales_by_month && (
              <LineChart dashboardData={revenueChartData} loading={false} />
            )}

            {/* Recent Payments + Gender Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payments */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Recent Payments
                </h3>
                {recentPayments.length > 0 ? (
                  <DataTable
                    columns={paymentColumns}
                    data={recentPayments}
                    isDarkMode={isDarkMode}
                    maxRows={5}
                  />
                ) : (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                    No recent payments
                  </div>
                )}
              </div>

              {/* Gender Distribution */}
              <div>
                {/* <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">Student Distribution</h3> */}
                <GenderDistributionChart
                  totalStudents={stats.total_students}
                  girls={girlsCount}
                  boys={boysCount}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - sticky on desktop, normal flow on mobile */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
            <CalendarWidget
              onDateSelect={(date) => {
                setSelectedCalendarDate(date);
                setIsCalendarDrawerOpen(true);
              }}
            />

            <UpcomingEvents events={upcomingEvents} />
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
          {/* Events for selected date */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Events
            </h4>
            {(() => {
              const filtered = upcomingEvents.filter((e) => {
                if (!selectedCalendarDate) return false;
                const eventDate = new Date(e.date);
                return (
                  eventDate.toDateString() ===
                  selectedCalendarDate.toDateString()
                );
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-6 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
                      No events on this date
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="w-1 self-stretch rounded-full bg-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {event.type && (
                          <span className="inline-block mt-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {event.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Recent payments for that date */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Payments
            </h4>
            {(() => {
              const filtered = recentPayments.filter((p) => {
                if (!selectedCalendarDate) return false;
                const payDate = new Date(p.payment_date);
                return (
                  payDate.toDateString() === selectedCalendarDate.toDateString()
                );
              });

              if (filtered.length === 0) {
                return (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No payments on this date
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {filtered.map((payment, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <ProfileAvatar name={payment.student_name} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {payment.student_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.payment_reference}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
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