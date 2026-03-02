import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import {
  LogOut,
  Home,
  Users,
  Calendar,
  FileText,
  CreditCard,
  ShieldCheck,
  Menu,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "../../features/settings/settings.api";
import { useState } from "react";

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: settingsApi.getMyClinic,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      path: "/dashboard",
      roles: ["All"],
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Patients",
      path: "/patients",
      roles: ["Doctor", "Nurse", "Admin", "SuperAdmin"],
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Appointments",
      path: "/appointments",
      roles: ["Doctor", "Nurse", "Admin", "SuperAdmin"],
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Medical Records",
      path: "/medical-records",
      roles: ["Doctor", "Nurse", "Admin", "SuperAdmin"],
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: "Billing",
      path: "/billing",
      roles: ["Admin", "Doctor", "SuperAdmin"],
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "Insurance",
      path: "/insurance",
      roles: ["Admin", "Insurance", "SuperAdmin"],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      path: "/settings",
      roles: ["All"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      item.roles.includes("All") ||
      (user?.role && item.roles.includes(user.role)),
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Mobile Backdrop */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:relative z-30 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"}
        bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full
      `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700">
          <span
            className={`text-xl font-bold text-primary ${!isSidebarOpen && "md:hidden"}`}
          >
            Carenexa
          </span>
          {isSidebarOpen ? (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              <Menu size={20} />
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md mx-auto"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }
                `}
              >
                <span
                  className={`${isActive ? "text-white" : "text-slate-400"} mr-3`}
                >
                  {item.icon}
                </span>
                <span
                  className={`${!isSidebarOpen && "md:hidden opacity-0"} transition-opacity duration-200 whitespace-nowrap`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div
            className={`flex items-center ${isSidebarOpen ? "px-2" : "justify-center"}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold truncate">
                  {user?.fullName}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center py-2 text-sm font-medium rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors
              ${isSidebarOpen ? "px-4" : "justify-center"}
            `}
            title="Logout"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className={`${!isSidebarOpen && "md:hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center flex-1"></div>

          <div className="flex items-center ml-4 space-x-3">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {clinic?.clinicName || "Carenexa Clinic"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                {clinic?.city || "Healthcare Provider"}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-4">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
