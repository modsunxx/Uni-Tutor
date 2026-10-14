"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Search,
  User as UserIcon,
  Phone,
  MessageCircle,
  Landmark,
  GraduationCap,
  Receipt,
  ExternalLink,
  Star,
  X,
} from "lucide-react";

type PaymentRecord = {
  id: number;
  booking_id: number;
  amount: number;
  slip_url: string | null;
  status?: string | null;
  created_at: string;
};

type ReviewRecord = {
  id: number;
  booking_id: number;
  rating: number;
  comment: string | null;
};

type BookingItem = {
  id: number;
  course_id: number;
  learner_id: string;
  tutor_id: string;
  start_at: string;
  end_at: string;
  status: string | null;
  total_amount: number;
  note: string | null;
  created_at: string;
  courses: {
    id: number;
    title: string;
    teaching_format: string;
    cover_image_url: string | null;
  } | null;
  tutor_user?: {
    prefix: string | null;
    first_name: string;
    last_name: string;
    nickname: string | null;
    phone: string | null;
    line_id: string | null;
    profile_image_url: string | null;
  } | null;
  payment?: PaymentRecord | null;
  review?: ReviewRecord | null;
};

export default function LearnerDashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [uploadingBookingId, setUploadingBookingId] = useState<number | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<number | null>(null);

  // States สำหรับกล่อง Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<BookingItem | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchLearnerDashboard = async () => {
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

        setCurrentUserId(session.user.id);

        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, nickname")
          .eq("id", session.user.id)
          .maybeSingle();

        if (userData) {
          setLearnerName(
            userData.nickname || userData.first_name || "นักศึกษา",
          );
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(
            `
            id,
            course_id,
            learner_id,
            tutor_id,
            start_at,
            end_at,
            status,
            total_amount,
            note,
            created_at,
            courses ( id, title, teaching_format, cover_image_url )
          `,
          )
          .eq("learner_id", session.user.id)
          .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;

        if (bookingsData && bookingsData.length > 0) {
          const tutorIds = Array.from(
            new Set(bookingsData.map((b) => b.tutor_id)),
          );
          const bookingIds = bookingsData.map((b) => b.id);

          const [
            { data: tutorsData },
            { data: paymentsData },
            { data: reviewsData },
          ] = await Promise.all([
            supabase
              .from("users")
              .select("id, prefix, first_name, last_name, nickname, phone, line_id, profile_image_url")
              .in("id", tutorIds),
            supabase.from("payments").select("*").in("booking_id", bookingIds),
            supabase
              .from("reviews")
              .select("id, booking_id, rating, comment")
              .in("booking_id", bookingIds),
          ]);

          const enrichedBookings: BookingItem[] = bookingsData.map((b) => {
            const matchedTutor = tutorsData?.find((t) => t.id === b.tutor_id);
            const matchedPayment = paymentsData?.find((p) => Number(p.booking_id) === Number(b.id));
            const matchedReview = reviewsData?.find((r) => Number(r.booking_id) === Number(b.id));
            const courseObj = Array.isArray(b.courses) ? b.courses[0] : b.courses;

            return {
              ...b,
              courses: courseObj || null,
              tutor_user: matchedTutor || null,
              payment: (matchedPayment as PaymentRecord) || null,
              review: (matchedReview as ReviewRecord) || null,
            };
          });

          setBookings(enrichedBookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching learner bookings:", err);
        const errObj = err as { message?: string };
        setErrorMsg(`ไม่สามารถโหลดข้อมูลการจองได้: ${errObj?.message || "กรุณาลองใหม่อีกครั้ง"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearnerDashboard();
  }, [supabase, router]);

  const handleFileChange = (bookingId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [bookingId]: file }));
      setPreviewUrls((prev) => ({
        ...prev,
        [bookingId]: URL.createObjectURL(file),
      }));
    }
  };

  const handleUploadSlip = async (booking: BookingItem) => {
    const file = selectedFiles[booking.id];
    if (!file) {
      alert("กรุณาเลือกไฟล์รูปสลิปโอนเงินก่อนครับ");
      return;
    }

    setUploadingBookingId(booking.id);
    setUploadSuccessId(null);

    try {
      const ext = file.name.split(".").pop();
      const filePath = `booking-${booking.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("slips")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("slips").getPublicUrl(filePath);

      if (booking.payment?.id) {
        const { data: updatedPayment, error: updateError } = await supabase
          .from("payments")
          .update({
            amount: booking.total_amount,
            slip_url: publicUrl,
          })
          .eq("id", booking.payment.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setBookings((prev) =>
          prev.map((item) =>
            item.id === booking.id ? { ...item, payment: updatedPayment as PaymentRecord } : item,
          ),
        );
      } else {
        const { data: newPayment, error: insertError } = await supabase
          .from("payments")
          .insert({
            booking_id: booking.id,
            amount: booking.total_amount,
            slip_url: publicUrl,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setBookings((prev) =>
          prev.map((item) =>
            item.id === booking.id ? { ...item, payment: newPayment as PaymentRecord } : item,
          ),
        );
      }

      setUploadSuccessId(booking.id);
    } catch (err) {
      console.error("Error uploading slip:", err);
      const errObj = err as { message?: string };
      alert(`อัปโหลดสลิปไม่สำเร็จ: ${errObj?.message || "กรุณาตรวจสอบว่าสร้าง Bucket ชื่อ slips ใน Supabase แล้ว"}`);
    } finally {
      setUploadingBookingId(null);
    }
  };

  const handleOpenReview = (booking: BookingItem) => {
    setReviewBooking(booking);
    setReviewRating(0);
    setReviewComment("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || reviewRating === 0) {
      alert("กรุณาให้คะแนนดาวก่อนกดยืนยันครับ");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { data: newReview, error } = await supabase
        .from("reviews")
        .insert({
          booking_id: reviewBooking.id,
          reviewer_id: currentUserId,
          tutor_id: reviewBooking.tutor_id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewBooking.id ? { ...b, review: newReview as ReviewRecord } : b,
        ),
      );

      setReviewModalOpen(false);
      alert("ขอบคุณสำหรับคำติชมและคะแนนรีวิวครับ!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("ไม่สามารถบันทึกรีวิวได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  const paidCount = bookings.filter((b) => b.payment?.slip_url).length;
  const unpaidCount = bookings.length - paidCount;

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* === Header Section === */}
      <div className="relative pt-12 pb-28 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[30%] left-16 w-37.5 h-37.5 bg-[#408A71] opacity-30 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full backdrop-blur-xs mb-2">
              Learner Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
              สวัสดีคุณ {learnerName}! 👋
            </h1>
            <p className="text-emerald-50 mt-1 text-sm md:text-base font-light">
              ตรวจสอบตารางเรียนที่จองไว้ และแนบสลิปชำระเงิน (โอนตรงให้ติวเตอร์)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/search"
              className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              ค้นหาคอร์สเรียนเพิ่ม
            </Link>
            <Link
              href="/dashboard/tutor"
              className="bg-[#1a1a1a] text-white hover:bg-black px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-lg"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              โหมดติวเตอร์
            </Link>
          </div>
        </div>
      </div>

      {/* === Content Section === */}
      <div className="max-w-6xl mx-auto px-4 -mt-14 relative z-20 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">
                คอร์สที่จองทั้งหมด
              </p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                {bookings.length}{" "}
                <span className="text-sm font-medium text-gray-500">
                  รายการ
                </span>
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <span className="text-emerald-600">
                  ✓ แนบสลิปแล้ว {paidCount}
                </span>
                <span className="text-amber-600">
                  • รอชำระเงิน {unpaidCount}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
          </div>

          {/* กล่องคำแนะนำการชำระเงิน แทนที่บัญชีแอดมินเดิม */}
          <div className="lg:col-span-2 bg-emerald-50 p-6 rounded-4xl border border-emerald-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
              <Landmark className="w-4 h-4" />
              การชำระเงิน (จ่ายตรงให้ติวเตอร์)
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
              ผู้เรียนสามารถโอนค่าเรียนเข้าบัญชีของ <b>ติวเตอร์โดยตรง</b> (สามารถสอบถามเลขบัญชีได้ผ่าน Line หรือเบอร์โทรศัพท์ของติวเตอร์) 
              หลังจากโอนเงินเรียบร้อยแล้ว กรุณา <b>แนบรูปสลิป</b> ในรายการจองด้านล่าง เพื่อรอให้แอดมินยืนยันความถูกต้องครับ
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* รายการคอร์สที่จองไว้ */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900 px-1 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            รายการจองเรียนและแจ้งชำระเงิน ({bookings.length})
          </h2>

          {bookings.length > 0 ? (
            <div className="space-y-5">
              {bookings.map((booking) => {
                const start = new Date(booking.start_at);
                const end = new Date(booking.end_at);
                const now = new Date();
                const isFinished = now >= end; 

                const dateStr = start.toLocaleDateString("th-TH", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const timeStr = `${start.toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${end.toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} น.`;

                const tutorName = booking.tutor_user
                  ? `${booking.tutor_user.nickname ? `${booking.tutor_user.nickname} (` : ""}${booking.tutor_user.prefix || ""}${booking.tutor_user.first_name} ${booking.tutor_user.last_name}${booking.tutor_user.nickname ? ")" : ""}`
                  : "ติวเตอร์";

                const hasSlip = Boolean(booking.payment?.slip_url);
                const previewImg = previewUrls[booking.id] || booking.payment?.slip_url || null;
                const hasReviewed = Boolean(booking.review);

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-4xl border shadow-sm transition-all p-6 sm:p-8 ${
                      isFinished && !hasReviewed
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : "border-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* ข้อมูลคอร์สและวันเวลาเรียน (2 คอลัมน์) */}
                      <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                              {booking.courses?.teaching_format || "Online"}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                hasSlip
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {hasSlip ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  แนบสลิปชำระเงินแล้ว
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  รอแนบสลิปโอนเงิน
                                </>
                              )}
                            </span>
                            {isFinished && (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                🏁 หมดเวลาเรียนแล้ว
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-gray-400">
                            รหัสการจอง #{booking.id}
                          </span>
                        </div>

                        <div>
                          <Link
                            href={`/courses/${booking.course_id}`}
                            className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5"
                          >
                            {booking.courses?.title || "คอร์สเรียน"}
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </Link>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-gray-700">
                              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold">{timeStr}</span>
                            </div>
                          </div>

                          {booking.note && (
                            <p className="text-xs text-gray-500 mt-2.5 bg-gray-50/70 px-3.5 py-2 rounded-xl border border-gray-100/50">
                              <b>ข้อความถึงติวเตอร์:</b> {booking.note}
                            </p>
                          )}
                        </div>

                        {/* ข้อมูลผู้สอนและช่องทางติดต่อ */}
                        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {booking.tutor_user?.profile_image_url ? (
                              <Image
                                src={booking.tutor_user.profile_image_url}
                                alt={tutorName}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <UserIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-xs text-gray-400 block">
                                ติวเตอร์ผู้สอน
                              </span>
                              <span className="font-bold text-gray-900">
                                {tutorName}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {booking.tutor_user?.line_id && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl font-semibold">
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                Line: {booking.tutor_user.line_id}
                              </span>
                            )}
                            {booking.tutor_user?.phone && (
                              <a
                                href={`tel:${booking.tutor_user.phone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                {booking.tutor_user.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* กล่องชำระเงิน หรือ กล่องรีวิวเมื่อเรียนจบ */}
                      {isFinished ? (
                        <div
                          className={`rounded-3xl p-5 flex flex-col justify-center items-center text-center border space-y-3 ${
                            hasReviewed
                              ? "bg-emerald-50/50 border-emerald-100"
                              : "bg-amber-50 border-amber-200"
                          }`}
                        >
                          {hasReviewed ? (
                            <>
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-emerald-800 text-sm">
                                ขอบคุณสำหรับการรีวิว!
                              </h4>
                              <div className="flex items-center justify-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= (booking.review?.rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {booking.review?.comment && (
                                <p className="text-xs text-emerald-700 mt-2 bg-white px-3 py-2 rounded-lg border border-emerald-100 w-full truncate">
                                  &quot;{booking.review.comment}&quot;
                                </p>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-1">
                                <Star className="w-6 h-6 fill-amber-400" />
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm">
                                การสอนเป็นอย่างไรบ้าง?
                              </h4>
                              <p className="text-xs text-gray-500 mb-2">
                                ช่วยให้คะแนนติวเตอร์
                                เพื่อเป็นกำลังใจและแนวทางให้ผู้เรียนคนอื่นๆ
                              </p>
                              <button
                                type="button"
                                onClick={() => handleOpenReview(booking)}
                                className="w-full py-3 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                <Star className="w-4 h-4" />
                                รีวิวและให้คะแนนติวเตอร์
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50/80 border border-gray-200/80 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                          <div className="flex items-baseline justify-between border-b border-gray-200/70 pb-3">
                            <span className="text-xs font-semibold text-gray-500">
                              ยอดโอนชำระทั้งหมด
                            </span>
                            <span className="text-2xl font-extrabold text-emerald-600">
                              ฿{Number(booking.total_amount).toLocaleString()}
                            </span>
                          </div>

                          {previewImg ? (
                            <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-emerald-200 bg-white">
                              <Image
                                src={previewImg}
                                alt="Payment Slip"
                                fill
                                unoptimized
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-3 text-center">
                              <UploadCloud className="w-7 h-7 mb-1 text-emerald-500" />
                              <span className="text-xs font-medium">
                                ยังไม่ได้แนบหลักฐานการโอนเงิน
                              </span>
                            </div>
                          )}

                          {uploadSuccessId === booking.id && (
                            <div className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-2 rounded-xl text-center">
                              ✓ แนบสลิปโอนเงินเรียบร้อยแล้ว รอแอดมินตรวจสอบ!
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="block w-full text-center py-2.5 px-4 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer transition-colors">
                              {hasSlip
                                ? "เปลี่ยนไฟล์รูปสลิปใหม่"
                                : "คลิกเลือกไฟล์รูปสลิป (.JPG, .PNG)"}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileChange(booking.id, e)
                                }
                                className="sr-only"
                              />
                            </label>

                            {selectedFiles[booking.id] && (
                              <button
                                type="button"
                                disabled={uploadingBookingId === booking.id}
                                onClick={() => handleUploadSlip(booking)}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                              >
                                {uploadingBookingId === booking.id
                                  ? "กำลังอัปโหลดสลิป..."
                                  : "ยืนยันการส่งสลิปโอนเงิน"}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-14 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ยังไม่มีประวัติการจองคอร์สเรียน
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                ค้นหารายวิชาที่ต้องการติว
                แล้วเลือกวัน-เวลาที่สะดวกเพื่อนัดเรียนกับติวเตอร์ได้เลย!
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition-all shadow-md"
              >
                <Search className="w-4 h-4" />
                ไปหน้าค้นหาคอร์สเรียน
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* === Modal รีวิวและให้คะแนน === */}
      {reviewModalOpen && reviewBooking && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                รีวิวการสอน
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  วิชา {reviewBooking.courses?.title}
                </p>
                <p className="text-gray-400 text-xs mb-4">
                  สอนโดย:{" "}
                  {reviewBooking.tutor_user?.nickname ||
                    reviewBooking.tutor_user?.first_name ||
                    "ติวเตอร์"}
                </p>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (reviewHover || reviewRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-600 font-bold mt-3 h-4">
                  {reviewRating > 0
                    ? `ให้ ${reviewRating} ดาว`
                    : "คลิกเพื่อเลือกคะแนน"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="ติวเตอร์สอนเข้าใจง่าย เป็นกันเอง หรือมีข้อเสนอแนะใดๆ..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReview || reviewRating === 0}
                  className="w-full py-3.5 px-4 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-sm font-bold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {isSubmittingReview ? "กำลังบันทึก..." : "ส่งรีวิว"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}