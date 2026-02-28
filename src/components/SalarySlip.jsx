import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const formatCurrency = (value) => {
  return `AED ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
};

const DetailedSalarySlip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slipRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const rider = location.state || {};

  const earnings = [
    { label: "Pickup Count", value: rider.pickup_count },
    { label: "DropOff Count", value: rider.dropoff_count },
  ];

  const deductions = [
    { label: "COD Deductions", value: rider.cod_deductions },
    { label: "Order Issue Deductions", value: rider.order_issue_deductions },
    { label: "Salaries - OID", value: rider.salaries_oid },
    { label: "Fine", value: rider.fine },
    { label: "Salik", value: rider.salik },
    { label: "Extra Sim Used", value: rider.safe_extra_sim_used },
    { label: "Insurance", value: rider.insurance },
    { label: "Advance", value: rider.advance },
    { label: "Negative Salary", value: rider.negative_salary },
    { label: "RTA Class", value: rider.rta_class },
    { label: "Labour Card", value: rider.labour_card },
    { label: "Others", value: rider.others },
    { label: "Non Performance Fine", value: rider.non_performance_fine },
    { label: "Fine Performance", value: rider.fine_performance },
  ];

  const handleDownload = async () => {
    setDownloading(true);

    const canvas = await html2canvas(slipRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("SwiftMax-SalarySlip.pdf");

    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 md:px-12 pb-10">

      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-end gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
        >
          Close
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
        >
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <div
        ref={slipRef}
        className="bg-white max-w-6xl mx-auto rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >

        {/* Header */}
        <div className="p-6 sm:p-10 border-b border-gray-200 text-center">
          <h1 className="flex justify-center items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-red-600">
              SWIFT
            </span>
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
              MAX
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 tracking-wider uppercase">
            Official Payroll Statement
          </p>
        </div>

        {/* ✅ Updated Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 border-b text-[14px]">

          {/* Left Side */}
          <div className="space-y-2 text-gray-900">
            <p>
              <span className="font-semibold text-gray-700">Rider ID:</span>{" "}
              <span className="font-bold text-black">{rider.rider_id}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              <span className="font-bold text-black">{rider.employee_name}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Email:</span>{" "}
              <span className="font-bold text-black">{rider.email || ""}</span>
            </p>
          </div>

          {/* Right Side */}
          <div className="space-y-2 md:text-right text-gray-900">

            <p>
              <span className="font-semibold text-gray-700">Employee A/C:</span>{" "}
              <span className="font-bold text-black">{rider.employee_ac}</span>
            </p>

            {/* ✅ Vehicle Type Added */}
            <p>
              <span className="font-semibold text-gray-700">Vehicle Type:</span>{" "}
              <span className="font-bold text-black">{rider.vehicle_type}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Salary Month:</span>{" "}
              <span className="font-bold text-black">{rider.salary_month_display}</span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Generated On:</span>{" "}
              <span className="font-bold text-black">
                {new Date().toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-6 bg-emerald-600 rounded"></div>
              <h2 className="text-xl font-bold text-emerald-700">Earnings</h2>
            </div>

            {earnings.map((item, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b border-gray-200 text-[14px] text-gray-800">
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}

            <div className="flex justify-between mt-4 bg-emerald-100 text-emerald-900 p-3 rounded-xl font-bold">
              <span>Total Earnings</span>
              <span>{formatCurrency(rider.total_earnings)}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-6 bg-red-600 rounded"></div>
              <h2 className="text-xl font-bold text-red-700">Deductions</h2>
            </div>

            {deductions.map((item, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b border-gray-200 text-[14px] text-gray-800">
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}

            <div className="flex justify-between mt-4 bg-red-100 text-red-900 p-3 rounded-xl font-bold">
              <span>Total Deduction</span>
              <span>{formatCurrency(rider.total_deductions)}</span>
            </div>
          </div>

        </div>

        {/* Net Salary */}
        <div className="px-4 sm:px-10 pb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Net Salary Payable
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Final Amount After All Deductions
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {formatCurrency(rider.net_salary)}
                </p>
                <div className="h-1 w-24 bg-emerald-500 mt-2 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailedSalarySlip;