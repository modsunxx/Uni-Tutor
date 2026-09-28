"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Save,
  AlertCircle,
  Lock,
  ImagePlus,
  Video,
  Link as LinkIcon,
  X,
} from "lucide-react";
import Link from "next/link";

export default function EditCoursePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);

  // ข้อมูลวิชาและชื่อคอร์ส (ล็อกไว้แสดงผลอย่างเดียว)
  const [courseTitle, setCourseTitle] = useState("");
  const [subjectDisplay, setSubjectDisplay] = useState("");

  // ข้อมูลที่อนุญาตให้แก้ไขได้
  const [level, setLevel] = useState("ทุกระดับ (All Levels)");
  const [format, setFormat] = useState("Online");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  // รูปหน้าปกคอร์ส (cover_image_url)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // วิดีโอแนะนำคอร์ส (preview_video_url)
  const [videoInputType, setVideoInputType] = useState<"upload" | "link">(
    "upload",
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;

        if (courseData) {
          setCourseTitle(courseData.title || "");
          setLevel(courseData.level || "ทุกระดับ (All Levels)");
          setFormat(courseData.teaching_format || "Online");
          setPrice(courseData.price_per_hour?.toString() || "");
          setDescription(courseData.description || "");
          setExistingCoverUrl(courseData.cover_image_url || null);

          if (courseData.preview_video_url) {
            setVideoUrlInput(courseData.preview_video_url);
            setVideoInputType("link");
          }

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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("ไม่พบเซสชันการล็อกอิน");

      const userId = session.user.id;
      let finalCoverUrl = existingCoverUrl;
      let finalVideoUrl: string | null = videoUrlInput.trim() || null;

      // 1. อัปโหลดรูปหน้าปกใหม่ (ถ้ามีการเลือกไฟล์ใหม่)
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const coverPath = `covers/${userId}-${Date.now()}.${ext}`;
        const { error: coverUploadError } = await supabase.storage
          .from("courses")
          .upload(coverPath, coverFile, { cacheControl: "3600", upsert: true });

        if (coverUploadError) throw coverUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("courses").getPublicUrl(coverPath);
        finalCoverUrl = publicUrl;
      }

      // 2. อัปโหลดไฟล์วิดีโอใหม่ (ถ้าเลือกโหมดอัปโหลดและมีไฟล์)
      if (videoInputType === "upload" && videoFile) {
        const ext = videoFile.name.split(".").pop();
        const videoPath = `videos/${userId}-${Date.now()}.${ext}`;
        const { error: videoUploadError } = await supabase.storage
          .from("courses")
          .upload(videoPath, videoFile, { cacheControl: "3600", upsert: true });

        if (videoUploadError) throw videoUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("courses").getPublicUrl(videoPath);
        finalVideoUrl = publicUrl;
      } else if (videoInputType === "link") {
        finalVideoUrl = videoUrlInput.trim() || null;
      }

      // 3. อัปเดตข้อมูลคอร์สเรียนลงตาราง courses
      const { error } = await supabase
        .from("courses")
        .update({
          level: level,
          teaching_format: format,
          price_per_hour: parseFloat(price),
          description: description,
          cover_image_url: finalCoverUrl,
          preview_video_url: finalVideoUrl,
        })
        .eq("id", courseId)
        .eq("tutor_id", userId);

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

  const displayCover = coverPreview || existingCoverUrl;

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
              ปรับปรุงระดับเนื้อหา รูปแบบการสอน ราคา รูปปก และวิดีโอแนะนำคอร์ส
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

            {/* 2. ระดับเนื้อหา (Level), รูปแบบการสอน & ราคาต่อชั่วโมง */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  ระดับเนื้อหา (Level) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 font-medium transition-all"
                >
                  <option value="ทุกระดับ (All Levels)">
                    ทุกระดับ (All Levels)
                  </option>
                  <option value="ปูพื้นฐาน (Beginner)">
                    ปูพื้นฐาน (Beginner)
                  </option>
                  <option value="ติวสอบ (Midterm/Final)">
                    ติวสอบ (Midterm/Final)
                  </option>
                  <option value="เจาะลึก (Advanced)">เจาะลึก (Advanced)</option>
                </select>
              </div>

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

            <hr className="border-gray-100" />

            {/* 4. แก้ไขรูปหน้าปกคอร์ส และวิดีโอตัวอย่าง */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* รูปหน้าปกคอร์ส */}
              <div>
                <div className="mb-2 ml-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    รูปหน้าปกคอร์ส (Cover Image)
                  </label>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    แนะนำอัตราส่วน 16:9 (ขนาด 1280×720 px ขึ้นไป)
                  </p>
                </div>
                {displayCover ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-200 h-44 bg-gray-50">
                    <Image
                      src={displayCover}
                      alt="Course Cover Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="ลบรูปหน้าปก"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-44 border-2 border-emerald-200 border-dashed rounded-2xl cursor-pointer hover:bg-emerald-50/40 transition-colors p-4 text-center">
                    <ImagePlus className="w-9 h-9 text-emerald-500 mb-2" />
                    <span className="text-sm font-semibold text-emerald-700">
                      คลิกเพื่ออัปโหลดรูปหน้าปก
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      สัดส่วน 16:9 แนวนอน (1280×720 px)
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5 MB (ไม่บังคับ)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>

              {/* วิดีโอตัวอย่าง */}
              <div>
                <div className="flex items-start justify-between mb-2 ml-1 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      วิดีโอแนะนำคอร์ส (Preview Video)
                    </label>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      แนะนำอัตราส่วน 16:9 ความละเอียด 720p / 1080p
                    </p>
                  </div>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setVideoInputType("upload")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        videoInputType === "upload"
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      อัปโหลดไฟล์
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputType("link")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        videoInputType === "link"
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      วางลิงก์
                    </button>
                  </div>
                </div>

                {videoInputType === "upload" ? (
                  <label className="flex flex-col items-center justify-center h-44 border-2 border-emerald-200 border-dashed rounded-2xl cursor-pointer hover:bg-emerald-50/40 transition-colors p-4 text-center">
                    <Video className="w-9 h-9 text-emerald-500 mb-2" />
                    <span className="text-sm font-semibold text-emerald-700">
                      คลิกเพื่ออัปโหลดไฟล์วิดีโอใหม่
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      สัดส่วน 16:9 แนวนอน (720p หรือ 1080p)
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      รองรับไฟล์ MP4, WebM ขนาดไม่เกิน 50 MB (ไม่บังคับ)
                    </span>
                    {videoFile && (
                      <span className="mt-2 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full truncate max-w-full">
                        🎬 {videoFile.name}
                      </span>
                    )}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setVideoFile(e.target.files?.[0] || null)
                      }
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="h-44 flex flex-col justify-center bg-gray-50/70 border border-gray-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <LinkIcon className="w-4 h-4" />
                        ลิงก์วิดีโอแนะนำการสอน (16:9, 720p/1080p)
                      </span>
                      {videoUrlInput && (
                        <button
                          type="button"
                          onClick={() => setVideoUrlInput("")}
                          className="text-red-500 hover:underline text-[11px]"
                        >
                          ล้างลิงก์
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="text-[11px] text-gray-400">
                      * แนะนำวิดีโอแนวนอน (16:9) ความยาวประมาณ 1–3 นาที
                    </p>
                  </div>
                )}
              </div>
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
