/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function CourseDetailPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ข้อมูลจำลอง
  const availableTimes = ["10:00 - 12:00", "13:00 - 15:00", "16:00 - 18:00"];

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ด้านซ้าย: รายละเอียดคอร์ส */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-1 rounded-md mb-4 inline-block">
              วิทยาการคอมพิวเตอร์ (CS)
            </span>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              เขียนโปรแกรมเบื้องต้น (C & Go)
            </h1>
            <p className="text-gray-500 mb-6">
              สอนพื้นฐานการเขียนโปรแกรมตั้งแต่ Data Type, Loop, Condition
              ไปจนถึง Pointer และ Goroutine เน้นทำโจทย์จริงเพื่อเตรียมสอบ
            </p>

            <div className="flex items-center gap-4 py-4 border-y border-gray-100">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thanapon"
                alt="Tutor"
                className="w-12 h-12 rounded-full bg-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-800">พี่ธนพล</p>
                <p className="text-sm text-yellow-500">
                  ⭐ 4.9 (32 รีวิว) | ยืนยันผลการเรียนแล้ว ✓
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ด้านขวา: ระบบนัดหมาย (Booking) */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              จองเวลาเรียน
            </h3>
            <p className="text-2xl font-bold text-primary mb-6">
              150 บาท{" "}
              <span className="text-sm text-gray-500 font-normal">
                / ชั่วโมง
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  1. เลือกวันที่
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["14 ต.ค.", "15 ต.ค.", "16 ต.ค."].map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`py-2 rounded-lg text-sm border transition-all ${selectedDate === date ? "border-primary bg-primary-light text-primary font-bold" : "border-gray-200 text-gray-600 hover:border-primary"}`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    2. เลือกเวลา
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-sm border transition-all ${selectedTime === time ? "border-primary bg-primary text-white font-bold" : "border-gray-200 text-gray-600 hover:border-primary"}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                fullWidth
                disabled={!selectedDate || !selectedTime}
                className="mt-4"
              >
                ยืนยันการนัดหมาย
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
