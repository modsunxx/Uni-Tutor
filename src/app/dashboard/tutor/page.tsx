"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Image from "next/image";
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
  Search,
  ChevronDown,
  X,
  Sparkles,
  Bell,
  Phone,
  MessageCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";

type Subject = {
  id: string;
  code: string;
  name: string;
  category: string | null;
};

type SelectedSubject = {
  subject_id: string;
  grade: string;
  searchText: string;
  isOpen: boolean;
};

type Course = {
  id: string;
  title: string;
  level: string | null;
  teaching_format: string;
  price_per_hour: number;
  description: string;
  cover_image_url: string | null;
  preview_video_url: string | null;
  status: string;
};

type AvailabilitySlot = {
  id: number;
  tutor_id: string;
  start_at: string;
  end_at: string;
  is_booked: boolean;
};

// อัปเดต Type ให้รองรับข้อมูลผู้เรียน (Learner)
type BookingNotification = {
  id: number;
  status: string | null;
  created_at: string;
  start_at: string;
  end_at: string;
  total_amount: number;
  courses: { title: string } | null;
  learner: {
    first_name: string;
    last_name: string;
    nickname: string | null;
    phone: string | null;
    line_id: string | null;
    profile_image_url: string | null;
  } | null;
};

export default function TutorDashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const [isTutor, setIsTutor] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [prefix, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingNotification[]>([]);

  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("13:00");
  const [slotEndTime, setSlotEndTime] = useState("15:00");
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const [stats, setStats] = useState({
    revenue: 0,
    students: 0,
    rating: 0,
    reviewCount: 0,
    views: [0, 0, 0, 0, 0, 0, 0],
  });

  const [bio, setBio] = useState("");
  const [gpa, setGpa] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [masterSubjects, setMasterSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([
    { subject_id: "", grade: "", searchText: "", isOpen: false },
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

          const { data: userData } = await supabase
            .from("users")
            .select("prefix, first_name, last_name")
            .eq("id", session.user.id)
            .maybeSingle();

          if (userData) {
            setPrefix(userData.prefix || "");
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
          }

          const { data: tutorProfile, error } = await supabase
            .from("tutor_profiles")
            .select("id, is_verified, rating, review_count")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) throw error;

          if (tutorProfile) {
            if (tutorProfile.is_verified) {
              setIsTutor(true);

              setStats((prev) => ({
                ...prev,
                rating: tutorProfile.rating || 0,
                reviewCount: tutorProfile.review_count || 0,
              }));

              const { data: coursesData } = await supabase
                .from("courses")
                .select("*")
                .eq("tutor_id", session.user.id)
                .order("created_at", { ascending: false });

              if (coursesData) setCourses(coursesData);

              const { data: availData } = await supabase
                .from("availability")
                .select("*")
                .eq("tutor_id", session.user.id)
                .order("start_at", { ascending: true });

              if (availData) {
                setAvailabilities(availData as AvailabilitySlot[]);
              }

              // --- ดึงข้อมูลการจอง และข้อมูลติดต่อผู้เรียน (Learner) ---
              const { data: bookingsData } = await supabase
                .from("bookings")
                .select(`
                  id,
                  status,
                  created_at,
                  start_at,
                  end_at,
                  total_amount,
                  learner_id,
                  courses ( title )
                `)
                .eq("tutor_id", session.user.id)
                .order("created_at", { ascending: false })
                .limit(10); // ดึงมา 10 รายการล่าสุด

              if (bookingsData && bookingsData.length > 0) {
                // หา ID ของผู้เรียนทั้งหมดที่ไม่ซ้ำกัน
                const learnerIds = [
                  ...new Set(bookingsData.map((b) => b.learner_id)),
                ];
                
                // ดึงข้อมูลชื่อ เบอร์โทร และ Line ID จากตาราง users
                const { data: learnersData } = await supabase
                  .from("users")
                  .select("id, first_name, last_name, nickname, phone, line_id, profile_image_url")
                  .in("id", learnerIds);

                // นำข้อมูลผู้เรียนมาประกบเข้ากับการจอง
                // นำข้อมูลผู้เรียนมาประกบเข้ากับการจอง และกำหนด Type ให้ถูกต้อง
const formattedBookings: BookingNotification[] = bookingsData.map((b) => {
  const learner = learnersData?.find((l) => l.id === b.learner_id);
  
  return {
    id: b.id,
    status: b.status,
    created_at: b.created_at,
    start_at: b.start_at,
    end_at: b.end_at,
    total_amount: b.total_amount,
    // กันเหนียวเผื่อ Supabase คืนค่า relation มาเป็น Array
    courses: (Array.isArray(b.courses) ? b.courses[0] : b.courses) as { title: string } | null,
    learner: learner
      ? {
          first_name: learner.first_name,
          last_name: learner.last_name,
          nickname: learner.nickname,
          phone: learner.phone,
          line_id: learner.line_id,
          profile_image_url: learner.profile_image_url,
        }
      : null,
  };
});

setRecentBookings(formattedBookings);

                setRecentBookings(formattedBookings);
                
                // คำนวณสถิตินักเรียนและรายได้คร่าวๆ
                const uniqueStudents = new Set(bookingsData.map(b => b.learner_id)).size;
                const totalRevenue = bookingsData.reduce((acc, b) => acc + (b.total_amount || 0), 0);
                setStats(prev => ({ ...prev, students: uniqueStudents, revenue: totalRevenue }));
              }
            } else {
              setIsPending(true);
            }
          }
        }

        const { data: subjectsData } = await supabase
          .from("master_subjects")
          .select("id, code, name, category")
          .order("code", { ascending: true })
          .range(0, 2000);

        if (subjectsData) setMasterSubjects(subjectsData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchData();
  }, [supabase]);

  const handleDeleteCourse = async (courseId: string) => {
    const confirmDelete = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบคอร์สเรียนนี้? (การลบจะไม่สามารถกู้คืนได้)",
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบคอร์สเรียนได้");
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !slotDate || !slotStartTime || !slotEndTime) return;

    const startIso = new Date(`${slotDate}T${slotStartTime}:00`).toISOString();
    const endIso = new Date(`${slotDate}T${slotEndTime}:00`).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      alert("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้นครับ");
      return;
    }

    setIsAddingSlot(true);
    try {
      const { data, error } = await supabase
        .from("availability")
        .insert({
          tutor_id: user.id,
          start_at: startIso,
          end_at: endIso,
          is_booked: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setAvailabilities((prev) =>
          [...prev, data as AvailabilitySlot].sort(
            (a, b) =>
              new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
          ),
        );
      }
    } catch (err) {
      console.error("Error adding availability:", err);
      alert("ไม่สามารถเพิ่มเวลาว่างได้ กรุณาตรวจสอบสิทธิ์ตาราง availability");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteAvailability = async (slotId: number) => {
    try {
      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("id", slotId);
      if (error) throw error;
      setAvailabilities((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      console.error("Error deleting availability:", err);
      alert("ไม่สามารถลบช่วงเวลานี้ได้");
    }
  };

  const addSubjectRow = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { subject_id: "", grade: "", searchText: "", isOpen: false },
    ]);
  };

  const removeSubjectRow = (index: number) => {
    const newSubjects = [...selectedSubjects];
    newSubjects.splice(index, 1);
    setSelectedSubjects(newSubjects);
  };

  const updateSubjectRow = <K extends keyof SelectedSubject>(
    index: number,
    field: K,
    value: SelectedSubject[K],
  ) => {
    const newSubjects = [...selectedSubjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSelectedSubjects(newSubjects);
  };

  const handleSelectSubject = (index: number, ms: Subject) => {
    const newSubjects = [...selectedSubjects];
    newSubjects[index] = {
      ...newSubjects[index],
      subject_id: String(ms.id),
      searchText: `${ms.code} - ${ms.name}`,
      isOpen: false,
    };
    setSelectedSubjects(newSubjects);
  };

  const handleClearSubject = (index: number) => {
    const newSubjects = [...selectedSubjects];
    newSubjects[index] = {
      ...newSubjects[index],
      subject_id: "",
      searchText: "",
      isOpen: true,
    };
    setSelectedSubjects(newSubjects);
  };

  const handleBecomeTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!prefix) {
      setErrorMsg("กรุณาเลือกคำนำหน้าชื่อให้ตรงกับใบผลการเรียน");
      return;
    }

    if (!file) {
      setErrorMsg("กรุณาอัปโหลดไฟล์หลักฐานผลการเรียน (Transcript)");
      return;
    }

    const hasEmptySubject = selectedSubjects.some(
      (s) => !s.subject_id || !s.grade,
    );
    if (hasEmptySubject) {
      setErrorMsg(
        "กรุณาคลิกเลือกวิชาจากรายการค้นหาและระบุเกรดให้ครบถ้วน หรือลบแถวที่ไม่ได้ใช้ออก",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ prefix: prefix })
        .eq("id", user.id);

      if (userUpdateError) throw userUpdateError;

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
        grade: sub.grade.toUpperCase().trim(),
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

  const fullNameWithPrefix = firstName
    ? `${prefix}${firstName} ${lastName}`.trim()
    : "";

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 text-center max-w-md w-full border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            กรุณาเข้าสู่ระบบก่อน
          </h2>
          <Link
            href="/login"
            className="inline-block bg-[#1a1a1a] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-black transition-all shadow-md"
          >
            ไปที่หน้าเข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  if (isPending) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-79 h-69.5 bg-[#285A48] opacity-10 rounded-full"></div>
          <div className="absolute top-8 right-40 w-54.5 h-54.5 bg-black opacity-10 rounded-full"></div>
          <div className="absolute -bottom-16 -right-12 w-75 h-79 bg-black opacity-10 rounded-full"></div>
          <div className="absolute bottom-12 right-32 w-49 h-45 bg-[#408A71] opacity-30 rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl p-10 md:p-12 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            คำขออยู่ระหว่างตรวจสอบ
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            แอดมินกำลังตรวจสอบความถูกต้องของผลการเรียน (Transcript) ของ{" "}
            <span className="font-semibold text-gray-800">
              {fullNameWithPrefix || "คุณ"}
            </span>{" "}
            เทียบกับรายวิชาที่ยื่นขอสอน กรุณารอการอนุมัติภายใน 1-2 วันทำการครับ
          </p>
          <Link
            href="/dashboard/learner"
            className="inline-flex items-center justify-center bg-[#1a1a1a] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-black transition-all shadow-lg active:scale-95"
          >
            &larr; กลับไปที่แดชบอร์ดนักศึกษา
          </Link>
        </div>
      </main>
    );
  }

  // --- แดชบอร์ดติวเตอร์ ---
  if (isTutor) {
    const days = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

    return (
      <main className="min-h-screen bg-gray-50 pb-16">
        <div className="relative pt-14 pb-28 px-4 overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 rounded-b-[2.5rem] shadow-md">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-62.5 h-62.5 bg-[#285A48] opacity-20 rounded-full"></div>
            <div className="absolute top-10 right-40 w-37.5 h-37.5 bg-black opacity-10 rounded-full"></div>
            <div className="absolute -bottom-20 -left-10 bg-black opacity-10 rounded-full"></div>
            <div className="absolute top-[30%] left-16 w-37.5 h-37.5 bg-[#408A71] opacity-30 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-sm">
                ภาพรวมการสอน
              </h1>
              <p className="text-emerald-50 mt-1 text-base md:text-lg font-light drop-shadow-sm">
                ยินดีต้อนรับกลับ
                {fullNameWithPrefix ? ` ${fullNameWithPrefix}` : ""}!
                นี่คือสถิติและคอร์สเรียนของคุณในขณะนี้
              </p>
            </div>
            <Link
              href="/dashboard/tutor/courses/new"
              className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              สร้างคอร์สใหม่
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-14 relative z-20 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">รายได้สะสม (โดยประมาณ)</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  ฿{stats.revenue.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  นักเรียนที่จองสอน
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.students}{" "}
                  <span className="text-base font-normal text-gray-500">
                    คน
                  </span>
                </h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <BookOpen className="w-7 h-7" />
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
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                <Star className="w-7 h-7" />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-4xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />{" "}
                  สถิติคนเข้าชมคอร์ส (สัปดาห์นี้)
                </h3>
              </div>

              <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-1 relative">
                {stats.views.every((v) => v === 0) && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 backdrop-blur-sm shadow-sm border border-gray-100">
                      ยังไม่มีข้อมูลสถิติเข้าชม
                    </span>
                  </div>
                )}
                {stats.views.map((height, index) => {
                  const normalizedHeight =
                    height === 0 ? 0 : Math.min(100, (height / 100) * 100);
                  return (
                    <div
                      key={index}
                      className="w-full bg-emerald-50/70 rounded-t-xl relative group h-full flex items-end"
                    >
                      <div
                        className="w-full bg-emerald-500 rounded-t-xl transition-all duration-700 ease-in-out hover:bg-emerald-600 min-h-1"
                        style={{ height: `${normalizedHeight}%` }}
                      ></div>
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

            {/* === อัปเดตส่วนแสดงการแจ้งเตือนล่าสุด & ข้อมูลติดต่อผู้เรียน === */}
            <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm flex flex-col h-full max-h-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  รายการคนจองล่าสุด
                </h3>
                {recentBookings.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> ใหม่
                  </span>
                )}
              </div>

              {recentBookings.length > 0 ? (
                <div className="space-y-4 overflow-y-auto pr-2 pb-2 custom-scrollbar">
                  {recentBookings.map((booking) => {
                    const isPending = !booking.status || booking.status === "pending";
                    
                    const start = new Date(booking.start_at);
                    const end = new Date(booking.end_at);
                    const dateStr = start.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
                    const timeStr = `${start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;

                    return (
                      <div
                        key={booking.id}
                        className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Profile Image */}
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {booking.learner?.profile_image_url ? (
                              <Image 
                                src={booking.learner.profile_image_url} 
                                alt="Learner"
                                fill 
                                unoptimized 
                                className="object-cover"
                              />
                            ) : (
                              <span className="font-bold">{booking.learner?.first_name?.charAt(0) || "?"}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {booking.learner?.first_name || "ไม่ระบุชื่อ"}{" "}
                                {booking.learner?.nickname ? `(${booking.learner.nickname})` : ""}
                              </p>
                              {isPending ? (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">รอโอนเงิน</span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">ชำระแล้ว</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                              คอร์ส: {booking.courses?.title}
                            </p>
                          </div>
                        </div>

                        {/* Contact Info Box */}
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                            <span className="truncate">{dateStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                            <span className="truncate">{timeStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                            <span className="truncate font-medium text-gray-900 select-all">Line: {booking.learner?.line_id || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                            <span className="truncate font-medium text-gray-900 select-all">{booking.learner?.phone || "-"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
                  <Clock className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">ยังไม่มีความเคลื่อนไหวใหม่</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-4xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                จัดการเวลาว่างเปิดสอน (Availability)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                เพิ่มวันและเวลาที่คุณสะดวกสอน เพื่อให้นักศึกษาเลือกกดจองเรียนในหน้าคอร์สของคุณ
              </p>
            </div>

            <form
              onSubmit={handleAddAvailability}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  วันที่เปิดสอน
                </label>
                <input
                  type="date"
                  required
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  เวลาเริ่ม (Start)
                </label>
                <input
                  type="time"
                  required
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  เวลาสิ้นสุด (End)
                </label>
                <input
                  type="time"
                  required
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={isAddingSlot}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {isAddingSlot ? "กำลังเพิ่ม..." : "เพิ่มเวลาว่าง"}
              </button>
            </form>

            {availabilities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availabilities.map((slot) => {
                  const start = new Date(slot.start_at);
                  const end = new Date(slot.end_at);
                  const dateStr = start.toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const timeStr = `${start.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${end.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} น.`;

                  return (
                    <div
                      key={slot.id}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm ${
                        slot.is_booked
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{dateStr}</span>
                        <span className="text-xs opacity-80">{timeStr}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          slot.is_booked
                            ? "bg-amber-200/80 text-amber-900"
                            : "bg-emerald-200/80 text-emerald-900"
                        }`}
                      >
                        {slot.is_booked ? "ถูกจองแล้ว" : "ว่าง"}
                      </span>
                      {!slot.is_booked && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAvailability(slot.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="ลบช่วงเวลานี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                ยังไม่ได้ลงเวลาว่างเปิดสอน
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-6 mt-4 px-2">
              <h3 className="text-xl font-bold text-gray-900">
                จัดการคอร์สเรียน ({courses.length})
              </h3>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 z-10"></div>

                    <div className="relative aspect-video w-full bg-linear-to-br from-emerald-50 via-teal-50 to-emerald-100/70 overflow-hidden border-b border-gray-100">
                      {course.cover_image_url ? (
                        <Image
                          src={course.cover_image_url}
                          alt={course.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-emerald-600/40">
                          <BookOpen className="w-10 h-10 mb-1 stroke-[1.5]" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider">
                            ไม่มีรูปหน้าปก
                          </span>
                        </div>
                      )}

                      {course.level && (
                        <div className="absolute bottom-3 right-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-black/70 text-white backdrop-blur-xs">
                            <Sparkles className="w-3 h-3 text-emerald-300" />
                            {course.level}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                          {course.teaching_format}
                        </span>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/tutor/courses/${course.id}`}
                            className="text-gray-400 hover:text-emerald-600 transition"
                            title="แก้ไขคอร์สเรียน"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="ลบคอร์สเรียน"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-gray-500 text-sm mb-4 line-clamp-2 grow">
                        {course.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                      </p>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="text-emerald-600 font-bold text-lg">
                          ฿{course.price_per_hour}{" "}
                          <span className="text-gray-400 text-sm font-normal">
                            / ชม.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-14 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ยังไม่มีคอร์สเรียน
                </h3>
                <p className="text-gray-500 mb-6">
                  สร้างคอร์สแรกของคุณเพื่อเริ่มรับนักเรียน
                </p>
                <Link
                  href="/dashboard/tutor/courses/new"
                  className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3 rounded-full font-semibold hover:bg-black transition-all shadow-md"
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

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 py-12 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-12 -right-12 w-79 h-69.5 bg-[#285A48] opacity-10 rounded-full"></div>
        <div className="absolute top-8 right-40 w-54.5 h-54.5 bg-black opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-75 h-79 bg-black opacity-10 rounded-full"></div>
        <div className="absolute bottom-12 right-32 w-49 h-45 bg-[#408A71] opacity-30 rounded-full"></div>
        <div className="absolute top-[50%] -left-16 w-66 h-78 bg-black opacity-10 rounded-full"></div>
        <div className="absolute top-[65%] left-16 w-57.5 h-49.5 bg-[#408A71] opacity-30 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            อัปเกรดบัญชีเป็นติวเตอร์
          </h1>
          <p className="text-gray-500">
            แบ่งปันความรู้ สร้างรายได้ และช่วยเหลือเพื่อนๆ
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleBecomeTutor} className="space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1 ml-1">
                  คำนำหน้าชื่อ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2.5 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm text-gray-900 font-medium"
                >
                  <option value="" disabled>
                    -- เลือก --
                  </option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-emerald-900 mb-1 ml-1">
                  ชื่อ-นามสกุลผู้สมัคร (อ้างอิงตามใบผลการเรียน)
                </label>
                <div className="w-full px-4 py-2.5 bg-white/80 border border-emerald-100 rounded-xl text-sm font-bold text-gray-800">
                  {prefix
                    ? `${prefix}${firstName} ${lastName}`
                    : `${firstName} ${lastName}`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                แนะนำตัวสั้นๆ (Bio) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                placeholder="เช่น ถนัดวิชาเขียนโปรแกรม สอนสนุก เป็นกันเอง..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
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
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                placeholder="เช่น 3.50"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                วิชาที่ต้องการขอสิทธิ์สอน{" "}
                <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addSubjectRow}
                className="text-sm flex items-center gap-1 text-emerald-700 hover:bg-emerald-100 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full transition-colors"
              >
                <Plus className="w-4 h-4" /> เพิ่มวิชา
              </button>
            </div>

            <div className="space-y-3">
              {selectedSubjects.map((subject, index) => {
                const query = subject.searchText.trim().toLowerCase();
                const filteredList = masterSubjects.filter((ms) => {
                  const fullLabel =
                    `${ms.code || ""} - ${ms.name}`.toLowerCase();
                  return (
                    (ms.code && ms.code.toLowerCase().includes(query)) ||
                    ms.name.toLowerCase().includes(query) ||
                    fullLabel.includes(query)
                  );
                });

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200/80"
                  >
                    <div className="flex-1 relative">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={subject.searchText}
                          onFocus={() =>
                            updateSubjectRow(index, "isOpen", true)
                          }
                          onBlur={() => {
                            setTimeout(
                              () => updateSubjectRow(index, "isOpen", false),
                              200,
                            );
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newSubjects = [...selectedSubjects];
                            newSubjects[index] = {
                              ...newSubjects[index],
                              searchText: val,
                              subject_id: "", 
                              isOpen: true,
                            };
                            setSelectedSubjects(newSubjects);
                          }}
                          placeholder="พิมพ์รหัสวิชา (เช่น 069...) หรือชื่อวิชา..."
                          className={`w-full pl-9 pr-9 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm text-gray-900 placeholder:text-gray-400 transition-all ${
                            subject.subject_id
                              ? "border-emerald-400 bg-emerald-50/20 font-medium"
                              : "border-gray-200"
                          }`}
                        />
                        {subject.searchText ? (
                          <button
                            type="button"
                            onClick={() => handleClearSubject(index)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            title="ล้างข้อความ"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>

                      {subject.isOpen && (
                        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50">
                          {filteredList.length > 0 ? (
                            filteredList.slice(0, 80).map((ms) => (
                              <button
                                type="button"
                                key={ms.id}
                                onMouseDown={(e) => {
                                  e.preventDefault(); 
                                  handleSelectSubject(index, ms);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2.5 ${
                                  String(ms.id) === subject.subject_id
                                    ? "bg-emerald-50/80 font-semibold text-emerald-900"
                                    : "text-gray-800"
                                }`}
                              >
                                <span className="font-mono text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md shrink-0">
                                  {ms.code || "ไม่ระบุรหัส"}
                                </span>
                                <span className="truncate">{ms.name}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">
                              ไม่พบรายวิชาที่ค้นหา
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-28 sm:w-32 shrink-0">
                      <input
                        type="text"
                        required
                        placeholder="เกรด (เช่น A)"
                        value={subject.grade}
                        onChange={(e) =>
                          updateSubjectRow(index, "grade", e.target.value)
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm text-gray-900 placeholder:text-gray-400 uppercase"
                      />
                    </div>

                    {selectedSubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              * พิมพ์รหัสวิชาหรือชื่อวิชาเพื่อค้นหา
              แล้วคลิกเลือกรายวิชาจากรายการที่แสดงขึ้นมา
            </p>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              ไฟล์ผลการเรียน (Transcript) อัปเดตล่าสุด{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 mb-3 text-xs md:text-sm text-emerald-950 space-y-1.5">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                📌 วิธีบันทึกไฟล์ผลการเรียนจากเว็บทะเบียน (แนะนำเป็นไฟล์ PDF):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-emerald-800/90 ml-1">
                <li>
                  เข้าเว็บทะเบียน (
                  <span className="font-mono font-medium">
                    regis.rmutto.ac.th
                  </span>
                  ) ไปที่หน้าผลการเรียน แล้วกดเลือก{" "}
                  <b>&quot;แสดงข้อมูล ทั้งหมด&quot;</b>
                </li>
                <li>
                  <b>คลิกขวา</b> บริเวณตารางเกรด เลือกเมนู <b>Print (พิมพ์)</b>{" "}
                  หรือคลิกที่ตารางแล้วกดปุ่ม <b>Ctrl + P</b>
                </li>
                <li>
                  เปลี่ยนที่เก็บไฟล์เป็น <b>Save as PDF (บันทึกเป็น PDF)</b>{" "}
                  โดยในไฟล์ต้องเห็นชื่อ-นามสกุลและเกรดครบทุกเทอม
                </li>
              </ol>
            </div>

            <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-emerald-200 border-dashed rounded-2xl hover:bg-emerald-50/30 transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-emerald-500" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-transparent rounded-md font-semibold text-emerald-600 hover:text-emerald-700">
                    <span>อัปโหลดไฟล์ PDF หรือรูปภาพ</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  แนะนำไฟล์ .PDF เพื่อให้แอดมินตรวจสอบรายวิชาได้รวดเร็วขึ้น
                </p>
                {file && (
                  <p className="text-sm font-semibold text-emerald-600 mt-2">
                    📄 {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white font-semibold py-4 rounded-full hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-6 text-lg"
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