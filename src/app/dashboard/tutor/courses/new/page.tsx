"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Save, AlertCircle } from "lucide-react";
import Link from "next/link";

type Subject = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  grade?: string;
};

export default function NewCoursePage() {
  const supabase = createClient();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const [subjectId, setSubjectId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [format, setFormat] = useState("Online");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchApprovedSubjects = async () => {
      setIsLoadingSubjects(true);
      setErrorMsg("");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        // 1. ดึงรายการวิชาที่ติวเตอร์ได้รับอนุมัติ (ใช้ .eq("status", "approved") เพื่อให้ตรงกับ Enum)
        const { data: verifiedRows, error: verifiedError } = await supabase
          .from("tutor_verified_subjects")
          .select("subject_id, grade, status")
          .eq("tutor_id", session.user.id)
          .eq("status", "approved");

        if (verifiedError) throw verifiedError;

        if (!verifiedRows || verifiedRows.length === 0) {
          setSubjects([]);
          return;
        }

        // 2. นำ subject_id ไปดึงชื่อและรหัสวิชาจากตาราง master_subjects
        const subjectIds = verifiedRows.map((r) => r.subject_id);
        const { data: masterData, error: masterError } = await supabase
          .from("master_subjects")
          .select("id, code, name, category")
          .in("id", subjectIds);

        if (masterError) throw masterError;

        if (masterData) {
          const formattedSubjects: Subject[] = masterData.map((ms) => {
            const matchedRow = verifiedRows.find(
              (r) => Number(r.subject_id) === Number(ms.id),
            );
            return {
              id: String(ms.id),
              code: ms.code || "",
              name: ms.name || "",
              category: ms.category || null,
              grade: matchedRow?.grade,
            };
          });

          setSubjects(formattedSubjects);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
        const errorObj = err as { message?: string };
        setErrorMsg(
          `ไม่สามารถดึงข้อมูลรายวิชาได้: ${errorObj?.message || "กรุณาตรวจสอบสิทธิ์ตาราง"}`,
        );
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchApprovedSubjects();
  }, [supabase]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSubjectId(selectedId);

    const found = subjects.find((s) => s.id === selectedId);
    if (found && !courseTitle) {
      setCourseTitle(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    if (!subjectId) {
      setErrorMsg("กรุณาเลือกรายวิชาที่ต้องการเปิดสอน");
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("ไม่พบเซสชันการล็อกอิน กรุณาเข้าสู่ระบบใหม่");
      }

      const selectedSubject = subjects.find((s) => s.id === subjectId);

      const { error } = await supabase.from("courses").insert({
        tutor_id: session.user.id,
        subject_id: Number(subjectId),
        title: courseTitle.trim() || selectedSubject?.name || "",
        teaching_format: format,
        price_per_hour: parseFloat(price),
        description: description,
      });

      if (error) throw error;

      router.push("/dashboard/tutor");
      router.refresh();
    } catch (err) {
      console.error("Error creating course:", err);
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header Section */}
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
              สร้างคอร์สเรียนใหม่
            </h1>
            <p className="text-sm md:text-base text-emerald-50 font-light mt-1 drop-shadow-sm">
              เลือกรายวิชาที่คุณผ่านการอนุมัติและกรอกรายละเอียดการสอน
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {!isLoadingSubjects && subjects.length === 0 && !errorMsg && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div className="text-sm">
                <p className="font-bold">ยังไม่มีรายวิชาที่ผ่านการอนุมัติ</p>
                <p className="text-amber-700 mt-0.5">
                  กรุณาตรวจสอบในฐานข้อมูลตาราง{" "}
                  <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                    tutor_verified_subjects
                  </code>{" "}
                  ว่าปรับสถานะ <code className="font-mono">status</code> เป็น{" "}
                  <b>approved</b> แล้วหรือยัง
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. เลือกวิชาแบบ Dropdown กดเลือกได้เลยไม่ต้องพิมพ์เอง */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                วิชาที่เปิดสอน (เฉพาะวิชาที่ได้รับอนุมัติ){" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={subjectId}
                onChange={handleSubjectChange}
                disabled={isLoadingSubjects || subjects.length === 0}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400 transition-all"
              >
                <option value="" disabled>
                  {isLoadingSubjects
                    ? "กำลังโหลดรายวิชา..."
                    : "-- คลิกเลือกรายวิชาที่ได้รับอนุมัติ --"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code ? `${subject.code} - ` : ""}
                    {subject.name}
                    {subject.grade ? ` (เกรด ${subject.grade})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. ชื่อคอร์สเรียน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                ชื่อคอร์สเรียน (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="ระบบจะดึงชื่อวิชามาให้อัตโนมัติ หรือพิมพ์ปรับแต่งเพิ่มได้..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            {/* 3. รูปแบบการสอน & ราคา */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  รูปแบบการสอน <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 transition-all"
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
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>

            {/* 4. รายละเอียดการสอน */}
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

            {/* ปุ่มบันทึกและยกเลิก */}
            <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
              <Link
                href="/dashboard/tutor"
                className="px-7 py-3.5 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-center"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingSubjects}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-[#1a1a1a] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    บันทึกคอร์สเรียน
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
