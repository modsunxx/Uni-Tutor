import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // จำลองการเช็กสถานะล็อกอินจาก Cookie ชื่อ 'uni_tutor_session'
  // (ของจริงธนพลจะใช้ @supabase/ssr มาเช็ก Cookie ของ Supabase แทน)
  const isLoggedIn = request.cookies.has("uni_tutor_session");

  // หน้าที่อนุญาตให้เข้าได้โดยไม่ต้องล็อกอิน
  const isPublicRoute = path === "/login" || path === "/register";

  // กฎข้อที่ 1: ถ้ายังไม่ล็อกอิน และพยายามเข้าหน้าอื่น (รวมถึงหน้าแรก '/') -> เด้งไป /login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // กฎข้อที่ 2: ถ้าล็อกอินแล้ว แต่พยายามกดกลับมาหน้า /login หรือ /register -> เด้งไปหน้าหลัก
  if (isLoggedIn && isPublicRoute) {
    // สมมติให้เด้งไปหน้าแรก หรือจะให้เด้งไป /dashboard/learner ก็ได้
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ถ้าถูกกฎทั้งหมด ก็ปล่อยให้ผ่านไปหน้าเว็บได้ปกติ
  return NextResponse.next();
}

export const config = {
  matcher: [
    // ดักทุกหน้า ยกเว้นพวกไฟล์ระบบ รูปภาพ หรือ API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
