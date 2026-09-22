"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, UserPlus } from "lucide-react";

export default function LearnerDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          แดชบอร์ดของฉัน
        </h1>
        <p className="text-gray-500 mb-8">จัดการคอร์สเรียนที่คุณลงทะเบียนไว้</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ยังไม่มีคอร์สเรียน
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            คุณยังไม่ได้ลงทะเบียนเรียนคอร์สใดๆ
            ค้นหาคอร์สที่สนใจแล้วเริ่มเรียนกันเลย!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition w-full sm:w-auto justify-center"
            >
              ค้นหาคอร์สเรียน
            </Link>
            <Link
              href="/dashboard/tutor"
              className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition w-full sm:w-auto justify-center"
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
