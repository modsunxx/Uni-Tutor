import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// จำลองข้อมูลติวเตอร์แนะนำ (รอเชื่อมต่อกับ API ของ Supabase)
const RECOMMENDED_TUTORS = [
  {
    id: "1",
    name: "พี่นัท",
    subject: "แคลคูลัส 1 (Calculus I)",
    rating: 4.8,
    reviews: 12,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nut",
  },
  {
    id: "2",
    name: "พี่มายด์",
    subject: "การเขียนโปรแกรมเบื้องต้น (C++)",
    rating: 4.9,
    reviews: 24,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mind",
  },
  {
    id: "3",
    name: "พี่เจมส์",
    subject: "ฟิสิกส์ 1 (Physics I)",
    rating: 4.7,
    reviews: 8,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="w-full bg-primary-light/30 py-20 px-6 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          เรียนสบายใจ สไตล์เพื่อนช่วยเพื่อน
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          หมดปัญหาความประหม่าในการถามอาจารย์ ค้นหาเพื่อนหรือรุ่นพี่ที่เชี่ยวชาญ
          เพื่อช่วยติวในรายวิชาที่คุณต้องการ พร้อมบรรยากาศที่เป็นกันเอง
        </p>

        {/* กล่องค้นหา */}
        <div className="w-full max-w-xl bg-white p-2 rounded-xl shadow-lg flex gap-2">
          <Input
            placeholder="ค้นหาวิชาเรียน เช่น แคลคูลัส, เขียนโปรแกรม..."
            className="border-none shadow-none focus:ring-0"
          />
          <Link href="/search">
            <Button variant="primary" className="px-8 whitespace-nowrap">
              ค้นหาเลย
            </Button>
          </Link>
        </div>
      </section>

      {/* Recommended Tutors Section */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              ติวเตอร์แนะนำ 🌟
            </h2>
            <p className="text-gray-500 mt-1">
              รุ่นพี่ที่ได้รับการรีวิวดีเยี่ยมจากผู้เรียน
            </p>
          </div>
          <Link
            href="/search"
            className="text-primary hover:underline text-sm font-medium"
          >
            ดูทั้งหมด &rarr;
          </Link>
        </div>

        {/* Grid แสดงการ์ดติวเตอร์ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RECOMMENDED_TUTORS.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="w-16 h-16 rounded-full bg-blue-50"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {tutor.name}
                  </h3>
                  <div className="flex items-center text-sm text-yellow-500 font-medium mt-1">
                    ⭐ {tutor.rating}{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      ({tutor.reviews} รีวิว)
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-1 rounded-md">
                  {tutor.subject}
                </span>
              </div>
              <Link href={`/courses/${tutor.id}`}>
                <Button variant="outline" fullWidth>
                  ดูรายละเอียด
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
