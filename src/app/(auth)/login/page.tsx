"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(""); // เพิ่ม State สำหรับเก็บข้อความ Error
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // รีเซ็ต Error ทุกครั้งที่กดปุ่มใหม่
    setEmailError("");

    // 1. ตรวจสอบว่าอีเมลลงท้ายด้วย @rmutto.ac.th หรือไม่
    if (!email.endsWith("@rmutto.ac.th")) {
      setEmailError("กรุณาใช้อีเมลของมหาวิทยาลัย (@rmutto.ac.th) เท่านั้นครับ");
      return; // หยุดการทำงาน ไม่ส่งข้อมูลไปหลังบ้าน
    }

    setIsLoading(true);

    // 2. จำลองการส่งข้อมูลไปให้ Supabase (ของจริงจะใส่โค้ดเชื่อม API ตรงนี้)
    setTimeout(() => {
      console.log("Logging in with:", { email, password });
      setIsLoading(false);
      // alert('เข้าสู่ระบบสำเร็จ!');
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm">
            ยินดีต้อนรับกลับสู่ Uni-Tutor พื้นที่แลกเปลี่ยนความรู้
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="อีเมลมหาวิทยาลัย"
            type="email"
            placeholder="student@rmutto.ac.th"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(""); // ลบ Error ออกตอนที่เริ่มพิมพ์ใหม่
            }}
            error={emailError} // ส่ง Error ไปแสดงผลที่ Input Component
            required
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Link
              href="#"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              ลืมรหัสผ่านใช่ไหม?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            สมัครสมาชิกเลย
          </Link>
        </div>
      </div>
    </main>
  );
}
