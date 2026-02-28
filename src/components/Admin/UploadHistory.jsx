import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Eye,
  Trash2,
  X,
  CheckCircle,
  Search
} from "lucide-react";
import { adminAPI } from "../../services/api";

export default function UploadHistory({ refreshTrigger }) {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Uploads
  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUploads();
      setUploads(data || []);
    } catch (error) {
      console.error("Failed to fetch uploads:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads, refreshTrigger]);

  // View Details
  const viewUpload = async (upload) => {
    try {
      const data = await adminAPI.getUploadDetails(upload.id);
      setSelectedUpload(data.upload);
      setRecords(data.records || []);
      setSearch("");
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch details:", error.message);
    }
  };

  // Delete Upload
  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUpload(id);
      fetchUploads();
      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed:", error.message);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!search) return records;
    return records.filter((r) =>
      r.rider_id?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, records]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 mt-10">

      <h2 className="text-2xl font-bold mb-8 text-black">
        Upload History
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading uploads...
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No uploads found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100 text-black">
                <th className="py-4 px-3 text-left font-bold">Month</th>
                <th className="px-3 text-left font-bold">Total Records</th>
                <th className="px-3 text-left font-bold">Uploaded By</th>
                <th className="px-3 text-left font-bold">Date</th>
                <th className="px-3 text-left font-bold">Status</th>
                <th className="px-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr
                  key={upload.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-3 font-semibold text-black">
                    {upload.salary_month_display}
                  </td>
                  <td className="px-3 text-black">
                    {upload.total_records}
                  </td>
                  <td className="px-3 text-black">
                    {upload.uploaded_by_name}
                  </td>
                  <td className="px-3 text-black">
                    {new Date(upload.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-3">
                    <span className="flex items-center gap-2 text-green-600 font-semibold">
                      <CheckCircle size={16} />
                      {upload.status}
                    </span>
                  </td>
<td className="px-3 text-right align-middle">
  <div className="flex items-center justify-end gap-4">
    <button onClick={() => viewUpload(upload)}>
      <Eye size={18} className="text-blue-600 hover:text-blue-800" />
    </button>
    <button onClick={() => setDeleteId(upload.id)}>
      <Trash2 size={18} className="text-red-600 hover:text-red-800" />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL */}
      {showModal && selectedUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">
                {selectedUpload.salary_month_display} - Rider Records
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={22} className="text-black hover:text-red-600" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative max-w-sm">
              <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search by Rider ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-black">
                  <tr>
                    <th className="p-3 text-left font-bold">#</th>
                    <th className="p-3 text-left font-bold">Rider ID</th>
                    <th className="p-3 text-left font-bold">Name</th>
                    <th className="p-3 text-right font-bold">Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, index) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-black">{index + 1}</td>
                      <td className="p-3 font-semibold text-black">
                        {r.rider_id}
                      </td>
                      <td className="p-3 text-black">
                        {r.employee_name}
                      </td>
                      <td className="p-3 text-right font-bold text-blue-700">
                        AED {r.net_salary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
            <h3 className="font-bold mb-6 text-black">
              Are you sure you want to delete this upload?
            </h3>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-2 bg-gray-200 text-black rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}