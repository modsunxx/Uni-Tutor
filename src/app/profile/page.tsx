"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  required?: boolean;
}

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
}: SelectFieldProps) => (
  <div>
    <label className="text-sm font-semibold text-gray-700 block mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
    >
      <option value="" disabled>
        -- เลือก{label} --
      </option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

// 1. สร้างโครงสร้างข้อมูลจับคู่ คณะ -> สาขา
const FACULTY_MAJOR_MAP: Record<string, string[]> = {
  คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ: [
    "เทคโนโลยีการผลิตพืช",
    "สัตวศาสตร์",
    "วิศวกรรมเครื่องกล - เครื่องจักรกลเกษตร",
    "เทคโนโลยีเพาะเลี้ยงสัตว์น้ำและการจัดการ",
    "เทคโนโลยีการจัดการอุตสาหกรรมเพื่อความยั่งยืน",
  ],
  คณะมนุษยศาสตร์และสังคมศาสตร์: [
    "การจัดการ",
    "เทคโนโลยีการลงทุน",
    "การตลาดสมัยใหม่",
    "ภาษาอังกฤษเพื่อการสื่อสารสากล",
    "บัญชีบัณฑิต",
    "เทคโนโลยีการจัดการโลจิสติกส์และซัพพลายเชน – เทคโนโลยีการจัดการคลังสินค้าและศูนย์กระจายสินค้าดิจิทัล",
    "เทคโนโลยีการจัดการโลจิสติกส์และซัพพลายเชน - การค้าระหว่างประเทศและเทคโนโลยีการจัดการขนส่งดิจิทัล",
  ],
  คณะวิทยาศาสตร์และเทคโนโลยี: [
    "วิทยาศาสตร์และเทคโนโลยีการอาหาร",
    "เทคโนโลยีการประกอบอาหารและการบริการ",
    "นวัตกรรมผลิตภัณฑ์ชีวภาพ",
    "วิทยาการคอมพิวเตอร์",
    "การจัดการสิ่งแวดล้อมและความปลอดภัย",
    "เทคโนโลยีสารสนเทศและการสื่อสาร",
    "ผลิตภัณฑ์เพื่อสุขภาพและความงาม",
  ],
  คณะสัตวแพทยศาสตร์: ["สัตวแพทย์ศาสตร์", "วิทยาศาสตร์สุขภาพสัตว์"],
  สำนักวิชาวิศวกรรมศาสตร์และนวัตกรรม: [
    "วิศวกรรมเมคคาทรอนิกส์และหุ่นยนต์",
    "วิศวกรรมอุตสาหการและโลจิสติกส์",
    "วิศวกรรมเครื่องกล",
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lineId, setLineId] = useState("");

  const [faculty, setFaculty] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  const [bio, setBio] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const titleOptions = ["นาย", "นางสาว", "นาง"];
  const yearOptions = [
    "ปี 1",
    "ปี 2",
    "ปี 3",
    "ปี 4",
    "ปี 3 เทียบโอน",
    "ปี 4 เทียบโอน",
  ];

  // 2. ดึงชื่อคณะทั้งหมดออกมาเป็นตัวเลือก
  const facultyOptions = Object.keys(FACULTY_MAJOR_MAP);

  // 3. คำนวณตัวเลือกสาขาตามคณะที่เลือกอยู่ ณ ปัจจุบัน
  const majorOptions = faculty ? FACULTY_MAJOR_MAP[faculty] : [];

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from("users")
        .select(
          // อัปเดตจาก avatar_url เป็น profile_image_url
          "title, first_name, last_name, nickname, phone, profile_image_url, line_id, faculty, major, year, bio",
        )
        .eq("id", session.user.id)
        .single();

      if (data) {
        setTitle(data.title || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setNickname(data.nickname || "");
        setPhone(data.phone || "");
        // อัปเดตจาก avatar_url เป็น profile_image_url
        setAvatarUrl(data.profile_image_url || null);
        setLineId(data.line_id || "");
        setFaculty(data.faculty || "");
        setMajor(data.major || "");
        setYear(data.year || "");
        setBio(data.bio || "");
      }
    };

    fetchProfile();
  }, [supabase, router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      setMessage({ type: "", text: "" });

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("กรุณาเลือกไฟล์รูปภาพ");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMessage({
        type: "success",
        text: "อัปโหลดรูปลง Bucket สำเร็จ! (อย่าลืมกดบันทึกข้อมูล)",
      });
    } catch (err) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "เกิดข้อผิดพลาดในการอัปโหลดรูป",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      const updates = {
        id: user?.id,
        title: title,
        first_name: firstName,
        last_name: lastName,
        nickname: nickname,
        phone: phone,
        // อัปเดตจาก avatar_url เป็น profile_image_url
        profile_image_url: avatarUrl,
        line_id: lineId,
        faculty: faculty,
        major: major,
        year: year,
        bio: bio,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("users").upsert(updates);

      if (error) throw error;

      setMessage({
        type: "success",
        text: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!",
      });
      router.refresh();
    } catch (err) {
      const error = err as Error;
      setMessage({
        type: "error",
        text: error.message || "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ตั้งค่าโปรไฟล์ ⚙️
        </h1>
        <p className="text-gray-500 mb-8">
          จัดการข้อมูลส่วนตัว การศึกษา และช่องทางการติดต่อของคุณ
        </p>

        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center space-y-4 md:w-1/3 shrink-0">
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                }
                alt="Profile Avatar"
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-50 shadow-sm bg-gray-100"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-sm font-semibold">
                  {isUploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 text-center max-w-37.5">
              รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 2MB)
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="flex-1 space-y-8">
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                ข้อมูลส่วนตัว
              </h3>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  อีเมลมหาวิทยาลัย
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <SelectField
                    label="คำนำหน้า"
                    options={titleOptions}
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setTitle(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <div className="w-full">
                    <Input
                      label="ชื่อจริง"
                      type="text"
                      placeholder="ไม่ต้องใส่คำนำหน้า"
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
                      placeholder="นามสกุล"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="ชื่อเล่น"
                  type="text"
                  placeholder="เช่น ซันนี่"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
                <Input
                  label="เบอร์โทรศัพท์ (บังคับใส่)"
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                ข้อมูลการศึกษา
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="คณะ"
                  options={facultyOptions}
                  value={faculty}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFaculty(e.target.value);
                    setMajor("");
                  }}
                  required
                />
                <SelectField
                  label="สาขาวิชา"
                  options={majorOptions}
                  value={major}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setMajor(e.target.value)
                  }
                  required
                />
                <SelectField
                  label="ชั้นปี"
                  options={yearOptions}
                  value={year}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setYear(e.target.value)
                  }
                  required
                />
                <Input
                  label="Line ID (สำหรับติดต่อเพิ่มเติม)"
                  type="text"
                  placeholder="ใส่ Line ID ของคุณ"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">
                เกี่ยวกับฉัน
              </h3>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  แนะนำตัวเองสั้นๆ (Bio)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-25 resize-y text-sm"
                  placeholder="ถนัดวิชาอะไร สไตล์การสอน/การเรียนเป็นแบบไหน เขียนบอกเพื่อนๆ ได้เลย..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving || isUploading}
                className="px-8"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
