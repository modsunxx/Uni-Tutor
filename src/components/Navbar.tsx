"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import {
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  Search,
  Settings,
} from "lucide-react";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  role: "Learner" | "Tutor" | "Admin" | "learner" | "tutor" | "admin" | string;
  profile_image_url: string | null;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select(
            "id, first_name, last_name, nickname, role, profile_image_url",
          )
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          setUserProfile(profile as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: profile } = await supabase
          .from("users")
          .select(
            "id, first_name, last_name, nickname, role, profile_image_url",
          )
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile) setUserProfile(profile as UserProfile);
      } else if (event === "SIGNED_OUT") {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const displayName = userProfile?.nickname || userProfile?.first_name || "";
  const roleClean = userProfile?.role?.trim().toLowerCase() || "learner";

  const dashboardHref =
    roleClean === "admin"
      ? "/dashboard/admin"
      : roleClean === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/learner";

  // ฟังก์ชันสำหรับปิดเมนูเมื่อกดเลือกลิงก์ในโหมดมือถือ
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        <Link
          href="/"
          onClick={closeMenu}
          className="font-bold text-xl sm:text-2xl text-emerald-800 flex items-center gap-2 tracking-tight hover:opacity-80 transition-opacity z-50"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 sm:w-7 sm:h-7"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          UniTutor
        </Link>

        <div className="flex items-center md:hidden z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/search"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname === "/search"
                ? "text-emerald-700 font-bold"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            <Search className="w-4 h-4" /> ค้นหาคอร์ส
          </Link>

          {isLoading ? (
            <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-full"></div>
          ) : userProfile ? (
            <div className="flex items-center gap-4">
              <Link
                href={dashboardHref}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  pathname.startsWith("/dashboard")
                    ? "text-emerald-700 font-bold"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> แดชบอร์ด
              </Link>

              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <Link
                  href={`/profile/${userProfile.id}`}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-emerald-50/70 transition-all group border border-transparent hover:border-emerald-100"
                  title="ดูโปรไฟล์ของฉัน"
                >
                  {userProfile.profile_image_url ? (
                    <Image
                      src={userProfile.profile_image_url}
                      alt={displayName}
                      width={32}
                      height={32}
                      unoptimized
                      className={`w-8 h-8 rounded-full object-cover shadow-xs shrink-0 ${
                        roleClean === "admin"
                          ? "border-2 border-amber-400"
                          : "border border-emerald-200"
                      }`}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-inner group-hover:bg-emerald-200 transition-colors shrink-0">
                      {displayName.charAt(0)}
                    </div>
                  )}

                  <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors max-w-28 truncate">
                    {displayName}
                  </span>

                  {roleClean === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-linear-to-r from-amber-200 via-yellow-300 to-amber-400 text-amber-950 border border-amber-400/80 px-2 py-0.5 rounded-full shadow-2xs">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      Admin
                    </span>
                  ) : roleClean === "tutor" ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Tutor
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                      Learner
                    </span>
                  )}
                </Link>

                {/* ปุ่มตั้งค่าโปรไฟล์ */}
                <Link
                  href="/profile/edit"
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all ml-1"
                  title="แก้ไขโปรไฟล์"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 pl-4 border-l border-gray-200">
              <Link
                href="/register"
                className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="bg-[#1a1a1a] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-md active:scale-95"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </div>

      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-125 opacity-100 border-t border-gray-50"
            : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          <Link
            href="/search"
            onClick={closeMenu}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              pathname === "/search"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${pathname === "/search" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
            >
              <Search className="w-5 h-5" />
            </div>
            ค้นหาคอร์สเรียน
          </Link>

          {!isLoading && userProfile ? (
            <>
              <Link
                href={dashboardHref}
                onClick={closeMenu}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  pathname.startsWith("/dashboard")
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${pathname.startsWith("/dashboard") ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                ไปที่แดชบอร์ด
              </Link>

              <div className="h-px bg-gray-100 my-2"></div>

              <Link
                href={`/profile/${userProfile.id}`}
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
              >
                {userProfile.profile_image_url ? (
                  <Image
                    src={userProfile.profile_image_url}
                    alt={displayName}
                    width={40}
                    height={40}
                    unoptimized
                    className={`w-10 h-10 rounded-full object-cover shrink-0 ${
                      roleClean === "admin"
                        ? "border-2 border-amber-400"
                        : "border border-emerald-200"
                    }`}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                    {displayName.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    ดูหน้าโปรไฟล์สาธารณะ
                  </span>
                </div>

                {roleClean === "admin" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-linear-to-r from-amber-200 via-yellow-300 to-amber-400 text-amber-950 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                ) : roleClean === "tutor" ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Tutor
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">
                    Learner
                  </span>
                )}
              </Link>

              {/* ปุ่มแก้ไขโปรไฟล์ในโหมดมือถือ */}
              <Link
                href="/profile/edit"
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
              >
                <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                  <Settings className="w-5 h-5" />
                </div>
                ตั้งค่า / แก้ไขโปรไฟล์
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 p-3 mt-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-bold text-sm w-full"
              >
                <LogOut className="w-5 h-5" />
                ออกจากระบบ
              </button>
            </>
          ) : (
            !isLoading && (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full text-center bg-[#1a1a1a] text-white text-sm font-bold py-3 rounded-xl hover:bg-black transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="w-full text-center bg-gray-50 text-gray-800 border border-gray-200 text-sm font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  สมัครสมาชิกใหม่
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
