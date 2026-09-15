"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";

// 1. กำหนดโครงสร้างข้อมูลให้ TypeScript สบายใจ
type Course = {
  id: string;
  subject_code: string;
  category: string;
  title: string;
  description: string | null;
  price: number;
};

export default function TutorDashboard() {
  const supabase = createClient();

  // 2. State สำหรับเก็บข้อมูลจริง
  const [userName, setUserName] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. ฟังก์ชันดึงข้อมูลจากฐานข้อมูล
  useEffect(() => {
    const fetchDashboardData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // ดึงชื่อซันนี่จากตาราง users
        const { data: userData } = await supabase
          .from("users")
          .select("nickname, first_name")
          .eq("id", session.user.id)
          .single();

        setUserName(
          userData?.nickname ||
            userData?.first_name ||
            session.user.email ||
            "",
        );

        // ดึงคอร์สที่ติวเตอร์สร้างไว้จากตาราง courses
        const { data: courseData, error } = await supabase
          .from("courses")
          .select("*")
          .eq("tutor_id", session.user.id)
          .order("created_at", { ascending: false });

        if (!error && courseData) {
          setCourses(courseData);
        }
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
      {/* ส่วนหัวของ Dashboard */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการการสอน (Tutor Center) 💡
          </h1>
          <p className="text-gray-500">
            ยินดีต้อนรับ,{" "}
            <span className="font-semibold text-primary">
              {userName || "กำลังโหลด..."}
            </span>
          </p>
        </div>

        {/* ปุ่มสร้างคอร์สใหม่ (แก้สีให้เห็นชัดเจน) */}
        <Link href="/dashboard/tutor/create-course">
          <Button
            variant="primary"
            className="bg-primary text-white hover:opacity-90 shadow-sm"
          >
            สร้างคอร์สใหม่ +
          </Button>
        </Link>
      </div>

      {/* กล่องสถิติ (รอเชื่อมข้อมูลรายได้จริงในอนาคต) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">
            รายได้เดือนนี้ (รอแอดมินยืนยัน)
          </p>
          <p className="text-3xl font-bold text-green-500 mt-2">฿ 0.00</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">เรตติ้งเฉลี่ย</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">⭐ 0.0</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">จำนวนคอร์สที่เปิดสอน</p>
          <p className="text-3xl font-bold text-primary mt-2">
            {courses.length} คอร์ส
          </p>
        </div>
      </div>

      {/* 4. ส่วนแสดงรายวิชาที่ดึงมาจากฐานข้อมูล */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        คอร์สเรียนของฉัน 📚
      </h2>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          กำลังโหลดข้อมูลคอร์ส...
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {course.subject_code}
                </span>
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {course.category}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                {course.description || "ไม่มีคำอธิบายคอร์ส"}
              </p>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                <span className="font-bold text-lg text-gray-800">
                  {course.price > 0 ? `฿${course.price}/ชม.` : "สอนฟรี"}
                </span>
                <Button variant="outline" size="sm">
                  แก้ไข
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mb-10">
          <span className="text-5xl mb-4">📭</span>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            ยังไม่มีคอร์สสอน
          </h3>
          <p className="text-gray-500 mb-6">
            เริ่มแบ่งปันความรู้และสร้างรายได้จากการสอนได้เลย!
          </p>
          <Link href="/dashboard/tutor/create-course">
            <Button variant="primary" className="bg-primary text-white">
              สร้างคอร์สแรกของคุณ
            </Button>
          </Link>
        </div>
      )}

      {/* คำขอจองเวลาเรียน (ทิ้ง Mockup แคลคูลัส 1 ไว้ให้ดูก่อน) */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 pt-6 border-t border-gray-100">
        คำขอจองเวลาเรียน (รอการยืนยัน)
      </h2>
    </main>
  );
}
