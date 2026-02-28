import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle } from "lucide-react";
import { adminAPI } from "../../services/api";

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !month) {
      alert("Please select month and file");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const result = await adminAPI.uploadSalary(file, month);

      setSuccessMessage(
        `Uploaded ${result.total_records} records successfully`
      );

      setFile(null);
      setMonth("");

      // 🔥 Trigger history refresh
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Month Input */}
      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Salary Month
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
          required
        />
      </div>

      {/* File Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50">
        <UploadCloud className="mx-auto text-blue-600 mb-4" size={40} />

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="fileUpload"
          required
        />

        <label
          htmlFor="fileUpload"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer"
        >
          Browse File
        </label>
      </div>

      {file && (
        <div className="bg-gray-100 p-4 rounded-lg text-black font-medium">
          Selected File: {file.name}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Uploading...
          </>
        ) : (
          "Upload Salary File"
        )}
      </button>

      {successMessage && (
        <div className="text-green-600 font-semibold flex items-center gap-2">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="text-red-600 font-semibold">
          {error}
        </div>
      )}
    </form>
  );
}