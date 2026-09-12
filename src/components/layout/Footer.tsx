import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Uni-Tutor. The Real Ones Team.
        </div>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="#" className="hover:text-primary transition-colors">
            เกี่ยวกับเรา
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            ติดต่อสอบถาม
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
      </div>
    </footer>
  );
}
