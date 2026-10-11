"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User as UserIcon,
  BookOpen,
  MapPin,
  Star,
  MonitorPlay,
  GraduationCap,
  MessageCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Phone,
  Sparkles,
  Target,
} from "lucide-react";

type ProfileUser = {
  id: string;
  prefix: string | null;
  first_name: string;
  last_name: string;
  nickname: string | null;
  profile_image_url: string | null;
  faculty: string | null;
  line_id: string | null;
  phone: string | null;
};

type TutorProfile = {
  bio: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
};

type Course = {
  id: string;
  title: string;
  level: string | null;
  price_per_hour: number;
  teaching_format: string;
  cover_image_url: string | null;
  master_subjects: {
    code: string | null;
    name: string;
    category: string | null;
  } | null;
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const supabase = createClient();

  const [userProfile, setUserProfile] = useState<ProfileUser | null>(null);
  const [tutorInfo, setTutorInfo] = useState<TutorProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      setIsLoading(true);
      
      try {
        // 1. ดึงข้อมูลพื้นฐานของผู้ใช้
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, prefix, first_name, last_name, nickname, profile_image_url, faculty, line_id, phone")
          .eq("id", userId)
          .single();

        if (userError) throw userError;
        setUserProfile(userData as ProfileUser);

        // 2. เช็กว่าผู้ใช้คนนี้เป็นติวเตอร์ที่ผ่านการยืนยันหรือเปล่า
        const { data: tutorData } = await supabase
          .from("tutor_profiles")
          .select("bio, rating, review_count, is_verified")
          .eq("id", userId)
          .maybeSingle();

        if (tutorData && tutorData.is_verified) {
          setTutorInfo(tutorData as TutorProfile);

          // 3. ถ้าเป็นติวเตอร์ ให้ดึงคอร์สที่สอนมาด้วย
          const { data: coursesData } = await supabase
            .from("courses")
            .select(`
              id, title, level, price_per_hour, teaching_format, cover_image_url,
              master_subjects ( code, name, category )
            `)
            .eq("tutor_id", userId)
            .order("created_at", { ascending: false });

          if (coursesData) {
            setCourses(coursesData as unknown as Course[]);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setErrorMsg("ไม่พบข้อมูลผู้ใช้งาน หรือเกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  if (errorMsg || !userProfile) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-4xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <UserIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">ไม่พบโปรไฟล์</h2>
          <p className="text-gray-500 mb-6">{errorMsg || "ผู้ใช้นี้อาจไม่มีอยู่ในระบบ"}</p>
          <Link href="/search" className="bg-emerald-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-emerald-700 transition-colors">
            กลับไปหน้าค้นหา
          </Link>
        </div>
      </main>
    );
  }

  const fullName = `${userProfile.prefix || ""}${userProfile.first_name} ${userProfile.last_name}`;
  const isTutor = Boolean(tutorInfo);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* === Cover & Header Section === */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
          <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-10 w-75 h-75 bg-black opacity-10 rounded-full"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 -mt-24 sm:-mt-32">
        {/* Profile Card */}
        <div className="bg-white rounded-4xl shadow-xl border border-gray-100 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left relative">
          
          {/* Avatar */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
            <div className="absolute inset-0 bg-white rounded-full shadow-md"></div>
            {userProfile.profile_image_url ? (
              <Image
                src={userProfile.profile_image_url}
                alt={fullName}
                fill
                unoptimized
                className="rounded-full object-cover border-4 border-white relative z-10"
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-white bg-emerald-50 text-emerald-600 flex items-center justify-center relative z-10">
                <UserIcon className="w-16 h-16" />
              </div>
            )}
            {isTutor && (
              <div className="absolute bottom-1 right-1 bg-amber-400 text-amber-950 p-2 rounded-full border-2 border-white z-20 shadow-sm" title="ติวเตอร์ยืนยันตัวตนแล้ว">
                <GraduationCap className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 mt-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {fullName}
                  {userProfile.nickname && <span className="text-gray-500 text-xl font-medium ml-2">({userProfile.nickname})</span>}
                </h1>
                
                <p className="text-emerald-700 font-semibold mt-1 flex items-center justify-center md:justify-start gap-1.5">
                  <MapPin className="w-4 h-4" /> 
                  {userProfile.faculty || "ไม่ได้ระบุคณะ"}
                </p>

                {isTutor && (
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-700 text-sm font-bold border border-amber-200/50">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {tutorInfo?.rating.toFixed(1) || "0.0"}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({tutorInfo?.review_count || 0} รีวิวจากผู้เรียน)
                    </span>
                  </div>
                )}
              </div>

              {/* ช่องทางติดต่อ (แสดงถ้ามี) */}
              <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-2 md:mt-0">
                {userProfile.line_id && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00B900]/10 text-[#00B900] rounded-full text-sm font-bold border border-[#00B900]/20">
                    <MessageCircle className="w-4 h-4" /> {userProfile.line_id}
                  </span>
                )}
              </div>
            </div>

            {isTutor && tutorInfo?.bio && (
              <div className="mt-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">เกี่ยวกับติวเตอร์</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{tutorInfo.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* === Main Content Section === */}
        <div className="mt-8">
          {isTutor ? (
            /* กรณีเป็นติวเตอร์ (รุ่นพี่) -> แสดงคอร์สที่สอน */
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-emerald-600" />
                คอร์สที่เปิดสอน ({courses.length})
              </h2>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const formatClean = course.teaching_format?.trim().toLowerCase() || "";
                    return (
                      <Link href={`/courses/${course.id}`} key={course.id} className="group block">
                        <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden flex flex-col h-full">
                          <div className="relative aspect-video w-full bg-emerald-50 overflow-hidden border-b border-gray-50">
                            {course.cover_image_url ? (
                              <Image src={course.cover_image_url} alt={course.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-emerald-600/40">
                                <BookOpen className="w-10 h-10 mb-1 stroke-[1.5]" />
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-800 backdrop-blur-xs shadow-xs">
                                {course.master_subjects?.code || "ทั่วไป"}
                              </span>
                            </div>
                            {course.level && (
                              <div className="absolute bottom-3 right-3">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                                  <Sparkles className="w-3 h-3 text-emerald-300" /> {course.level}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                              {course.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-1">
                              วิชา: {course.master_subjects?.name || "ไม่ระบุวิชา"}
                            </p>
                            
                            <div className="mt-auto flex items-end justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                                {formatClean === "online" ? <MonitorPlay className="w-3.5 h-3.5 text-emerald-600" /> : <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                                {formatClean === "online" ? "Online" : formatClean === "onsite" ? "Onsite" : "Hybrid"}
                              </div>
                              <span className="text-lg font-bold text-emerald-600">
                                ฿{course.price_per_hour}<span className="text-xs font-medium text-gray-400">/ชม.</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500">ติวเตอร์ท่านนี้ยังไม่มีคอร์สที่เปิดสอนในขณะนี้</p>
                </div>
              )}
            </div>
          ) : (
            /* กรณีเป็นผู้เรียน (รุ่นน้อง) -> แสดงวิชาที่กำลังหาเรียน */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  วิชาที่กำลังสนใจ / ตามหาติวเตอร์
                </h2>
              </div>

              {/* Note: ส่วนนี้ผมทำ UI หลอกไว้ก่อน (Mock) เนื่องจากเรายังไม่มีตารางเก็บ "วิชาที่ผู้เรียนต้องการ" */}
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400"></div>
                <Target className="w-14 h-14 text-emerald-100 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  ฟีเจอร์ ประกาศหาติวเตอร์ เร็วๆ นี้!
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  ในอนาคต {userProfile.nickname || userProfile.first_name} จะสามารถโพสต์วิชาที่อยากเรียน และงบประมาณที่มี เพื่อให้รุ่นพี่ (ติวเตอร์) ทักเข้ามาเสนอสอนได้ตรงจุดครับ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}