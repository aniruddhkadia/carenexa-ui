import axios from "../../lib/axios";

export interface AppointmentDto {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  type: string;
  status: string;
  notes: string;
}

export interface MonthlyAppointmentsResponse {
  year: number;
  month: number;
  days: {
    date: string;
    count: number;
  }[];
}

export interface CreateAppointmentRequest {
  patientId: string;
  appointmentDate: string;
  type: string;
  notes: string;
}

export const appointmentsApi = {
  getToday: async () => {
    const res = await axios.get<AppointmentDto[]>("/appointments/today");
    return res.data;
  },

  getDaily: async (date: string) => {
    const res = await axios.get<AppointmentDto[]>(`/appointments?date=${date}`);
    return res.data;
  },

  getCalendar: async (year: number, month: number) => {
    const res = await axios.get<MonthlyAppointmentsResponse>(
      `/appointments/calendar?year=${year}&month=${month}`,
    );
    return res.data;
  },

  create: async (data: CreateAppointmentRequest) => {
    const res = await axios.post<string>("/appointments", data);
    return res.data;
  },

  updateStatus: async (id: string, status: number) => {
    // Enums: Booked=0, InProgress=1, Completed=2, Cancelled=3
    await axios.patch(`/appointments/${id}/status`, status, {
      headers: { "Content-Type": "application/json" },
    });
  },
};
