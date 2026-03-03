// ===============================
// 🔥 Vite Base URL
// ===============================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// ===============================
// 🔐 Helper: Auth Headers
// ===============================
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found. Please login again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};


// ===============================
// 🔐 AUTH API
// ===============================
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    return data;
  },

  logout: async () => {
    const token = localStorage.getItem("access_token");

    await fetch(`${API_BASE_URL}/api/auth/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};


// ===============================
// 👤 PUBLIC SALARY API
// ===============================
export const publicAPI = {
  viewSalary: async (riderId, salaryMonth) => {
    const response = await fetch(`${API_BASE_URL}/api/salary/view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rider_id: riderId,
        salary_month: salaryMonth,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Salary not found");
    }

    return data;
  },
};


// ===============================
// 🛠 ADMIN API
// ===============================
export const adminAPI = {

  // 📊 Analytics
  getAnalytics: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/analytics/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch analytics");
    }

    return data;
  },


  // 📂 Upload Salary File (UPDATED VERSION)
  uploadSalary: async (file, clawbackFile, salaryMonth, notes) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw new Error("No access token found. Please login again.");
    }

    if (!file) {
      throw new Error("Salary file is required.");
    }

    if (!salaryMonth) {
      throw new Error("Salary month is required.");
    }

    const formData = new FormData();

    // Required salary file
    formData.append("file", file);

    // Optional clawback file
    if (clawbackFile) {
      formData.append("clawback_file", clawbackFile);
    }

    // Required month (must be YYYY-MM or YYYY-MM-DD)
    formData.append("salary_month", salaryMonth);

    // Optional notes
    if (notes && notes.trim() !== "") {
      formData.append("notes", notes.trim());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/upload/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Upload failed");
    }

    return data;
  },


  // 📜 Get Upload History
  getUploads: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/uploads/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to fetch uploads");
    }

    return data;
  },


  // 📄 Get Upload Details
  getUploadDetails: async (uploadId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/uploads/${uploadId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Upload not found");
    }

    return data;
  },


  // ❌ Delete Upload
  deleteUpload: async (uploadId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/uploads/${uploadId}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    return true;
  },

};