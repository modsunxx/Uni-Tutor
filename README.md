# 🎓 Uni-Tutor (แพลตฟอร์มติวเตอร์ มทร.ตะวันออก)

Uni-Tutor เป็นแพลตฟอร์มเว็บแอปพลิเคชันที่สร้างขึ้นเพื่อเชื่อมโยงนักศึกษา มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก เข้าด้วยกัน โดยเปิดโอกาสให้นักศึกษาที่มีความชำนาญในรายวิชาต่างๆ สามารถสมัครเป็น "ติวเตอร์" เพื่อเปิดสอน และให้นักศึกษาคนอื่นๆ ("ผู้เรียน") สามารถค้นหาและลงทะเบียนเรียนได้

## ✨ ฟีเจอร์หลัก (Key Features)

- **ระบบยืนยันตัวตน (Authentication):** รองรับการเข้าสู่ระบบและสมัครสมาชิกด้วย Google OAuth ผ่าน Supabase Auth
- **การจัดการสิทธิ์ผู้ใช้งาน (Role-based Access):** แบ่งสิทธิ์ผู้ใช้งานออกเป็น 3 ระดับ: `Learner`, `Tutor`, และ `Admin`
- **ระบบสมัครติวเตอร์ (Tutor Application):** นักศึกษาสามารถยื่นคำขอเป็นติวเตอร์ โดยกรอกประวัติย่อ (Bio), เกรดเฉลี่ย (GPAX) และอัปโหลดไฟล์ผลการเรียน (Transcript) เข้าสู่ระบบ Supabase Storage
- **ระบบอนุมัติ (Approval Workflow):** แอดมินสามารถตรวจสอบเอกสารและอนุมัติสิทธิ์ติวเตอร์ได้ผ่าน Admin Dashboard
- **การจัดการคอร์สเรียน (Course Management):** ติวเตอร์สามารถสร้าง แก้ไข และกำหนดรูปแบบการสอน (Online, Onsite, Hybrid) รวมถึงราคาต่อชั่วโมงได้
- **ระบบค้นหาคอร์ส (Course Search):** ผู้เรียนสามารถค้นหาคอร์สได้จากชื่อวิชา, คณะ, หรือหมวดหมู่วิชา (เชื่อมโยงกับฐานข้อมูลรายวิชาของมหาวิทยาลัย)

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL), Supabase Auth, Supabase Storage
- **Language:** TypeScript (Strict Mode)
- **Icons:** Lucide React

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. โคลนโปรเจกต์

```bash
git clone [https://github.com/your-username/uni-tutor.git](https://github.com/your-username/uni-tutor.git)
cd uni-tutor
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์ และใส่ค่า API Key จาก Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์และเข้าไปที่ [http://localhost:3000](http://localhost:3000)

## 🗄️ โครงสร้างฐานข้อมูล (Database Schema)

โปรเจกต์นี้ใช้ Supabase PostgreSQL โดยมีตารางหลักดังนี้:

- `users`: เก็บข้อมูลผู้ใช้งานทั่วไปและ Role (Learner, Tutor, Admin)
- `tutor_profiles`: เก็บข้อมูลโปรไฟล์ของติวเตอร์ สถานะการอนุมัติ (is_verified) และลิงก์ไฟล์ Transcript
- `master_subjects`: ฐานข้อมูลวิชาเรียนทั้งหมดของมหาวิทยาลัย (หมวดหมู่ และ รหัสวิชา)
- `courses`: เก็บข้อมูลคอร์สเรียนที่เปิดสอน เชื่อมโยงกับ `tutor_profiles` และ `master_subjects`

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)

```text
src/
├── app/
│   ├── (auth)/         # หน้า Login, Register
│   ├── dashboard/      # หน้า Dashboard แยกตาม Role (learner, tutor, admin)
│   ├── search/         # หน้าค้นหาคอร์สเรียน
│   ├── layout.tsx
│   └── page.tsx
├── components/         # Reusable components (Navbar, Cards, etc.)
└── utils/
    └── supabase/       # ฟังก์ชันการเชื่อมต่อ Supabase Client
```
