import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
      <Link
        href="/"
        className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
      >
        Uni-Tutor
      </Link>

      <div className="flex items-center gap-4">
        {/* เมนูนำทางแบบเรียบง่าย */}
        <nav className="hidden md:flex gap-6 mr-4 text-sm font-medium text-gray-600">
          <Link href="/search" className="hover:text-primary transition-colors">
            ค้นหาคอร์ส
          </Link>
          <Link
            href="/register"
            className="hover:text-primary transition-colors"
          >
            สมัครเป็นติวเตอร์
          </Link>
        </nav>

        <Link href="/login">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            เข้าสู่ระบบ
          </Button>
        </Link>
        <Link href="/register">
          <Button variant="primary" size="sm">
            สมัครสมาชิก
          </Button>
        </Link>
      </div>
    </header>
  );
}
