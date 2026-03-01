import React from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const AppointmentCalendar: React.FC = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock appointments for the grid
  const appointments = [
    {
      id: 1,
      time: "09:00 AM",
      patient: "Alice Johnson",
      type: "Checkup",
      day: 25,
    },
    {
      id: 2,
      time: "11:30 AM",
      patient: "Bob Smith",
      type: "Consultation",
      day: 25,
    },
    {
      id: 3,
      time: "02:00 PM",
      patient: "Charlie Davis",
      type: "Follow-up",
      day: 26,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Appointment Calendar
          </h2>
          <p className="text-slate-500">
            View and schedule patient appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-semibold px-4">October 2026</span>
          <Button variant="outline" size="sm">
            <ChevronRight size={16} />
          </Button>
          <Button className="ml-4">New Appointment</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {days.map((day) => (
                <div
                  key={day}
                  className="bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500 uppercase"
                >
                  {day}
                </div>
              ))}

              {/* Simplified Grid Generation */}
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 3; // Mock offset
                const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                const dateNum = isCurrentMonth
                  ? dayNum
                  : dayNum <= 0
                    ? 30 + dayNum
                    : dayNum - 31;
                const hasAppointment =
                  isCurrentMonth && appointments.some((a) => a.day === dateNum);

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] bg-white p-2 transition-colors hover:bg-slate-50 cursor-pointer ${
                      !isCurrentMonth ? "opacity-30" : ""
                    }`}
                  >
                    <div className="text-right text-xs font-medium text-slate-400 mb-2">
                      {dateNum}
                    </div>
                    {hasAppointment && (
                      <div className="space-y-1">
                        {appointments
                          .filter((a) => a.day === dateNum)
                          .map((a) => (
                            <div
                              key={a.id}
                              className="text-[10px] p-1 bg-primary/10 text-primary rounded border border-primary/20 truncate"
                            >
                              {a.time} - {a.patient}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Daily Schedule / List */}
        <div className="space-y-4">
          <Card title="Today's Schedule">
            <div className="space-y-4">
              {appointments
                .filter((a) => a.day === 25)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 p-3 rounded-lg border border-slate-100 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                      <Clock size={18} className="text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {a.patient}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.time} • {a.type}
                      </p>
                    </div>
                  </div>
                ))}
              <Button variant="outline" className="w-full text-xs">
                View Full Schedule
              </Button>
            </div>
          </Card>

          <Card title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Total Booked</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Available Slots</span>
                <span className="font-semibold text-green-600">8</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
