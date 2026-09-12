import React from "react";
import { Button } from "@/components/ui/Button";

export default function TutorDashboard() {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการการสอน (Tutor Center) 💡
          </h1>
          <p className="text-gray-500">ยินดีต้อนรับ, tutor@rmutto.ac.th</p>
        </div>
        <Button variant="primary">สร้างคอร์สใหม่ +</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">
            รายได้เดือนนี้ (รอแอดมินยืนยันสลิป)
          </p>
          <p className="text-3xl font-bold text-green-500 mt-2">฿ 450.00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">เรตติ้งเฉลี่ย</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">⭐ 4.9</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        คำขอจองเวลาเรียน (รอการยืนยัน)
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">แคลคูลัส 1 (Calculus I)</h3>
            <p className="text-sm text-gray-500">
              ผู้เรียน: น้องเอ • 16 ต.ค. 2569 | 10:00 - 12:00 น.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              ปฏิเสธ
            </Button>
            <Button variant="primary" size="sm">
              ยืนยันรับสอน
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
