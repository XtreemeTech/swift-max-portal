import React, { useState } from "react";
import { User, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      await authAPI.login(formData.username, formData.password);
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 pt-28 sm:pt-24 bg-[#F3F4F6]">

      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <h2 className="flex items-baseline justify-center gap-2 tracking-tight">
            <span className="text-3xl font-black text-red-600">SWIFT</span>
            <span className="text-5xl font-black text-slate-900 leading-none">MAX</span>
          </h2>
          <h3 className="mt-2 text-xl font-bold text-slate-700">
            Admin Panel Access
          </h3>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-[0.2em] font-medium">
            Authorized Personnel Only
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-2xl px-8 py-10">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Admin Username
              </label>

              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User size={18} />
                </span>

                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>

              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>

                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition"
                  placeholder="Enter secure password"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-70"
            >
              {loading ? "Signing In..." : "LOGIN TO DASHBOARD"}
              {!loading && <ArrowRight size={18} />}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Secure Admin Access</span>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;