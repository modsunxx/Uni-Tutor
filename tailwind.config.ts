import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // สีหลักของแบรนด์ (ปรับตาม Figma ได้เลย)
        primary: {
          DEFAULT: "#3B82F6", // Blue-500 สีหลักที่ดูเป็นมิตร
          hover: "#2563EB", // Blue-600 สีตอนเอาเมาส์ชี้
          light: "#DBEAFE", // Blue-100 สีพื้นหลังอ่อนๆ
        },
        // สีรอง (สำหรับปุ่มยกเลิก หรือป้ายสถานะทั่วไป)
        secondary: {
          DEFAULT: "#64748B", // Slate-500
          hover: "#475569",
          light: "#F1F5F9",
        },
      },
    },
  },
  plugins: [],
};
export default config;
