import axios from "../../lib/axios";

export interface ClinicDto {
  id: string;
  clinicName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  qualification: string;
  role: string;
}

export const settingsApi = {
  // Clinic
  getMyClinic: async () => {
    const res = await axios.get<ClinicDto>("/clinics/my-clinic");
    return res.data;
  },
  updateMyClinic: async (data: ClinicDto) => {
    await axios.put(`/clinics/my-clinic`, data);
  },

  // Profile
  getProfile: async () => {
    const res = await axios.get<UserProfileDto>("/users/profile");
    return res.data;
  },
  updateProfile: async (data: Partial<UserProfileDto>) => {
    await axios.put("/users/profile", data);
  },

  // Team
  getStaff: async () => {
    const res = await axios.get<UserProfileDto[]>("/users/staff");
    return res.data;
  },
  createStaff: async (data: any) => {
    await axios.post("/users/staff", data);
  },
};
