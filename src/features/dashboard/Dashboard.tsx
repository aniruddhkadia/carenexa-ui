import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../lib/axios";
import {
  Users,
  Calendar,
  CheckCircle2,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react";

interface DashboardSummary {
  totalPatients: number;
  todaysAppointments: number;
  completedToday: number;
  pendingClaims: number;
  monthlyRevenue: number;
  recentAppointments: Array<{
    id: string;
    patientName: string;
    appointmentDate: string;
    status: string;
  }>;
}

interface ActivityLog {
  message: string;
  createdAt: string;
  action: string;
  entity: string;
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  color: string;
  index: number;
  isLoading?: boolean;
}> = ({ label, value, trend, trendUp, icon, color, index, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${color} shadow-sm`}>
        {React.cloneElement(icon as React.ReactElement<any>, {
          className: `w-6 h-6 text-white`,
        })}
      </div>
      {trend && (
        <div
          className={`flex items-center text-xs font-bold ${trendUp ? "text-emerald-500" : "text-rose-500"}`}
        >
          {trendUp ? (
            <ArrowUpRight size={14} className="mr-0.5" />
          ) : (
            <ArrowDownRight size={14} className="mr-0.5" />
          )}
          {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      {isLoading ? (
        <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 animate-pulse rounded mt-1" />
      ) : (
        <motion.h3
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold mt-1 tracking-tight"
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </motion.h3>
      )}
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { data: summary, isLoading: isSummaryLoading } =
    useQuery<DashboardSummary>({
      queryKey: ["dashboard-summary"],
      queryFn: async () => {
        const { data } = await api.get("/dashboard/summary");
        return data;
      },
      refetchInterval: 120000, // 2 minutes
    });

  const { data: activityLogs, isLoading: isActivityLoading } = useQuery<
    ActivityLog[]
  >({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/activity");
      return data;
    },
    refetchInterval: 60000, // 1 minute
  });

  const stats = [
    {
      label: "Total Patients",
      value: summary?.totalPatients ?? 0,
      trend: "+12.5%",
      trendUp: true,
      icon: <Users />,
      color: "bg-blue-500",
    },
    {
      label: "Today's Appointments",
      value: summary?.todaysAppointments ?? 0,
      trend: `${summary?.completedToday ?? 0} Completed`,
      trendUp: true,
      icon: <Calendar />,
      color: "bg-purple-500",
    },
    {
      label: "Monthly Revenue",
      value: `₹${(summary?.monthlyRevenue ?? 0).toLocaleString()}`,
      trend: "+8.2%",
      trendUp: true,
      icon: <IndianRupee />,
      color: "bg-emerald-500",
    },
    {
      label: "Pending Claims",
      value: summary?.pendingClaims ?? 0,
      trend: "3 Oldest",
      trendUp: false,
      icon: <AlertCircle />,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, Dr. Amit
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening in your clinic today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Clock size={16} className="mr-2" />
            Daily Report
          </button>
          <button className="flex items-center bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Plus size={16} className="mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            {...stat}
            index={i}
            isLoading={isSummaryLoading}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">
              Today's Appointments
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {isSummaryLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-full bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {(summary?.recentAppointments?.length
                  ? summary.recentAppointments
                  : [
                      {
                        id: "1",
                        patientName: "Rahul Sharma",
                        appointmentDate: new Date(
                          new Date().setHours(new Date().getHours() + 1),
                        ).toISOString(),
                        status: "Booked",
                      },
                      {
                        id: "2",
                        patientName: "Priya Patel",
                        appointmentDate: new Date(
                          new Date().setHours(new Date().getHours() - 1),
                        ).toISOString(),
                        status: "Completed",
                      },
                      {
                        id: "3",
                        patientName: "Amit Kumar",
                        appointmentDate: new Date(
                          new Date().setHours(new Date().getHours() + 2),
                        ).toISOString(),
                        status: "Booked",
                      },
                    ]
                ).map((appt, i) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                        {new Date(appt.appointmentDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {appt.patientName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Consultation • Regular Checkup
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`
                        text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                        ${
                          appt.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : appt.status === "Booked"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                        }
                      `}
                      >
                        {appt.status}
                      </span>
                      <button className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        Start Visit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">
              Recent Activity
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              Refresh
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            {isActivityLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-3/4 bg-slate-100 animate-pulse rounded" />
                      <div className="h-2 w-1/4 bg-slate-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {(activityLogs?.length
                  ? activityLogs
                  : [
                      {
                        message: "Registered new patient Rahul Sharma",
                        createdAt: new Date().toISOString(),
                        action: "CREATE",
                        entity: "Patient",
                      },
                      {
                        message: "Completed appointment for Priya Patel",
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        action: "UPDATE",
                        entity: "Appointment",
                      },
                      {
                        message: "Added prescription for Amit Kumar",
                        createdAt: new Date(Date.now() - 7200000).toISOString(),
                        action: "CREATE",
                        entity: "MedicalRecord",
                      },
                    ]
                ).map((log, i) => (
                  <div
                    key={i}
                    className="p-3 flex items-start space-x-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors"
                  >
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0
                        ${
                          log.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-600"
                            : log.action === "DELETE"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-blue-100 text-blue-600"
                        }
                      `}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {log.message}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString()} •{" "}
                        {log.entity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
