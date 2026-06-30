import React, { useState } from 'react';
import {
  User,
  Calendar,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import DateInputDDMMYYYY from './DateInputDDMMYYYY';

const SalaryForm = () => {
  const [formData, setFormData] = useState({
    riderId: '',
    email: '',
    statementDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.riderId || !formData.statementDate) {
      setError('Please enter Rider ID and select statement date');
      return;
    }

    try {
      setLoading(true);

      const response = await publicAPI.viewSalary(
        formData.riderId,
        formData.statementDate
      );

      navigate('/slip', {
        state: {
          ...response,
          email: formData.email,
        },
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-32 px-4 flex justify-center">
      <div className="w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <h2 className="flex items-baseline justify-center gap-2">
            <span className="text-2xl font-black text-red-600">SWIFT</span>
            <span className="text-4xl font-black text-slate-900">MAX</span>
          </h2>

          <h3 className="mt-3 text-lg font-bold text-slate-700">
            Rider Portal
          </h3>

          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest font-medium">
            Employee Access Only
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-2xl px-6 pt-8 pb-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Rider ID */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase">
                Rider Identity *
              </label>

              <div className="relative mt-2">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  required
                  value={formData.riderId}
                  onChange={(e) =>
                    setFormData({ ...formData, riderId: e.target.value })
                  }
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 font-semibold focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none"
                  placeholder="Enter Rider ID"
                />
              </div>
            </div>

            {/* Statement Date */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase">
                Statement Date *
              </label>

              <div className="relative mt-2">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

                <DateInputDDMMYYYY
                  value={formData.statementDate}
                  onChange={(isoDate) =>
                    setFormData({ ...formData, statementDate: isoDate })
                  }
                  disabled={loading}
                  className="w-full min-h-[48px] border border-slate-300 rounded-2xl py-3 pl-11 pr-4 text-base text-slate-900 font-semibold focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 outline-none"
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                Enter date as DD/MM/YYYY (e.g. 01/07/2026 or 10/07/2026).
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 uppercase">
                Email Address (Optional)
              </label>

              <div className="relative mt-2">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={loading}
                  className="w-full border border-slate-300 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 font-semibold focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none"
                  placeholder="Send a digital copy"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  VIEW STATEMENT
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-500" />
          Protected & Secure System
        </div>

      </div>
    </div>
  );
};

export default SalaryForm;