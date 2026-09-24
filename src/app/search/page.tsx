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

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
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
        const errorObj = err as { message?: string; details?: string };

        setErrorMsg(
          `Database Error: ${errorObj?.message || errorObj?.details || JSON.stringify(err)}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [supabase]);

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
      {/* === Header & Search Section แบบใหม่ (ธีมเขียว Figma) === */}
      <div className="relative pt-16 pb-28 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
        {/* กลุ่มวงกลมตกแต่ง (Blobs) สำหรับ Header */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[40%] left-20 w-37.5 h-37.5 bg-[#408A71] opacity-40 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* ข้อมูลโลโก้คณะ (ย้ายมาจัดชิดซ้ายให้เหมือน Figma) */}
          <div className="mb-8 text-white px-2">
            <div className="flex items-center gap-2 mb-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L22 12L12 22L2 12L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-3xl font-bold tracking-tight drop-shadow-sm">
                UniTutor
              </span>
            </div>
            <p className="text-sm text-emerald-50 leading-relaxed font-light ml-8 drop-shadow-sm">
              แพลตฟอร์มหาติวเตอร์สำหรับนักศึกษา
            </p>
          </div>

          <div className="max-w-3xl relative mt-10">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-6 py-4 rounded-full border-0 focus:ring-4 focus:ring-emerald-500/30 shadow-2xl outline-none text-gray-900 font-medium transition-all"
              placeholder="ค้นหารายวิชา / รุ่นพี่ / ติวเตอร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* ======================================================== */}

      {/* Course Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-8 shadow-sm border border-red-100">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white h-64 rounded-4xl animate-pulse shadow-sm border border-gray-100"
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
                  <div className="bg-white rounded-4xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.master_subjects?.category || "ทั่วไป"}
                      </span>
                      <span className="text-xl font-bold text-emerald-600">
                        ฿{course.price_per_hour}
                        <span className="text-sm font-medium text-gray-400">
                          /ชม.
                        </span>
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 font-medium">
                        วิชา:{" "}
                        <span className="text-gray-700">
                          {course.master_subjects?.name || "ไม่ระบุวิชา"}
                        </span>
                      </p>

                      <div className="mt-auto space-y-3 bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <User className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span>
                            สอนโดย{" "}
                            <span className="font-bold text-gray-900">
                              {tutorName}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                            {course.teaching_format === "online" ? (
                              <MonitorPlay className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <MapPin className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <span className="capitalize font-medium">
                            รูปแบบ:{" "}
                            <span className="text-gray-900">
                              {course.teaching_format === "online"
                                ? "ออนไลน์"
                                : course.teaching_format === "onsite"
                                  ? "ออนไซต์"
                                  : "ผสมผสาน (Hybrid)"}
                            </span>
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
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ไม่พบคอร์สเรียน
            </h3>
            <p className="text-gray-500 text-lg">
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
