import React, { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import swiftMaxLogo from "../assets/swift max.png";
import { isoToDisplay } from "../utils/dateFormat";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const amount = Number(value);
  // Non-numeric cells are shown as-is rather than as a misleading AED 0.00
  if (Number.isNaN(amount)) return String(value);
  return `AED ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString) => {
  if (dateString === null || dateString === undefined || dateString === "") return "-";
  // Exported dates carry narrow/non-breaking spaces (e.g. "Jul 1, 2026, 10:34:54 PM")
  // which stop the browser from parsing them.
  const text = String(dateString)
    .replace(/[\u00a0\u202f\u2007\u2009\u200a]/g, " ")
    .replace(/[\u200b\ufeff]/g, "")
    .trim();
  const date = new Date(text);
  if (isNaN(date.getTime())) return text;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Clawback columns holding long free-text explanations — kept in sync with the
// backend so the split still works if the API only returns extra_data.
const CLAWBACK_REMARK_HINTS = ["remark", "investigation", "comment", "description"];

const splitClawbackEntry = (entry) => {
  if (entry.details || entry.remarks) {
    return { details: entry.details || {}, remarks: entry.remarks || {} };
  }

  const details = {};
  const remarks = {};

  Object.entries(entry.extra_data || {}).forEach(([label, value]) => {
    if (value === null || value === undefined || value === "") return;
    const normalized = label.trim().toLowerCase();
    if (CLAWBACK_REMARK_HINTS.some((hint) => normalized.includes(hint))) {
      remarks[label] = value;
    } else {
      details[label] = value;
    }
  });

  return { details, remarks };
};

const formatDetailValue = (label, value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (/date|time/i.test(label)) return formatDate(value);
  return String(value);
};

const WatermarkOverlay = ({ text }) => {
  if (!text?.trim()) return null;

  const tiles = Array.from({ length: 48 }, (_, index) => index);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 w-[300%] -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] py-12">
        <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-20 opacity-[0.14]">
          {tiles.map((tile) => (
            <span
              key={tile}
              className="inline-block w-[18%] min-w-[6.5rem] whitespace-nowrap text-center text-lg font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-xl lg:text-2xl"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const DetailedSalarySlip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slipRef = useRef();
  const [downloading, setDownloading] = useState(false);

  const rider = location.state || {};

  const earningsObj = rider.earnings || {};
  const earningsTotal = earningsObj["Total"] ?? rider.total_earnings;
  const earningsRows = Object.entries(earningsObj).filter(([key]) => key !== "Total");

  const deductionsObj = rider.deductions || {};
  const deductionsRows = Object.entries(deductionsObj);

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

      pdf.save("SwiftMax-Statement.pdf");
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
        className="relative bg-white text-gray-900 max-w-6xl mx-auto rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        style={{ WebkitFontSmoothing: "antialiased", textRendering: "geometricPrecision" }}
      >
        <WatermarkOverlay text={rider.watermark} />

        <div className="relative">

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
            <p><strong>Statement Date:</strong> {isoToDisplay(rider.salary_month) || rider.salary_month_display}</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8">

          {/* Earnings */}
          <div>
            <h2 className="text-xl font-bold text-emerald-700 mb-4 border-l-4 border-emerald-600 pl-3">
              Earnings
            </h2>

            {earningsRows.map(([label, value], idx) => (
              <div key={idx} className="flex justify-between py-2 border-b text-sm">
                <span>{label}</span>
                <span>{value}</span>
              </div>
            ))}

            <div className="flex justify-between mt-4 bg-emerald-100 p-4 rounded-xl font-bold text-lg">
              <span>Total Earnings</span>
              <span>{earningsTotal !== undefined ? earningsTotal : "-"}</span>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h2 className="text-xl font-bold text-red-700 mb-4 border-l-4 border-red-600 pl-3">
              Deductions
            </h2>

            {deductionsRows.map(([label, value], idx) => (
              <div key={idx} className="flex justify-between py-2 border-b text-sm">
                <span>{label}</span>
                <span>{formatCurrency(value)}</span>
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
                <span>{rider.clawback_count ?? rider.clawback_entries.length}</span>
              </div>
              <div className="flex justify-between text-base font-semibold mt-3">
                <span>Total Clawback Amount</span>
                <span className="text-red-600">
                  {formatCurrency(rider.clawback_total)}
                </span>
              </div>
            </div>

            {rider.clawback_entries.map((entry, index) => {
              // Whatever columns the clawback file carries are rendered as-is,
              // so a renamed or newly added heading still shows up on the slip.
              const { details, remarks } = splitClawbackEntry(entry);
              const detailRows = Object.entries(details);
              const remarkRows = Object.entries(remarks);

              return (
                <div
                  key={entry.id ?? index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-md"
                >
                  <p className="text-lg font-bold text-orange-600 mb-3">
                    Clawback #{index + 1}
                  </p>

                  {detailRows.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {detailRows.map(([label, value]) => (
                        <p key={label}>
                          <strong>{label}:</strong> {formatDetailValue(label, value)}
                        </p>
                      ))}
                    </div>
                  )}

                  {remarkRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="mt-4 bg-gray-50 border rounded-xl p-4 text-sm"
                    >
                      <strong>{label}:</strong>
                      <p className="mt-2 whitespace-pre-line text-gray-700">
                        {String(value)}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between mt-5 text-lg font-bold">
                    <span>Amount</span>
                    <span className="text-red-600">
                      {formatCurrency(Math.abs(Number(entry.amount) || 0))}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between bg-orange-100 p-5 rounded-2xl font-bold text-xl shadow-sm">
              <span>Final Total Clawback Amount</span>
              <span className="text-red-700">
                {formatCurrency(rider.clawback_total)}
              </span>
            </div>
          </div>
        )}

        {/* NET PAYABLE */}
        <div className="px-8 pb-8">
          <div className="bg-gradient-to-r from-gray-50 to-white border rounded-2xl p-8 shadow-xl text-center sm:text-left">
            <p className="uppercase text-xs tracking-widest text-gray-500 font-semibold">
              Net Payable
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
    </div>
  );
};

export default DetailedSalarySlip;