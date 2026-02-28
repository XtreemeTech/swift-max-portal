import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import DashboardStats from "../components/Admin/DashboardStats"; // ✅ NEW
import FileUpload from "../components/Admin/FileUpload";
import UploadHistory from "../components/Admin/UploadHistory";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/admin");
  };

  // 🔥 This will refresh stats + history after upload
  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">

      {/* Logout Button */}
      <div className="flex justify-end px-6 sm:px-12 py-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:opacity-80 transition shadow"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="px-6 sm:px-12 pb-10 space-y-10">

        {/* 🔥 API Integrated Stats + Charts */}
        <DashboardStats refreshTrigger={refreshTrigger} />

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-900">
            Upload Monthly Salary File
          </h2>

          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-lg font-semibold mb-6 text-gray-900">
            Upload History & Management
          </h2>

          <UploadHistory refreshTrigger={refreshTrigger} />
        </div>

      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl text-center border">

            <h3 className="text-lg font-bold mb-3 text-black">
              Confirm Logout
            </h3>

            <p className="text-sm text-gray-700">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2 bg-gray-200 text-black font-medium rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-black text-white font-medium rounded-lg hover:opacity-80 transition"
              >
                Yes, Logout
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;