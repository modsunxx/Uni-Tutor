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

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        if (!session.user.email?.endsWith("@rmutto.ac.th")) {
          setErrorMsg(
            "ระบบอนุญาตให้ใช้อีเมล @rmutto.ac.th ของมหาวิทยาลัยเท่านั้นครับ",
          );
          await supabase.auth.signOut();
          setIsPageLoading(false);
          return;
        }

        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (existingUser) {
          router.push("/search");
        } else {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 p-4">
      {/* === กลุ่มวงกลมตกแต่ง (Blobs) === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-12 -right-12 w-79 h-69.5 bg-[#285A48] opacity-10 rounded-full"></div>
        <div className="absolute top-8 right-40 w-54.5 h-54.5 bg-black opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-75 h-79 bg-black opacity-10 rounded-full"></div>
        <div className="absolute bottom-12 right-32 w-49 h-45 bg-[#408A71] opacity-30 rounded-full"></div>
        <div className="absolute top-[50%] -left-16 w-66 h-78 bg-black opacity-10 rounded-full"></div>
        <div className="absolute top-[65%] left-16 w-57.5 h-49.5 bg-[#408A71] opacity-30 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col">
        <div className="bg-white w-full rounded-[2.5rem] shadow-2xl p-10 md:p-14">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {authUser ? "ข้อมูลนักศึกษา" : "สมัครเป็นสมาชิก"}
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              {authUser
                ? "กรอกข้อมูลเพิ่มเติมเพื่อเริ่มต้นใช้งาน Uni-Tutor"
                : "เริ่มต้นแบ่งปันและค้นหาความรู้ในมหาลัยด้วยบัญชี Google"}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm mb-8 border border-emerald-100">
              {successMsg}
            </div>
          )}

          {!authUser ? (
            <>
              <div className="max-w-sm mx-auto my-12">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold text-[17px] py-4 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>

              <div className="text-center mt-12 space-y-3">
                <p className="text-[13px] text-gray-400">
                  ใช้บัญชีมหาวิทยาลัย (@rmutto.ac.th)
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  มีบัญชีอยู่แล้วใช่ไหม?{" "}
                  <Link
                    href="/login"
                    className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleCompleteProfile} className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 px-5 py-4 rounded-2xl flex items-center justify-between mb-8">
                <span className="text-sm text-emerald-800 font-semibold">
                  บัญชีที่ผูก:{" "}
                  <span className="font-normal">{authUser.email}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    รหัสนักศึกษา <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    required
                    maxLength={15}
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                    placeholder="เช่น 0141401..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    คณะ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="faculty"
                    required
                    value={formData.faculty}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    ชั้นปี <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  สาขา <span className="text-red-500">*</span>
                </label>
                <select
                  name="major"
                  required
                  value={formData.major}
                  onChange={handleChange}
                  disabled={!formData.faculty}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    เบอร์โทรติดต่อ
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Line ID
                  </label>
                  <input
                    type="text"
                    name="lineId"
                    value={formData.lineId}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1a1a1a] text-white font-semibold py-4 rounded-full hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 mt-8 text-lg"
              >
                {isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกและเริ่มต้นใช้งาน"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
