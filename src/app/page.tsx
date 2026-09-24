import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-900">
      {/* === กลุ่มวงกลมตกแต่ง (Blobs) ทั้ง 6 วง ตรงตาม Figma เป๊ะๆ === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* มุมขวาบน (Top Right) */}
        <div className="absolute -top-12 -right-12 w-79 h-69.5 bg-[#285A48] opacity-10 rounded-full"></div>
        <div className="absolute top-8 right-40 w-54.5 h-54.5 bg-black opacity-10 rounded-full"></div>

        {/* มุมขวาล่าง (Bottom Right) */}
        <div className="absolute -bottom-16 -right-12 w-75 h-79 bg-black opacity-10 rounded-full"></div>
        <div className="absolute bottom-12 right-32 w-49 h-45 bg-[#408A71] opacity-30 rounded-full"></div>

        {/* มุมซ้ายล่าง (Bottom Left) */}
        <div className="absolute top-[50%] -left-16 w-66 h-78 bg-black opacity-10 rounded-full"></div>
        <div className="absolute top-[65%] left-16 w-57.5 h-49.5 bg-[#408A71] opacity-30 rounded-full"></div>
      </div>
      {/* ======================================================= */}

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* รูปภาพโลโก้ */}
        <Image
          src="/logo.png"
          alt="Uni-Tutor Logo"
          width={350}
          height={350}
          className="mb-10 drop-shadow-xl"
          priority
        />

        {/* ปุ่มเริ่มต้นใช้งาน */}
        <Link
          href="/search"
          className="bg-[#1a1a1a] text-white px-14 py-4 rounded-full font-semibold text-lg shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95"
        >
          เริ่มต้นใช้งาน
        </Link>
      </div>
    </main>
  );
}
