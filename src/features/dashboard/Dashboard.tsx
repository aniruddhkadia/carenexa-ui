import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
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
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import AddAppointmentModal from "../appointments/AddAppointmentModal";
import ViewMedicalRecordModal from "../medical-records/ViewMedicalRecordModal";
import {
  medicalRecordsApi,
  type MedicalRecordDto,
} from "../medical-records/medicalRecords.api";
import { formatToLocalTime } from "../../utils/dateUtils";
import { useAuth } from "../auth/AuthContext";

interface DashboardSummary {
  totalPatients: number;
  todaysAppointments: number;
  completedToday: number;
  pendingClaims: number;
  monthlyRevenue: number;
  recentAppointments: Array<{
    id: string;
    patientId: string;
    patientName: string;
    appointmentDate: string;
    status: string;
  }>;
}

interface DailyVisit {
  id: string;
  patientId: string;
  patientName: string;
  completedAt: string;
  diagnosis: string;
  doctorName: string;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordDto | null>(
    null,
  );
  const [isRecordLoading, setIsRecordLoading] = useState(false);

  const handleViewRecord = async (recordId: string) => {
    try {
      setIsRecordLoading(true);
      const record = await medicalRecordsApi.getRecordById(recordId);
      setSelectedRecord(record);
    } catch (error) {
      console.error("Failed to fetch medical record", error);
    } finally {
      setIsRecordLoading(false);
    }
  };

  const { data: summary, isLoading: isSummaryLoading } =
    useQuery<DashboardSummary>({
      queryKey: ["dashboard-summary"],
      queryFn: async () => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const { data } = await api.get(`/dashboard/summary?date=${todayStr}`);
        return data;
      },
      refetchInterval: 120000, // 2 minutes
    });

  const { data: dailyVisits, isLoading: isDailyVisitsLoading } = useQuery<
    DailyVisit[]
  >({
    queryKey: ["dashboard-daily-visits", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data } = await api.get(
        `/dashboard/completed-visits?date=${format(selectedDate, "yyyy-MM-dd")}`,
      );
      return data;
    },
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Welcome back, {user?.fullName || "Doctor"}
          </h2>
          <p className="text-slate-500 mt-1">
            Here's what's happening in your clinic today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Clock size={16} className="mr-2" />
            Daily Report
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
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
            <h3 className="text-xl font-bold tracking-tight">Appointments</h3>
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
                  : []
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
                        {formatToLocalTime(appt.appointmentDate)}
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
                      {appt.status !== "Completed" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/medical-records/${appt.patientId}/${appt.id}`,
                            )
                          }
                          className="text-xs font-bold text-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          Start Visit
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Completed Visits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">
              Completed Visits
            </h3>
            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-tight">
              {dailyVisits?.length || 0} Records
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden min-h-[300px]">
            {/* Boxed Date Selector */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-center items-center gap-3 bg-slate-50/50 dark:bg-slate-900/20 relative z-10">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d);
                }}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-6 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                <Calendar size={16} className="mr-2 text-primary" />
                {selectedDate.toDateString() === new Date().toDateString()
                  ? "Today"
                  : format(selectedDate, "MMM dd")}
              </button>

              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d);
                }}
                className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {isDailyVisitsLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-3/4 bg-slate-100 animate-pulse rounded" />
                      <div className="h-2 w-1/4 bg-slate-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dailyVisits?.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                  <CheckCircle2
                    size={32}
                    className="text-slate-200 dark:text-slate-700"
                  />
                </div>
                <p className="text-sm font-semibold text-slate-400">
                  No visits completed on this day.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {dailyVisits?.map((visit, i) => (
                  <motion.div
                    key={visit.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 flex items-start space-x-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs uppercase group-hover:bg-primary group-hover:text-white transition-colors">
                      {formatToLocalTime(visit.completedAt)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                        {visit.patientName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 italic truncate">
                        {visit.diagnosis || "Consultation Report"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewRecord(visit.id)}
                      disabled={isRecordLoading}
                      className="h-8 w-8 p-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50"
                      title="View Medical Record"
                    >
                      <Eye size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
        }}
      />

      {selectedRecord && (
        <ViewMedicalRecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
