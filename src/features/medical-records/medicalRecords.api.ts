import axios from "../../lib/axios";

export interface MedicineDto {
  id: string;
  genericName: string;
  brandName: string;
  strength: string;
  form: string;
}

export interface VisitTemplateDto {
  id: string;
  templateName: string;
  diagnosis: string;
  advice: string;
  prescriptionJson: string;
}

export interface MedicalRecordDto {
  id: string;
  diagnosis: string;
  prescription: string;
  advice: string;
  labNotes: string;
  followUpDate: string | null;
  createdAt: string;
  doctorName: string;
  appointmentId: string | null;
  chiefComplaint: string;
  history: string;
  status: string;
  weight: string;
  bp: string;
  temp: string;
  pulse: string;
}

export interface SaveMedicalRecordRequest {
  patientId: string;
  appointmentId?: string;
  chiefComplaint: string;
  history: string;
  diagnosis: string;
  prescription: string;
  advice: string;
  labNotes: string;
  followUpDate?: string;
  weight: string;
  bp: string;
  temp: string;
  pulse: string;
  status: number; // 0 = Draft, 1 = Completed
}

export const medicalRecordsApi = {
  // Medicines
  searchMedicines: async (query: string) => {
    const res = await axios.get<MedicineDto[]>(`/medicines/search?q=${query}`);
    return res.data;
  },

  getFavourites: async () => {
    const res = await axios.get<MedicineDto[]>("/medicines/favourites");
    return res.data;
  },

  addFavourite: async (medicineId: string) => {
    await axios.post("/medicines/favourites", `"${medicineId}"`, {
      headers: { "Content-Type": "application/json" },
    });
  },

  removeFavourite: async (medicineId: string) => {
    await axios.delete(`/medicines/favourites/${medicineId}`);
  },

  // Templates
  getTemplates: async () => {
    const res = await axios.get<VisitTemplateDto[]>("/templates");
    return res.data;
  },

  createTemplate: async (data: any) => {
    const res = await axios.post<string>("/templates", data);
    return res.data;
  },

  // Medical Records
  getPatientHistory: async (patientId: string) => {
    const res = await axios.get<MedicalRecordDto[]>(
      `/medicalrecords/${patientId}/history`,
    );
    return res.data;
  },

  saveRecord: async (data: SaveMedicalRecordRequest) => {
    const res = await axios.post<string>("/medicalrecords", data);
    return res.data;
  },

  updateRecord: async (id: string, data: SaveMedicalRecordRequest) => {
    await axios.put(`/medicalrecords/${id}`, { id, ...data });
  },

  getRecordById: async (id: string) => {
    const res = await axios.get<MedicalRecordDto>(`/medicalrecords/${id}`);
    return res.data;
  },

  generateWhatsAppLink: (
    phone: string,
    patientName: string,
    diagnosis: string,
    prescription: string,
    followUp?: string,
  ) => {
    const message = `🏥 *CARE NEXA CLINIC — DIGITAL PRESCRIPTION*\n\n*Patient:* ${patientName}\n*Diagnosis:* ${diagnosis || "Regular Checkup"}\n\n*Medications:*\n${prescription}\n\n${followUp ? `*Follow-up Visit:* ${followUp}\n` : ""}--------------------------------\n_This is a digitally generated summary._\n_For official PDF, please contact clinic support._`;
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  },
};
