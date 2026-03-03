import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "./settings.api";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
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
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"clinic" | "profile" | "team">(
    "clinic",
  );
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";

  // Queries
  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: settingsApi.getMyClinic,
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: settingsApi.getProfile,
  });

  const { data: staff } = useQuery({
    queryKey: ["clinic-staff"],
    queryFn: settingsApi.getStaff,
    enabled: isAdmin,
  });

  // Mutations
  const updateClinicMutation = useMutation({
    mutationFn: settingsApi.updateMyClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-clinic"] });
      toast.success("Clinic profile updated successfully!");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Personal profile updated successfully!");
    },
  });

  const [showAddStaff, setShowAddStaff] = useState(false);

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Settings</h1>
          <p className="text-slate-500">
            Manage your clinic, profile, and team permissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("clinic")}
          className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "clinic"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 size={18} className="mr-2" /> Clinic Profile
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "profile"
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <User size={18} className="mr-2" /> Personal Profile
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "team"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users size={18} className="mr-2" /> Team Management
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Clinic Settings */}
        {activeTab === "clinic" && clinic && (
          <Card
            title="Clinic Information"
            description="Update your clinic's public presence"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateClinicMutation.mutate({
                  ...clinic,
                  clinicName: formData.get("clinicName") as string,
                  address: formData.get("address") as string,
                  phone: formData.get("phone") as string,
                  email: formData.get("email") as string,
                  logoUrl: formData.get("logoUrl") as string,
                });
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Clinic Name"
                  name="clinicName"
                  defaultValue={clinic.clinicName}
                  icon={<Building2 size={18} />}
                />
                <Input
                  label="Contact Phone"
                  name="phone"
                  defaultValue={clinic.phone}
                  icon={<Phone size={18} />}
                />
                <Input
                  label="Email Address"
                  name="email"
                  defaultValue={clinic.email}
                  icon={<Mail size={18} />}
                />
                <Input
                  label="Address"
                  name="address"
                  defaultValue={clinic.address}
                  icon={<MapPin size={18} />}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Logo URL (Icon path/URL)"
                    name="logoUrl"
                    defaultValue={clinic.logoUrl}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  isLoading={updateClinicMutation.isPending}
                  className="px-8"
                >
                  <Save size={18} className="mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Profile Settings */}
        {activeTab === "profile" && profile && (
          <Card
            title="My Profile"
            description="Update your professional credentials"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateProfileMutation.mutate({
                  id: profile.id,
                  fullName: formData.get("fullName") as string,
                  phoneNumber: formData.get("phone") as string,
                  specialization: formData.get("specialization") as string,
                  qualification: formData.get("qualification") as string,
                });
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="fullName"
                  defaultValue={profile.fullName}
                  icon={<User size={18} />}
                />
                <Input
                  label="Email Address"
                  defaultValue={profile.email}
                  disabled
                  icon={<Mail size={18} />}
                  hint="Email cannot be changed"
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  defaultValue={profile.phoneNumber}
                  icon={<Phone size={18} />}
                />
                <Input
                  label="Specialization"
                  name="specialization"
                  defaultValue={profile.specialization}
                  icon={<Stethoscope size={18} />}
                  placeholder="e.g. Cardiologist"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Qualification"
                    name="qualification"
                    defaultValue={profile.qualification}
                    icon={<GraduationCap size={18} />}
                    placeholder="e.g. MBBS, MD"
                  />
                </div>
                <div className="md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                  <ShieldCheck className="text-primary mr-3" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase">
                      System Role
                    </p>
                    <p className="text-sm text-slate-500 font-medium">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  isLoading={updateProfileMutation.isPending}
                  className="px-8"
                >
                  <Save size={18} className="mr-2" /> Update Profile
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Team Management */}
        {activeTab === "team" && isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-800">Clinic Staff</h3>
              <Button onClick={() => setShowAddStaff(true)} size="sm">
                <Plus size={18} className="mr-2" /> Add Staff
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff?.map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {member.fullName.charAt(0)}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        member.role === "Doctor"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 mb-1">
                    {member.fullName}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center mb-1">
                    <Mail size={12} className="mr-1.5" /> {member.email}
                  </p>
                  {member.phoneNumber && (
                    <p className="text-xs text-slate-500 flex items-center">
                      <Phone size={12} className="mr-1.5" />{" "}
                      {member.phoneNumber}
                    </p>
                  )}
                  {member.specialization && (
                    <p className="mt-3 text-[10px] text-primary font-bold uppercase">
                      {member.specialization}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Add Staff Modal (Simplified) */}
            {showAddStaff && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                    Add Staff Member
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      try {
                        await settingsApi.createStaff({
                          fullName: formData.get("fullName"),
                          email: formData.get("email"),
                          password: formData.get("password"),
                          role: formData.get("role"),
                          phoneNumber: formData.get("phone"),
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["clinic-staff"],
                        });
                        setShowAddStaff(false);
                      } catch (err: any) {
                        toast.error(
                          err.response?.data?.message || "Failed to add staff",
                        );
                      }
                    }}
                    className="space-y-4"
                  >
                    <Input label="Full Name" name="fullName" required />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      required
                    />
                    <Input
                      label="Temporary Password"
                      name="password"
                      type="password"
                      required
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
                    <Input label="Phone" name="phone" />
                    <div className="flex gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowAddStaff(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Create Account
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
