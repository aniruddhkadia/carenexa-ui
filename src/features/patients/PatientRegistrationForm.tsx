import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import BloodGroupSelect, {
  BLOOD_GROUPS,
} from "../../components/common/BloodGroupSelect";
import api from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z
    .enum(BLOOD_GROUPS as unknown as [string, ...string[]])
    .optional()
    .or(z.literal("")),
  chiefComplaint: z.string().optional(),
  address: z.string().min(5, "Address is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientRegistrationFormProps {
  patientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  patientId,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const { data: patientData, isLoading: isFetching } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const { data } = await api.get(`/patients/${patientId}`);
      return data;
    },
    enabled: !!patientId,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "Male",
    },
  });

  useEffect(() => {
    if (patientData) {
      reset({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || "",
        phone: patientData.phone,
        dob: patientData.dob.split("T")[0],
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup || "",
        address: patientData.address,
        chiefComplaint: patientData.chiefComplaint || "",
      });
    }
  }, [patientData, reset]);

  const dobValue = watch("dob");

  useEffect(() => {
    if (dobValue) {
      const birthDate = new Date(dobValue);
      if (!isNaN(birthDate.getTime())) {
        const age = new Date().getFullYear() - birthDate.getFullYear();
        setCalculatedAge(age);
      } else {
        setCalculatedAge(null);
      }
    }
  }, [dobValue]);

  const onSubmit = async (data: PatientFormValues) => {
    setIsLoading(true);

    try {
      if (patientId) {
        await api.put(`/patients/${patientId}`, { ...data, id: patientId });
      } else {
        await api.post("/patients", data);
      }
      toast.success(
        patientId
          ? "Patient updated successfully"
          : "Patient registered successfully",
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data || "Failed to save patient. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card
        title="Loading Patient Details..."
        description="Please wait while we fetch the information."
      >
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={patientId ? "Edit Patient" : "Register New Patient"}
      description={
        patientId
          ? "Update the patient's personal and medical information"
          : "Enter the patient's personal and medical information"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            {...register("firstName")}
            error={errors.firstName?.message}
            placeholder="John"
          />
          <Input
            label="Last Name *"
            {...register("lastName")}
            error={errors.lastName?.message}
            placeholder="Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            {...register("phone")}
            error={errors.phone?.message}
            placeholder="9876543210"
          />
          <Input
            label="Email Address"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              label="Date of Birth *"
              type="date"
              {...register("dob")}
              error={errors.dob?.message}
            />
            {calculatedAge !== null && (
              <span className="absolute right-0 top-0 text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                {calculatedAge} Yrs
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gender *
            </label>
            <select
              {...register("gender")}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 dark:text-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-500">
                {errors.gender.message}
              </p>
            )}
          </div>
          <BloodGroupSelect
            label="Blood Group"
            {...register("bloodGroup")}
            error={errors.bloodGroup?.message}
          />
        </div>

        <Input
          label="Chief Complaint"
          {...register("chiefComplaint")}
          error={errors.chiefComplaint?.message}
          placeholder="e.g. Fever, cold, headache"
        />

        <Input
          label="Residential Address *"
          {...register("address")}
          error={errors.address?.message}
          placeholder="123 Health St, Medical District"
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="rounded-xl shadow-lg shadow-primary/20"
          >
            {patientId ? "Save Changes" : "Register Patient"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PatientRegistrationForm;
