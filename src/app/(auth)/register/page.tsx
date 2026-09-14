"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client"; // นำเข้า Supabase Client

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient(); // เรียกใช้งาน Supabase

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Learner"); // ค่าเริ่มต้นเป็นผู้เรียน

  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // 1. ตรวจสอบเงื่อนไขฝั่งหน้าบ้าน
    if (!email.endsWith("@rmutto.ac.th")) {
      setErrorMsg("กรุณาใช้อีเมลของมหาวิทยาลัย (@rmutto.ac.th) เท่านั้นครับ");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกันครับ กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ");
      return;
    }

    setIsLoading(true);

    // 2. ส่งข้อมูลไปสมัครสมาชิกที่ Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: role, // บันทึก Role ลงใน Metadata ของ Auth ทันที
        },
      },
    });

    setIsLoading(false);

    // 3. จัดการกรณีเกิด Error จาก Supabase
    if (error) {
      console.error("Signup error:", error.message);
      // แปลงข้อความ Error ให้เข้าใจง่ายขึ้น
      if (error.message.includes("User already registered")) {
        setErrorMsg("อีเมลนี้มีผู้ใช้งานแล้วครับ");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // 4. สำเร็จ! แจ้งเตือนและพาไปหน้าเข้าสู่ระบบ
    if (data.user) {
      alert("สมัครสมาชิกสำเร็จ! โปรดเข้าสู่ระบบเพื่อเริ่มใช้งาน");
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50/50 p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm">
            เข้าร่วมคอมมูนิตี้ Uni-Tutor
            เริ่มต้นเรียนรู้หรือแบ่งปันความรู้ได้เลย
          </p>
        </div>

        {/* แสดงข้อความแจ้งเตือนเมื่อเกิด Error */}
        {errorMsg && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="อีเมลมหาวิทยาลัย"
            type="email"
            placeholder="student@rmutto.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="ตั้งรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="ยืนยันรหัสผ่าน"
            type="password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* ส่วนเลือก Role (ผู้เรียน / ผู้สอน) */}
          <div className="space-y-2 pb-2">
            <label className="text-sm font-semibold text-gray-700 block">
              คุณต้องการใช้งานในฐานะอะไร?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`cursor-pointer text-center py-2 px-4 rounded-lg border transition-all ${role === "Learner" ? "border-primary bg-primary-light text-primary font-bold" : "border-gray-200 text-gray-600 hover:border-primary"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="Learner"
                  checked={role === "Learner"}
                  onChange={() => setRole("Learner")}
                />
                ผู้เรียน (Learner)
              </label>
              <label
                className={`cursor-pointer text-center py-2 px-4 rounded-lg border transition-all ${role === "Tutor" ? "border-primary bg-primary-light text-primary font-bold" : "border-gray-200 text-gray-600 hover:border-primary"}`}
              >
                <input
                  type="radio"
                  className="hidden"
                  value="Tutor"
                  checked={role === "Tutor"}
                  onChange={() => setRole("Tutor")}
                />
                ติวเตอร์ (Tutor)
              </label>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
          มีบัญชีอยู่แล้วใช่ไหม?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            เข้าสู่ระบบเลย
          </Link>
        </div>
      </div>
    </main>
  );
}
