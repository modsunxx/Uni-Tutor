"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900 p-4">
      {/* === กลุ่มวงกลมตกแต่ง (Blobs) พื้นหลัง === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-12 -right-12 w-79 h-69.5 bg-[#285A48] opacity-10 rounded-full"></div>
        <div className="absolute top-8 right-40 w-54.5 h-54.5 bg-black opacity-10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-75 h-79 bg-black opacity-10 rounded-full"></div>
        <div className="absolute bottom-12 right-32 w-49 h-45 bg-[#408A71] opacity-30 rounded-full"></div>
        <div className="absolute top-[50%] -left-16 w-66 h-78 bg-black opacity-10 rounded-full"></div>
        <div className="absolute top-[65%] left-16 w-57.5 h-49.5 bg-[#408A71] opacity-30 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col">
        {/* === Header โลโก้และข้อความด้านบนซ้าย === */}
        <div className="mb-6 text-white px-2">
          <div className="flex items-center gap-2 mb-1">
            {/* ไอคอนสี่เหลี่ยมข้าวหลามตัด */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl font-bold tracking-tight">UniTutor</span>
          </div>
        </div>

        {/* === การ์ดสีขาวแบบกว้าง (ตาม Figma) === */}
        <div className="bg-white w-full rounded-[2.5rem] shadow-2xl p-10 md:p-14">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              สำหรับนักศึกษาและติวเตอร์ภายในมหาวิทยาลัย
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-8 border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* ปุ่มเข้าสู่ระบบ Google (ดีไซน์โค้งมน) */}
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
              {isLoading ? "กำลังเชื่อมต่อ..." : "เข้าสู่ระบบด้วย Google"}
            </button>
          </div>

          {/* ข้อความส่วนท้าย (Footer) */}
          <div className="text-center mt-12 space-y-3">
            <p className="text-[13px] text-gray-400">
              ใช้บัญชีมหาวิทยาลัยเพื่อยืนยันตัวตน
            </p>
            <p className="text-sm text-gray-600 font-medium">
              ยังไม่มีบัญชีใช่ไหม?{" "}
              <Link
                href="/register"
                className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
