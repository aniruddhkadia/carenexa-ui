import React, { useState, useEffect } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import DailyView from "./DailyView";
import AddAppointmentModal from "./AddAppointmentModal";
import {
  appointmentsApi,
  type MonthlyAppointmentsResponse,
} from "./appointments.api";

const AppointmentCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyData, setMonthlyData] =
    useState<MonthlyAppointmentsResponse | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);

  // Create padding for days before month start
  const startDay = monthStart.getDay();
  const paddingBefore = Array.from({ length: startDay }).map((_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startDay - i));
    return d;
  });

  // Create padding for days after month end
  const endDay = monthEnd.getDay();
  const paddingAfter = Array.from({ length: 6 - endDay }).map((_, i) => {
    const d = new Date(monthEnd);
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const calendarDays = [
    ...paddingBefore,
    ...eachDayOfInterval({ start: monthStart, end: monthEnd }),
    ...paddingAfter,
  ];

  const fetchMonthlyData = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await appointmentsApi.getCalendar(year, month);
      setMonthlyData(data);
    } catch (e) {
      console.error("Failed to fetch calendar", e);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDayCount = (date: Date) => {
    if (!monthlyData) return 0;
    // Fallback naive search based on YYYY-MM-DD
    const fDate = format(date, "yyyy-MM-dd");
    const dayData = monthlyData.days.find((d) => d.date.startsWith(fDate));
    return dayData ? dayData.count : 0;
  };

  const onAppointmentAdded = () => {
    setIsModalOpen(false);
    fetchMonthlyData();
    // To trigger a re-render of DailyView, we can optionally change selectedDate or use a ref.
    // Just setting state to same date triggers refresh in DailyView if we use a different prop.
    // For simplicity, we just rely on fetchMonthlyData and maybe manual refresh or the user clicks again.
    setSelectedDate(new Date(selectedDate.getTime())); // Force reference change
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
          <p className="text-slate-500">Manage your daily clinic schedule</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Appointment</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)] min-h-[600px]">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-lg text-slate-800">
                {format(currentDate, "MMMM yyyy")}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-xs font-semibold text-slate-500 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 overflow-y-auto">
              {calendarDays.map((date, i) => {
                const count = getDayCount(date);
                const isCurrent = isSameMonth(date, currentDate);
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[100px] bg-white p-2 transition-colors cursor-pointer border-transparent border-2 hover:border-primary/30 flex flex-col
                      ${!isCurrent ? "text-slate-400 bg-slate-50" : "text-slate-700"}
                      ${isSelected ? "ring-2 ring-inset ring-primary !border-transparent" : ""}
                    `}
                  >
                    <div
                      className={`text-right text-sm font-medium mb-2 ${isToday ? "text-primary font-bold" : ""}`}
                    >
                      <span
                        className={
                          isToday
                            ? "bg-primary/10 px-2 py-0.5 rounded-full"
                            : ""
                        }
                      >
                        {format(date, "d")}
                      </span>
                    </div>
                    {count > 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${count > 10 ? "bg-primary text-white" : count > 5 ? "bg-primary/80 text-white" : "bg-primary/20 text-primary"}
                        `}
                        >
                          {count}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Daily Schedule / List */}
        <div className="lg:col-span-1 overflow-hidden">
          <DailyView date={selectedDate} onDateChange={setSelectedDate} />
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onAppointmentAdded}
      />
    </div>
  );
};

export default AppointmentCalendar;
