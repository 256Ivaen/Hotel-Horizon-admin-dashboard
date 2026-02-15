// components/WelcomeCard.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  GraduationCap, 
  Users, 
  DollarSign, 
  BookOpen, 
  School, 
  UserCog,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";

interface WelcomeCardProps {
  userType: string;
  userName?: string;
  className?: string;
}

const roleContent = {
  admin: {
    icon: <UserCog className="h-6 w-6" />,
    title: "Welcome back, Commander",
    subtitle: "Your institution is running smoothly. 12 tasks need your attention today.",
    illustration: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png", // Admin with dashboard
    cta: "View Tasks"
  },
  systemadmin: {
    icon: <School className="h-6 w-6" />,
    title: "System Overview",
    subtitle: "All systems operational. 3 updates pending for deployment.",
    illustration: "https://cdn-icons-png.flaticon.com/512/2881/2881142.png", // Server/System
    cta: "System Status"
  },
  instructor: {
    icon: <BookOpen className="h-6 w-6" />,
    title: `Good ${getGreetingTime()}, Professor`,
    subtitle: "You have 2 classes today and 24 pending assignments to grade.",
    illustration: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Teacher at board
    cta: "View Schedule"
  },
  student: {
    icon: <GraduationCap className="h-6 w-6" />,
    title: `Ready to learn, ${getFirstName()}`,
    subtitle: "You're 75% through the semester. Keep up the great work!",
    illustration: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png", // Student studying
    cta: "Continue Learning"
  },
  accounts: {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Financial Hub",
    subtitle: "UGX 2.4M in pending payments. 8 invoices awaiting approval.",
    illustration: "https://cdn-icons-png.flaticon.com/512/3131/3131915.png", // Finance/Coins
    cta: "Review Payments"
  },
  management: {
    icon: <Target className="h-6 w-6" />,
    title: "Strategic View",
    subtitle: "Student enrollment up 12% this quarter. 3 new intakes pending.",
    illustration: "https://cdn-icons-png.flaticon.com/512/1048/1048940.png", // Analytics/Growth
    cta: "View Reports"
  }
};

function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

function getFirstName(fullName?: string) {
  if (!fullName) return "Student";
  return fullName.split(' ')[0];
}

export function WelcomeCard({ userType, userName, className }: WelcomeCardProps) {
  const content = roleContent[userType as keyof typeof roleContent] || roleContent.admin;
  const firstName = userName ? getFirstName(userName) : '';
  
  // Personalize title with name
  let title = content.title;
  if (userType === 'student' && firstName) {
    title = `Ready to learn, ${firstName}`;
  } else if (userType === 'instructor' && firstName) {
    title = `Good ${getGreetingTime()}, ${firstName}`;
  } else if (userType === 'admin' && firstName) {
    title = `Welcome back, ${firstName}`;
  }

  return (
    <motion.div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-gray-500 p-6 text-white shadow-md",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left Content */}
        <div className="flex-1 z-10">
          {/* Icon + Title Row */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              {content.icon}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-white">
              {title}
            </h3>
          </div>
          
          {/* Subtitle */}
          <p className="text-sm text-white/90 max-w-lg">
            {content.subtitle}
          </p>
          
          {/* CTA Button */}
          <div className="mt-4">
            <button className="px-4 py-2 bg-white text-gray-800 text-xs font-medium rounded-lg hover:bg-white/90 transition-colors shadow-sm">
              {content.cta} →
            </button>
          </div>
        </div>

        {/* 3D Illustration - Right Side */}
        <div className="absolute bottom-0 right-0 md:relative md:bottom-auto md:right-auto w-32 h-32 md:w-36 md:h-36 pointer-events-none">
          <img
            src={content.illustration}
            alt=""
            className="w-full h-full object-contain drop-shadow-lg transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-600/50 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}