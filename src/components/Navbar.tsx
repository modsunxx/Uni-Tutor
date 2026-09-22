"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut, BookOpen, LayoutDashboard } from "lucide-react";

// ปรับ Type ให้รองรับทั้งตัวพิมพ์เล็กและพิมพ์ใหญ่
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
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-2xl text-blue-600 flex items-center gap-2"
        >
          <BookOpen className="w-6 h-6" />
          Uni-Tutor
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/search"
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ค้นหาคอร์ส
          </Link>

          {isLoading ? (
            <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-md"></div>
          ) : userProfile ? (
            <div className="flex items-center gap-4">
              {/* บังคับแปลง Role เป็นพิมพ์เล็กทั้งหมดด้วย toLowerCase() */}
              <Link
                href={
                  userProfile.role.toLowerCase() === "admin"
                    ? "/admin"
                    : `/dashboard/${userProfile.role.toLowerCase()}`
                }
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                แดชบอร์ด
              </Link>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {displayName.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden md:block">
                  {displayName}
                  <span className="ml-1 text-xs text-gray-400 font-normal">
                    ({userProfile.role})
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden md:block"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
