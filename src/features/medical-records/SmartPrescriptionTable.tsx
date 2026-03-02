import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, Heart } from "lucide-react";
import Button from "../../components/common/Button";
import { medicalRecordsApi, type MedicineDto } from "./medicalRecords.api";

interface PrescriptionRow {
  id: string;
  medicineObj: MedicineDto | null;
  dose: string;
  duration: string;
  frequency: string;
  instructions: string;
}

interface SmartPrescriptionTableProps {
  prescriptions: PrescriptionRow[];
  onChange: (prescriptions: PrescriptionRow[]) => void;
}

const SmartPrescriptionTable: React.FC<SmartPrescriptionTableProps> = ({
  prescriptions,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineDto[]>([]);
  const [favourites, setFavourites] = useState<MedicineDto[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadFavourites();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      searchMedicines();
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query]);

  const loadFavourites = async () => {
    try {
      const data = await medicalRecordsApi.getFavourites();
      setFavourites(data);
    } catch (e) {
      console.error(e);
    }
  };

  const searchMedicines = async () => {
    try {
      const data = await medicalRecordsApi.searchMedicines(query);
      setResults(data);
      setShowDropdown(true);
    } catch (e) {
      console.error(e);
      setShowDropdown(false);
    }
  };

  const addRow = (medicine: MedicineDto | null = null) => {
    const newRow: PrescriptionRow = {
      id: Math.random().toString(),
      medicineObj: medicine,
      dose: "1 Tab",
      duration: "5 Days",
      frequency: "1-0-1",
      instructions: "After meals",
    };
    onChange([...prescriptions, newRow]);
    setQuery("");
    setShowDropdown(false);
  };

  const updateRow = (id: string, field: keyof PrescriptionRow, value: any) => {
    onChange(
      prescriptions.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const removeRow = (id: string) => {
    onChange(prescriptions.filter((p) => p.id !== id));
  };

  const toggleFavourite = async (e: React.MouseEvent, med: MedicineDto) => {
    e.stopPropagation();
    const isFav = favourites.some((f) => f.id === med.id);
    try {
      if (isFav) {
        await medicalRecordsApi.removeFavourite(med.id);
      } else {
        await medicalRecordsApi.addFavourite(med.id);
      }
      loadFavourites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 relative">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search medicine brand or generic name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {showDropdown && results.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {results.map((med) => (
                <div
                  key={med.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center group"
                  onClick={() => addRow(med)}
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-800">
                      {med.brandName} - {med.strength}
                    </div>
                    <div className="text-xs text-slate-500">
                      {med.genericName} • {med.form}
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavourite(e, med)}
                    className={`p-2 rounded-full transition-colors ${favourites.some((f) => f.id === med.id) ? "text-rose-500 bg-rose-50" : "text-slate-300 hover:bg-slate-100"}`}
                  >
                    <Heart
                      size={16}
                      fill={
                        favourites.some((f) => f.id === med.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => addRow(null)}>
          <Plus size={16} className="mr-2" /> Add Custom
        </Button>
      </div>

      {favourites.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-500 py-1">
            ⭐ Favourites:
          </span>
          {favourites.map((f) => (
            <button
              key={f.id}
              onClick={() => addRow(f)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors border border-slate-200"
            >
              {f.brandName}
            </button>
          ))}
        </div>
      )}

      {prescriptions.length > 0 ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold w-1/3">Medicine</th>
                <th className="p-3 font-semibold w-1/6">Dose</th>
                <th className="p-3 font-semibold w-1/6">Frequency</th>
                <th className="p-3 font-semibold w-1/6">Duration</th>
                <th className="p-3 font-semibold">Instructions</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    {p.medicineObj ? (
                      <div>
                        <div className="font-semibold text-slate-800 leading-tight">
                          {p.medicineObj.brandName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.medicineObj.strength} • {p.medicineObj.form}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Custom Medicine"
                        className="w-full p-2 border border-slate-300 rounded focus:border-primary text-sm"
                        value={p.instructions}
                        onChange={(e) =>
                          updateRow(p.id, "instructions", e.target.value)
                        }
                      />
                    )}
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full p-2 border border-slate-300 rounded focus:border-primary text-sm"
                      value={p.dose}
                      onChange={(e) => updateRow(p.id, "dose", e.target.value)}
                    >
                      <option value="1 Tab">1 Tab</option>
                      <option value="2 Tabs">2 Tabs</option>
                      <option value="1 Cap">1 Cap</option>
                      <option value="5 ml">5 ml</option>
                      <option value="10 ml">10 ml</option>
                      <option value="1 tsp">1 tsp</option>
                      <option value="As directed">As directed</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full p-2 border border-slate-300 rounded focus:border-primary text-sm"
                      value={p.frequency}
                      onChange={(e) =>
                        updateRow(p.id, "frequency", e.target.value)
                      }
                    >
                      <option value="1-0-1">1-0-1 (BID)</option>
                      <option value="1-1-1">1-1-1 (TID)</option>
                      <option value="1-0-0">1-0-0 (OD)</option>
                      <option value="0-0-1">0-0-1 (HS)</option>
                      <option value="SOS">SOS (As needed)</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full p-2 border border-slate-300 rounded focus:border-primary text-sm"
                      value={p.duration}
                      onChange={(e) =>
                        updateRow(p.id, "duration", e.target.value)
                      }
                    >
                      <option value="3 Days">3 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="10 Days">10 Days</option>
                      <option value="14 Days">14 Days</option>
                      <option value="1 Month">1 Month</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded focus:border-primary text-sm"
                      value={p.instructions}
                      onChange={(e) =>
                        updateRow(p.id, "instructions", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeRow(p.id)}
                      className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
          <p className="text-slate-500 font-medium">No medicines prescribed.</p>
          <p className="text-sm text-slate-400 mt-1">
            Search above or select from favourites to add prescriptions.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartPrescriptionTable;
