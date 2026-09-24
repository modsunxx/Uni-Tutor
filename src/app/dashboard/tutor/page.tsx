"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  BookOpen,
  PlusCircle,
  UserCheck,
  GraduationCap,
  Clock,
  UploadCloud,
  Plus,
  Trash2,
  Edit,
  Wallet,
  Users,
  Star,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

type Subject = {
  id: string;
  name: string;
  category: string;
};

type SelectedSubject = {
  subject_id: string;
  grade: string;
};

type Course = {
  id: string;
  title: string;
  teaching_format: string;
  price_per_hour: number;
  description: string;
  status: string;
};

export default function TutorDashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const [isTutor, setIsTutor] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ข้อมูลคอร์สเรียน
  const [courses, setCourses] = useState<Course[]>([]);

  // ข้อมูลสถิติของติวเตอร์ (ของจริง)
  const [stats, setStats] = useState({
    revenue: 0,
    students: 0,
    rating: 0,
    reviewCount: 0,
    views: [0, 0, 0, 0, 0, 0, 0], // จันทร์ - อาทิตย์
  });

  // สเตตัสฟอร์มสมัคร
  const [bio, setBio] = useState("");
  const [gpa, setGpa] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [masterSubjects, setMasterSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([
    { subject_id: "", grade: "" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // เช็คสถานะและดึงข้อมูลโปรไฟล์
          const { data: tutorProfile, error } = await supabase
            .from("tutor_profiles")
            .select("id, is_verified, rating, review_count")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;

          if (tutorProfile) {
            if (tutorProfile.is_verified) {
              setIsTutor(true);

              // อัปเดตสถิติรีวิวจากฐานข้อมูลจริง
              setStats((prev) => ({
                ...prev,
                rating: tutorProfile.rating || 0,
                reviewCount: tutorProfile.review_count || 0,
              }));

              // ดึงข้อมูลคอร์สทั้งหมดที่ติวเตอร์คนนี้เปิดสอน
              const { data: coursesData, error: coursesError } = await supabase
                .from("courses")
                .select("*")
                .eq("tutor_id", session.user.id)
                .order("created_at", { ascending: false });

              if (coursesError) throw coursesError;
              if (coursesData) setCourses(coursesData);

              // TODO: ในอนาคตถ้ามีตาราง bookings สามารถเขียน query ดึงยอดรายได้และจำนวนนักเรียนมาใส่ stats ตรงนี้ได้เลย
            } else {
              setIsPending(true);
            }
          }
        }

        // ดึงข้อมูลรายวิชามาเตรียมไว้สำหรับตอนสมัคร
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("master_subjects")
          .select("id, name, category")
          .order("name", { ascending: true });

        if (subjectsError) throw subjectsError;
        if (subjectsData) setMasterSubjects(subjectsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchData();
  }, [supabase]);

  const addSubjectRow = () => {
    setSelectedSubjects([...selectedSubjects, { subject_id: "", grade: "" }]);
  };

  const removeSubjectRow = (index: number) => {
    const newSubjects = [...selectedSubjects];
    newSubjects.splice(index, 1);
    setSelectedSubjects(newSubjects);
  };

  const updateSubjectRow = (
    index: number,
    field: keyof SelectedSubject,
    value: string,
  ) => {
    const newSubjects = [...selectedSubjects];
    newSubjects[index][field] = value;
    setSelectedSubjects(newSubjects);
  };

  const handleBecomeTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!file) {
      setErrorMsg("กรุณาอัปโหลดไฟล์หลักฐานผลการเรียน (Transcript)");
      return;
    }

    const hasEmptySubject = selectedSubjects.some(
      (s) => !s.subject_id || !s.grade,
    );
    if (hasEmptySubject) {
      setErrorMsg(
        "กรุณาเลือกวิชาและระบุเกรดให้ครบถ้วน หรือลบแถวที่ไม่ได้ใช้ออก",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("transcripts")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("transcripts").getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: user.id,
          bio: bio,
          gpa: parseFloat(gpa),
          transcript_url: publicUrl,
          is_verified: false,
          rating: 0,
          review_count: 0,
        });

      if (insertError) throw insertError;

      const subjectsToInsert = selectedSubjects.map((sub) => ({
        tutor_id: user.id,
        subject_id: parseInt(sub.subject_id),
        grade: sub.grade,
        status: "pending",
      }));

      const { error: subjectsInsertError } = await supabase
        .from("tutor_verified_subjects")
        .insert(subjectsToInsert);

      if (subjectsInsertError) throw subjectsInsertError;

      setIsPending(true);
    } catch (err) {
      const errorObj = err as { message?: string };
      console.error("Error becoming tutor:", err);
      setErrorMsg(
        `เกิดข้อผิดพลาด: ${errorObj?.message || JSON.stringify(err)}`,
      );
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

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            กรุณาเข้าสู่ระบบก่อน
          </h2>
          <Link
            href="/login"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            ไปที่หน้าเข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            คำขออยู่ระหว่างตรวจสอบ
          </h1>
          <p className="text-gray-500 mb-6">
            แอดมินกำลังตรวจสอบความถูกต้องของผลการเรียน (Transcript)
            เทียบกับรายวิชาที่คุณยื่นขอสอน กรุณารอการอนุมัติภายใน 1-2
            วันทำการครับ
          </p>
          <Link
            href="/dashboard/learner"
            className="text-blue-600 font-medium hover:underline"
          >
            &larr; กลับไปที่แดชบอร์ดนักศึกษา
          </Link>
        </div>
      </main>
    );
  }

  // --- แดชบอร์ดสำหรับติวเตอร์ที่ผ่านการอนุมัติแล้ว ---
  if (isTutor) {
    const days = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ภาพรวมการสอน</h1>
              <p className="text-gray-500 mt-1">
                ยินดีต้อนรับกลับ! นี่คือสถิติและคอร์สเรียนของคุณในขณะนี้
              </p>
            </div>
            <Link
              href="/dashboard/tutor/courses/new"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              สร้างคอร์สใหม่
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">รายได้สะสม</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ฿{stats.revenue.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  นักเรียนที่สอน
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.students}{" "}
                  <span className="text-base font-normal text-gray-500">
                    คน
                  </span>
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  คอร์สที่เปิดสอน
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {courses.length}{" "}
                  <span className="text-base font-normal text-gray-500">
                    วิชา
                  </span>
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  คะแนนรีวิวเฉลี่ย
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.rating.toFixed(1)}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({stats.reviewCount} รีวิว)
                  </span>
                </h3>
              </div>
            </div>
          </div>

          {/* Graph & Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Graph (Starts at 0) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />{" "}
                  สถิติคนเข้าชมคอร์ส (สัปดาห์นี้)
                </h3>
              </div>

              {/* ถ้ากราฟเป็น 0 หมด จะแสดงแบบราบเรียบ */}
              <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-1 relative">
                {stats.views.every((v) => v === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 pointer-events-none">
                    ยังไม่มีข้อมูลสถิติเข้าชม
                  </div>
                )}
                {stats.views.map((height, index) => {
                  // คำนวณความสูง (สมมติให้ Max คือ 100 view ถ้าเกินให้เป็น 100%)
                  const normalizedHeight =
                    height === 0 ? 0 : Math.min(100, (height / 100) * 100);

                  return (
                    <div
                      key={index}
                      className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 ease-in-out hover:bg-blue-600 min-h-1"
                        style={{ height: `${normalizedHeight}%` }}
                      ></div>
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded-md transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {height} views
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-400 mt-4 px-2">
                {days.map((day, idx) => (
                  <span key={idx}>{day}</span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                แจ้งเตือนล่าสุด
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Clock className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">ยังไม่มีความเคลื่อนไหวใหม่</p>
              </div>
            </div>
          </div>

          {/* รายการคอร์สเรียน */}
          <div>
            <div className="flex items-center justify-between mb-6 mt-4">
              <h3 className="text-xl font-bold text-gray-900">
                จัดการคอร์สเรียน ({courses.length})
              </h3>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-6 flex flex-col relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
                        {course.teaching_format}
                      </span>
                      <button className="text-gray-400 hover:text-blue-600 transition">
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 grow">
                      {course.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                    </p>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-gray-900 font-bold text-lg">
                        ฿{course.price_per_hour}{" "}
                        <span className="text-gray-400 text-sm font-normal">
                          / ชม.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ยังไม่มีคอร์สเรียน
                </h3>
                <p className="text-gray-500 mb-6">
                  สร้างคอร์สแรกของคุณเพื่อเริ่มรับนักเรียน
                </p>
                <Link
                  href="/dashboard/tutor/courses/new"
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl font-medium hover:bg-blue-100 transition"
                >
                  <PlusCircle className="w-5 h-5" />
                  สร้างคอร์สเลย
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // --- หน้าฟอร์มสมัครติวเตอร์ ---
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            อัปเกรดบัญชีเป็นติวเตอร์
          </h1>
          <p className="text-gray-500">
            แบ่งปันความรู้ สร้างรายได้ และช่วยเหลือเพื่อนๆ
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleBecomeTutor} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แนะนำตัวสั้นๆ (Bio) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="เช่น ถนัดวิชาเขียนโปรแกรม สอนสนุก เป็นกันเอง..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เกรดเฉลี่ยสะสมรวม (GPAX) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                required
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น 3.50"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                วิชาที่ต้องการขอสิทธิ์สอน{" "}
                <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addSubjectRow}
                className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" /> เพิ่มวิชา
              </button>
            </div>

            <div className="space-y-3">
              {selectedSubjects.map((subject, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200"
                >
                  <div className="flex-1">
                    <select
                      required
                      value={subject.subject_id}
                      onChange={(e) =>
                        updateSubjectRow(index, "subject_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                    >
                      <option value="" disabled>
                        -- เลือกรายวิชา --
                      </option>
                      {masterSubjects.map((ms) => (
                        <option key={ms.id} value={ms.id}>
                          {ms.name} ({ms.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input
                      type="text"
                      required
                      placeholder="เกรด (เช่น A)"
                      value={subject.grade}
                      onChange={(e) =>
                        updateSubjectRow(index, "grade", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm uppercase"
                    />
                  </div>
                  {selectedSubjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSubjectRow(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * แอดมินจะตรวจสอบเกรดแต่ละวิชาจากรูป Transcript
              ที่คุณแนบมาด้านล่าง
            </p>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ไฟล์ผลการเรียน (Transcript) อัปเดตล่าสุด{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>อัปโหลดไฟล์ภาพ หรือ PDF</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                </div>
                {file && (
                  <p className="text-sm font-semibold text-emerald-600 mt-2">
                    {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 mt-6"
          >
            {isSubmitting ? (
              "กำลังส่งคำขอ..."
            ) : (
              <>
                <GraduationCap className="w-5 h-5" /> ส่งคำขอเป็นติวเตอร์
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
