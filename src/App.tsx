import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./features/dashboard/Dashboard";
import PatientList from "./features/patients/PatientList";
import LoginPage from "./features/auth/LoginPage";
import ForgotPasswordPage from "./features/auth/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AppointmentCalendar from "./features/appointments/AppointmentCalendar";
import PatientProfilePage from "./features/patients/PatientProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
            <Route path="appointments" element={<AppointmentCalendar />} />
            <Route
              path="medical-records"
              element={<div className="p-4">Medical Records (Coming Soon)</div>}
            />
            <Route
              path="billing"
              element={<div className="p-4">Billing (Coming Soon)</div>}
            />
            <Route
              path="insurance"
              element={
                <div className="p-4">Insurance Claims (Coming Soon)</div>
              }
            />
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
