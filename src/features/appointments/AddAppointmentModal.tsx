import React, { useState, useEffect, useRef } from "react";
import Button from "../../components/common/Button";
import { appointmentsApi } from "./appointments.api";
import api from "../../lib/axios";
import { Search, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
}

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "Consultation",
    notes: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        try {
          const { data } = await api.get(
            `/patients?q=${searchTerm}&page=1&pageSize=5`,
          );
          setSearchResults(data.items);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const checkConflicts = async (patientId: string, date: string) => {
    try {
      const appointments = await appointmentsApi.getDaily(date);
      const isDuplicate = appointments.some((a) => a.patientId === patientId);
      if (isDuplicate) {
        setDuplicateWarning(
          "Warning: This patient already has an appointment booked for today.",
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error("Conflict check failed", e);
    }
  };

  useEffect(() => {
    if (formData.patientId && formData.date) {
      checkConflicts(formData.patientId, formData.date);
    }
  }, [formData.patientId, formData.date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      toast.error("Please select a patient");
      return;
    }
    setLoading(true);
    try {
      const dt = new Date(`${formData.date}T${formData.time}:00`);
      await appointmentsApi.create({
        patientId: formData.patientId,
        appointmentDate: dt.toISOString(),
        type: formData.type,
        notes: formData.notes,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create appointment", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
    });
    setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            Add New Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 pb-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Patient *
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search name or phone..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (formData.patientId) {
                    setFormData({
                      ...formData,
                      patientId: "",
                      patientName: "",
                    });
                  }
                }}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
              />
              {isSearching && (
                <Loader2
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
                  size={16}
                />
              )}
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                    onClick={() => selectPatient(p)}
                  >
                    <p className="text-sm font-bold text-slate-800">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      DOB: {p.dob} • Phone: {p.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {duplicateWarning && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <p>{duplicateWarning}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                required
                step="900" // 15 min slots
                className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Appointment Type *
            </label>
            <select
              required
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="Consultation">Consultation</option>
              <option value="FollowUp">Follow-up</option>
              <option value="Procedure">Procedure</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Brief reason or instructions..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
