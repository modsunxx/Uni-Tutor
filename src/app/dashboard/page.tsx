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
} from "lucide-react";
import Link from "next/link";

export default function TutorDashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  // สถานะผู้ใช้งาน
  const [isTutor, setIsTutor] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // สเตตัสสำหรับฟอร์มสมัคร
  const [bio, setBio] = useState("");
  const [gpa, setGpa] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const checkUserAndTutorStatus = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // ดึงข้อมูลเช็คว่าสมัครหรือยัง และยืนยันตัวตน (is_verified) หรือยัง
          const { data: tutorProfile, error } = await supabase
            .from("tutor_profiles")
            .select("id, is_verified")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;

          if (tutorProfile) {
            if (tutorProfile.is_verified) {
              setIsTutor(true); // แอดมินอนุมัติแล้ว
            } else {
              setIsPending(true); // สมัครแล้ว แต่รอแอดมินอนุมัติ
            }
          }
        }
      } catch (err) {
        console.error("Error checking tutor status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndTutorStatus();
  }, [supabase]);

  // ฟังก์ชันกดสมัครเป็นติวเตอร์
  const handleBecomeTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!file) {
      setErrorMsg("กรุณาอัปโหลดไฟล์หลักฐานผลการเรียน (Transcript)");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. อัปโหลดไฟล์ลง Supabase Storage (Bucket: transcripts)
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("transcripts")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // ดึง URL ของไฟล์ที่อัปโหลดเสร็จแล้ว
      const {
        data: { publicUrl },
      } = supabase.storage.from("transcripts").getPublicUrl(fileName);

      // 2. บันทึกข้อมูลลงตาราง (สถานะ is_verified เป็น false และไม่เปลี่ยน Role)
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

      // สมัครสำเร็จ เปลี่ยนสถานะหน้าจอเป็น "รออนุมัติ"
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

  // --- สถานะที่ 1: รอแอดมินอนุมัติ ---
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
            เราได้รับข้อมูลการสมัครเป็นติวเตอร์ของคุณแล้ว
            แอดมินกำลังตรวจสอบความถูกต้องของผลการเรียน (Transcript)
            กรุณารอการอนุมัติภายใน 1-2 วันทำการครับ
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

  // --- สถานะที่ 2: เป็นติวเตอร์แล้ว (แสดงหน้า Dashboard) ---
  if (isTutor) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                แดชบอร์ดติวเตอร์
              </h1>
              <p className="text-gray-500 mt-1">
                จัดการคอร์สเรียนและดูสถิติการสอนของคุณ
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mt-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              คุณยังไม่ได้เปิดสอนคอร์สใดๆ
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              เริ่มต้นสร้างรายได้ด้วยการเปิดคอร์สติววิชาที่คุณถนัด
              ให้นักศึกษาคนอื่นเข้ามาค้นหาและลงทะเบียนเรียนได้เลย
            </p>
            <Link
              href="/dashboard/tutor/courses/new"
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition"
            >
              <PlusCircle className="w-5 h-5" />
              สร้างคอร์สแรกเลย!
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --- สถานะที่ 3: ยังไม่เป็นติวเตอร์ (แสดงฟอร์มสมัคร) ---
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          อัปเกรดบัญชีเป็นติวเตอร์
        </h1>
        <p className="text-gray-500 mb-8">
          แบ่งปันความรู้ สร้างรายได้ระหว่างเรียน และช่วยเหลือเพื่อนๆ
          มทร.ตะวันออก
        </p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleBecomeTutor}
          className="text-left space-y-5 max-w-md mx-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              แนะนำตัวสั้นๆ (Bio) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="เช่น ถนัดวิชาเขียนโปรแกรม สอนสนุก เป็นกันเอง..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เกรดเฉลี่ยสะสม (GPAX) <span className="text-red-500">*</span>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ไฟล์ผลการเรียน (Transcript){" "}
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
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF ขนาดไม่เกิน 5MB
                </p>
                {file && (
                  <p className="text-sm font-semibold text-emerald-600 mt-2">
                    เลือกไฟล์: {file.name}
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
