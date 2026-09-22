"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

// ข้อมูลคณะและสาขาของ มทร.ตะวันออก
const FACULTY_DATA: Record<string, string[]> = {
  เกษตรศาสตร์และทรัพยากรธรรมชาติ: [
    "สัตวศาสตร์",
    "วิศวกรรมเครื่องกล - เครื่องจักรกลเกษตร",
    "เทคโนโลยีเพาะเลี้ยงสัตว์น้ำและการจัดการ",
    "เทคโนโลยีการจัดการอุตสาหกรรมเพื่อความยั่งยืน",
  ],
  มนุษยศาสตร์และสังคมศาสตร์: [
    "การจัดการ",
    "เทคโนโลยีการลงทุน",
    "การตลาดสมัยใหม่",
    "ภาษาอังกฤษเพื่อการสื่อสารสากล",
    "บัญชีบัณฑิต",
    "เทคโนโลยีการจัดการโลจิสติกส์และซัพพลายเชน - เทคโนโลยีการจัดการคลังสินค้าและศูนย์กระจายสินค้าดิจิทัล",
    "เทคโนโลยีการจัดการโลจิสติกส์และซัพพลายเชน - การค้าระหว่างประเทศและเทคโนโลยีการจัดการขนส่งดิจิทัล",
  ],
  วิทยาศาสตร์และเทคโนโลยี: [
    "วิทยาศาสตร์และเทคโนโลยีการอาหาร",
    "เทคโนโลยีการประกอบอาหารและการบริการ",
    "นวัตกรรมผลิตภัณฑ์ชีวภาพ",
    "วิทยาการคอมพิวเตอร์",
    "การจัดการสิ่งแวดล้อมและความปลอดภัย",
    "เทคโนโลยีสารสนเทศและการสื่อสาร",
    "ผลิตภัณฑ์เพื่อสุขภาพและความงาม",
  ],
  สัตวแพทยศาสตร์: ["สัตวแพทย์ศาสตร์", "วิทยาศาสตร์สุขภาพสัตว์"],
  สำนักวิชาวิศวกรรมศาสตร์และนวัตกรรม: [
    "วิศวกรรมเมคคาทรอนิกส์และหุ่นยนต์",
    "วิศวกรรมอุตสาหการและโลจิสติกส์",
    "วิศวกรรมเครื่องกล",
  ],
};

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [authUser, setAuthUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    nickname: "",
    faculty: "",
    major: "",
    year: "",
    lineId: "",
    phone: "",
  });

  // 1. ตรวจสอบสถานะการล็อกอินเมื่อโหลดหน้าเว็บ (หลังจากเด้งกลับมาจาก Google)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // เช็คโดเมนอีเมลทันทีที่เด้งกลับมา
        if (!session.user.email?.endsWith("@rmutto.ac.th")) {
          setErrorMsg(
            "ระบบอนุญาตให้ใช้อีเมล @rmutto.ac.th ของมหาวิทยาลัยเท่านั้นครับ",
          );
          await supabase.auth.signOut();
          setIsPageLoading(false);
          return;
        }

        // เช็คว่าเคยลงทะเบียนข้อมูลในตาราง users หรือยัง
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (existingUser) {
          // ถ้ามีข้อมูลแล้ว ให้พาไปหน้าหลักเลย ไม่ต้องกรอกซ้ำ
          router.push("/search");
        } else {
          // ถ้ายังไม่มีข้อมูล ให้แสดงฟอร์มกรอกข้อมูลส่วนตัว
          setAuthUser(session.user);
        }
      }
      setIsPageLoading(false);
    };

    checkAuthStatus();
  }, [router, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "faculty") {
      setFormData({ ...formData, faculty: value, major: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 2. ฟังก์ชันเริ่มล็อกอินด้วย Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/register`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  // 3. ฟังก์ชันบันทึกข้อมูลส่วนตัว (หลังจากผูกบัญชี Google ผ่านแล้ว)
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error: insertError } = await supabase.from("users").insert({
        id: authUser.id,
        email: authUser.email,
        role: "Learner",
        student_id: formData.studentId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        nickname: formData.nickname,
        faculty: formData.faculty,
        major: formData.major,
        year: formData.year,
        line_id: formData.lineId,
        phone: formData.phone,
      });

      if (insertError) throw insertError;

      setSuccessMsg("สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าค้นหา...");
      setTimeout(() => {
        router.push("/search");
      }, 2000);
    } catch (err) {
      const error = err as Error;
      if (error.message.includes("users_student_id_key")) {
        setErrorMsg("รหัสนักศึกษานี้ถูกใช้งานไปแล้ว");
      } else {
        setErrorMsg(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {authUser ? "ข้อมูลนักศึกษา" : "สมัครเป็นสมาชิก"}
          </h1>
          <p className="text-gray-500 mt-2">
            {authUser
              ? "กรอกข้อมูลเพิ่มเติมเพื่อเริ่มต้นใช้งาน Uni-Tutor"
              : "เริ่มต้นแบ่งปันและค้นหาความรู้ในมหาลัยด้วยบัญชี Google"}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-6 border border-green-100">
            {successMsg}
          </div>
        )}

        {/* ตรวจสอบว่ามีข้อมูล Auth จาก Google หรือยัง ถ้ายังให้โชว์ปุ่มล็อกอิน */}
        {!authUser ? (
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "กำลังเชื่อมต่อ..." : "สมัครสมาชิกด้วย Google"}
            </button>

            <p className="text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้วใช่ไหม?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        ) : (
          /* ถ้าเชื่อมต่อ Google สำเร็จแล้ว ให้โชว์ฟอร์มกรอกข้อมูลส่วนตัว */
          <form onSubmit={handleCompleteProfile} className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between mb-6">
              <span className="text-sm text-blue-800 font-medium">
                บัญชีที่ผูก: {authUser.email}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสนักศึกษา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentId"
                required
                maxLength={15}
                value={formData.studentId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="เช่น 0141401..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อจริง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คณะ <span className="text-red-500">*</span>
                </label>
                <select
                  name="faculty"
                  required
                  value={formData.faculty}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>
                    -- เลือกคณะ --
                  </option>
                  {Object.keys(FACULTY_DATA).map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชั้นปี <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>
                    -- เลือกชั้นปี --
                  </option>
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                  <option value="3 เทียบโอน">ปี 3 (เทียบโอน)</option>
                  <option value="4 เทียบโอน">ปี 4 (เทียบโอน)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สาขา <span className="text-red-500">*</span>
              </label>
              <select
                name="major"
                required
                value={formData.major}
                onChange={handleChange}
                disabled={!formData.faculty}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="" disabled>
                  -- เลือกสาขา --
                </option>
                {formData.faculty &&
                  FACULTY_DATA[formData.faculty].map((maj) => (
                    <option key={maj} value={maj}>
                      {maj}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อเล่น
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรติดต่อ
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line ID
                </label>
                <input
                  type="text"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 mt-4"
            >
              {isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกและเริ่มต้นใช้งาน"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
