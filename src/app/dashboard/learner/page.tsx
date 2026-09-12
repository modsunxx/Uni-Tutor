import React from "react";
import { Button } from "@/components/ui/Button";

export default function LearnerDashboard() {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          ภาพรวมการเรียนของฉัน 📚
        </h1>
        <p className="text-gray-500">ยินดีต้อนรับ, student@rmutto.ac.th</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">คลาสเรียนที่กำลังจะมาถึง</p>
          <p className="text-3xl font-bold text-primary mt-2">
            2 <span className="text-lg text-gray-600 font-normal">วิชา</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">รออัปโหลดสลิปชำระเงิน</p>
          <p className="text-3xl font-bold text-red-500 mt-2">
            1 <span className="text-lg text-gray-600 font-normal">รายการ</span>
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        ตารางเรียนเร็วๆ นี้
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800">
              เขียนโปรแกรมเบื้องต้น (C & Go)
            </h3>
            <p className="text-sm text-gray-500">
              กับ พี่ธนพล • 15 ต.ค. 2569 | 13:00 - 15:00 น.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              เข้าเรียน (Discord)
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
