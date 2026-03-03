import React from "react";
import {
  X,
  User,
  Stethoscope,
  Pill,
  FileText,
  Activity,
  Calendar,
  Zap,
  ClipboardList,
} from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { type MedicalRecordDto, medicalRecordsApi } from "./medicalRecords.api";
import { useQuery } from "@tanstack/react-query";

interface ViewMedicalRecordModalProps {
  record?: MedicalRecordDto;
  recordId?: string;
  onClose: () => void;
}

const ViewMedicalRecordModal: React.FC<ViewMedicalRecordModalProps> = ({
  record: initialRecord,
  recordId,
  onClose,
}) => {
  const { data: fetchedRecord, isLoading } = useQuery({
    queryKey: ["medical-record", recordId],
    queryFn: () => medicalRecordsApi.getRecordById(recordId!),
    enabled: !!recordId && !initialRecord,
  });

  const record = initialRecord || fetchedRecord;

  const parsePrescription = (prescriptionJson: string) => {
    try {
      if (!prescriptionJson) return [];
      const parsed = JSON.parse(prescriptionJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  if (isLoading || !record) {
    if (isLoading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <Card className="p-12 rounded-3xl animate-pulse flex flex-col items-center">
            <Activity className="text-primary animate-bounce mb-4" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Medical Record...</p>
          </Card>
        </div>
      );
    }
    return null;
  }

  const prescriptions = parsePrescription(record.prescription);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-primary/10 overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-primary p-5 text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 p-12 -ml-8 -mb-8 bg-white/5 rounded-full blur-2xl" />

          <div className="relative flex justify-between items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div>
                <div className="flex items-center space-x-2 text-primary-foreground/80 mb-0.5">
                  <FileText size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Medical Record Details
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight leading-none">
                  Consultation Report
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90">
                <div className="flex items-center px-3 py-1.5 bg-white/15 rounded-xl backdrop-blur-md">
                  <Calendar size={12} className="mr-2" />
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center px-3 py-1.5 bg-white/15 rounded-xl backdrop-blur-md">
                  <User size={12} className="mr-2" />
                  Dr. {record.doctorName}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:rotate-90 duration-300 outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Vitals & Info */}
            <div className="space-y-6">
              <Card className="rounded-[1.5rem] border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center">
                  <Activity size={12} className="mr-2 text-primary" />
                  Patient Vitals
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                      Weight
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {record.weight || "--"}{" "}
                      <span className="text-[10px] font-medium text-slate-500">
                        kg
                      </span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                      BP
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {record.bp || "--"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                      Temp
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {record.temp || "--"}{" "}
                      <span className="text-[10px] font-medium text-slate-500">
                        °F
                      </span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                      Pulse
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {record.pulse || "--"}{" "}
                      <span className="text-[10px] font-medium text-slate-500">
                        bpm
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              {record.followUpDate && (
                <div className="p-4 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-center space-x-3 text-indigo-700 dark:text-indigo-400">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-70">
                        Follow-up Scheduled
                      </p>
                      <p className="text-base font-black">
                        {new Date(record.followUpDate).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle and Right Column: Clinical Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinical Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                      <ClipboardList size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Chief Complaint
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 italic text-[13px] text-slate-700 dark:text-slate-300">
                    "{record.chiefComplaint || "No notes provided"}"
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                      <Stethoscope size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Final Diagnosis
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-[13px] text-slate-900 dark:text-white">
                    {record.diagnosis || "No diagnosis provided"}
                  </div>
                </div>
              </div>

              {/* Prescription */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                      <Pill size={12} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Prescription Medications
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase">
                    {prescriptions.length} items
                  </span>
                </div>

                {prescriptions.length > 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full text-[13px] text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                        <tr>
                          <th className="px-5 py-3">Medicine</th>
                          <th className="px-5 py-3">Dose & Freq</th>
                          <th className="px-5 py-3">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {prescriptions.map((p, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors"
                          >
                            <td className="px-5 py-3 text-slate-900 dark:text-white">
                              <div className="font-bold">
                                {p.medicineObj?.brandName ||
                                  p.brandName ||
                                  "Custom Medicine"}
                              </div>
                              <div className="text-[9px] text-slate-500 font-medium leading-tight">
                                {p.medicineObj
                                  ? `${p.medicineObj.strength} • ${p.medicineObj.form}`
                                  : p.instructions || "No details"}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-slate-900 dark:text-white">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[9px] font-bold mr-2 inline-block">
                                {p.dose || p.dosage}
                              </span>
                              <div className="text-[10px] font-semibold text-primary mt-1">
                                {p.frequency}
                              </div>
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                              <div className="font-bold">{p.duration}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5 whitespace-nowrap">
                                {p.medicineObj ? p.instructions : ""}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-400">
                    <p className="text-sm font-medium italic">
                      No medications prescribed for this visit.
                    </p>
                  </div>
                )}
              </div>

              {/* Advice and Lab Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <FileText size={12} className="mr-2" />
                    Medical Advice
                  </span>
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {record.advice || "No specific advice given."}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <Activity size={12} className="mr-2" />
                    Imaging Notes
                  </span>
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {record.labNotes || "No lab investigations requested."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-8 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-[9px]"
          >
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewMedicalRecordModal;
