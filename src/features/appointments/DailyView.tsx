import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { appointmentsApi, type AppointmentDto } from "./appointments.api";
import {
  Clock,
  PlayCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { parseApiDate } from "../../utils/dateUtils";

interface DailyViewProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ date, onDateChange }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [date]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentsApi.getDaily(format(date, "yyyy-MM-dd"));
      const sorted = [...data].sort(
        (a, b) =>
          parseApiDate(a.appointmentDate).getTime() -
          parseApiDate(b.appointmentDate).getTime(),
      );
      setAppointments(sorted);
    } catch (error) {
      console.error("Failed to load daily appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Booked":
        return {
          bg: "bg-blue-50/50",
          text: "text-blue-700",
          border: "border-blue-200",
          accent: "bg-blue-500",
          icon: <Clock size={12} className="mr-1" />,
          label: "Booked",
        };
      case "InProgress":
        return {
          bg: "bg-amber-50/50",
          text: "text-amber-700",
          border: "border-amber-200",
          accent: "bg-amber-500",
          icon: <PlayCircle size={12} className="mr-1" />,
          label: "In Progress",
        };
      case "Completed":
        return {
          bg: "bg-emerald-50/50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          accent: "bg-emerald-500",
          icon: <CheckCircle2 size={12} className="mr-1" />,
          label: "Completed",
        };
      case "Cancelled":
        return {
          bg: "bg-rose-50/50",
          text: "text-rose-700",
          border: "border-rose-200",
          accent: "bg-rose-500",
          icon: <AlertCircle size={12} className="mr-1" />,
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-slate-50/50",
          text: "text-slate-700",
          border: "border-slate-200",
          accent: "bg-slate-500",
          icon: null,
          label: status,
        };
    }
  };

  const completed = appointments.filter((a) => a.status === "Completed").length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
  const inProgress = appointments.filter(
    (a) => a.status === "InProgress",
  ).length;
  const remaining = appointments.length - completed - cancelled;

  return (
    <div className="flex flex-col h-full bg-slate-50/30 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden backdrop-blur-sm">
      {/* Header with Glassmorphism */}
      <div className="p-5 border-b border-slate-200/60 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Calendar size={16} className="text-primary/70" />
            <h3 className="font-extrabold text-slate-900 tracking-tight">
              {isSameDay(date, new Date())
                ? "Today's Schedule"
                : format(date, "EEEE, dd MMM")}
            </h3>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {appointments.length} Appointments &bull; {remaining} Pending
          </p>
        </div>
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => onDateChange(new Date(date.getTime() - 86400000))}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              isSameDay(date, new Date())
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-primary"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onDateChange(new Date(date.getTime() + 86400000))}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Appointment List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-400">
              Loading your schedule...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Calendar size={32} />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Clear Schedule</h4>
            <p className="text-sm text-slate-500 max-w-[200px]">
              No appointments booked for this day yet.
            </p>
          </div>
        ) : (
          appointments.map((a) => {
            const config = getStatusConfig(a.status);
            return (
              <div
                key={a.id}
                className="group relative flex flex-col gap-3 p-4 rounded-xl border border-slate-200/70 bg-white hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Status Accent Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${config.accent}`}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 min-w-[54px] border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                        Time
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 group-hover:text-primary transition-colors">
                        {format(parseApiDate(a.appointmentDate), "hh:mm")}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mt-0.5">
                        {format(parseApiDate(a.appointmentDate), "a")}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4
                        className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/patients/${a.patientId}`)}
                      >
                        {a.patientName}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">
                          {a.type}
                        </span>
                        <span className="opacity-40">&bull;</span>
                        <span className="truncate italic">"{a.notes}"</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50 group-hover:border-primary/5 transition-colors">
                  <div
                    className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}
                  >
                    {config.icon}
                    {config.label}
                  </div>

                  <div className="flex gap-2">
                    {a.status === "Booked" && (
                      <button
                        onClick={() =>
                          navigate(`/medical-records/${a.patientId}`)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all active:scale-95"
                      >
                        <PlayCircle size={14} /> START VISIT
                      </button>
                    )}
                    {a.status === "InProgress" && (
                      <button
                        onClick={() =>
                          navigate(`/medical-records/${a.patientId}`)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 shadow-sm shadow-amber-200 transition-all active:scale-95"
                      >
                        RESUME
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modern Summary Footer */}
      <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Summary
          </span>
          <span className="text-xs font-bold text-primary-foreground/90">
            {appointments.length} Total
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-emerald-400 font-extrabold text-sm">
              {completed}
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
              Done
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-amber-400 font-extrabold text-sm">
              {inProgress}
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
              Active
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 border border-white/10">
            <span className="text-blue-400 font-extrabold text-sm">
              {remaining}
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
              Wait
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyView;
