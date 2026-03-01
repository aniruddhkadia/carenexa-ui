import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Card from "../../components/common/Card";
import api from "../../lib/axios";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().optional(),
  chiefComplaint: z.string().optional(),
  address: z.string().min(5, "Address is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "Male",
    },
  });

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
    setServerError("");

    try {
      await api.post("/patients", data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setServerError(
        err.response?.data || "Failed to register patient. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title="Register New Patient"
      description="Enter the patient's personal and medical information"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Input
            label="Blood Group"
            {...register("bloodGroup")}
            error={errors.bloodGroup?.message}
            placeholder="O+"
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

        {serverError && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 animate-shake">
            {serverError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
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
            Register Patient
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PatientRegistrationForm;
