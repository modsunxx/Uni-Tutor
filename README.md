# 🎓 Uni-Tutor (แพลตฟอร์มติวเตอร์ มทร.ตะวันออก)

Uni-Tutor เป็นแพลตฟอร์มเว็บแอปพลิเคชันที่สร้างขึ้นเพื่อเชื่อมโยงนักศึกษา มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก เข้าด้วยกัน โดยเปิดโอกาสให้นักศึกษาที่มีความชำนาญในรายวิชาต่างๆ สามารถสมัครเป็น "ติวเตอร์" เพื่อเปิดสอน และให้นักศึกษาคนอื่นๆ ("ผู้เรียน") สามารถค้นหา ลงทะเบียนเรียน และชำระเงินโดยตรงกับผู้สอนได้แบบ Peer-to-Peer

## ✨ ฟีเจอร์หลัก (Key Features)

- **ระบบยืนยันตัวตน (Authentication):** รองรับการเข้าสู่ระบบและสมัครสมาชิกด้วย Google OAuth ผ่าน Supabase Auth
- **การจัดการสิทธิ์ผู้ใช้งาน (Role-based Access):** แบ่งสิทธิ์ผู้ใช้งานออกเป็น 3 ระดับ: `Learner`, `Tutor`, และ `Admin`
- **ระบบสมัครติวเตอร์ (Tutor Application):** นักศึกษาสามารถยื่นคำขอเป็นติวเตอร์ โดยกรอกประวัติย่อ, เกรดเฉลี่ย, อัปโหลดไฟล์ผลการเรียน (Transcript) ลงใน Storage และระบุรายวิชาที่ต้องการสอนพร้อมเกรดที่ได้
- **ระบบจองเวลาเรียน (Booking System):** ผู้เรียนสามารถดูตารางเวลาที่ว่างของติวเตอร์ (Availability Slots) และกดจองช่วงเวลาเรียนที่ต้องการได้
- **ระบบชำระเงินแบบ Decentralized (Direct Payment):** ผู้เรียนโอนเงินค่าเรียนเข้าบัญชีธนาคารหรือพร้อมเพย์ของติวเตอร์โดยตรง (ไม่มีการหักค่าธรรมเนียมแพลตฟอร์ม) จากนั้นอัปโหลดสลิปเข้าระบบ
- **ระบบตรวจสอบสลิป (Slip Verification):** แอดมินทำหน้าที่ตรวจสอบความถูกต้องของสลิปโอนเงิน เพื่อยืนยันหรือปฏิเสธการจอง (Verified / Rejected)
- **ระบบรีวิวและให้คะแนน (Review & Rating):** เมื่อถึงกำหนดเวลาเรียนจบ ผู้เรียนสามารถให้คะแนนดาวและเขียนคำติชมถึงติวเตอร์ได้
- **การจัดการคอร์สเรียน (Course Management):** ติวเตอร์สามารถสร้าง แก้ไข กำหนดรูปแบบการสอน (Online, Onsite, Hybrid) และระบุราคาต่อคอร์สได้
- **Dashboard แยกตามบทบาท:**
  - **Learner Dashboard:** ติดตามสถานะการจอง, อัปโหลดสลิป, ดูเวลาเรียน, และให้คะแนนติวเตอร์
  - **Tutor Dashboard:** จัดการคอร์ส, จัดการตารางเวลาว่าง (Availability), ตรวจสอบรายชื่อผู้จอง, และตั้งค่าบัญชีรับเงิน
  - **Admin Dashboard:** อนุมัติสิทธิ์ติวเตอร์จากผลการเรียน, ตรวจสอบและยืนยันสลิปโอนเงิน

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL), Supabase Auth, Supabase Storage
- **Language:** TypeScript (Strict Mode)
- **Icons:** Lucide React

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. โคลนโปรเจกต์

```bash
git clone [https://github.com/modsunxx/Uni-Tutor.git](https://github.com/modsunxx/Uni-Tutor.git)
cd Uni-Tutor
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

โปรเจกต์นี้ใช้ Supabase PostgreSQL โดยมีตารางที่สำคัญดังนี้:

- `users`: ข้อมูลผู้ใช้งานทั่วไปและ Role (Learner, Tutor, Admin)
- `tutor_profiles`: โปรไฟล์ของติวเตอร์, สถานะการอนุมัติ (is_verified), ข้อมูลบัญชีรับเงิน (Bank/PromptPay)
- `tutor_verified_subjects`: รายวิชาและเกรดที่นักศึกษายื่นขอสอน
- `master_subjects`: ฐานข้อมูลรายวิชากลางของมหาวิทยาลัย
- `courses` & `course_contents`: ข้อมูลคอร์สเรียนที่เปิดสอนและรายละเอียดเนื้อหา
- `availability`: ตารางช่วงเวลาที่ติวเตอร์เปิดรับสอน (Start/End time)
- `bookings`: ข้อมูลการจองเวลาเรียนของผู้เรียน (Pending, Confirmed, Completed, Cancelled)
- `payments`: ข้อมูลการชำระเงินและสลิปโอนเงิน (Unpaid, Slip Uploaded, Verified, Rejected)
- `reviews`: ข้อมูลการประเมินผลและคะแนนจากผู้เรียนที่มีต่อติวเตอร์

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)

```text
src/
├── app/
│   ├── (auth)/         # หน้า Login, Register, Auth Callbacks
│   ├── courses/        # หน้าหน้ารายละเอียดคอร์สเรียน (/courses/[id])
│   ├── dashboard/      # หน้า Dashboard แยกตาม Role
│   │   ├── admin/      # ระบบจัดการแอดมิน (ตรวจสลิป, อนุมัติติวเตอร์)
│   │   ├── learner/    # ระบบนักเรียน (ส่งสลิป, ดูตารางเรียน, รีวิว)
│   │   └── tutor/      # ระบบผู้สอน (จัดการคอร์ส, เวลาว่าง, ข้อมูลรับเงิน)
│   ├── search/         # หน้าค้นหาคอร์สเรียน
│   ├── layout.tsx
│   └── page.tsx
├── components/         # Reusable components (Navbar, Cards, Modals, etc.)
└── utils/
    └── supabase/       # ฟังก์ชันการเชื่อมต่อ Supabase Client (Browser/Server)
```