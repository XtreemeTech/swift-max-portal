import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { adminAPI } from "../../services/api";

export default function DashboardStats({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAnalytics();
        setData(response);
      } catch (error) {
        console.error("Analytics fetch failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-white p-10 rounded-2xl border text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  if (!data) return null;

  // 🔥 Format Line Chart Data
  const recordTrend = data.monthly_record_trend.map((item) => ({
    month: `${item.month} ${item.year}`,
    count: item.count,
  }));

  // 🔥 Format Bar Chart Data
  const salaryComparison = data.monthly_salary_comparison.map((item) => ({
    month: `${item.month} ${item.year}`,
    total_salary: Number(item.total_salary),
  }));

  return (
    <>
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Recent Records</p>
          <h2 className="text-3xl font-bold mt-2 text-gray-900">
            {data.recent_records}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">Last Upload</p>
          <h2 className="text-xl font-semibold mt-2 text-gray-900">
            {data.last_upload}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-sm text-gray-500">
            Salary Paid (Last Month)
          </p>
          <h2 className="text-2xl font-bold mt-2 text-gray-900">
            AED {Number(data.salary_paid_last_month).toLocaleString()}
          </h2>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

        {/* Monthly Record Trend */}
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Monthly Record Trend
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recordTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Salary Comparison */}
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Monthly Salary Comparison
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Bar
                  dataKey="total_salary"
                  fill="#10B981"
                  barSize={30}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}