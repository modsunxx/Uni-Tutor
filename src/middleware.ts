import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ฟังก์ชัน Middleware จะถูกเรียกทุกครั้งที่มีการเปลี่ยนหน้า
export function middleware(request: NextRequest) {
  // ดึง Path ที่ผู้ใช้กำลังจะไป
  const path = request.nextUrl.pathname;

  // 1. กำหนดหน้าเว็บที่ต้องล็อกอินก่อนถึงจะเข้าได้ (Protected Routes)
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/courses/");

  // 2. กำหนดหน้าเว็บสำหรับคนยังไม่ล็อกอิน (Public Auth Routes)
  const isAuthRoute = path === "/login" || path === "/register";

  /* 
    --- จุดสำหรับให้ Backend (ธนพล) มาเขียนโค้ดต่อ ---
    ตรงนี้จะต้องดึง Session จาก Supabase (ใช้ @supabase/ssr)
    เพื่อเช็กว่ามี Token หรือไม่ และเช็ก Role ว่าเป็นใคร
    
    ตัวอย่าง Logic เบื้องต้น:
    const hasSession = ... (เช็กจากคุกกี้)
  */

  // จำลองสถานการณ์ (Mock Logic): สมมติว่ายังไม่มี Session
  const hasSession = false; // เปลี่ยนเป็น true เพื่อทดสอบการเข้าถึง

  // ถ้ายังไม่ล็อกอิน แต่พยายามเข้าหน้า Dashboard -> เด้งไปหน้า Login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ถ้าล็อกอินแล้ว แต่พยายามเข้าหน้า Login/Register ซ้ำ -> เด้งไปหน้าแรกหรือ Dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ปล่อยให้ผ่านไปหน้าเว็บที่ต้องการได้ตามปกติ
  return NextResponse.next();
}

// กำหนดว่า Middleware นี้จะทำงานกับ Path ไหนบ้าง
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
