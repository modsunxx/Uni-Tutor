"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  User,
  MapPin,
  MonitorPlay,
  Sparkles,
  Star,
  Phone,
  MessageCircle,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

type CourseDetail = {
  id: string;
  tutor_id: string;
  subject_id: number;
  title: string;
  level: string | null;
  price_per_hour: number;
  teaching_format: string;
  description: string | null;
  cover_image_url: string | null;
  preview_video_url: string | null;
  master_subjects: {
    code?: string;
    name: string;
    category: string | null;
  } | null;
  tutor_profiles: {
    bio: string | null;
    gpa: number | null;
    rating: number | null;
    review_count: number | null;
    users: {
      prefix?: string | null;
      first_name: string;
      last_name: string;
      nickname: string | null;
      phone?: string | null;
      line_id?: string | null;
      bio?: string | null;
      profile_image_url?: string | null;
    } | null;
  } | null;
};

// ฟังก์ชันแปลงลิงก์ YouTube (รองรับทั้งเว็บคอม มือถือ m.youtube.com และ Shorts)
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith("/shorts/")) {
        const shortId = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
        return shortId ? `https://www.youtube.com/embed/${shortId}` : null;
      }
    }
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.slice(1).split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function CourseDetailPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tutorGrade, setTutorGrade] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCourseDetail = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("courses")
          .select(
            `
            id,
            tutor_id,
            subject_id,
            title,
            level,
            price_per_hour,
            teaching_format,
            description,
            cover_image_url,
            preview_video_url,
            master_subjects ( code, name, category ),
            tutor_profiles (
              bio,
              gpa,
              rating,
              review_count,
              users ( prefix, first_name, last_name, nickname, phone, line_id, bio, profile_image_url )
            )
          `,
          )
          .eq("id", courseId)
          .single();

        if (error) throw error;

        if (data) {
          const formattedCourse = data as unknown as CourseDetail;
          setCourse(formattedCourse);

          // ดึงเกรดของวิชานี้ที่ติวเตอร์สอบได้จากตาราง tutor_verified_subjects
          if (formattedCourse.tutor_id && formattedCourse.subject_id) {
            const { data: verifiedData } = await supabase
              .from("tutor_verified_subjects")
              .select("grade")
              .eq("tutor_id", formattedCourse.tutor_id)
              .eq("subject_id", formattedCourse.subject_id)
              .maybeSingle();

            if (verifiedData?.grade) {
              setTutorGrade(verifiedData.grade);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course detail:", err);
        setErrorMsg("ไม่พบข้อมูลคอร์สเรียนที่คุณต้องการ");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [supabase, courseId]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/search");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  if (errorMsg || !course) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl p-8 sm:p-10 text-center max-w-md w-full border border-gray-100">
          <BookOpen className="w-14 h-14 text-emerald-600 mx-auto mb-4 opacity-70" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            ไม่พบคอร์สเรียนนี้
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            คอร์สเรียนนี้อาจถูกลบหรือไม่มีอยู่ในระบบแล้ว
          </p>
          <Link
            href="/search"
            className="inline-flex items-center justify-center bg-[#1a1a1a] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-black transition-all shadow-md text-sm sm:text-base"
          >
            &larr; กลับไปหน้าค้นหาคอร์ส
          </Link>
        </div>
      </main>
    );
  }

  const tutorUser = course.tutor_profiles?.users;
  const tutorFullName = tutorUser
    ? `${tutorUser.prefix || ""}${tutorUser.first_name} ${tutorUser.last_name}`.trim()
    : "ไม่ระบุชื่อ";
  const tutorDisplayName = tutorUser?.nickname
    ? `${tutorUser.nickname} (${tutorFullName})`
    : tutorFullName;
  const tutorBio =
    tutorUser?.bio ||
    course.tutor_profiles?.bio ||
    "ติวเตอร์ยังไม่ได้ระบุข้อความแนะนำตัว";

  const formatClean = course.teaching_format?.trim().toLowerCase() || "";
  const formatLabel =
    formatClean === "online"
      ? "ออนไลน์ (Online)"
      : formatClean === "onsite"
        ? "เจอตัว (Onsite)"
        : "ผสมผสาน (Hybrid)";

  const youtubeEmbed = course.preview_video_url
    ? getYouTubeEmbedUrl(course.preview_video_url)
    : null;
  const isDirectVideoFile =
    course.preview_video_url &&
    (course.preview_video_url.includes("/storage/v1/object/public/courses/") ||
      course.preview_video_url.endsWith(".mp4") ||
      course.preview_video_url.endsWith(".webm"));

  return (
    <main className="min-h-screen bg-gray-50 pb-16 overflow-x-hidden">
      {/* === Header Section (รองรับมือถือและจอใหญ่) === */}
      <div className="relative pt-8 sm:pt-10 pb-20 sm:pb-28 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-3xl sm:rounded-b-[2.5rem] shadow-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
          <div className="absolute top-[30%] left-16 w-37.5 h-37.5 bg-[#408A71] opacity-30 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-1 sm:px-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold rounded-full backdrop-blur-sm transition-all mb-5 sm:mb-6 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            ย้อนกลับ
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {course.master_subjects?.code && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 shadow-xs">
                รหัสวิชา {course.master_subjects.code}
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/60 text-emerald-100 border border-emerald-400/30">
              {course.master_subjects?.category || "วิชาทั่วไป"}
            </span>
            {course.level && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-black/40 text-white backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                {course.level}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm mb-2 wrap-break-word leading-snug">
            {course.title}
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base md:text-lg font-light wrap-break-word">
            รายวิชา: {course.master_subjects?.name || course.title}
          </p>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 -mt-10 sm:-mt-14 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* คอลัมน์ซ้าย (2 ส่วน): รูปหน้าปก, รายละเอียดการสอน, วิดีโอแนะนำคอร์ส */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* 1. รูปหน้าปกคอร์ส (16:9) */}
            {course.cover_image_url && (
              <div className="bg-white p-2 sm:p-3 rounded-3xl sm:rounded-4xl shadow-md border border-gray-100">
                <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100">
                  <Image
                    src={course.cover_image_url}
                    alt={course.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* 2. รายละเอียดการสอน */}
            <div className="bg-white rounded-3xl sm:rounded-4xl shadow-md border border-gray-100 p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                รายละเอียดคอร์สเรียน
              </h2>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line wrap-break-word bg-gray-50/70 p-4 sm:p-6 rounded-2xl border border-gray-100">
                {course.description ||
                  "ติวเตอร์ยังไม่ได้ระบุรายละเอียดเพิ่มเติมสำหรับคอร์สนี้"}
              </div>
            </div>

            {/* 3. วิดีโอแนะนำคอร์ส (ถ้ามี) */}
            {course.preview_video_url && (
              <div className="bg-white rounded-3xl sm:rounded-4xl shadow-md border border-gray-100 p-5 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  วิดีโอแนะนำคอร์สเรียน (Preview)
                </h2>

                {youtubeEmbed ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={youtubeEmbed}
                      title="Course Preview Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : isDirectVideoFile ? (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                    <video
                      src={course.preview_video_url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <a
                    href={course.preview_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-5 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-2xl transition-colors text-center"
                  >
                    <PlayCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    คลิกเพื่อเปิดดูวิดีโอตัวอย่างคอร์สเรียน
                  </a>
                )}
              </div>
            )}
          </div>

          {/* คอลัมน์ขวา (1 ส่วน): ราคา รูปแบบการสอน ข้อมูลติวเตอร์ และช่องทางติดต่อ */}
          <div className="space-y-5 sm:space-y-6">
            {/* การ์ดราคาและข้อมูลสรุป */}
            <div className="bg-white rounded-3xl sm:rounded-4xl shadow-xl border border-gray-100 p-5 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-500">
                  ค่าเรียนต่อชั่วโมง
                </span>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                    ฿{course.price_per_hour}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">
                    {" "}
                    / ชม.
                  </span>
                </div>
              </div>

              <div className="py-4 sm:py-5 space-y-3.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    {formatClean === "online" ? (
                      <MonitorPlay className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    รูปแบบการสอน
                  </span>
                  <span className="font-bold text-gray-900">{formatLabel}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    ระดับเนื้อหา
                  </span>
                  <span className="font-bold text-gray-900">
                    {course.level || "ทุกระดับ"}
                  </span>
                </div>

                {tutorGrade && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-gray-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      เกรดวิชานี้ของติวเตอร์
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 text-xs sm:text-sm">
                      เกรด {tutorGrade} (Verified)
                    </span>
                  </div>
                )}
              </div>

              {/* ข้อมูลติดต่อติวเตอร์ */}
              <div className="pt-5 border-t border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  ช่องทางติดต่อเรียนกับติวเตอร์
                </p>

                {tutorUser?.line_id ? (
                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-emerald-950">
                    <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-sm min-w-0 flex-1">
                      <span className="text-xs text-emerald-700 block">
                        Line ID
                      </span>
                      <span className="font-bold select-all wrap-break-word">
                        {tutorUser.line_id}
                      </span>
                    </div>
                  </div>
                ) : null}

                {tutorUser?.phone ? (
                  <a
                    href={`tel:${tutorUser.phone}`}
                    className="flex items-center gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/70 rounded-2xl text-gray-900 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-sm min-w-0 flex-1">
                      <span className="text-xs text-gray-500 block">
                        เบอร์โทรศัพท์ (แตะเพื่อโทรออก)
                      </span>
                      <span className="font-bold select-all">
                        {tutorUser.phone}
                      </span>
                    </div>
                  </a>
                ) : null}

                {!tutorUser?.line_id && !tutorUser?.phone && (
                  <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 text-center">
                    ติวเตอร์ยังไม่ได้ระบุเบอร์โทรหรือ Line ID ในหน้าโปรไฟล์
                  </div>
                )}
              </div>
            </div>

            {/* การ์ดข้อมูลผู้สอน (Tutor Profile) */}
            <div className="bg-white rounded-3xl sm:rounded-4xl shadow-md border border-gray-100 p-5 sm:p-8">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
                ข้อมูลติวเตอร์ผู้สอน
              </h3>

              <div className="flex items-center gap-3.5 sm:gap-4 mb-4">
                {tutorUser?.profile_image_url ? (
                  <Image
                    src={tutorUser.profile_image_url}
                    alt={tutorDisplayName}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-emerald-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0">
                    <User className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg wrap-break-word leading-snug">
                    {tutorDisplayName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      {(course.tutor_profiles?.rating || 0).toFixed(1)} (
                      {course.tutor_profiles?.review_count || 0} รีวิว)
                    </span>
                    {course.tutor_profiles?.gpa && (
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">
                        GPAX {Number(course.tutor_profiles.gpa).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed wrap-break-word">
                {tutorBio}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}