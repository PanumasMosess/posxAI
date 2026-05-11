"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  X,
  FileVideo,
} from "lucide-react";

import { createBackdrop, updateBackdrop } from "@/lib/actions/actionSettings";
import { SettingFormBackdropProps } from "@/lib/type";

const SettingFormBackdrop = ({
  backdropId,
  organizationId,
  stateSheet,
  userId,
}: SettingFormBackdropProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form States ---
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [title, setTitle] = useState("");
  const [sequence, setSequence] = useState<number>(1);
  const [duration, setDuration] = useState<number>(10);
  const [isActive, setIsActive] = useState(true);

  // Media States
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  // --- Fetch Data (กรณีโหมดแก้ไข) ---
  useEffect(() => {
    const loadData = async () => {
      if (backdropId) {
        setIsFetching(true);
        try {
          // ⚠️ เรียก API หรือ Server Action ดึงข้อมูลเดิมมาแสดง
          // const data = await getBackdropById(backdropId);
          // if (data) {
          //   setTitle(data.title || "");
          //   setSequence(data.sequence);
          //   setDuration(data.duration);
          //   setIsActive(data.isActive);
          //   setPreviewUrl(data.imageUrl);
          //   // เช็คว่าเป็นวิดีโอหรือรูปภาพจาก URL (เช่น .mp4)
          //   if (data.imageUrl.match(/\.(mp4|webm|mov)$/i)) {
          //     setMediaType("video");
          //   } else {
          //     setMediaType("image");
          //   }
          // }
        } catch (error) {
          toast.error("ดึงข้อมูลไม่สำเร็จ");
        } finally {
          setIsFetching(false);
        }
      } else {
        // โหมดเพิ่มใหม่ รีเซ็ตค่า
        setTitle("");
        setSequence(1);
        setDuration(10);
        setIsActive(true);
        setMediaFile(null);
        setPreviewUrl(null);
        setMediaType(null);
      }
    };
    loadData();
  }, [backdropId]);

  // --- File Handlers ---
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("ขนาดไฟล์ต้องไม่เกิน 50MB");
        return;
      }

      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewUrl && !mediaFile && !backdropId) {
      toast.warning("กรุณาอัปโหลดรูปภาพหรือวิดีโอ");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("organizationId", String(organizationId));
      formData.append("title", title);
      formData.append("sequence", String(sequence));
      formData.append("duration", String(duration));
      formData.append("isActive", String(isActive));

      if (userId) {
        formData.append("userId", String(userId));
      }

      if (mediaFile) {
        formData.append("image", mediaFile);
      }

      if (backdropId) {
        formData.append("id", String(backdropId));
        const res = await updateBackdrop(formData);
        if (res.success) {
          toast.success("แก้ไขโปรโมชั่นสำเร็จ");
          router.refresh();
          stateSheet(false);
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await createBackdrop(formData);
        if (res.success) {
          toast.success(
            backdropId ? "แก้ไขโปรโมชั่นสำเร็จ" : "อัปโหลดและเพิ่มสื่อสำเร็จ",
          );
          setTitle("");
          setSequence(1);
          setDuration(10);
          setIsActive(true);
          setMediaFile(null);
          setPreviewUrl(null);
          setMediaType(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
          stateSheet(false);
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-0 flex flex-col h-full border-l border-zinc-200 dark:border-zinc-800">
      <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-10">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-primary" />
            {backdropId ? "แก้ไขโปรโมชั่น" : "เพิ่มสื่อใหม่"}
          </SheetTitle>
          <SheetDescription>
            กำหนดรูปภาพหรือวิดีโอ ลำดับการโชว์ และระยะเวลาสำหรับหน้าจอลูกค้า
          </SheetDescription>
        </SheetHeader>
      </div>

      {isFetching ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-zinc-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>กำลังดึงข้อมูล...</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col p-6 gap-6"
        >
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ไฟล์รูปภาพ / วิดีโอ <span className="text-red-500">*</span>
            </Label>
            <div
              className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all ${
                previewUrl
                  ? "border-primary/50 bg-primary/5"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
              }`}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <div className="relative w-full h-full p-2">
                    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-200 shadow-sm flex items-center justify-center bg-black">
                      {mediaType === "video" ? (
                        <video
                          src={previewUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain bg-zinc-100 dark:bg-zinc-900"
                        />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-110 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-zinc-500">
                  <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
                  <p className="mb-1 text-sm font-semibold">
                    คลิกเพื่ออัปโหลดไฟล์
                  </p>
                  <p className="text-xs text-zinc-400">
                    PNG, JPG, MP4, WEBM (สูงสุด 10MB)
                  </p>
                  <p className="text-xs text-primary mt-2 font-medium">
                    สัดส่วนที่แนะนำ 16:9 (แนวนอน)
                  </p>
                </div>
              )}
              {/* ✅ ปรับ accept ให้รองรับ video */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, video/mp4, video/webm"
                className="hidden"
                onChange={handleMediaChange}
              />
            </div>
          </div>

          {/* 🌟 ข้อมูลทั่วไป */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-zinc-700 dark:text-zinc-300"
              >
                ชื่อโปรโมชั่น / คำอธิบาย (ไม่บังคับ)
              </Label>
              <Input
                id="title"
                placeholder="เช่น โปรโมชั่นเบียร์ 3 ขวด 199"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white dark:bg-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="sequence"
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  ลำดับการโชว์
                </Label>
                <Input
                  id="sequence"
                  type="number"
                  min={1}
                  value={sequence}
                  onChange={(e) => setSequence(parseInt(e.target.value) || 1)}
                  className="bg-white dark:bg-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="duration"
                  className="text-zinc-700 dark:text-zinc-300"
                >
                  เวลาโชว์ (วินาที)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  className="bg-white dark:bg-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-zinc-700 dark:text-zinc-300">
                สถานะการแสดงผล
              </Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex-1 hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="isActive"
                    checked={isActive}
                    onChange={() => setIsActive(true)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm font-medium">🟢 เปิดแสดงผล</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex-1 hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="isActive"
                    checked={!isActive}
                    onChange={() => setIsActive(false)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm font-medium">⚫ ปิดซ่อนไว้</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex-1"></div>

          <SheetFooter className="pt-6 border-t border-zinc-200 dark:border-zinc-800 pb-safe">
            <div className="flex gap-3 w-full sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => stateSheet(false)}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึกข้อมูล"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      )}
    </SheetContent>
  );
};

export default SettingFormBackdrop;
