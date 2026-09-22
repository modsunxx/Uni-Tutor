"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, BookOpen, User, MapPin, MonitorPlay } from "lucide-react";
import Link from "next/link";

// กำหนด Type ป้องกันการใช้ any ตามมาตรฐาน TypeScript (Strict Mode)
type Course = {
  id: string;
  title: string;
  price_per_hour: number;
  teaching_format: "online" | "onsite" | "hybrid";
  master_subjects: {
    name: string;
    category: string;
  } | null;
  tutor_profiles: {
    users: {
      first_name: string;
      last_name: string;
      nickname: string | null;
    } | null;
  } | null;
};

export default function SearchPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ย้ายฟังก์ชันมาสร้างและเรียกใช้จบใน useEffect ที่เดียวเลยครับ
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // ดึงข้อมูลคอร์ส และ Join ตารางที่เกี่ยวข้องเพื่อเอาชื่อวิชาและชื่อติวเตอร์มาโชว์
        const { data, error } = await supabase.from("courses").select(`
            id,
            title,
            price_per_hour,
            teaching_format,
            master_subjects ( name, category ),
            tutor_profiles (
              users ( first_name, last_name, nickname )
            )
          `);

        if (error) throw error;
        setCourses((data as unknown as Course[]) || []);
      } catch (err) {
        console.error("Supabase Error Details:", err);
        // แปลง type ของ err ให้ปลอดภัยตามหลัก TypeScript โดยไม่ใช้ any
        const errorObj = err as { message?: string; details?: string };

        setErrorMsg(
          `Database Error: ${errorObj?.message || errorObj?.details || JSON.stringify(err)}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ปล่อย Array ว่างไว้ เพื่อให้ทำงานแค่ครั้งเดียวตอนโหลดหน้า

  // กรองคอร์สตามคำค้นหา (ค้นหาจากชื่อคอร์ส หรือ ชื่อวิชา)
  const filteredCourses = courses.filter((course) => {
    const titleMatch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const subjectMatch = course.master_subjects?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return titleMatch || subjectMatch;
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* Header & Search Section */}
      <div className="bg-blue-600 pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ค้นหาคอร์สเรียนและติวเตอร์ที่ใช่
          </h1>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            รวบรวมคอร์สติวจากรุ่นพี่และเพื่อนๆ มทร.ตะวันออก ครบทุกคณะ ทุกสาขา
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 rounded-xl border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 shadow-lg outline-none text-gray-900"
              placeholder="ค้นหาชื่อวิชา หรือชื่อคอร์สเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Course Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-8 shadow-sm">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white h-64 rounded-2xl animate-pulse shadow-sm border border-gray-100"
              ></div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const tutorName = course.tutor_profiles?.users?.nickname
                ? `${course.tutor_profiles.users.nickname} (${course.tutor_profiles.users.first_name})`
                : course.tutor_profiles?.users?.first_name ||
                  "ไม่ระบุชื่อติวเตอร์";

              return (
                <Link
                  href={`/courses/${course.id}`}
                  key={course.id}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* Card Header (Category & Price) */}
                    <div className="p-5 border-b border-gray-50 flex justify-between items-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.master_subjects?.category || "ทั่วไป"}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ฿{course.price_per_hour}
                        <span className="text-sm font-normal text-gray-500">
                          /ชม.
                        </span>
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        วิชา: {course.master_subjects?.name || "ไม่ระบุวิชา"}
                      </p>

                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>
                            สอนโดย{" "}
                            <span className="font-medium text-gray-900">
                              {tutorName}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {course.teaching_format === "online" ? (
                            <MonitorPlay className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <MapPin className="w-4 h-4 text-rose-500" />
                          )}
                          <span className="capitalize">
                            รูปแบบ:{" "}
                            {course.teaching_format === "online"
                              ? "ออนไลน์"
                              : course.teaching_format === "onsite"
                                ? "ออนไซต์"
                                : "ผสมผสาน (Hybrid)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ไม่พบคอร์สเรียน
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "ลองค้นหาด้วยคำอื่นดูอีกครั้งนะครับ"
                : "ยังไม่มีคอร์สเรียนในระบบตอนนี้ ติวเตอร์คนไหนพร้อมสอน มาสร้างคอร์สแรกกันเลย!"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
