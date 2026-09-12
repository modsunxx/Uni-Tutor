/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

// ข้อมูลจำลองรายการสลิปรอการตรวจสอบ (Mock Data)
const MOCK_PENDING_SLIPS = [
  {
    id: "pay-001",
    learnerName: "น้องเอ (student@rmutto.ac.th)",
    courseName: "เขียนโปรแกรมเบื้องต้น (C & Go)",
    amount: "150 บาท",
    submittedAt: "12 ต.ค. 2569 | 14:30 น.",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500", // รูปจำลองสลิป
  },
  {
    id: "pay-002",
    learnerName: "น้องบี (student2@rmutto.ac.th)",
    courseName: "แคลคูลัส 1 (Calculus I)",
    amount: "100 บาท",
    submittedAt: "12 ต.ค. 2569 | 15:15 น.",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
  },
];

export default function AdminDashboardPage() {
  const [slips, setSlips] = useState(MOCK_PENDING_SLIPS);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // ฟังก์ชันจำลองการอนุมัติสลิป
  const handleApprove = (id: string) => {
    setSlips((prev) => prev.filter((item) => item.id !== id));
    setSelectedSlip(null);
    alert('อนุมัติสลิปเรียบร้อย! สถานะการเรียนถูกเปลี่ยนเป็น "ยืนยันแล้ว"');
  };

  // ฟังก์ชันจำลองการปฏิเสธสลิป
  const handleReject = (id: string) => {
    setSlips((prev) => prev.filter((item) => item.id !== id));
    setSelectedSlip(null);
    alert("ปฏิเสธสลิปเรียบร้อย ระบบได้แจ้งเตือนให้ผู้เรียนอัปโหลดใหม่แล้ว");
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8">
      {/* ส่วนหัว */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Dashboard: ตรวจสอบสลิปโอนเงิน 🛡️
          </h1>
          <p className="text-gray-500">
            จัดการและตรวจสอบหลักฐานการชำระเงินจากผู้เรียนในระบบ
          </p>
        </div>
        <div className="bg-primary-light text-primary px-4 py-2 rounded-xl text-sm font-semibold self-start">
          รอตรวจสอบ: {slips.length} รายการ
        </div>
      </div>

      {/* ตารางแสดงรายการสลิป */}
      {slips.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                  <th className="p-4 font-semibold">ผู้เรียน</th>
                  <th className="p-4 font-semibold">รายวิชาที่จอง</th>
                  <th className="p-4 font-semibold">ยอดเงิน</th>
                  <th className="p-4 font-semibold">เวลาที่แจ้งโอน</th>
                  <th className="p-4 font-semibold text-center">หลักฐานสลิป</th>
                  <th className="p-4 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slips.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {item.learnerName}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {item.courseName}
                    </td>
                    <td className="p-4 text-sm font-bold text-primary">
                      {item.amount}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {item.submittedAt}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedSlip(item.slipUrl)}
                        className="text-xs font-semibold text-primary bg-primary-light px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        ดูรูปสลิป
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(item.id)}
                      >
                        ปฏิเสธ
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                      >
                        อนุมัติ
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-bold text-gray-700">
            เคลียร์คิวสลิปทั้งหมดเรียบร้อยแล้ว!
          </h3>
          <p className="text-gray-500 mt-1">
            ไม่มีรายการสลิปค้างตรวจสอบในระบบตอนนี้ครับ
          </p>
        </div>
      )}

      {/* Modal สำหรับแสดงรูปสลิปขนาดใหญ่เมื่อกดดู */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">
                ตรวจสอบหลักฐานการโอนเงิน
              </h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl overflow-hidden flex justify-center p-2">
              <img
                src={selectedSlip}
                alt="Payment Slip Modal"
                className="max-h-96 object-contain rounded-lg"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setSelectedSlip(null)}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
