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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State ควบคุม Dropdown

  // อ้างอิงถึงตัว Dropdown เพื่อทำระบบคลิกที่อื่นแล้วปิด
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || "Learner");
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setRole(session.user.user_metadata?.role || "Learner");
        } else {
          setUser(null);
          setRole(null);
        }
      },
    );

    // ฟังก์ชันปิด Dropdown เมื่อคลิกพื้นที่อื่นบนหน้าจอ
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

  // ซ่อน Navbar ในหน้า Login และ Register
  /* eslint-disable @next/next/no-img-element */
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await supabase.auth.signOut();

    // เคลียร์คุกกี้ที่ทำจำลองไว้ให้เกลี้ยง
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
          // ส่วนเมนูผู้ใช้ (Dropdown)
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              {/* รูปโปรไฟล์ชั่วคราว (เดี๋ยวไปเชื่อมกับ Storage ทีหลัง) */}
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt="Profile"
                className="w-9 h-9 rounded-full bg-blue-100 border border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-30 truncate">
                {user.email?.split("@")[0] ?? "ผู้ใช้"}
              </span>
            </button>

            {/* กล่อง Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col z-50">
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-primary font-medium mt-0.5">
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
