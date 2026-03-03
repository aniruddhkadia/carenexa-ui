import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SmartPrescriptionTable from "./SmartPrescriptionTable";
import MedicineHistoryTable from "./components/MedicineHistoryTable";
import {
  medicalRecordsApi,
  type SaveMedicalRecordRequest,
  type VisitTemplateDto,
  type MedicalRecordDto,
} from "./medicalRecords.api";
import {
  Save,
  FileText,
  Activity,
  User,
  Calendar,
  Printer,
  ChevronLeft,
  Share2,
} from "lucide-react";
import { format, addDays } from "date-fns";
import api from "../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const ADVICE_SHORTCUTS = [
  "Drink plenty of fluids",
  "Avoid cold/oily food",
  "Bed rest for 2 days",
  "Review if fever persists",
  "Take light diet",
  "Apply cold compress",
  "Maintain hygiene",
];

const PatientVisitScreen: React.FC = () => {
  const { patientId, appointmentId } = useParams<{
    patientId: string;
    appointmentId?: string;
  }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const targetPatientId = patientId || "";
  const targetAppointmentId = appointmentId || undefined;

  const [templates, setTemplates] = useState<VisitTemplateDto[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const currentRecordIdRef = useRef<string | null>(null);
  const isSavingRef = useRef(false);

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    historyNotes: "",
    diagnosis: "",
    advice: "",
    labNotes: "",
    followUpDate: "",
    weight: "",
    bp: "",
    temp: "",
    pulse: "",
    status: 0,
  });

  const [history, setHistory] = useState<MedicalRecordDto[]>([]);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const autoSaveTimerRef = useRef<any>(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");

  useEffect(() => {
    if (targetPatientId) {
      loadPatientData();
      loadPatientHistory();
    }
    loadTemplates();

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      }
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleSave(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [targetPatientId]);

  // Auto-save logic
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    // Don't auto-save if form is empty
    if (
      !formData.chiefComplaint &&
      !formData.diagnosis &&
      prescriptions.length === 0
    )
      return;

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(false, true); // silent auto-save
    }, 5000); // 5 second debounce
  }, [formData, prescriptions]);

  const handleSaveAsTemplate = () => {
    setTemplateNameInput("");
    setShowTemplateModal(true);
  };

  const submitTemplate = async () => {
    if (!templateNameInput) {
      toast.error("Template name is required.");
      return;
    }

    try {
      setLoading(true);
      await medicalRecordsApi.createTemplate({
        templateName: templateNameInput,
        diagnosis: formData.diagnosis,
        advice: formData.advice,
        prescriptionJson: JSON.stringify(prescriptions),
      });
      toast.success("Template saved successfully!");
      setShowTemplateModal(false);
      loadTemplates();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    try {
      const { data } = await api.get(`/patients/${targetPatientId}`);
      setPatient(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await medicalRecordsApi.getTemplates();
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPatientHistory = async () => {
    if (!targetPatientId) return;
    try {
      const data = await medicalRecordsApi.getPatientHistory(targetPatientId);
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyTemplate = (template: VisitTemplateDto) => {
    setFormData((prev) => ({
      ...prev,
      diagnosis: template.diagnosis || prev.diagnosis,
      advice: template.advice || prev.advice,
    }));

    if (template.prescriptionJson) {
      try {
        const parsed = JSON.parse(template.prescriptionJson);
        setPrescriptions(parsed);
      } catch (e) {
        console.error("Failed to parse template prescriptions", e);
      }
    }
  };

  const handleSave = async (
    isCompleted: boolean,
    isAutoSave: boolean = false,
  ) => {
    if (loading || isSavingRef.current) return;

    if (isCompleted) {
      if (!formData.chiefComplaint.trim()) {
        toast.error(
          "Chief Complaint & History is required to complete the visit.",
        );
        return;
      }
      if (!formData.followUpDate) {
        toast.error("Schedule Follow-up is required to complete the visit.");
        return;
      }
    }

    if (!isAutoSave) setLoading(true);
    isSavingRef.current = true;

    try {
      const request: SaveMedicalRecordRequest = {
        patientId: targetPatientId,
        appointmentId: targetAppointmentId,
        chiefComplaint: formData.chiefComplaint,
        history: formData.historyNotes,
        diagnosis: formData.diagnosis,
        advice: formData.advice,
        labNotes: formData.labNotes,
        prescription: JSON.stringify(prescriptions),
        followUpDate: formData.followUpDate || undefined,
        weight: formData.weight,
        bp: formData.bp,
        temp: formData.temp,
        pulse: formData.pulse,
        status: isCompleted ? 1 : 0,
      };

      if (currentRecordIdRef.current) {
        await medicalRecordsApi.updateRecord(
          currentRecordIdRef.current,
          request,
        );
      } else {
        const newRecordId = await medicalRecordsApi.saveRecord(request);
        currentRecordIdRef.current = newRecordId;
      }

      setLastSaved(new Date());

      if (!isAutoSave) {
        if (isCompleted) {
          queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-activity"] });
          toast.success("Visit Completed!");
          navigate("/dashboard");
        } else {
          toast.success("Draft saved.");
        }
      }
    } catch (e) {
      if (!isAutoSave) {
        console.error(e);
        toast.error("Failed to save record");
      }
    } finally {
      if (!isAutoSave) setLoading(false);
      isSavingRef.current = false;
    }
  };

  const handleShareWhatsApp = () => {
    if (!patient) return;
    const link = medicalRecordsApi.generateWhatsAppLink(
      patient.phone,
      `${patient.firstName} ${patient.lastName}`,
      formData.diagnosis,
      prescriptions
        .map(
          (p) =>
            `- ${p.medicineObj?.brandName || "Medicine"} (${p.dose}) ${p.frequency}`,
        )
        .join("\n"),
      formData.followUpDate,
    );
    window.open(link, "_blank");
  };

  const handleFollowUpOffset = (days: number) => {
    const date = addDays(new Date(), days);
    setFormData({ ...formData, followUpDate: format(date, "yyyy-MM-dd") });
  };

  const addAdvice = (text: string) => {
    setFormData((prev) => ({
      ...prev,
      advice: prev.advice ? `${prev.advice}. ${text}` : text,
    }));
  };

  const age = patient
    ? new Date().getFullYear() - new Date(patient.dob).getFullYear()
    : "";

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 overflow-hidden print:h-auto print:overflow-visible relative">
      {/* Left Pane - Active Visit Form */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* ENHANCED HEADER BAR */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} className="text-slate-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                  {patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : "Loading..."}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                  <span>{patient?.gender}</span>
                  <span className="opacity-30">•</span>
                  <span>{age} Years</span>
                  <span className="opacity-30">•</span>
                  <span className="text-primary">{patient?.bloodGroup}</span>
                  {lastSaved && (
                    <span className="ml-4 text-emerald-500 lowercase font-normal italic">
                      Auto-saved at {format(lastSaved, "HH:mm:ss")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="rounded-xl border-slate-200"
            >
              <Share2 size={16} className="mr-2" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl border-slate-200"
            >
              <Printer size={16} className="mr-2" /> Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="rounded-xl text-slate-600"
            >
              <Save size={16} className="mr-2" /> Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAsTemplate}
              disabled={loading}
              className="rounded-xl border-slate-200"
            >
              <FileText size={16} className="mr-2" /> Save Template
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={loading}
              className="rounded-xl shadow-lg shadow-primary/20"
            >
              Complete Visit (Ctrl+Enter)
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {/* Vitals & Chief Complaint */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <Card className="shadow-sm border-slate-200 rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Baseline Vitals
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      placeholder="120/80"
                      className="w-full text-sm font-bold border-b-2 border-slate-100 py-1 focus:outline-none focus:border-primary bg-transparent text-slate-700"
                      value={formData.bp}
                      onChange={(e) =>
                        setFormData({ ...formData, bp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Weight (kg)
                    </label>
                    <input
                      type="text"
                      placeholder="75"
                      className="w-full text-sm font-bold border-b-2 border-slate-100 py-1 focus:outline-none focus:border-primary bg-transparent text-slate-700"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Temp (°F)
                    </label>
                    <input
                      type="text"
                      placeholder="98.6"
                      className="w-full text-sm font-bold border-b-2 border-slate-100 py-1 focus:outline-none focus:border-primary bg-transparent text-slate-700"
                      value={formData.temp}
                      onChange={(e) =>
                        setFormData({ ...formData, temp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Pulse (bpm)
                    </label>
                    <input
                      type="text"
                      placeholder="72"
                      className="w-full text-sm font-bold border-b-2 border-slate-100 py-1 focus:outline-none focus:border-primary bg-transparent text-slate-700"
                      value={formData.pulse}
                      onChange={(e) =>
                        setFormData({ ...formData, pulse: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="xl:col-span-2">
              <Card className="shadow-sm border-slate-200 rounded-2xl p-0 overflow-hidden flex flex-col h-full">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Chief Complaint & History
                  </h4>
                </div>
                <textarea
                  placeholder="Why is the patient here? e.g. Fever for 3 days, body ache..."
                  className="w-full flex-1 p-4 text-sm border-none bg-white resize-none focus:outline-none min-h-[100px]"
                  value={formData.chiefComplaint}
                  onChange={(e) =>
                    setFormData({ ...formData, chiefComplaint: e.target.value })
                  }
                />
              </Card>
            </div>
          </div>

          {/* Templates Quick Bar */}
          {templates.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleApplyTemplate(t)}
                    className="text-xs font-bold px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                  >
                    {t.templateName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Findings & Diagnosis */}
          <Card className="shadow-sm border-slate-200 rounded-2xl p-0 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Diagnosis & Clinical Notes
              </h4>
              <Activity size={16} className="text-slate-300" />
            </div>
            <div className="p-4 space-y-4">
              <input
                type="text"
                placeholder="Primary Diagnosis (e.g., Viral Fever)"
                className="w-full p-3 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
              />
              <textarea
                placeholder="Secondary observations, physical exam results..."
                className="w-full h-20 p-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-primary bg-white"
                value={formData.historyNotes}
                onChange={(e) =>
                  setFormData({ ...formData, historyNotes: e.target.value })
                }
              />
            </div>
          </Card>

          {/* Prescriptions */}
          <Card className="shadow-sm border-slate-200 rounded-2xl p-0 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Medications
              </h4>
            </div>
            <div className="p-4">
              <SmartPrescriptionTable
                prescriptions={prescriptions}
                onChange={setPrescriptions}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Lab Orders */}
            <Card className="shadow-sm border-slate-200 rounded-2xl p-0 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Lab & Investigations
                </h4>
              </div>
              <textarea
                placeholder="Order tests like CBC, ESR, X-Ray..."
                className="w-full h-32 p-4 text-sm border-none bg-white resize-none focus:outline-none"
                value={formData.labNotes}
                onChange={(e) =>
                  setFormData({ ...formData, labNotes: e.target.value })
                }
              />
            </Card>

            {/* Advice & Follow-up */}
            <Card className="shadow-sm border-slate-200 rounded-2xl p-0 overflow-hidden flex flex-col">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Advice & Follow-up
                </h4>
              </div>
              <div className="p-4 flex-1 flex flex-col space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {ADVICE_SHORTCUTS.map((advice) => (
                    <button
                      key={advice}
                      onClick={() => addAdvice(advice)}
                      className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors border border-transparent"
                    >
                      + {advice}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="General advice, diet, precautions..."
                  className="w-full flex-1 min-h-[80px] p-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:border-primary bg-white"
                  value={formData.advice}
                  onChange={(e) =>
                    setFormData({ ...formData, advice: e.target.value })
                  }
                />
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                    Schedule Follow-up
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleFollowUpOffset(3)}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all"
                    >
                      +3 Days
                    </button>
                    <button
                      onClick={() => handleFollowUpOffset(7)}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all"
                    >
                      +1 Wk
                    </button>
                    <button
                      onClick={() => handleFollowUpOffset(14)}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all"
                    >
                      +2 Wks
                    </button>
                    <button
                      onClick={() => handleFollowUpOffset(30)}
                      className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all"
                    >
                      +1 Mo
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Calendar size={14} className="text-slate-400" />
                    </div>
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-bold text-slate-700"
                      value={formData.followUpDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          followUpDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Pane - Visit History Sidebar */}
      <div className="w-80 flex flex-col gap-6 overflow-y-auto hidden xl:flex print:hidden">
        <div className="flex flex-col gap-6">
          <MedicineHistoryTable
            history={history}
            onAddMedicine={(med) => {
              const newPrescription = {
                id: Math.random().toString(),
                medicineObj: med.medicineObj || {
                  id: med.medicineId,
                  brandName: med.brandName,
                  genericName: med.genericName,
                  strength: med.strength,
                  form: med.form,
                },
                dose: med.dose,
                duration: med.duration,
                frequency: med.frequency,
                instructions: med.instructions,
              };
              setPrescriptions([...prescriptions, newPrescription]);
              toast.success("Added from history");
            }}
          />

          {/* Previous Diagnoses Quick View */}
          <Card className="shadow-sm border-slate-200 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Previous Diagnoses
            </h4>
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No history</p>
              ) : (
                history.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <p className="text-xs font-bold text-slate-700 uppercase">
                      {h.diagnosis || "No Diagnosis"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {format(new Date(h.createdAt), "dd MMM yyyy")} •{" "}
                      {h.doctorName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Save as Template
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter a name for this template so you can reuse it later.
            </p>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Standard Viral Fever"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-6"
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitTemplate();
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={submitTemplate}
                disabled={loading}
                className="rounded-xl"
              >
                {loading ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVisitScreen;
