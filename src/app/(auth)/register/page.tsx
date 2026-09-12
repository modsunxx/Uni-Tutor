"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  // สร้าง State เก็บ Role ว่าเป็น Learner หรือ Tutor (ค่าเริ่มต้นเป็น Learner)
  const [role, setRole] = useState<"learner" | "tutor">("learner");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันอัปเดตข้อมูลในฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // ลบ Error ทิ้งเมื่อผู้ใช้เริ่มพิมพ์ใหม่
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });

    let isValid = true;

    // 1. ตรวจสอบโดเมนอีเมลมหาวิทยาลัย
    if (!formData.email.endsWith("@rmutto.ac.th")) {
      setErrors((prev) => ({
        ...prev,
        email: "กรุณาใช้อีเมลของมหาวิทยาลัย (@rmutto.ac.th) เท่านั้นครับ",
      }));
      isValid = false;
    }

    // 2. ตรวจสอบรหัสผ่านว่าตรงกันไหม
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "รหัสผ่านยืนยันไม่ตรงกันครับ",
      }));
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    // จำลองการส่งข้อมูลไปสมัครสมาชิก
    setTimeout(() => {
      console.log("Registering as:", role, formData);
      setIsLoading(false);
      // alert('สมัครสมาชิกสำเร็จ!');
    }, 1000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50/50 p-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
        {/* ส่วนหัว */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">สร้างบัญชีผู้ใช้</h1>
          <p className="text-gray-500 text-sm">
            เลือกบทบาทของคุณเพื่อเริ่มต้นใช้งาน Uni-Tutor
          </p>
        </div>

        {/* ปุ่มเลือก Role (Learner / Tutor) */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRole("learner")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === "learner"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📚 ฉันต้องการหาคนติว (ผู้เรียน)
          </button>
          <button
            type="button"
            onClick={() => setRole("tutor")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === "tutor"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            💡 ฉันอยากเปิดสอน (ติวเตอร์)
          </button>
        </div>

        {/* ฟอร์มกรอกข้อมูล */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ชื่อจริง"
              name="firstName"
              placeholder="สมชาย"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="นามสกุล"
              name="lastName"
              placeholder="ใจดี"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="อีเมลมหาวิทยาลัย"
            type="email"
            name="email"
            placeholder="student@rmutto.ac.th"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="รหัสผ่าน"
            type="password"
            name="password"
            placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="ยืนยันรหัสผ่าน"
            type="password"
            name="confirmPassword"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading
              ? "กำลังสร้างบัญชี..."
              : `สมัครสมาชิกในฐานะ${role === "learner" ? "ผู้เรียน" : "ติวเตอร์"}`}
          </Button>
        </form>

        {/* ลิงก์กลับไปหน้า Login */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
          มีบัญชีอยู่แล้วใช่ไหม?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}
