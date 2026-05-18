"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImagePlus, Instagram, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createTemporaryShoutout } from "@/lib/actions/actionBackdrop";
import { sendbase64toS3DataMultifile } from "@/lib/actions/actionIndex";
import { ShoutoutDialogProps } from "@/lib/type";

export default function ShoutoutDialog({ isOpen, onClose, organizationId }: ShoutoutDialogProps) {
  const [image, setImage] = useState<string | null>(null);
  const [igName, setIgName] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setImage(compressedBase64);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) return toast.warning("อย่าลืมเลือกรูปภาพสวยๆ น้า 📸");

    setIsUploading(true);

    try {
      const base64Parts = image.split(",");
      const mimeType = base64Parts[0].match(/:(.*?);/)?.[1] || "image/png";
      const base64Data = base64Parts[1];

      const s3Result = await sendbase64toS3DataMultifile(
        base64Data,
        "shoutout_img",
        mimeType
      );

      if (!s3Result.success || !s3Result.url) {
        toast.error("อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่");
        setIsUploading(false);
        return;
      }

      const res = await createTemporaryShoutout(
        organizationId,
        s3Result.url,
        igName,
        message
      );

      if (res.success) {
        toast.success("ส่งข้อมูลขึ้นจอทีวีสำเร็จ!", { position: "bottom-center" });
        onClose();
        setImage(null);
        setIgName("");
        setMessage("");
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("เกิดข้อผิดพลาดของระบบ");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[88vh] rounded-t-[2rem] flex flex-col bg-[#121212] border-t border-white/10 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        {/* แถบดึงด้านบน */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2 mb-4"></div>

        <SheetHeader className="pb-4 text-center">
          <SheetTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="text-orange-400 w-6 h-6" />
            โชว์รูปของคุณขึ้นจอ
            <Sparkles className="text-pink-500 w-6 h-6" />
          </SheetTitle>
          <p className="text-white/60 text-sm mt-1">
            เลือกรูปภาพและฝากข้อความทักทายถึงทุกคนในร้านได้เลย!
          </p>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-2 flex-1 overflow-y-auto pb-8 hide-scrollbar">

          {/* ส่วนอัปโหลดรูป (ดีไซน์เป็น Dropzone น่ารักๆ) */}
          <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group">
            {image ? (
              <>
                <Image src={image} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                    แตะเพื่อเปลี่ยนรูป
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="p-4 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full shadow-lg">
                  <ImagePlus size={28} className="text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white/90 font-medium block">แตะเพื่อเลือกรูปภาพ</span>
                  <span className="text-white/40 text-xs">รองรับ JPG, PNG</span>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>

          <div className="flex flex-col gap-4">
            {/* ส่วนกรอกชื่อ IG */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 pl-1 uppercase tracking-wider">Instagram ของคุณ</label>
              <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-orange-400/50 focus-within:ring-1 focus-within:ring-orange-400/50 transition-all shadow-inner">
                <div className="pl-4 pr-3 flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-pink-500" />
                </div>
                <Input
                  placeholder="ชื่อ IG เช่น posx.system (ไม่บังคับ)"
                  value={igName}
                  onChange={(e) => setIgName(e.target.value)}
                  className="h-14 bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-white/30 rounded-none shadow-none text-md"
                />
              </div>
            </div>

            {/* ส่วนกรอกข้อความ */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 pl-1 uppercase tracking-wider">ข้อความ</label>
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 focus-within:border-orange-400/50 focus-within:ring-1 focus-within:ring-orange-400/50 transition-all shadow-inner">
                <textarea
                  placeholder="พิมพ์ข้อความน่ารักๆ หรือคำอวยพรได้ที่นี่เลย..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-24 bg-transparent border-none text-white focus:outline-none placeholder:text-white/30 p-3 resize-none text-md"
                />
              </div>
            </div>
          </div>

          {/* ปุ่มส่งข้อมูล (ดีไซน์เด่น เป็น CTA หลัก) */}
          <Button
            className="w-full h-14 rounded-xl mt-auto flex gap-2 text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all border-0"
            onClick={handleSubmit}
            disabled={!image || isUploading}
          >
            {isUploading ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <Send className="w-5 h-5 mb-0.5" />
            )}
            {isUploading ? "กำลังเตรียมส่งขึ้นจอ..." : "ส่งขึ้นจอทีวีเลย!"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}