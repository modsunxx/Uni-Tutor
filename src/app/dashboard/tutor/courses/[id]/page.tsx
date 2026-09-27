"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Save, AlertCircle, Lock } from "lucide-react";
import Link from "next/link";

export default function EditCoursePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);

  // ข้อมูลวิชาและชื่อคอร์ส (แสดงผลอย่างเดียว ไม่ให้แก้ไข)
  const [courseTitle, setCourseTitle] = useState("");
  const [subjectDisplay, setSubjectDisplay] = useState("");

  // ข้อมูลที่อนุญาตให้แก้ไขได้
  const [format, setFormat] = useState("Online");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // ดึงข้อมูลคอร์สที่ต้องการแก้ไข
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;

        if (courseData) {
          setCourseTitle(courseData.title || "");
          setFormat(courseData.teaching_format || "Online");
          setPrice(courseData.price_per_hour?.toString() || "");
          setDescription(courseData.description || "");

          // ดึงรหัสวิชาและชื่อวิชาจากตาราง master_subjects มาแสดงผล
          if (courseData.subject_id) {
            const { data: subjectData } = await supabase
              .from("master_subjects")
              .select("code, name")
              .eq("id", courseData.subject_id)
              .maybeSingle();

            if (subjectData) {
              setSubjectDisplay(
                subjectData.code
                  ? `${subjectData.code} - ${subjectData.name}`
                  : subjectData.name,
              );
            } else {
              setSubjectDisplay(courseData.title || "");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setErrorMsg("ไม่สามารถโหลดข้อมูลคอร์สเรียนได้");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [supabase, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("ไม่พบเซสชันการล็อกอิน");

      // อัปเดตเฉพาะ รูปแบบการสอน ราคา และรายละเอียดการสอน
      const { error } = await supabase
        .from("courses")
        .update({
          teaching_format: format,
          price_per_hour: parseFloat(price),
          description: description,
        })
        .eq("id", courseId)
        .eq("tutor_id", session.user.id);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* === Header Section (ธีมเขียว Emerald + Blobs) === */}
      <div className="relative pt-12 pb-24 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[30%] left-16 w-37.5 h-37.5 bg-[#408A71] opacity-30 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto flex items-center gap-4 px-2">
          <Link
            href="/dashboard/tutor"
            className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-full backdrop-blur-sm transition-all shadow-sm"
            title="กลับไปหน้าแดชบอร์ด"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5 tracking-tight drop-shadow-sm">
              <BookOpen className="w-7 h-7 text-emerald-200" />
              แก้ไขคอร์สเรียน
            </h1>
            <p className="text-sm md:text-base text-emerald-50 font-light mt-1 drop-shadow-sm">
              ปรับปรุงรูปแบบการสอน ราคา หรือรายละเอียดการสอนของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* === Form Card === */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. ข้อมูลรายวิชาและชื่อคอร์ส (ล็อกไว้ไม่ให้แก้ไข) */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  รายวิชาและชื่อคอร์ส (ไม่สามารถแก้ไขได้)
                </span>
              </div>

              <div>
                <p className="text-lg font-bold text-gray-900">{courseTitle}</p>
                {subjectDisplay && subjectDisplay !== courseTitle && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    วิชา: {subjectDisplay}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400">
                * หากต้องการเปลี่ยนรายวิชาหรือชื่อคอร์ส
                กรุณาลบคอร์สนี้ในหน้าแดชบอร์ดแล้วสร้างคอร์สใหม่
              </p>
            </div>

            {/* 2. รูปแบบการสอน & ราคาต่อชั่วโมง */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  รูปแบบการสอน <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 font-medium transition-all"
                >
                  <option value="Online">ออนไลน์ (Online)</option>
                  <option value="Onsite">เจอตัว (Onsite)</option>
                  <option value="Hybrid">ผสมผสาน (Hybrid)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  ราคาต่อชั่วโมง (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="เช่น 150"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 font-medium placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 3. รายละเอียดการสอน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                รายละเอียดการสอน (Description)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายสไตล์การสอน สิ่งที่ผู้เรียนจะได้รับ หรือสถานที่นัดเรียน..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
              ></textarea>
            </div>

            {/* ปุ่มยกเลิกและบันทึก */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
              <Link
                href="/dashboard/tutor"
                className="px-7 py-3.5 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-center"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-[#1a1a1a] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    บันทึกการแก้ไข
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
