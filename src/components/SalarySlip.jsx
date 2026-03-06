import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import swiftMaxLogo from "../assets/swift max.png";

const formatCurrency = (value) => {
  return `AED ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString();
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
        { label: "Pickup Cancel", value: rider.pickup_cancel },
    { label: "Dropoff Cancel", value: rider.dropoff_cancel },
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
    if (!slipRef.current || downloading) return;

    setDownloading(true);

    try {
      const element = slipRef.current;

      const captureScale = Math.max(2, Math.min(3, window.devicePixelRatio || 1));

      const canvas = await html2canvas(element, {
        scale: captureScale,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const imgWidth = pageWidth;

      let pageIndex = 0;

      const pageCanvas = document.createElement("canvas");
      const pageContext = pageCanvas.getContext("2d");

      if (!pageContext) {
        throw new Error("Unable to prepare PDF canvas context.");
      }

      const pageCanvasHeight = Math.floor((canvasWidth * pageHeight) / pageWidth);
      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageCanvasHeight;

      let renderedHeight = 0;

      while (renderedHeight < canvasHeight) {
        const sourceHeight = Math.min(pageCanvasHeight, canvasHeight - renderedHeight);
        pageCanvas.height = sourceHeight;

        pageContext.clearRect(0, 0, pageCanvas.width, sourceHeight);
        pageContext.drawImage(
          canvas,
          0,
          renderedHeight,
          canvasWidth,
          sourceHeight,
          0,
          0,
          canvasWidth,
          sourceHeight
        );

        const pageData = pageCanvas.toDataURL("image/png");
        const renderedPageHeight = (sourceHeight * imgWidth) / canvasWidth;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(pageData, "PNG", 0, 0, imgWidth, renderedPageHeight);

        renderedHeight += sourceHeight;
        pageIndex += 1;
      }

      pdf.save("SwiftMax-SalarySlip.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  const isNegative = Number(rider.net_salary) < 0;

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4 pb-12">

      {/* Buttons */}
      <div className="max-w-6xl mx-auto flex justify-end gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2 rounded-lg bg-gray-600 text-white font-semibold"
        >
          Close
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold"
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div
        ref={slipRef}
        className="bg-white text-gray-900 max-w-6xl mx-auto rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ WebkitFontSmoothing: "antialiased", textRendering: "geometricPrecision" }}
      >

        {/* Header */}
        <div className="p-8 border-b text-center bg-white">

          <div className="bg-white rounded-xl p-4 inline-block">
            <img
              src={swiftMaxLogo}
              alt="Swift Max Delivery"
              className="h-40 md:h-48 w-auto mx-auto object-contain"
              draggable={false}
            />
          </div>

        </div>

        {/* NOTES SECTION */}
        {rider.notes && rider.notes.trim() !== "" && (
          <div className="px-8 pt-6 pb-2 border-b bg-gray-50">
            <div className="rounded-xl border-l-4 border-blue-600 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                <h3 className="text-base font-bold tracking-wide text-gray-800 uppercase">
                  Important Note
                </h3>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {rider.notes}
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b text-sm">
          <div className="space-y-1">
            <p><strong>Rider ID:</strong> {rider.rider_id}</p>
            <p><strong>Name:</strong> {rider.employee_name}</p>
          </div>
          <div className="space-y-1 md:text-right">
            <p><strong>Employee A/C:</strong> {rider.employee_ac}</p>
            <p><strong>Vehicle Type:</strong> {rider.vehicle_type}</p>
            <p><strong>Salary Month:</strong> {rider.salary_month_display}</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8">

          {/* Earnings */}
          <div>
            <h2 className="text-xl font-bold text-emerald-700 mb-4 border-l-4 border-emerald-600 pl-3">
              Earnings
            </h2>

            {earnings.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b text-sm">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}

            <div className="flex justify-between mt-4 bg-emerald-100 p-4 rounded-xl font-bold text-lg">
              <span>Total Earnings</span>
              <span>{formatCurrency(rider.total_earnings)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h2 className="text-xl font-bold text-red-700 mb-4 border-l-4 border-red-600 pl-3">
              Deductions
            </h2>

{deductions.map((item, idx) => (
  <div key={idx} className="flex justify-between py-2 border-b text-sm">
    <span>{item.label}</span>

    <span>
      {item.label === "Pickup Cancel" || item.label === "Dropoff Cancel"
        ? item.value
        : formatCurrency(item.value)}
    </span>

  </div>
))}

            <div className="flex justify-between mt-4 bg-red-100 p-4 rounded-xl font-bold text-lg">
              <span>Total Deduction</span>
              <span>{formatCurrency(rider.total_deductions)}</span>
            </div>
          </div>
        </div>

        {/* CLAWBACK STYLISH */}
        {rider.has_clawback && rider.clawback_entries?.length > 0 && (
          <div className="px-8 pb-8">

            <h2 className="text-2xl font-bold text-orange-700 mb-6 border-l-4 border-orange-500 pl-3">
              Clawback Details
            </h2>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 shadow-sm mb-8">
              <div className="flex justify-between text-base font-semibold">
                <span>Total Clawback Count</span>
                <span>{rider.clawback_count}</span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-3">
                <span>Total Clawback Amount</span>
                <span className="text-red-600">
                  {formatCurrency(rider.clawback_total)}
                </span>
              </div>
            </div>

            {rider.clawback_entries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-md"
              >
                <p className="text-lg font-bold text-orange-600 mb-3">
                  Clawback #{index + 1}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <p><strong>ID:</strong> {entry.id}</p>
                  <p><strong>City:</strong> {entry.city}</p>
                  <p><strong>Vehicle:</strong> {entry.vehicle}</p>
                  <p><strong>Order Date:</strong> {formatDate(entry.clawback_order_date)}</p>
                  <p className="sm:col-span-2">
                    <strong>Order ID:</strong> {entry.clawback_order_id}
                  </p>
                </div>

                <div className="mt-4 bg-gray-50 border rounded-xl p-4 text-sm">
                  <strong>Investigation Details:</strong>
                  <p className="mt-2 whitespace-pre-line text-gray-700">
                    {entry.clawback_remarks}
                  </p>
                </div>

                <div className="flex justify-between mt-5 text-lg font-bold">
                  <span>Amount</span>
                  <span className="text-red-600">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-between bg-orange-100 p-5 rounded-2xl font-bold text-xl shadow-sm">
              <span>Final Total Clawback Amount</span>
              <span className="text-red-700">
                {formatCurrency(rider.clawback_total)}
              </span>
            </div>
          </div>
        )}

        {/* NET SALARY */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-gray-50 to-white border rounded-2xl p-8 shadow-xl text-center sm:text-left">
            <p className="uppercase text-xs tracking-widest text-gray-500 font-semibold">
              Net Salary Payable
            </p>

            <p
              className={`mt-4 text-4xl sm:text-5xl font-extrabold ${
                isNegative ? "text-red-600" : "text-gray-900"
              }`}
            >
              {formatCurrency(rider.net_salary)}
            </p>

            <div className="h-1 w-32 mx-auto sm:mx-0 mt-4 bg-emerald-500 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DetailedSalarySlip;