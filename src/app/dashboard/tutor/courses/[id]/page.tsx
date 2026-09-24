"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Save, AlertCircle, Search } from "lucide-react";
import Link from "next/link";

export default function EditCoursePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams(); // ดึง ID จาก URL
  const courseId = params.id as string;

  type Subject = {
    id: string;
    name: string;
    category: string;
  };

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [format, setFormat] = useState("Online");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึงข้อมูลรายวิชาทั้งหมดมาก่อน
        const { data: subjectsData, error: subError } = await supabase
          .from("master_subjects")
          .select("id, name, category")
          .order("name", { ascending: true });

        if (subError) throw subError;

        let uniqueSubjects: Subject[] = [];
        if (subjectsData) {
          uniqueSubjects = subjectsData.filter(
            (subject, index, self) =>
              index === self.findIndex((t) => t.name === subject.name),
          );
          setSubjects(uniqueSubjects);
        }

        // 2. ดึงข้อมูลคอร์สที่ต้องการแก้ไข
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;

        if (courseData) {
          setSubjectId(courseData.subject_id.toString());
          setFormat(courseData.teaching_format);
          setPrice(courseData.price_per_hour.toString());
          setDescription(courseData.description || "");

          // หาชื่อวิชามาใส่ในช่องค้นหา
          const currentSubject = uniqueSubjects.find(
            (s) => s.id === courseData.subject_id.toString(),
          );
          if (currentSubject) {
            setSearchQuery(currentSubject.name);
          } else {
            setSearchQuery(courseData.title); // ถ้าหาไม่เจอ ให้ใช้ title เก่า
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMsg("ไม่สามารถโหลดข้อมูลคอร์สเรียนได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [supabase, courseId]);

  const filteredSubjects = subjects.filter((subject) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      subject.name?.toLowerCase().includes(searchLower) ||
      subject.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectSubject = (id: string, name: string) => {
    setSubjectId(id);
    setSearchQuery(name);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    if (!subjectId) {
      setErrorMsg("กรุณาค้นหาและกดเลือกวิชาจากรายการที่ปรากฏ");
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("ไม่พบเซสชันการล็อกอิน");

      // ใช้คำสั่ง .update() เพื่อแก้ไขข้อมูลที่มีอยู่แล้ว
      const { error } = await supabase
        .from("courses")
        .update({
          subject_id: Number(subjectId),
          title: searchQuery,
          teaching_format: format,
          price_per_hour: parseFloat(price),
          description: description,
        })
        .eq("id", courseId)
        .eq("tutor_id", session.user.id); // ป้องกันไม่ให้แก้คอร์สคนอื่น

      if (error) throw error;

      router.push("/dashboard/tutor");
      router.refresh();
    } catch (err) {
      console.error("Error updating course:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/tutor"
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              แก้ไขคอร์สเรียน
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ปรับปรุงรายละเอียด รูปแบบการสอน หรือราคาคอร์สของคุณ
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วิชาที่สอน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อวิชาเพื่อค้นหา..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSubjectId("");
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>

              {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-2 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <li
                        key={subject.id}
                        onMouseDown={() =>
                          handleSelectSubject(subject.id, subject.name)
                        }
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="text-sm font-semibold text-gray-900">
                          {subject.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          หมวดหมู่: {subject.category || "ไม่มีหมวดหมู่"}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-sm text-gray-500 text-center">
                      ไม่พบรายวิชาที่ตรงกับ &quot;{searchQuery}&quot;
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปแบบการสอน <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Online">ออนไลน์ (Online)</option>
                  <option value="Onsite">เจอตัว (Onsite)</option>
                  <option value="Hybrid">ผสมผสาน (Hybrid)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาต่อชั่วโมง (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดการสอน (Description)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Link
                href="/dashboard/tutor"
                className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <Save className="w-5 h-5" /> บันทึกการแก้ไข
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
