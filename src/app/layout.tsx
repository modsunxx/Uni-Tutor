import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uni-Tutor | แพลตฟอร์มติวเตอร์ มทร.ตะวันออก",
  description: "ค้นหาและจับคู่คอร์สเรียนพิเศษสำหรับนักศึกษา",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Navbar /> {/* แทรก Navbar ไว้ด้านบนสุดของ body เพื่อให้โชว์ทุกหน้า */}
        {children}
      </body>
    </html>
  );
}
