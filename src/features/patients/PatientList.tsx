import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PatientRegistrationForm from "./PatientRegistrationForm";
import toast from "react-hot-toast";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
}

interface PaginatedPatients {
  items: Patient[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const columnHelper = createColumnHelper<Patient>();

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<
    string | undefined
  >();

  const { data, isLoading, refetch } = useQuery<PaginatedPatients>({
    queryKey: ["patients", page, searchTerm],
    queryFn: async () => {
      const { data } = await api.get(
        `/patients?q=${searchTerm}&page=${page}&pageSize=${pageSize}`,
      );
      return data;
    },
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient deleted successfully");
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string) => {
    setEditingPatientId(id);
    setIsRegistering(true);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: "fullName",
        header: "Name",
        cell: (info) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
              {info.getValue().charAt(0)}
            </div>
            <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("dob", {
        header: "DOB",
        cell: (info) => {
          const birthDate = new Date(info.getValue());
          const age = new Date().getFullYear() - birthDate.getFullYear();
          return (
            <div className="text-sm">
              <p className="text-slate-900 dark:text-slate-200">
                {info.getValue()}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {age} Years
              </p>
            </div>
          );
        },
      }),
      columnHelper.accessor("phone", {
        header: "Contact",
        cell: (info) => (
          <div className="text-sm">
            <p className="text-slate-900 dark:text-slate-200">
              {info.getValue()}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {info.row.original.email}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => (
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {info.getValue()}
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
              onClick={() => navigate(`/patients/${info.row.original.id}`)}
              className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="View Profile"
            >
              <Eye size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(info.row.original.id)}
              className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Edit Profile"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(info.row.original.id)}
              className="h-9 w-9 p-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Delete Profile"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      }),
    ],
    [navigate],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const totalPages = Math.ceil((data?.totalCount ?? 0) / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Patients
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage your patient database.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPatientId(undefined);
            setIsRegistering(true);
          }}
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus size={18} className="mr-2" />
          Register Patient
        </Button>
      </div>

      <Card className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-widest"
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    No patients found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Registration / Edit Form */}
      {isRegistering && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <PatientRegistrationForm
              patientId={editingPatientId}
              onSuccess={() => {
                setIsRegistering(false);
                setEditingPatientId(undefined);
                refetch();
              }}
              onCancel={() => {
                setIsRegistering(false);
                setEditingPatientId(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
