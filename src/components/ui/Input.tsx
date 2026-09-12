import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      {/* ถ้ามีการส่ง label มา ให้แสดงผล */}
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <input
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all 
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-primary focus:ring-primary-light"
          } ${className}`}
        {...props}
      />

      {/* ถ้ามีการส่ง error มา ให้แสดงข้อความสีแดงด้านล่าง */}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
