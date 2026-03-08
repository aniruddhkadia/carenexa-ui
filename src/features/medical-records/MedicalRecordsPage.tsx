import React, { useState } from "react";
import {
  FileText,
  Search,
  User,
  Clock,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Stethoscope,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { format } from "date-fns";
import ViewMedicalRecordModal from "./ViewMedicalRecordModal";
import Pagination from "../../components/common/Pagination";

interface MedicalRecord {
  id: string;
  patientFullName: string;
  diagnosis: string;
  doctorName: string;
  createdAt: string;
  status: string;
}

const MedicalRecordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery<{
    items: MedicalRecord[];
    totalCount: number;
  }>({
    queryKey: ["all-medical-records", page, pageSize, searchTerm],
    queryFn: async () => {
      const { data } = await api.get(
        `/medicalrecords?page=${page}&pageSize=${pageSize}`,
      );
      return data;
    },
  });

  const records = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const filteredRecords = records?.filter(
    (record) =>
      record.patientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medical Records</h1>
          <p className="text-slate-500 mt-1">
            Central repository of all patient visits and clinical notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by patient, diagnosis or doctor..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            className="rounded-xl border border-slate-200"
          >
            <Filter size={18} className="mr-2" /> Filter
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-primary rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Total Records
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {records?.length || 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Completed Today
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {records?.filter(
                  (r) =>
                    format(new Date(r.createdAt), "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd"),
                ).length || 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Clock size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Active Doctors
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {new Set(records?.map((r) => r.doctorName)).size}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Stethoscope size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Records Table */}
      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Diagnosis</th>
                <th className="px-6 py-4">Consulted By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRecords?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center">
                      <FileText size={48} className="mb-2 opacity-20" />
                      <p className="font-medium">No medical records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords?.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                          <User size={16} />
                        </div>
                        <span className="font-bold text-slate-800">
                          {record.patientFullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium italic">
                      {record.diagnosis || "No specific diagnosis"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-tight flex items-center">
                        <Stethoscope
                          size={14}
                          className="mr-1.5 text-slate-400"
                        />
                        Dr. {record.doctorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {format(
                        new Date(record.createdAt),
                        "dd MMM yyyy, hh:mm a",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          record.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRecordId(record.id)}
                        className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </Card>

      {/* View Modal */}
      {selectedRecordId && (
        <ViewMedicalRecordModal
          recordId={selectedRecordId}
          onClose={() => setSelectedRecordId(null)}
        />
      )}
    </div>
  );
};

export default MedicalRecordsPage;
