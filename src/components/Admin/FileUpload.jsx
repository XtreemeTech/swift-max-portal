import { useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { adminAPI } from "../../services/api";
import DateInputDDMMYYYY from "../DateInputDDMMYYYY";

export default function FileUpload({ onUploadSuccess }) {

  const [salaryFile, setSalaryFile] = useState(null);
  const [clawbackFile, setClawbackFile] = useState(null);
  const [statementDate, setStatementDate] = useState("");
  const [notes, setNotes] = useState("");
  const [watermark, setWatermark] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!salaryFile) {
      setError("Please select the Statement file. The Clawback file is optional.");
      return;
    }

    if (!statementDate) {
      setError("Please select statement date.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setWarnings([]);

      const result = await adminAPI.uploadSalary(
        salaryFile,
        clawbackFile,
        statementDate,
        notes,
        watermark
      );

      const clawbackCount = result.clawback_records_imported || 0;
      // Showing the imported total makes a mis-read amount column obvious
      // straight away, instead of surfacing as AED 0.00 on rider slips.
      const clawbackTotal = Number(result.clawback_total_amount || 0).toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      );

      setSuccessMessage(
        `Upload successful • Records: ${result.total_records || 0}` +
          (clawbackCount > 0
            ? ` • Clawbacks: ${clawbackCount} (AED ${clawbackTotal})`
            : " • Clawbacks: 0")
      );

      // Rows the parser had to skip — worth showing so nothing goes unnoticed
      setWarnings([
        ...(result.parse_errors || []),
        ...(result.clawback_errors || []),
      ]);

      setSalaryFile(null);
      setClawbackFile(null);
      setStatementDate("");
      setNotes("");
      setWatermark("");

      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 max-w-3xl mx-auto shadow-lg text-gray-900"
      style={{
        opacity: 1,
        filter: "none",
        transform: "none",
        backdropFilter: "none",
        WebkitFontSmoothing: "antialiased",
        "--tw-text-opacity": 1
      }}
    >

      <h2 className="text-2xl font-semibold mb-8">
        Upload Statement / Clawback Data
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Statement Date */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Statement Date
          </label>
          <DateInputDDMMYYYY
            value={statementDate}
            onChange={setStatementDate}
            disabled={loading}
            className="w-full min-h-[48px] border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus-within:ring-2 focus-within:ring-blue-500 outline-none"
          />
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Enter date as DD/MM/YYYY. You can upload multiple statements in the same
            month using different dates (e.g. 01/07/2026 and 10/07/2026).
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write remarks for this upload..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Watermark */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Watermark (Optional)
          </label>
          <input
            type="text"
            value={watermark}
            onChange={(e) => setWatermark(e.target.value)}
            placeholder="e.g. CONFIDENTIAL, Swift Max, January 2028"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-xs text-gray-500">
            This text will appear as a background watermark on rider statements for this month.
          </p>
        </div>

        {/* Salary File */}
        <div className="border border-dashed border-blue-400 rounded-xl p-6 text-center bg-blue-50/30">
          <UploadCloud className="mx-auto text-blue-600 mb-3" size={28} />

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setSalaryFile(e.target.files[0])}
            className="hidden"
            id="salaryUpload"
          />

          <label
            htmlFor="salaryUpload"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg cursor-pointer text-sm"
          >
            Select Statement File
          </label>

          {salaryFile && (
            <div
              className="mt-4 flex justify-between items-center bg-white border border-blue-200 px-4 py-3 rounded-lg text-sm shadow-sm"
              style={{
                opacity: 1,
                "--tw-text-opacity": 1
              }}
            >
              <span className="truncate font-medium text-gray-900">
                {salaryFile.name}
              </span>
              <X
                size={18}
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => setSalaryFile(null)}
              />
            </div>
          )}
        </div>

        {/* Clawback File */}
        <div className="border border-dashed border-purple-400 rounded-xl p-6 text-center bg-purple-50/30">
          <UploadCloud className="mx-auto text-purple-600 mb-3" size={28} />

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setClawbackFile(e.target.files[0])}
            className="hidden"
            id="clawbackUpload"
          />

          <label
            htmlFor="clawbackUpload"
            className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg cursor-pointer text-sm"
          >
            Select Clawback File
          </label>

          {clawbackFile && (
            <div
              className="mt-4 flex justify-between items-center bg-white border border-purple-200 px-4 py-3 rounded-lg text-sm shadow-sm"
              style={{
                opacity: 1,
                "--tw-text-opacity": 1
              }}
            >
              <span className="truncate font-medium text-gray-900">
                {clawbackFile.name}
              </span>
              <X
                size={18}
                className="cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => setClawbackFile(null)}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Processing..." : "Upload & Process"}
        </button>

        {successMessage && (
          <div className="text-green-600 text-sm font-medium mt-2">
            {successMessage}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold mb-2">
              {warnings.length} row{warnings.length > 1 ? "s were" : " was"} skipped:
            </p>
            <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm font-medium mt-2 whitespace-pre-line">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}