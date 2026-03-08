import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./features/dashboard/Dashboard";
import { X } from "lucide-react";
import PatientList from "./features/patients/PatientList";
import LoginPage from "./features/auth/LoginPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AppointmentCalendar from "./features/appointments/AppointmentCalendar";
import PatientProfilePage from "./features/patients/PatientProfilePage";
import PatientVisitScreen from "./features/medical-records/PatientVisitScreen";
import MedicineManagement from "./features/medical-records/MedicineManagement";
import MedicalRecordsPage from "./features/medical-records/MedicalRecordsPage";
import SettingsPage from "./features/settings/SettingsPage";
import TeamManagementPage from "./features/team/TeamManagementPage";
import toast, { Toaster, ToastBar } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "shadow-xl border border-slate-100",
          success: {
            style: {
              borderLeft: "5px solid #10b981", // emerald-500
              padding: "16px 20px",
              color: "#334155", // slate-700
              fontWeight: 600,
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "white",
            },
          },
          error: {
            style: {
              borderLeft: "5px solid #ef4444", // red-500
              padding: "16px 20px",
              color: "#334155",
              fontWeight: 600,
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-4 p-1 rounded-md transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route
              path="patients"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Doctor",
                    "Nurse",
                    "Staff",
                    "Admin",
                    "SuperAdmin",
                  ]}
                />
              }
            >
              <Route index element={<PatientList />} />
              <Route path=":id" element={<PatientProfilePage />} />
            </Route>

            <Route
              path="appointments"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Doctor",
                    "Nurse",
                    "Staff",
                    "Admin",
                    "SuperAdmin",
                  ]}
                />
              }
            >
              <Route index element={<AppointmentCalendar />} />
            </Route>

            <Route
              path="records"
              element={
                <ProtectedRoute
                  allowedRoles={["Doctor", "Nurse", "Admin", "SuperAdmin"]}
                />
              }
            >
              <Route index element={<MedicalRecordsPage />} />
            </Route>

            <Route
              path="medical-records/:patientId/:appointmentId?"
              element={
                <ProtectedRoute
                  allowedRoles={["Doctor", "Nurse", "Admin", "SuperAdmin"]}
                />
              }
            >
              <Route index element={<PatientVisitScreen />} />
            </Route>
            <Route
              path="medicines"
              element={
                <ProtectedRoute
                  allowedRoles={["Doctor", "Nurse", "Admin", "SuperAdmin"]}
                />
              }
            >
              <Route index element={<MedicineManagement />} />
            </Route>
            <Route
              path="billing"
              element={
                <ProtectedRoute
                  allowedRoles={["Admin", "SuperAdmin", "Staff"]}
                />
              }
            >
              <Route
                index
                element={<div className="p-4">Billing (Coming Soon)</div>}
              />
            </Route>
            <Route
              path="insurance"
              element={
                <ProtectedRoute
                  allowedRoles={["Admin", "Insurance", "SuperAdmin"]}
                />
              }
            >
              <Route
                index
                element={
                  <div className="p-4">Insurance Claims (Coming Soon)</div>
                }
              />
            </Route>
            <Route
              path="settings"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "Admin",
                    "SuperAdmin",
                    "Doctor",
                    "Nurse",
                    "Staff",
                  ]}
                />
              }
            >
              <Route index element={<SettingsPage />} />
            </Route>
            <Route
              path="team"
              element={<ProtectedRoute allowedRoles={["SuperAdmin"]} />}
            >
              <Route index element={<TeamManagementPage />} />
            </Route>
          </Route>
        </Route>
        <Route
          path="/unauthorized"
          element={<div className="p-4">Unauthorized Access</div>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
