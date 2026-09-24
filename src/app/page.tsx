import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        ยินดีต้อนรับสู่ Uni-Tutor
      </h1>
      <p className="text-gray-600 mb-8">
        แพลตฟอร์มแบ่งปันความรู้สำหรับนักศึกษา มทร.ตะวันออก
      </p>

      <div className="flex gap-4">
        <Link
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          href="/search"
        >
          ค้นหาคอร์สเรียน
        </Link>
        <Link
          className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          href="/login"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}
