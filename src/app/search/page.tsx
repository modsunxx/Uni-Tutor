"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import {
  Search,
  BookOpen,
  User,
  MapPin,
  MonitorPlay,
  Sparkles,
  Filter,
} from "lucide-react";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  level: string | null;
  price_per_hour: number;
  teaching_format: string;
  cover_image_url: string | null;
  master_subjects: {
    code?: string;
    name: string;
    category: string | null;
  } | null;
  tutor_profiles: {
    users: {
      first_name: string;
      last_name: string;
      nickname: string | null;
      profile_image_url?: string | null;
      faculty?: string | null; // เพิ่มฟิลด์คณะเข้ามา
    } | null;
  } | null;
};

export default function SearchPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States สำหรับเก็บค่า Filter ที่ถูกเลือก
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // เพิ่มการดึงคอลัมน์ faculty ออกมาจากตาราง users ของติวเตอร์
        const { data, error } = await supabase.from("courses").select(`
            id,
            title,
            level,
            price_per_hour,
            teaching_format,
            cover_image_url,
            master_subjects ( code, name, category ),
            tutor_profiles (
              users ( first_name, last_name, nickname, profile_image_url, faculty )
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

  // ดึงรายชื่อ "คณะ" (Faculty) จากติวเตอร์ทุกคนที่มีคอร์สในระบบ โดยตัดตัวที่ซ้ำและค่าว่างออก
  const uniqueFaculties = Array.from(
    new Set(
      courses
        .map((c) => c.tutor_profiles?.users?.faculty)
        .filter(Boolean)
    )
  ) as string[];

  // กรองข้อมูลตาม Search Text + Faculty ของติวเตอร์ + Teaching Format
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = course.title?.toLowerCase().includes(query);
    const subjectMatch = course.master_subjects?.name
      ?.toLowerCase()
      .includes(query);
    const codeMatch = course.master_subjects?.code
      ?.toLowerCase()
      .includes(query);
    const tutorFirst = course.tutor_profiles?.users?.first_name
      ?.toLowerCase()
      .includes(query);
    const tutorNick = course.tutor_profiles?.users?.nickname
      ?.toLowerCase()
      .includes(query);

    // 1. ตรวจสอบคำค้นหา
    const matchesSearch = query === "" || titleMatch || subjectMatch || codeMatch || tutorFirst || tutorNick;

    // 2. ตรวจสอบคณะของติวเตอร์
    const matchesFaculty = selectedFaculty === "all" || course.tutor_profiles?.users?.faculty === selectedFaculty;

    // 3. ตรวจสอบรูปแบบการสอน
    const formatClean = course.teaching_format?.trim().toLowerCase() || "";
    const matchesFormat = selectedFormat === "all" || formatClean === selectedFormat;

    return matchesSearch && matchesFaculty && matchesFormat;
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* === Header & Search Section === */}
      <div className="relative pt-16 pb-32 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[40%] left-20 w-37.5 h-37.5 bg-[#408A71] opacity-40 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6 text-white px-2 text-center md:text-left">
            <span className="text-3xl font-bold tracking-tight drop-shadow-sm">
              ค้นหาติวเตอร์และรายวิชา
            </span>
          </div>

          <div className="relative mt-4 space-y-4">
            {/* ช่องพิมพ์ค้นหา */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-14 pr-6 py-4 rounded-2xl border-0 bg-white focus:ring-4 focus:ring-emerald-500/30 shadow-xl outline-none text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                placeholder="ค้นหารายวิชา / รหัสวิชา / รุ่นพี่ / ติวเตอร์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* แถบตัวกรอง (Filters) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-emerald-100" />
                </div>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-400 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                >
                  <option value="all" className="text-gray-900 font-medium">ทุกคณะ / คณะของผู้สอนทั้งหมด</option>
                  {uniqueFaculties.map((fac) => (
                    <option key={fac} value={fac} className="text-gray-900 font-medium">
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 sm:max-w-62.5">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-emerald-100" />
                </div>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-400 outline-none transition-all appearance-none cursor-pointer font-medium text-sm"
                >
                  <option value="all" className="text-gray-900 font-medium">ทุกรูปแบบการสอน</option>
                  <option value="online" className="text-gray-900 font-medium">ออนไลน์ (Online)</option>
                  <option value="onsite" className="text-gray-900 font-medium">เจอตัว (Onsite)</option>
                  <option value="hybrid" className="text-gray-900 font-medium">ผสมผสาน (Hybrid)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Course Gallery Section === */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
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
                className="bg-white h-87.5 rounded-4xl animate-pulse shadow-sm border border-gray-100"
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

              const tutorAvatar =
                course.tutor_profiles?.users?.profile_image_url;
                
              const tutorFaculty = course.tutor_profiles?.users?.faculty;

              const formatClean =
                course.teaching_format?.trim().toLowerCase() || "";

              return (
                <Link
                  href={`/courses/${course.id}`}
                  key={course.id}
                  className="group block"
                >
                  <div className="bg-white rounded-4xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col h-full">
                    {/* === ส่วนรูปหน้าปกคอร์ส (16:9) === */}
                    <div className="relative aspect-video w-full bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-100/70 overflow-hidden border-b border-gray-50">
                      {course.cover_image_url ? (
                        <Image
                          src={course.cover_image_url}
                          alt={course.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600/40">
                          <BookOpen className="w-12 h-12 mb-1 stroke-[1.5]" />
                          <span className="text-xs font-semibold tracking-wide uppercase">
                            UniTutor Course
                          </span>
                        </div>
                      )}

                      {/* ป้ายรหัสวิชา มุมซ้ายบน */}
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-800 backdrop-blur-xs shadow-xs">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          {course.master_subjects?.code || "ทั่วไป"}
                        </span>
                      </div>

                      {/* ป้ายระดับเนื้อหา (Level) มุมขวาล่างของรูป */}
                      {course.level && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                            <Sparkles className="w-3 h-3 text-emerald-300" />
                            {course.level}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* === Card Body === */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 flex-1">
                          {course.title}
                        </h3>
                        <span className="text-xl font-bold text-emerald-600 shrink-0">
                          ฿{course.price_per_hour}
                          <span className="text-xs font-medium text-gray-400">
                            /ชม.
                          </span>
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-5 font-medium line-clamp-1">
                        วิชา:{" "}
                        <span className="text-gray-700">
                          {course.master_subjects?.name || "ไม่ระบุวิชา"}
                        </span>
                      </p>

                      <div className="mt-auto space-y-2.5 bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          {tutorAvatar ? (
                            <Image
                              src={tutorAvatar}
                              alt={tutorName}
                              width={32}
                              height={32}
                              unoptimized
                              className="w-8 h-8 rounded-full object-cover border border-emerald-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                              <User className="w-4 h-4 text-emerald-600" />
                            </div>
                          )}
                          <span className="truncate">
                            สอนโดย <span className="font-bold text-gray-900">{tutorName}</span>
                            {/* แสดงชื่อคณะต่อท้ายชื่อติวเตอร์ */}
                            {tutorFaculty && (
                              <span className="text-xs text-emerald-700 ml-1 font-semibold block sm:inline">
                                ({tutorFaculty})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                            {formatClean === "online" ? (
                              <MonitorPlay className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <MapPin className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <span className="font-medium">
                            รูปแบบ:{" "}
                            <span className="text-gray-900 font-semibold">
                              {formatClean === "online"
                                ? "ออนไลน์ (Online)"
                                : formatClean === "onsite"
                                  ? "เจอตัว (Onsite)"
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
              <Filter className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ไม่พบคอร์สเรียนที่ตรงกับตัวกรอง
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              ลองเปลี่ยนคณะของผู้สอน รูปแบบการสอน หรือคำค้นหาดูอีกครั้งนะครับ
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedFaculty("all");
                setSelectedFormat("all");
              }}
              className="px-6 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-full hover:bg-emerald-200 transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>
    </main>
  );
}