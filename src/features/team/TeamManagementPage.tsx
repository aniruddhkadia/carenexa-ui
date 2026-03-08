import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { settingsApi } from "../settings/settings.api";
import type { UserProfileDto } from "../settings/settings.api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { confirmToast } from "../../utils/toast";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  Building2,
  User,
  Users,
  Save,
  Plus,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Stethoscope,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Search,
  Calendar,
  Clock,
  Briefcase,
} from "lucide-react";

const columnHelper = createColumnHelper<UserProfileDto>();

const TeamManagementPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "SuperAdmin";
  const queryClient = useQueryClient();
  const isSuperAdmin = user?.role === "SuperAdmin";

  // Queries
  const { data: staff, isLoading } = useQuery({
    queryKey: ["clinic-staff"],
    queryFn: settingsApi.getStaff,
    enabled: isAdmin,
  });

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<UserProfileDto | null>(null);
  const [viewingStaff, setViewingStaff] = useState<UserProfileDto | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Team mutations
  const createStaffMutation = useMutation({
    mutationFn: settingsApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
      setShowAddStaff(false);
      toast.success("Staff member added successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Failed to add staff member.");
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: (data: { id: string; payload: any }) =>
      settingsApi.updateStaff(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
      setEditingStaff(null);
      toast.success("Staff details updated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Failed to update staff details.");
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: settingsApi.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-staff"] });
      toast.success("Staff removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Failed to remove staff member.");
    },
  });

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    return staff.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [staff, searchTerm]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: "Name",
        cell: (info) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
              {info.getValue().charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 uppercase tracking-tight">
                {info.getValue()}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">
                ID: {info.row.original.id.substring(0, 8)}
              </span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Role",
        cell: (info) => (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              info.getValue() === "Doctor"
                ? "bg-blue-100 text-blue-600"
                : info.getValue() === "SuperAdmin"
                  ? "bg-purple-100 text-purple-600"
                  : info.getValue() === "Nurse"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-600"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("email", {
        header: "Contact",
        cell: (info) => (
          <div className="text-sm">
            <p className="text-slate-800 font-medium flex items-center gap-1.5">
              {info.getValue()}
            </p>
            {info.row.original.phoneNumber && (
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                {info.row.original.phoneNumber}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("specialization", {
        header: "Specialization",
        cell: (info) => (
          <div className="text-sm">
            <p className="text-slate-900 font-semibold italic">
              {info.getValue() || "N/A"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {info.row.original.qualification || "-"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Status",
        cell: (info) => (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              info.getValue()
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewingStaff(info.row.original)}
              className="h-9 w-9 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50 transition-all"
              title="View Profile"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingStaff(info.row.original)}
              className="h-9 w-9 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:bg-slate-50 transition-all"
              title="Edit Staff"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={info.row.original.role === "SuperAdmin"}
              onClick={() => {
                confirmToast(
                  `Are you sure you want to remove ${info.row.original.fullName}?`,
                  () => {
                    deleteStaffMutation.mutate(info.row.original.id);
                  },
                );
              }}
              className={`h-9 w-9 p-0 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition-all ${
                info.row.original.role === "SuperAdmin"
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }`}
              title={
                info.row.original.role === "SuperAdmin"
                  ? "System Admin cannot be deleted"
                  : "Delete Staff"
              }
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      }),
    ],
    [deleteStaffMutation],
  );

  const table = useReactTable({
    data: filteredStaff,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-8">
        {/* Staff */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">
                  Staff
                </h1>
                <p className="text-slate-500 mt-1">
                  Manage your clinic staff and their access levels
                </p>
              </div>
              <Button onClick={() => setShowAddStaff(true)} size="sm">
                <Plus size={18} className="mr-2" /> Add Staff
              </Button>
            </div>
            <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm p-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    placeholder="Search by name, email or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Total Staff: {filteredStaff.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-6">
                            <div className="h-10 bg-slate-50 rounded-xl w-full" />
                          </td>
                        </tr>
                      ))
                    ) : table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-500 italic"
                        >
                          No staff members found matching "{searchTerm}"
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Add Staff Modal (Simplified) */}
            {showAddStaff && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl w-full max-w-lg p-4 shadow-2xl animate-in zoom-in-95 duration-200">
                  <h2 className="text-lg font-bold text-slate-800 pb-2 mb-2 border-b border-slate-100">
                    Add Staff Member
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createStaffMutation.mutate({
                        fullName: formData.get("fullName"),
                        email: formData.get("email"),
                        password: formData.get("password"),
                        role: formData.get("role"),
                        phoneNumber: formData.get("phone"),
                        specialization: formData.get("specialization"),
                        qualification: formData.get("qualification"),
                        renewalDueDate: formData.get("renewalDueDate") || null,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Full Name" name="fullName" required />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Renewal Due Date"
                        name="renewalDueDate"
                        type="date"
                        id="renewal-date-input"
                      />
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Quick Preset
                        </label>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const date = new Date();
                            if (val === "1m")
                              date.setMonth(date.getMonth() + 1);
                            if (val === "6m")
                              date.setMonth(date.getMonth() + 6);
                            if (val === "1y")
                              date.setFullYear(date.getFullYear() + 1);

                            const dateInput = document.getElementById(
                              "renewal-date-input",
                            ) as HTMLInputElement;
                            if (dateInput) {
                              dateInput.value = date
                                .toISOString()
                                .split("T")[0];
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="">Select duration...</option>
                          <option value="today">Today</option>
                          <option value="1m">1 Month</option>
                          <option value="6m">6 Months</option>
                          <option value="1y">1 Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Temporary Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        rightElement={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        }
                      />
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="Staff">Staff / Receptionist</option>
                          <option value="Nurse">Nurse</option>
                          <option value="Doctor">Doctor</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Phone" name="phone" />
                      <Input label="Specialization" name="specialization" />
                    </div>
                    <Input label="Qualification" name="qualification" />
                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowAddStaff(false);
                          setShowPassword(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        isLoading={createStaffMutation.isPending}
                      >
                        Create Account
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Staff Modal */}
            {editingStaff && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] w-full max-w-lg p-4 shadow-2xl animate-in zoom-in-95 duration-200">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                    Edit Staff Profile
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      updateStaffMutation.mutate({
                        id: editingStaff.id,
                        payload: {
                          id: editingStaff.id,
                          fullName: formData.get("fullName"),
                          role: formData.get("role"),
                          phoneNumber: formData.get("phone"),
                          specialization: formData.get("specialization"),
                          qualification: formData.get("qualification"),
                          isActive: formData.get("isActive") === "on",
                          renewalDueDate:
                            formData.get("renewalDueDate") || null,
                        },
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        name="fullName"
                        defaultValue={editingStaff.fullName}
                        required
                      />
                      <Input
                        label="Email Address"
                        defaultValue={editingStaff.email}
                        disabled
                        hint="Email cannot be changed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Role
                        </label>
                        <select
                          name="role"
                          defaultValue={editingStaff.role}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="Staff">Staff / Receptionist</option>
                          <option value="Nurse">Nurse</option>
                          <option value="Doctor">Doctor</option>
                        </select>
                      </div>
                      <Input
                        label="Phone"
                        name="phone"
                        defaultValue={editingStaff.phoneNumber}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Specialization"
                        name="specialization"
                        defaultValue={editingStaff.specialization}
                      />
                      <Input
                        label="Qualification"
                        name="qualification"
                        defaultValue={editingStaff.qualification}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Renewal Due Date"
                        name="renewalDueDate"
                        type="date"
                        id="edit-renewal-date-input"
                        disabled={editingStaff.role === "SuperAdmin"}
                        defaultValue={
                          editingStaff.renewalDueDate
                            ? new Date(editingStaff.renewalDueDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                      />
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Renewal Preset
                        </label>
                        <select
                          disabled={editingStaff.role === "SuperAdmin"}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            const date = new Date();
                            if (val === "1m")
                              date.setMonth(date.getMonth() + 1);
                            if (val === "6m")
                              date.setMonth(date.getMonth() + 6);
                            if (val === "1y")
                              date.setFullYear(date.getFullYear() + 1);

                            const dateInput = document.getElementById(
                              "edit-renewal-date-input",
                            ) as HTMLInputElement;
                            if (dateInput) {
                              dateInput.value = date
                                .toISOString()
                                .split("T")[0];
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select duration...</option>
                          <option value="today">Today</option>
                          <option value="1m">1 Month</option>
                          <option value="6m">6 Months</option>
                          <option value="1y">1 Year</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Account Status
                        </p>
                        <p className="text-xs text-slate-500">
                          {editingStaff.role === "SuperAdmin"
                            ? "System Admin status cannot be deactivated"
                            : editingStaff.isActive
                              ? "This account is currently active"
                              : "This account is deactivated"}
                        </p>
                      </div>
                      <label
                        className={`relative inline-flex items-center ${
                          editingStaff.role === "SuperAdmin"
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={editingStaff.isActive}
                          disabled={editingStaff.role === "SuperAdmin"}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {editingStaff.createdAt && (
                      <p className="text-[10px] text-center text-slate-400 font-bold uppercase">
                        Account created on{" "}
                        {new Date(editingStaff.createdAt).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditingStaff(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        isLoading={updateStaffMutation.isPending}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Staff Detail Modal */}
            {viewingStaff && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative">
                    <button
                      onClick={() => setViewingStaff(null)}
                      className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    >
                      <Plus className="rotate-45" size={24} />
                    </button>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-extrabold text-white border border-white/20">
                        {viewingStaff.fullName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight">
                          {viewingStaff.fullName}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2.5 py-0.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                            {viewingStaff.role}
                          </span>
                          {!viewingStaff.isActive && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Mail size={12} /> Email Address
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewingStaff.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Phone size={12} /> Phone Number
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewingStaff.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase size={12} /> Specialization
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewingStaff.specialization || "General"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <GraduationCap size={12} /> Qualification
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {viewingStaff.qualification || "Not listed"}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            License Renewal Due
                          </p>
                          <p
                            className={`text-sm font-black ${viewingStaff.renewalDueDate && new Date(viewingStaff.renewalDueDate) < new Date() ? "text-rose-600" : "text-slate-800"}`}
                          >
                            {viewingStaff.renewalDueDate
                              ? new Date(
                                  viewingStaff.renewalDueDate,
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "No date set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl h-12"
                        onClick={() => setViewingStaff(null)}
                      >
                        Close
                      </Button>
                      <Button
                        className="flex-1 rounded-2xl h-12 shadow-lg shadow-primary/20"
                        onClick={() => {
                          setEditingStaff(viewingStaff);
                          setViewingStaff(null);
                        }}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagementPage;
