"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Camera,
  Save,
  ArrowLeft,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/login");
          return;
        }

        setUserId(session.user.id);
        setEmail(session.user.email || "");

        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (userData) {
          setStudentId(userData.student_id || "");
          setFirstName(userData.first_name || "");
          setLastName(userData.last_name || "");
          setNickname(userData.nickname || "");
          setPhone(userData.phone || "");
          setLineId(userData.line_id || "");
          setBio(userData.bio || "");
          setProfileImageUrl(userData.profile_image_url || null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setErrorMsg("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [supabase, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let finalImageUrl = profileImageUrl;

      // 1. ถ้ามีการเลือกรูปใหม่ ให้อัปโหลดขึ้น Supabase Storage (Bucket: avatars)
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, imageFile, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 2. อัปเดตข้อมูลลงตาราง users
      const { error: updateError } = await supabase
        .from("users")
        .update({
          nickname: nickname.trim() || null,
          phone: phone.trim() || null,
          line_id: lineId.trim() || null,
          bio: bio.trim() || null,
          profile_image_url: finalImageUrl,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 3. ซิงค์ข้อมูล bio ไปยังตาราง tutor_profiles ด้วย (กรณีเป็นติวเตอร์)
      await supabase
        .from("tutor_profiles")
        .update({ bio: bio.trim() || null })
        .eq("id", userId);

      setProfileImageUrl(finalImageUrl);
      setSuccessMsg("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!");
      router.refresh();
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorObj = err as { message?: string };
      setErrorMsg(
        `เกิดข้อผิดพลาด: ${errorObj?.message || "ไม่สามารถบันทึกข้อมูลได้"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  const displayAvatar = imagePreview || profileImageUrl;

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

        <div className="relative z-10 max-w-2xl mx-auto flex items-center gap-4 px-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-full backdrop-blur-sm transition-all shadow-sm"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              แก้ไขโปรไฟล์ส่วนตัว
            </h1>
            <p className="text-sm md:text-base text-emerald-50 font-light mt-1 drop-shadow-sm">
              อัปเดตรูปโปรไฟล์ แนะนำตัว และช่องทางติดต่อของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* === Form Card === */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-semibold">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* ส่วนอัปโหลดรูปโปรไฟล์ */}
            <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
              <div className="relative group">
                {displayAvatar ? (
                  <Image
                    src={displayAvatar}
                    alt="Profile Preview"
                    width={112}
                    height={112}
                    unoptimized
                    className="w-28 h-28 rounded-full object-cover border-4 border-emerald-100 shadow-md"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center shadow-inner">
                    <UserIcon className="w-12 h-12 opacity-60" />
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2.5 bg-[#1a1a1a] text-white rounded-full shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                  title="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                คลิกที่ไอคอนกล้องเพื่ออัปโหลดรูปโปรไฟล์ใหม่ (JPG, PNG)
              </p>
            </div>

            {/* ข้อมูลที่ล็อกไว้ (ชื่อ-นามสกุล, รหัสนักศึกษา, อีเมล) */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">
                  ชื่อ-นามสกุล
                </span>
                <span className="font-bold text-gray-800">
                  {firstName} {lastName}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">
                  รหัสนักศึกษา
                </span>
                <span className="font-bold text-gray-800">
                  {studentId || "-"}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-gray-400 block">
                  อีเมลมหาวิทยาลัย
                </span>
                <span className="font-medium text-emerald-700">{email}</span>
              </div>
            </div>

            {/* ช่องแก้ไขข้อมูลติดต่อ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น ซันนี่"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  Line ID
                </label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="ไอดีไลน์ติดต่อ"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>

            {/* ช่องแก้ไขประวัติแนะนำตัว (Bio) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                แนะนำตัวสั้นๆ (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="เขียนแนะนำตัว สไตล์การเรียน หรือความถนัดของคุณ..."
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-gray-50/50 text-gray-900 placeholder:text-gray-400 transition-all"
              ></textarea>
            </div>

            {/* ปุ่มบันทึก */}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <Link
                href="/search"
                className="px-6 py-3.5 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all text-center"
              >
                กลับหน้าหลัก
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white bg-[#1a1a1a] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    บันทึกโปรไฟล์
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
