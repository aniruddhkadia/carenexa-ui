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
  Save,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Stethoscope,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
  const [activeTab, setActiveTab] = useState<"clinic" | "profile">(
    isAdmin ? "clinic" : "profile",
  );
  const queryClient = useQueryClient();

  // Queries
  const { data: clinic } = useQuery({
    queryKey: ["my-clinic"],
    queryFn: settingsApi.getMyClinic,
    enabled: isAdmin,
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: settingsApi.getProfile,
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

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Settings</h1>
          <p className="text-slate-500 mt-1">
            Manage your clinic, profile, and team permissions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {isAdmin && (
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
        )}
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
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Clinic Settings */}
        {activeTab === "clinic" && clinic && (
          <Card
            title="Clinic Information"
            // description="Update your clinic's public presence"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            // description="Update your professional credentials"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
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

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${profile.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                    >
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase">
                        Account Status
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {profile.isActive ? "Active" : "Deactivated"}
                      </p>
                    </div>
                  </div>

                  {profile.renewalDueDate && (
                    <div
                      className={`p-3 rounded-xl border flex items-center ${new Date(profile.renewalDueDate) < new Date() ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${new Date(profile.renewalDueDate) < new Date() ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"}`}
                      >
                        <Save size={16} />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold uppercase ${new Date(profile.renewalDueDate) < new Date() ? "text-red-700" : "text-slate-700"}`}
                        >
                          Renewal Due
                        </p>
                        <p
                          className={`text-sm font-medium ${new Date(profile.renewalDueDate) < new Date() ? "text-red-600" : "text-slate-500"}`}
                        >
                          {new Date(
                            profile.renewalDueDate,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {profile.createdAt && (
                  <div className="md:col-span-3 flex justify-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Account created on{" "}
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
                {" "}
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
      </div>
    </div>
  );
};

export default SettingsPage;
