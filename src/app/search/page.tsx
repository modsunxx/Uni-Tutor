/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// จำลองข้อมูลคอร์สเรียน (Mock Data) สำหรับทำ UI
const MOCK_COURSES = [
  {
    id: "1",
    title: "Database Systems & ER Diagram",
    tutor: "พี่ซันนี่",
    department: "เทคโนโลยีสารสนเทศ (IT)",
    level: "ปี 2",
    rating: 5.0,
    reviews: 24,
    price: "ฟรี (จิตอาสา)",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny",
  },
  {
    id: "2",
    title: "แคลคูลัส 1 (Calculus I)",
    tutor: "พี่นัท",
    department: "วิทยาศาสตร์ (Science)",
    level: "ปี 1",
    rating: 4.8,
    reviews: 15,
    price: "100 บาท/ชม.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nut",
  },
  {
    id: "3",
    title: "เขียนโปรแกรมเบื้องต้น (C & Go)",
    tutor: "พี่ธนพล",
    department: "วิทยาการคอมพิวเตอร์ (CS)",
    level: "ปี 1",
    rating: 4.9,
    reviews: 32,
    price: "150 บาท/ชม.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thanapon",
  },
  {
    id: "4",
    title: "หลักการออกแบบ UI/UX",
    tutor: "พี่ภัทราพร",
    department: "เทคโนโลยีสารสนเทศ (IT)",
    level: "ปี 3",
    rating: 4.7,
    reviews: 18,
    price: "120 บาท/ชม.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design",
  },
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ทั้งหมด");
  const [selectedLevel, setSelectedLevel] = useState("ทั้งหมด");

  // ฟังก์ชันกรองข้อมูลแบบง่ายๆ (ทำงานฝั่ง Client)
  const filteredCourses = MOCK_COURSES.filter((course) => {
    const matchSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tutor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept =
      selectedDept === "ทั้งหมด" || course.department.includes(selectedDept);
    const matchLevel =
      selectedLevel === "ทั้งหมด" || course.level === selectedLevel;

    return matchSearch && matchDept && matchLevel;
  });

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 py-8 flex flex-col md:flex-row gap-8">
      {/* แถบตัวกรอง (Sidebar Filters) */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ตัวกรองการค้นหา
          </h2>
          <Input
            placeholder="ค้นหาวิชา, ชื่อผู้สอน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">ภาควิชา</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="IT">เทคโนโลยีสารสนเทศ (IT)</option>
            <option value="CS">วิทยาการคอมพิวเตอร์ (CS)</option>
            <option value="Science">วิทยาศาสตร์ (Science)</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">
            ระดับชั้น
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="ปี 1">ชั้นปีที่ 1</option>
            <option value="ปี 2">ชั้นปีที่ 2</option>
            <option value="ปี 3">ชั้นปีที่ 3</option>
            <option value="ปี 4">ชั้นปีที่ 4</option>
          </select>
        </div>

        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setSearchTerm("");
            setSelectedDept("ทั้งหมด");
            setSelectedLevel("ทั้งหมด");
          }}
        >
          ล้างตัวกรอง
        </Button>
      </aside>

      {/* พื้นที่แสดงผลลัพธ์ (Results Grid) */}
      <section className="flex-1">
        <div className="mb-6 flex justify-between items-end">
          <h1 className="text-2xl font-bold text-gray-800">
            ผลการค้นหา{" "}
            <span className="text-primary text-lg">
              ({filteredCourses.length} รายการ)
            </span>
          </h1>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={course.image}
                    alt={course.tutor}
                    className="w-16 h-16 rounded-full bg-blue-50 border-2 border-primary-light"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      สอนโดย:{" "}
                      <span className="font-medium text-gray-700">
                        {course.tutor}
                      </span>
                    </p>
                    <div className="flex items-center text-sm text-yellow-500 font-medium mt-1">
                      ⭐ {course.rating}{" "}
                      <span className="text-gray-400 font-normal ml-1">
                        ({course.reviews} รีวิว)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {course.department}
                  </span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    สำหรับ {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="font-semibold text-primary">
                    {course.price}
                  </span>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="primary" size="sm">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-bold text-gray-700">
              ไม่พบคอร์สที่ตรงกับเงื่อนไข
            </h3>
            <p className="text-gray-500 mt-1">
              ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองดูใหม่อีกครั้งนะครับ
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
