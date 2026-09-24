"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut, LayoutDashboard } from "lucide-react";

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  role: "Learner" | "Tutor" | "Admin" | "learner" | "tutor" | "admin";
};

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, first_name, last_name, nickname, role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUserProfile(profile as UserProfile);
        }
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
          .select("id, first_name, last_name, nickname, role")
          .eq("id", session.user.id)
          .single();
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
    router.push("/login");
  };

  const displayName = userProfile?.nickname || userProfile?.first_name || "";

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between">
        {/* โลโก้ใหม่ (สี่เหลี่ยมข้าวหลามตัด + สีเขียวเข้ม) */}
        <Link
          href="/"
          className="font-bold text-2xl text-emerald-800 flex items-center gap-2 tracking-tight hover:opacity-80 transition-opacity"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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

        <div className="flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
          >
            ค้นหาคอร์ส
          </Link>

          {isLoading ? (
            <div className="w-24 h-10 bg-gray-100 animate-pulse rounded-full"></div>
          ) : userProfile ? (
            <div className="flex items-center gap-4">
              <Link
                href={
                  userProfile.role.toLowerCase() === "admin"
                    ? "/admin"
                    : `/dashboard/${userProfile.role.toLowerCase()}`
                }
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                แดชบอร์ด
              </Link>

              <div className="flex items-center gap-3 pl-5 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-inner">
                  {displayName.charAt(0)}
                </div>
                <span className="text-sm font-bold text-gray-800 hidden md:block">
                  {displayName}
                  <span className="ml-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {userProfile.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all ml-1"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5 pl-2">
              <Link
                href="/register"
                className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors hidden md:block"
              >
                สมัครสมาชิก
              </Link>
              {/* ปุ่มเข้าสู่ระบบแบบโค้งมน */}
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
    </nav>
  );
}
