import React, { useState } from "react";
import {
  Search,
  Plus,
  Pill,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/axios";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Medicine {
  id: string;
  genericName: string;
  brandName: string;
  strength: string;
  form: string;
  isActive: boolean;
  createdAt: string;
}

const MedicineManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    brandName: "",
    genericName: "",
    strength: "",
    form: "Tablet",
    isActive: true,
  });

  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ["medicines", searchTerm],
    queryFn: async () => {
      const { data } = await api.get(`/medicines/search?q=${searchTerm || ""}`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      return await api.post("/medicines", newData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added successfully");
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (medicine: any) => {
      return await api.put(`/medicines/${medicine.id}`, medicine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated");
      setEditingMedicine(null);
      setShowAddModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/medicines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      id: "",
      brandName: "",
      genericName: "",
      strength: "",
      form: "Tablet",
      isActive: true,
    });
    setEditingMedicine(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedicine) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      id: med.id,
      brandName: med.brandName,
      genericName: med.genericName,
      strength: med.strength,
      form: med.form,
      isActive: med.isActive,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Medicine Catalog
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Manage available medications for prescription
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
          <Plus size={18} className="mr-2" /> Add Medicine
        </Button>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by brand or generic name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Composition</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center animate-pulse text-slate-400"
                  >
                    Loading catalog...
                  </td>
                </tr>
              ) : medicines?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400 font-medium"
                  >
                    No medicines found.
                  </td>
                </tr>
              ) : (
                medicines?.map((med) => (
                  <tr
                    key={med.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <Pill size={16} />
                        </div>
                        <div className="font-bold text-slate-800 uppercase tracking-tight">
                          {med.brandName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600">
                        {med.strength}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                      {med.genericName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">
                        {med.form}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {med.createdAt
                        ? format(new Date(med.createdAt), "dd MMM yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {med.isActive ? (
                        <div className="flex items-center text-emerald-600 font-bold text-[10px] uppercase">
                          <CheckCircle size={12} className="mr-1" /> Active
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 font-bold text-[10px] uppercase">
                          <XCircle size={12} className="mr-1" /> Inactive
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(med)}
                          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={10} />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest pl-1">
                  Brand Name
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  placeholder="e.g. Dolo"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 tracking-widest pl-1">
                  Generic Name
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  value={formData.genericName}
                  onChange={(e) =>
                    setFormData({ ...formData, genericName: e.target.value })
                  }
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest pl-1">
                    Strength
                  </label>
                  <input
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    value={formData.strength}
                    onChange={(e) =>
                      setFormData({ ...formData, strength: e.target.value })
                    }
                    placeholder="e.g. 650mg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 tracking-widest pl-1">
                    Form
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    value={formData.form}
                    onChange={(e) =>
                      setFormData({ ...formData, form: e.target.value })
                    }
                  >
                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Ointment</option>
                    <option>Drops</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-xs font-bold text-slate-600"
                >
                  Medicine is Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                >
                  Save Medicine
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
