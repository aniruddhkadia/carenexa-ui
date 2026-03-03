import React from "react";
import { Pill, Calendar, User, ShoppingCart, Info } from "lucide-react";
import { format } from "date-fns";

interface MedicineHistoryTableProps {
  history: any[];
  onAddMedicine?: (medicine: any) => void;
}

const MedicineHistoryTable: React.FC<MedicineHistoryTableProps> = ({
  history,
  onAddMedicine,
}) => {
  // Flatten medications from all past records
  const allMedications = history.flatMap((record) => {
    try {
      if (!record.prescription) return [];
      const medications = JSON.parse(record.prescription);
      if (!Array.isArray(medications)) return [];

      return medications.map((med: any) => ({
        ...med,
        date: record.createdAt,
        diagnosis: record.diagnosis,
        doctor: record.doctorName,
      }));
    } catch (e) {
      console.error("Failed to parse history prescription", e);
      return [];
    }
  });

  // Sort by date descending
  allMedications.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Pill size={14} className="text-primary" />
          Medication History
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
          {allMedications.length} Records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/30 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Dose / Freq</th>
              <th className="px-4 py-3">Prescribed On</th>
              {onAddMedicine && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allMedications.length === 0 ? (
              <tr>
                <td
                  colSpan={onAddMedicine ? 4 : 3}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    <Info size={32} />
                    <p className="font-bold">No previous medications</p>
                  </div>
                </td>
              </tr>
            ) : (
              allMedications.map((med, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800">
                      {med.medicineObj?.brandName ||
                        med.brandName ||
                        "Medicine"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                      {med.medicineObj?.genericName || med.genericName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-700 font-bold">{med.dose}</div>
                    <div className="text-[10px] text-primary font-bold">
                      {med.frequency}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold whitespace-nowrap">
                      {format(new Date(med.date), "dd MMM yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium italic">
                      {med.doctor}
                    </div>
                  </td>
                  {onAddMedicine && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onAddMedicine(med)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Re-prescribe"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineHistoryTable;
