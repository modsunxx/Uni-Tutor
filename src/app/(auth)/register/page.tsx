"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ข้อมูลส่วนตัวเพิ่มเติม
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");

  const [role, setRole] = useState("Learner");

  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.endsWith("@rmutto.ac.th")) {
      setErrorMsg("กรุณาใช้อีเมลของมหาวิทยาลัย (@rmutto.ac.th) เท่านั้นครับ");
      return;
    }

    if (!title) {
      setErrorMsg("กรุณาเลือกคำนำหน้าชื่อครับ");
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

    // ส่งข้อมูลทั้งหมดไปสมัครสมาชิกพร้อมกับ Metadata
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: role,
          title: title,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          line_id: lineId,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("User already registered")) {
        setErrorMsg("อีเมลนี้มีผู้ใช้งานแล้วครับ");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    if (data.user) {
      alert("สมัครสมาชิกสำเร็จ! โปรดเข้าสู่ระบบเพื่อเริ่มใช้งาน");
      router.push("/login");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50/50 p-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p className="text-gray-500 text-sm">
            เข้าร่วมคอมมูนิตี้ Uni-Tutor
            เริ่มต้นเรียนรู้หรือแบ่งปันความรู้ได้เลย
          </p>
        </div>

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

          {/* แถวที่ 1: คำนำหน้า, ชื่อจริง, นามสกุล */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-1">
              <label className="text-sm font-semibold text-gray-700 block">
                คำนำหน้า <span className="text-red-500">*</span>
              </label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
              >
                <option value="" disabled>
                  เลือก
                </option>
                <option value="นาย">นาย</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div className="md:col-span-1 flex items-end">
              <div className="w-full">
                <Input
                  label="ชื่อจริง"
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2 flex items-end">
              <div className="w-full">
                <Input
                  label="นามสกุล"
                  type="text"
                  placeholder="นามสกุลของคุณ"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* แถวที่ 2: เบอร์โทรศัพท์, Line ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="เบอร์โทรศัพท์"
              type="tel"
              placeholder="08X-XXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Line ID (ใส่หรือไม่ใส่ก็ได้)"
              type="text"
              placeholder="ไอดีไลน์ของคุณ"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
            />
          </div>

          {/* แถวที่ 3: รหัสผ่าน, ยืนยันรหัสผ่าน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="ยืนยันรหัสผ่าน"
              type="password"
              placeholder="กรอกอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

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
