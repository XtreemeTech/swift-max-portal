import React from "react";
import logo from "../assets/swift logo.png";

const Navbar = () => {
  return (
    <div className="w-full bg-[#334155] border-b border-gray-300 shadow-sm fixed top-0 left-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex justify-between items-center">

        {/* ===== Left Side (Logo + Brand) ===== */}
        <div className="flex items-center gap-2">

          <img
            src={logo}
            alt="Swift Max Logo"
            className="w-8 h-8 object-contain"
          />

          <div className="leading-tight">
            <h1 className="flex items-baseline gap-1 font-black tracking-tight">
              <span className="text-lg sm:text-xl text-red-500">
                SWIFT
              </span>
              <span className="text-2xl sm:text-3xl text-white">
                MAX
              </span>
            </h1>

            <p className="text-[9px] sm:text-[10px] text-gray-200 uppercase tracking-widest">
              Salary Transparency System
            </p>
          </div>

        </div>

        {/* ===== Right Side ===== */}
        <div className="hidden sm:block text-xs text-gray-200 font-medium">
          Secure • Transparent • Automated
        </div>

      </div>

    </div>
  );
};

export default Navbar;