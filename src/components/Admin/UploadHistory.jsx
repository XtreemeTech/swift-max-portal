import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Eye,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2
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
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUploads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUploads();
      setUploads(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads, refreshTrigger]);

  const viewUpload = async (upload) => {
    setShowModal(true);
    setDetailsLoading(true);
    setSelectedUpload(upload);
    setRecords([]);
    setSearch("");

    try {
      const data = await adminAPI.getUploadDetails(upload.id);
      setSelectedUpload(data.upload);
      setRecords(data.records || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUpload(id);
      fetchUploads();
      setDeleteId(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!search) return records;
    return records.filter((r) =>
      r.rider_id?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, records]);

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-10 text-gray-900"
      style={{
        opacity: 1,
        filter: "none",
        transform: "none",
        backdropFilter: "none",
        WebkitFontSmoothing: "antialiased",
        "--tw-text-opacity": 1
      }}
    >

      <h2 className="text-2xl font-semibold mb-6">
        Upload History
      </h2>

      {/* ================= MAIN TABLE (UNCHANGED) ================= */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No uploads found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="p-3 text-left font-semibold">Month</th>
                <th className="p-3 text-left font-semibold">Records</th>
                <th className="p-3 text-left font-semibold">Clawbacks</th>
                <th className="p-3 text-left font-semibold">Uploaded By</th>
                <th className="p-3 text-left font-semibold">Date</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">
                    {upload.salary_month_display}
                  </td>
                  <td className="p-3">
                    {upload.total_records}
                  </td>
                  <td className="p-3 text-purple-700 font-semibold">
                    {upload.total_clawbacks || 0}
                  </td>
                  <td className="p-3">
                    {upload.uploaded_by_name}
                  </td>
                  <td className="p-3">
                    {new Date(upload.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {upload.status === "processed" ? (
                      <span className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle size={16} />
                        Processed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-600 font-semibold">
                        <AlertCircle size={16} />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-4">
                    <button onClick={() => viewUpload(upload)}>
                      <Eye size={18} className="text-blue-600" />
                    </button>
                    <button onClick={() => setDeleteId(upload.id)}>
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= VIEW MODAL (REDESIGNED) ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

            {/* HEADER */}
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedUpload?.salary_month_display}
                </h2>
                {selectedUpload?.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    Notes: {selectedUpload.notes}
                  </p>
                )}
              </div>
              <button onClick={() => setShowModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* SEARCH + HEADER */}
            <div className="p-6 border-b bg-white">

              <div className="relative max-w-sm mb-6">
                <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by Rider ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-5 bg-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700">
                <div>#</div>
                <div>Rider ID</div>
                <div>Name</div>
                <div className="text-right">Net Salary</div>
                <div className="text-center">Clawback</div>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto">

              {detailsLoading ? (
                <div className="text-center py-10 text-gray-500">
                  Loading records...
                </div>
              ) : (
                filteredRecords.map((r, index) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-5 items-center px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition text-sm"
                  >
                    <div className="text-gray-500">
                      {index + 1}
                    </div>

                    <div className="font-semibold">
                      {r.rider_id}
                    </div>

                    <div className="pr-4 truncate">
                      {r.employee_name}
                    </div>

                    <div className={`text-right font-bold ${
                      Number(r.net_salary) < 0
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}>
                      AED {r.net_salary}
                    </div>

                    <div className="text-center">
                      {r.clawback_count > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          {r.clawback_count}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          0
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL UNCHANGED */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-96">
            <h3 className="font-semibold mb-4">
              Are you sure you want to delete this upload?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg"
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