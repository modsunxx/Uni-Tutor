import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Uni-Tutor | แพลตฟอร์มติวเตอร์มหาวิทยาลัย",
  description: "ค้นหาคอร์สและติวเตอร์สำหรับนักศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
