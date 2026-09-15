"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";
import coursesData from "@/data/courses.json";

// 1. กำหนด Type ให้ตรงกับข้อมูลในไฟล์ courses.json
interface CourseOption {
  id: string;
  name: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);

  // State สำหรับฟอร์ม
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Online");
  const [price, setPrice] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  // State สำหรับ Dropdown ค้นหาวิชา
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State สำหรับสถานะการบันทึก
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
    };
    fetchUser();

    // ระบบคลิกที่อื่นเพื่อปิด Dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router, supabase]);

  // ระบบกรองข้อมูล (Filter) แบบมี Type
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return coursesData as CourseOption[];
    const lowerQuery = searchQuery.toLowerCase();

    return (coursesData as CourseOption[]).filter(
      (course: CourseOption) =>
        course.id.includes(lowerQuery) ||
        course.name.toLowerCase().includes(lowerQuery),
    );
  }, [searchQuery]);

  const handleSelectCourse = (courseId: string, courseName: string) => {
    setSubjectCode(courseId);
    setSearchQuery(`${courseId} - ${courseName}`);
    setIsDropdownOpen(false);

    // ตั้งชื่อคอร์สเริ่มต้นให้อัตโนมัติ
    if (!title) setTitle(`ติวเข้ม ${courseName}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode) {
      setMessage({ type: "error", text: "กรุณาเลือกรายวิชาที่ต้องการสอน" });
      return;
    }

    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      // ข้อมูลที่จะส่งเข้าฐานข้อมูล (ตาราง courses)
      const newCourse = {
        tutor_id: userId,
        subject_code: subjectCode,
        title: title,
        description: description,
        category: category,
        price: parseFloat(price) || 0,
      };

      const { error } = await supabase.from("courses").insert(newCourse);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "สร้างคอร์สสอนสำเร็จ! กำลังพาไปหน้าแดชบอร์ด...",
      });

      // หน่วงเวลา 1.5 วินาทีแล้วเด้งกลับไปหน้าแดชบอร์ด
      setTimeout(() => {
        router.push("/dashboard/tutor");
      }, 1500);
    } catch (err) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "เกิดข้อผิดพลาดในการสร้างคอร์ส",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          สร้างคอร์สสอนใหม่ 📚
        </h1>
        <p className="text-gray-500 mb-8">
          เปิดรับลูกศิษย์และแบ่งปันความรู้ในสไตล์ของคุณ
        </p>

        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative" ref={dropdownRef}>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              ค้นหารายวิชาของมหาวิทยาลัย <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="พิมพ์รหัส หรือ ชื่อวิชา เช่น แคลคูลัส..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setSubjectCode("");
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
              required
            />

            {/* กล่องแสดงผลลัพธ์การค้นหาวิชา */}
            {isDropdownOpen && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: CourseOption) => (
                    <li
                      key={course.id}
                      onClick={() => handleSelectCourse(course.id, course.name)}
                      className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors border-b border-gray-50 last:border-0 flex items-center"
                    >
                      <span className="font-semibold text-primary mr-3 min-w-17.5">
                        {course.id}
                      </span>
                      <span className="text-gray-700 truncate">
                        {course.name}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-gray-400 text-center text-sm">
                    ไม่พบรายวิชาที่ค้นหา
                  </li>
                )}
              </ul>
            )}
          </div>

          <Input
            label="ชื่อคอร์ส (โปรโมทให้น่าสนใจ)"
            type="text"
            placeholder="เช่น ติวแคลคูลัส 1 แบบรวบรัดก่อนสอบ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                รูปแบบการสอน <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-gray-700 bg-white"
              >
                <option value="Online">เรียนออนไลน์ (Online)</option>
                <option value="On-site">เรียนเจอตัว (On-site)</option>
                <option value="Hybrid">ตกลงกันได้ (Hybrid)</option>
              </select>
            </div>

            <Input
              label="ราคา (บาท / ชั่วโมง)"
              type="number"
              placeholder="เช่น 150 (ใส่ 0 ถ้าสอนฟรี)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              รายละเอียดคอร์ส / สไตล์การสอน
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-30 resize-y text-sm text-gray-700"
              placeholder="อธิบายว่าคอร์สนี้เหมาะกับใคร จะสอนเนื้อหาบทไหนบ้าง หรือมีเอกสารประกอบให้ไหม..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/tutor")}
              disabled={isSaving}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="px-8 bg-primary text-white hover:opacity-90"
            >
              {isSaving ? "กำลังสร้าง..." : "สร้างคอร์สสอน"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
