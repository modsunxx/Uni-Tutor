"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Landmark,
  Wallet,
  Users,
  AlertCircle,
  GraduationCap,
  BookOpen,
} from "lucide-react";

type VerifiedSubjectItem = {
  id: number;
  tutor_id: string;
  subject_id: number;
  grade: string;
  status: string | null;
  subject_code?: string;
  subject_name?: string;
};

type TutorApplication = {
  id: string;
  bio: string | null;
  headline: string | null;
  gpa: number | null;
  transcript_url: string | null;
  is_verified: boolean;
  verified_at: string | null;
  bank_name: string | null;
  bank_account: string | null;
  promptpay: string | null;
  created_at: string;
  user_info: {
    student_id: string | null;
    prefix: string | null;
    first_name: string;
    last_name: string;
    nickname: string | null;
    phone: string | null;
    line_id: string | null;
    role: string;
    profile_image_url: string | null;
  } | null;
  subjects: VerifiedSubjectItem[];
};

type AdminPaymentItem = {
  id: number;
  booking_id: number;
  amount: number;
  slip_url: string | null;
  status: string | null;
  verified_by: string | null;
  verified_at: string | null;
  reject_note: string | null;
  created_at: string;
  booking?: {
    id: number;
    course_id: number;
    learner_id: string;
    tutor_id: string;
    start_at: string;
    end_at: string;
    total_amount: number;
    status: string | null;
  } | null;
  course_title?: string;
  learner_name?: string;
  tutor_name?: string;
  tutor_bank?: {
    bank_name: string | null;
    bank_account: string | null;
    promptpay: string | null;
  } | null;
};

export default function AdminDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tutors" | "payments">("tutors");

  const [tutorApps, setTutorApps] = useState<TutorApplication[]>([]);
  const [paymentItems, setPaymentItems] = useState<AdminPaymentItem[]>([]);
  const [processingId, setProcessingId] = useState<string | number | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verifyAdminAndLoadData = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login");
          return;
        }

        setAdminId(session.user.id);

        const { data: currentUser, error: userErr } = await supabase
          .from("users")
          .select("first_name, last_name, nickname, role")
          .eq("id", session.user.id)
          .single();

        if (userErr || !currentUser || currentUser.role?.toLowerCase() !== "admin") {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        setAdminName(currentUser.nickname || currentUser.first_name || "Admin");

        const [
          { data: allUsers },
          { data: allProfiles },
          { data: allVerifiedSubjects },
          { data: allMasterSubjects },
          { data: allCourses },
          { data: allBookings },
          { data: allPayments },
        ] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("tutor_profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("tutor_verified_subjects").select("*"),
          supabase.from("master_subjects").select("id, code, name"),
          supabase.from("courses").select("id, title"),
          supabase.from("bookings").select("*").order("created_at", { ascending: false }),
          supabase.from("payments").select("*").order("created_at", { ascending: false }),
        ]);

        if (allProfiles) {
          const formattedTutors: TutorApplication[] = allProfiles.map((tp) => {
            const matchedUser = allUsers?.find((u) => u.id === tp.id) || null;
            const tutorSubs = allVerifiedSubjects?.filter((vs) => vs.tutor_id === tp.id).map((vs) => {
                  const ms = allMasterSubjects?.find((m) => Number(m.id) === Number(vs.subject_id));
                  return {
                    ...vs,
                    subject_code: ms?.code || "",
                    subject_name: ms?.name || "ไม่ระบุชื่อวิชา",
                  };
                }) || [];

            return { ...tp, user_info: matchedUser, subjects: tutorSubs };
          });
          setTutorApps(formattedTutors);
        }

        if (allPayments) {
          const formattedPayments: AdminPaymentItem[] = allPayments.map((p) => {
            const matchedBooking = allBookings?.find((b) => Number(b.id) === Number(p.booking_id)) || null;
            const matchedCourse = allCourses?.find((c) => Number(c.id) === Number(matchedBooking?.course_id));
            const learnerUser = allUsers?.find((u) => u.id === matchedBooking?.learner_id);
            const tutorUser = allUsers?.find((u) => u.id === matchedBooking?.tutor_id);
            const tutorProfile = allProfiles?.find((tp) => tp.id === matchedBooking?.tutor_id);

            const learnerName = learnerUser
              ? `${learnerUser.nickname ? `${learnerUser.nickname} (` : ""}${learnerUser.prefix || ""}${learnerUser.first_name} ${learnerUser.last_name}${learnerUser.nickname ? ")" : ""}`
              : "ไม่ระบุชื่อผู้เรียน";

            const tutorName = tutorUser
              ? `${tutorUser.nickname ? `${tutorUser.nickname} (` : ""}${tutorUser.prefix || ""}${tutorUser.first_name} ${tutorUser.last_name}${tutorUser.nickname ? ")" : ""}`
              : "ไม่ระบุชื่อติวเตอร์";

            return {
              ...p,
              booking: matchedBooking,
              course_title: matchedCourse?.title || "คอร์สเรียน",
              learner_name: learnerName,
              tutor_name: tutorName,
              tutor_bank: tutorProfile
                ? {
                    bank_name: tutorProfile.bank_name,
                    bank_account: tutorProfile.bank_account,
                    promptpay: tutorProfile.promptpay,
                  }
                : null,
            };
          });
          setPaymentItems(formattedPayments);
        }
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
        setErrorMsg("เกิดข้อผิดพลาดในการโหลดข้อมูลแอดมิน");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAndLoadData();
  }, [supabase, router]);

  const handleToggleVerifyTutor = async (tutor: TutorApplication, approve: boolean) => {
    setProcessingId(tutor.id);
    setErrorMsg("");
    try {
      const nowIso = approve ? new Date().toISOString() : null;

      const { error: profileErr } = await supabase.from("tutor_profiles").update({
        is_verified: approve,
        verified_at: nowIso,
      }).eq("id", tutor.id);
      if (profileErr) throw profileErr;

      const { error: subErr } = await supabase.from("tutor_verified_subjects").update({ 
        status: approve ? "approved" : "pending" 
      }).eq("tutor_id", tutor.id);
      if (subErr) throw subErr;

      if (tutor.user_info && tutor.user_info.role?.toLowerCase() !== "admin") {
        await supabase.from("users").update({ role: approve ? "Tutor" : "Learner" }).eq("id", tutor.id);
      }

      setTutorApps((prev) => prev.map((item) => item.id === tutor.id ? {
          ...item,
          is_verified: approve,
          verified_at: nowIso,
          subjects: item.subjects.map((s) => ({ ...s, status: approve ? "approved" : "pending" })),
        } : item));
    } catch (err) {
      console.error("Error updating tutor verification:", err);
      alert("ไม่สามารถอัปเดตสถานะติวเตอร์ได้ กรุณารัน SQL เปิดสิทธิ์ Admin ก่อน");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprovePayment = async (payment: AdminPaymentItem) => {
    setProcessingId(payment.id);
    try {
      const nowIso = new Date().toISOString();

      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "verified",
          verified_by: adminId,
          verified_at: nowIso,
          reject_note: null,
        })
        .eq("id", payment.id);

      if (paymentError) throw paymentError;

      if (payment.booking_id) {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
          })
          .eq("id", payment.booking_id);

        if (bookingError) throw bookingError;
      }

      setPaymentItems((prev) =>
        prev.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                status: "verified",
                verified_by: adminId,
                verified_at: nowIso,
                reject_note: null,
                booking: item.booking ? { ...item.booking, status: "confirmed" } : item.booking,
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("เกิดข้อผิดพลาดในการยืนยันสลิป");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayment = async (payment: AdminPaymentItem) => {
    const reason = window.prompt(
      "ระบุเหตุผลที่ปฏิเสธสลิปโอนเงิน (เช่น ยอดเงินไม่ตรง / รูปสลิปไม่ชัดเจน):",
      payment.reject_note || "หลักฐานการโอนเงินไม่ถูกต้อง กรุณาแนบสลิปใหม่อีกครั้ง",
    );
    if (reason === null) return;

    setProcessingId(payment.id);
    try {
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          status: "rejected", 
          verified_by: adminId,
          verified_at: null, 
          reject_note: reason.trim(),
        })
        .eq("id", payment.id);

      if (paymentError) throw paymentError;

      setPaymentItems((prev) =>
        prev.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                status: "rejected",
                verified_by: adminId,
                verified_at: null,
                reject_note: reason.trim(),
              }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error rejecting payment:", err);
      alert("ไม่สามารถบันทึกการปฏิเสธสลิปได้");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">สำหรับผู้ดูแลระบบ (Admin) เท่านั้น</h1>
          <p className="text-gray-500 text-sm mb-6">บัญชีของคุณยังไม่มีสิทธิ์ Admin</p>
          <Link href="/search" className="inline-flex items-center justify-center bg-[#1a1a1a] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-black transition-all shadow-md">
            &larr; กลับไปหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  const pendingTutorsCount = tutorApps.filter((t) => !t.is_verified).length;
  const pendingPaymentsCount = paymentItems.filter((p) => p.status === "slip_uploaded" || p.status === "pending").length;
  const totalGrossVolume = paymentItems.filter((p) => p.status === "verified").reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="relative pt-12 pb-28 px-4 overflow-hidden bg-linear-to-br from-emerald-700 via-emerald-800 to-teal-950 rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30 px-3.5 py-1 rounded-full mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              UniTutor Admin Center
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">ระบบจัดการแอดมิน (สวัสดีคุณ {adminName})</h1>
            <p className="text-emerald-100 mt-1 text-sm md:text-base font-light">
              ตรวจสอบผลการเรียนเพื่ออนุมัติติวเตอร์ และตรวจสอบความถูกต้องของสลิปโอนเงินที่ผู้เรียนชำระให้ติวเตอร์โดยตรง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/dashboard/learner" className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> มุมมองผู้เรียน
            </Link>
            <Link href="/dashboard/tutor" className="bg-[#1a1a1a] hover:bg-black text-white px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> มุมมองติวเตอร์
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-14 relative z-20 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0"><Users className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">ติวเตอร์รออนุมัติ</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{pendingTutorsCount} <span className="text-xs font-medium text-gray-400">/ {tutorApps.length}</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><Receipt className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">สลิปรอตรวจสอบ</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{pendingPaymentsCount} <span className="text-xs font-medium text-gray-400">/ {paymentItems.length}</span></h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0"><Wallet className="w-7 h-7" /></div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">ยอดชำระเงินที่ตรวจสอบแล้ว</p>
              <h3 className="text-2xl font-extrabold text-gray-900">฿{totalGrossVolume.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /><span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-full border border-gray-200/80 shadow-xs w-fit">
          <button onClick={() => setActiveTab("tutors")} className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "tutors" ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
            <UserCheck className="w-4 h-4" /> ตรวจสอบและอนุมัติติวเตอร์
          </button>
          <button onClick={() => setActiveTab("payments")} className={`px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "payments" ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
            <Receipt className="w-4 h-4" /> ตรวจสอบสลิปโอนเงิน
          </button>
        </div>

        {activeTab === "tutors" && (
          <div className="space-y-5">
            {tutorApps.length > 0 ? (
              tutorApps.map((tutor) => {
                const u = tutor.user_info;
                const fullName = u ? `${u.prefix || ""}${u.first_name} ${u.last_name}`.trim() : "ไม่ระบุชื่อ";

                return (
                  <div key={tutor.id} className="bg-white rounded-4xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3.5">
                        {u?.profile_image_url ? (
                          <Image src={u.profile_image_url} alt={fullName} width={52} height={52} unoptimized className="w-13 h-13 rounded-full object-cover border-2 border-emerald-200" />
                        ) : (
                          <div className="w-13 h-13 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">{fullName.charAt(0)}</div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">{fullName} {u?.nickname ? `(${u.nickname})` : ""}</h3>
                            <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${tutor.is_verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                              {tutor.is_verified ? "✓ อนุมัติเป็นติวเตอร์แล้ว" : "⏳ รอตรวจสอบใบผลการเรียน"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            รหัสนักศึกษา: <b>{u?.student_id || "-"}</b> • GPAX: <b className="text-emerald-700">{tutor.gpa ? Number(tutor.gpa).toFixed(2) : "-"}</b>
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase">รายวิชาที่ยื่นขอเปิดสอน</p>
                        <div className="flex flex-wrap gap-2">
                          {tutor.subjects.map((sub) => (
                            <span key={sub.id} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-800 shadow-2xs">
                              <span className="font-mono text-emerald-700 font-bold">{sub.subject_code}</span>
                              <span>{sub.subject_name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-3 lg:w-64 shrink-0 bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
                      {tutor.transcript_url ? (
                        <a href={tutor.transcript_url} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs">
                          <FileText className="w-4 h-4" /> เปิดดูไฟล์ Transcript <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <div className="text-xs text-gray-400 text-center py-2">ไม่มีไฟล์ Transcript</div>
                      )}
                      {!tutor.is_verified ? (
                        <button type="button" disabled={processingId === tutor.id} onClick={() => handleToggleVerifyTutor(tutor, true)} className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-50">
                          <CheckCircle2 className="w-4 h-4" /> {processingId === tutor.id ? "กำลังอนุมัติ..." : "อนุมัติเป็นติวเตอร์"}
                        </button>
                      ) : (
                        <button type="button" disabled={processingId === tutor.id} onClick={() => handleToggleVerifyTutor(tutor, false)} className="w-full py-2.5 px-4 rounded-2xl bg-gray-200 hover:bg-red-100 hover:text-red-700 text-gray-700 text-xs font-bold transition-colors disabled:opacity-50">
                          ยกเลิกสถานะการอนุมัติ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] p-14 text-center border border-gray-100 text-gray-400">ยังไม่มีรายการยื่นสมัครติวเตอร์ในระบบ</div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-5">
            {paymentItems.length > 0 ? (
              paymentItems.map((p) => {
                const gross = Number(p.amount) || 0;
                
                const isVerified = p.status === "verified";
                const isRejected = p.status === "rejected";

                return (
                  <div key={p.id} className="bg-white rounded-4xl border border-gray-100 shadow-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            รายการชำระเงิน #{p.id} (Booking #{p.booking_id})
                          </span>
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ตรวจสอบสลิปผ่านแล้ว
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> ปฏิเสธสลิปแล้ว
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                              <Clock className="w-3.5 h-3.5" /> รอแอดมินตรวจสลิป
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">คอร์ส: {p.course_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <b>ผู้เรียน:</b> {p.learner_name} • <b>ติวเตอร์:</b> {p.tutor_name}
                        </p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-800">ยอดเงินที่ผู้เรียนโอนให้ติวเตอร์</span>
                        <span className="text-2xl font-extrabold text-emerald-700">฿{gross.toLocaleString()}</span>
                      </div>

                      <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl space-y-1.5 text-xs sm:text-sm text-emerald-950">
                        <p className="font-bold text-emerald-800 flex items-center gap-1.5"><Landmark className="w-4 h-4 text-emerald-600" /> บัญชีรับเงินของติวเตอร์ (ใช้อ้างอิงสำหรับตรวจสอบสลิป)</p>
                        {p.tutor_bank?.bank_account || p.tutor_bank?.promptpay ? (
                          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                            <span><b>ธนาคาร:</b> {p.tutor_bank.bank_name || "-"}</span>
                            <span><b>เลขที่บัญชี:</b> <span className="font-mono font-bold select-all">{p.tutor_bank.bank_account || "-"}</span></span>
                            <span><b>PromptPay:</b> <span className="font-mono font-bold select-all">{p.tutor_bank.promptpay || "-"}</span></span>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700">* ติวเตอร์คนนี้ยังไม่ได้กรอกเลขบัญชีธนาคาร</p>
                        )}
                      </div>

                      {p.reject_note && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                          <b>หมายเหตุที่ปฏิเสธสลิป:</b> {p.reject_note}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200/70 flex flex-col justify-between space-y-4">
                      {p.slip_url ? (
                        <div className="space-y-2">
                          <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-white border border-gray-200">
                            <Image src={p.slip_url} alt="Payment Slip" fill unoptimized className="object-contain" />
                          </div>
                          <a href={p.slip_url} target="_blank" rel="noopener noreferrer" className="w-full py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                            เปิดดูรูปสลิปขนาดเต็ม <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs text-gray-400">ไม่มีรูปสลิป</div>
                      )}

                      {!isVerified && !isRejected ? (
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleApprovePayment(p)}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            อนุมัติสลิป
                          </button>
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleRejectPayment(p)}
                            className="py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            ปฏิเสธสลิป
                          </button>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl border text-center text-xs font-bold ${
                          isVerified ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
                        }`}>
                          {isVerified ? "✓ อนุมัติสลิปเรียบร้อยแล้ว" : "✗ ปฏิเสธสลิปเรียบร้อยแล้ว"}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[2.5rem] p-14 text-center border border-gray-100 text-gray-400">ยังไม่มีรายการแจ้งโอนเงินเข้ามาในระบบ</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}