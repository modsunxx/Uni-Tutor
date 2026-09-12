import type { Metadata } from "next";
import { Inter } from "next/font/google"; // หรือฟอนต์ที่คุณเลือกใช้
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uni-Tutor | แพลตฟอร์มการเรียนรู้แบบเพื่อนช่วยเพื่อน",
  description:
    "พื้นที่แลกเปลี่ยนความรู้ ลดความประหม่าในการเรียน สไตล์เพื่อนช่วยเพื่อน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}
      >
        <Navbar />
        {/* ตรงนี้คือส่วนที่จะเปลี่ยนไปตามแต่ละหน้า */}
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
