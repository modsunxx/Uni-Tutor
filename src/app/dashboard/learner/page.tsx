"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, UserPlus, Search } from "lucide-react";

export default function LearnerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* === Header Section (ธีมเขียว Emerald + Blobs) === */}
      <div className="relative pt-14 pb-24 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[30%] left-16 w-37.5 h-37.5 bg-[#408A71] opacity-30 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm">
            แดชบอร์ดของฉัน
          </h1>
          <p className="text-emerald-50 text-base md:text-lg font-light drop-shadow-sm">
            จัดการคอร์สเรียนที่คุณลงทะเบียนไว้
          </p>
        </div>
      </div>

      {/* === Content Card === */}
      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-12 md:p-16 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <BookOpen className="w-10 h-10 text-emerald-600" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ยังไม่มีคอร์สเรียน
          </h3>
          <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            คุณยังไม่ได้ลงทะเบียนเรียนคอร์สใดๆ
            ค้นหาคอร์สที่สนใจแล้วเริ่มเรียนกันเลย!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto justify-center"
            >
              <Search className="w-4 h-4" />
              ค้นหาคอร์สเรียน
            </Link>
            <Link
              href="/dashboard/tutor"
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-8 py-3.5 rounded-full font-bold hover:bg-emerald-100 hover:border-emerald-300 transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-5 h-5" />
              สมัครเป็นติวเตอร์
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
