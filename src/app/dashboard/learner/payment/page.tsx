"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
// import { supabase } from '@/lib/supabase'; // เตรียมเปิดคอมเมนต์เมื่อต่อ Supabase จริง

export default function PaymentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ฟังก์ชันเมื่อผู้ใช้เลือกไฟล์รูป
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // สร้าง URL สำหรับ Preview รูปก่อนอัปโหลด
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  // ฟังก์ชันอัปโหลดรูปไปที่ Supabase
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      /* โค้ดสำหรับต่อ Supabase ของจริง (รอธนพลสร้างเสร็จ)
      const fileExt = file.name.split('.').pop();
      const fileName = `slip-${Date.now()}.${fileExt}`;

      // 1. อัปโหลดรูปเข้า Storage bucket ชื่อ 'slips'
      const { data, error } = await supabase.storage
        .from('slips')
        .upload(fileName, file);

      if (error) throw error;

      // 2. เอาลิงก์รูปไปบันทึกลงตาราง payments พร้อมเปลี่ยนสถานะเป็น Pending
      const { data: publicUrlData } = supabase.storage
        .from('slips')
        .getPublicUrl(fileName);

      await supabase.from('payments').insert({
        booking_id: 'ใส่ ID การจองตรงนี้',
        slip_url: publicUrlData.publicUrl,
        status: 'Pending'
      });
      */

      // จำลองการโหลด
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setPreviewUrl(null);
        alert("อัปโหลดสลิปสำเร็จ! รอแอดมินตรวจสอบครับ");
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          แจ้งชำระเงินค่าเรียน 💸
        </h1>
        <p className="text-gray-500 mb-8">
          วิชา: เขียนโปรแกรมเบื้องต้น (C & Go) | ยอดชำระ: 150 บาท
        </p>

        <div className="space-y-6">
          {/* ข้อมูลบัญชีสำหรับโอนเงิน */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">
              โอนเงินเข้าบัญชี (แอดมินกลาง)
            </p>
            <p className="text-xl font-bold text-gray-800 tracking-wider">
              XXX-X-XXXXX-X
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ธนาคารกสิกรไทย (ชื่อบัญชี: โครงการ Uni-Tutor)
            </p>
          </div>

          {/* ส่วนอัปโหลดรูป */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <img
                  src={previewUrl}
                  alt="Slip Preview"
                  className="max-h-64 rounded-lg shadow-sm mb-4"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  เปลี่ยนรูปสลิป
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                </p>

                {/* ปุ่ม Input แบบซ่อน */}
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="slip-upload"
                />
                <label htmlFor="slip-upload">
                  <span className="bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-hover transition-colors inline-block">
                    เลือกไฟล์สลิป
                  </span>
                </label>
              </div>
            )}
          </div>

          <Button
            fullWidth
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="mt-4"
          >
            {isUploading ? "กำลังอัปโหลด..." : "ยืนยันการแจ้งโอนเงิน"}
          </Button>
        </div>
      </div>
    </main>
  );
}
