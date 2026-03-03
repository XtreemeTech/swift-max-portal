import { useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { adminAPI } from "../../services/api";

export default function FileUpload({ onUploadSuccess }) {

  const [salaryFile, setSalaryFile] = useState(null);
  const [clawbackFile, setClawbackFile] = useState(null);
  const [month, setMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const formatSalaryMonth = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `${year}-${month}-01`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!salaryFile && !clawbackFile) {
      setError("Please upload at least one file (Salary or Clawback).");
      return;
    }

    if (!month) {
      setError("Please select salary month.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const formattedMonth = formatSalaryMonth(month);

      const result = await adminAPI.uploadSalary(
        salaryFile,
        clawbackFile,
        formattedMonth,
        notes
      );

      setSuccessMessage(
        `Upload successful • Records: ${result.total_records || 0} • Clawbacks: ${result.clawback_records_imported || 0}`
      );

      setSalaryFile(null);
      setClawbackFile(null);
      setMonth("");
      setNotes("");

      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-8 max-w-3xl mx-auto shadow-lg text-gray-900"
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
        Upload Salary / Clawback Data
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Month */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Salary Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
            required
          />
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
            Select Salary File
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

        {error && (
          <div className="text-red-600 text-sm font-medium mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}