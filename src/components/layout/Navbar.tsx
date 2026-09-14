"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 1. เพิ่ม State สำหรับเก็บชื่อที่จะแสดง (Display Name)
  const [displayName, setDisplayName] = useState<string>("ผู้ใช้");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 2. เปลี่ยนชื่อฟังก์ชันและให้มันดึง nickname, first_name มาด้วย
    const fetchUserData = async (
      userId: string,
      defaultEmail: string | undefined,
      meta: { first_name?: string },
    ) => {
      const { data } = await supabase
        .from("users")
        .select("profile_image_url, nickname, first_name")
        .eq("id", userId)
        .single();

      if (data) {
        if (data.profile_image_url) setProfileImage(data.profile_image_url);

        // ลำดับความสำคัญการแสดงชื่อ: ชื่อเล่น -> ชื่อจริง(ในตาราง) -> ชื่อจริง(ตอนสมัคร) -> อีเมลส่วนหน้า
        const nameToShow =
          data.nickname ||
          data.first_name ||
          meta?.first_name ||
          defaultEmail?.split("@")[0] ||
          "ผู้ใช้";
        setDisplayName(nameToShow);
      } else {
        // กรณีดึงตารางไม่สำเร็จ ให้ใช้ชื่อจากตอนสมัคร หรืออีเมลแทน
        setDisplayName(
          meta?.first_name || defaultEmail?.split("@")[0] || "ผู้ใช้",
        );
      }
    };

    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || "Learner");
        // ส่งข้อมูลเบื้องต้นไปให้ฟังก์ชันช่วยประมวลผล
        fetchUserData(
          session.user.id,
          session.user.email,
          session.user.user_metadata,
        );
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setRole(session.user.user_metadata?.role || "Learner");
          fetchUserData(
            session.user.id,
            session.user.email,
            session.user.user_metadata,
          );
        } else {
          setUser(null);
          setRole(null);
          setProfileImage(null);
          setDisplayName("ผู้ใช้");
        }
      },
    );

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [supabase]);

  /* eslint-disable @next/next/no-img-element */
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await supabase.auth.signOut();

    document.cookie =
      "uni_tutor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link
        href="/"
        className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
      >
        Uni-Tutor
      </Link>

      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-6 mr-4 text-sm font-medium text-gray-600 items-center">
          <Link href="/search" className="hover:text-primary transition-colors">
            ค้นหาคอร์ส
          </Link>

          {role !== "Tutor" && (
            <Link
              href={user ? "/dashboard/learner" : "/register"}
              className="hover:text-primary transition-colors"
            >
              สมัครเป็นติวเตอร์
            </Link>
          )}
        </nav>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <img
                src={
                  profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                }
                alt="Profile"
                className="w-9 h-9 rounded-full bg-blue-100 border border-gray-200 object-cover"
              />
              {/* 3. เปลี่ยนจาก user.email มาโชว์ displayName แทน */}
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-30 truncate">
                {displayName}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col z-50">
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  {/* แสดงชื่อเล่นตรงหัวข้อตัวใหญ่ และโชว์อีเมลตัวเล็กๆ ด้านล่างแทน */}
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    สถานะ: {role}
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    href={
                      role === "Tutor"
                        ? "/dashboard/tutor"
                        : "/dashboard/learner"
                    }
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    📊 แดชบอร์ดของฉัน
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    ⚙️ ตั้งค่าโปรไฟล์
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    🚪 ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
