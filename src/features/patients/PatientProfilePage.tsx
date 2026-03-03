import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  Plus,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Stethoscope,
  Pill,
  Activity,
  Eye,
} from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import api from "../../lib/axios";
import ViewMedicalRecordModal from "../medical-records/ViewMedicalRecordModal";
import MedicineHistoryTable from "../medical-records/components/MedicineHistoryTable";
import { type MedicalRecordDto } from "../medical-records/medicalRecords.api";
import PatientRegistrationForm from "./PatientRegistrationForm";

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  insuranceId?: string;
  createdAt: string;
  totalVisits: number;
  successRate: string;
}

const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "history" | "appointments" | "billing" | "medications"
  >("history");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordDto | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: patient,
    isLoading: isPatientLoading,
    refetch: refetchPatient,
  } = useQuery<PatientProfile>({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data;
    },
  });

  const { data: visits, isLoading: isVisitsLoading } = useQuery<
    MedicalRecordDto[]
  >({
    queryKey: ["patient-visits", id],
    queryFn: async () => {
      // Use the correct endpoint for medical records
      const { data } = await api.get(`/MedicalRecords/${id}/history`);
      return data;
    },
    enabled: !!id && (activeTab === "history" || activeTab === "medications"),
  });

  if (isPatientLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!patient)
    return <div className="p-10 text-center">Patient not found.</div>;

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/patients")}
          className="h-10 w-10 p-0 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Profile</h2>
          <div className="flex items-center text-slate-500 text-sm font-medium mt-0.5">
            <span>Patients</span>
            <ChevronRight size={14} className="mx-1" />
            <span>
              {patient.firstName} {patient.lastName}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-4">
          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden p-0">
            <div className="bg-primary h-24 relative">
              <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center">
                <User size={40} className="text-slate-300" />
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-sm font-bold text-slate-500 uppercase">
                  {patient.gender} • {age} Years • {patient.bloodGroup}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={16} className="mr-3 text-slate-400" />
                  <span className="font-medium">{patient.phone}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Mail size={16} className="mr-3 text-slate-400" />
                  <span className="font-medium truncate">
                    {patient.email || "No Email Provided"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={16} className="mr-3 text-slate-400 shrink-0" />
                  <span className="font-medium">{patient.address}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button
                  className="w-full rounded-xl"
                  onClick={() => navigate(`/medical-records/${id}`)}
                >
                  <Plus size={16} className="mr-2" />
                  New Visit
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-slate-500">
              Quick Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                <p className="text-[10px] font-bold text-blue-600 uppercase">
                  Total Visits
                </p>
                <p className="text-xl font-bold text-blue-700">
                  {patient.totalVisits || 0}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">
                  Health Score
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {patient.successRate || "98%"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
            {[
              {
                id: "history",
                label: "Visit History",
                icon: <FileText size={16} />,
              },
              {
                id: "appointments",
                label: "Appointments",
                icon: <Calendar size={16} />,
              },
              {
                id: "billing",
                label: "Billing",
                icon: <CreditCard size={16} />,
              },
              {
                id: "medications",
                label: "Medications",
                icon: <Pill size={16} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                            flex items-center px-6 py-2 rounded-xl text-sm font-bold transition-all
                            ${activeTab === tab.id ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}
                        `}
              >
                {React.cloneElement(tab.icon as React.ReactElement<any>, {
                  className: "mr-2",
                })}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "history" && (
              <div className="space-y-4">
                {isVisitsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : visits?.length === 0 ? (
                  <div className="p-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">No visit history found.</p>
                    <Button
                      variant="ghost"
                      className="mt-2 text-primary"
                      onClick={() => navigate(`/medical-records/${id}`)}
                    >
                      Start first visit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits?.map((visit) => (
                      <div
                        key={visit.id}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500">
                              <Clock size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                {new Date(visit.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase">
                                Consulation with {visit.doctorName}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecord(visit)}
                            className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <Stethoscope size={12} className="mr-1.5" />
                              Diagnosis
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {visit.diagnosis}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <Pill size={12} className="mr-1.5" />
                              Prescription
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed truncate">
                              {(() => {
                                try {
                                  if (!visit.prescription) return "None";
                                  const parsed = JSON.parse(visit.prescription);
                                  if (
                                    Array.isArray(parsed) &&
                                    parsed.length > 0
                                  ) {
                                    return parsed
                                      .map(
                                        (p: any) =>
                                          p.medicineObj?.brandName ||
                                          p.brandName ||
                                          "Medicine",
                                      )
                                      .filter(Boolean)
                                      .join(", ");
                                  }
                                  return visit.prescription;
                                } catch (e) {
                                  return visit.prescription;
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === "appointments" && (
              <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No upcoming appointments.</p>
                <Button className="mt-4 rounded-xl">Book Appointment</Button>
              </div>
            )}
            {activeTab === "billing" && (
              <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                <CreditCard size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No billing records found.</p>
              </div>
            )}
            {activeTab === "medications" && (
              <div className="space-y-4">
                <MedicineHistoryTable history={visits || []} />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <ViewMedicalRecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <PatientRegistrationForm
              patientId={id}
              onSuccess={() => {
                setIsEditing(false);
                refetchPatient();
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfilePage;
