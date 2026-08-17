"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getBookingSettingsAction,
  updateBookingSettings,
  uploadStoreLayoutAction,
} from "@/lib/actions/actionTableBooking";
import { toast } from "react-toastify";
import { ImagePlus, X, Settings, Loader2 } from "lucide-react";

interface SettingBookingConfigProps {
  organizationId: number;
  isOpen: boolean;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const SettingBookingConfig = ({
  organizationId,
  isOpen,
  onClose,
}: SettingBookingConfigProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    promptpayNumber: "",
    promptpayName: "",
    baseDepositAmount: 20,
    storeLayoutUrl: "",
  });

  useEffect(() => {
    if (isOpen && organizationId) {
      const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const res = await getBookingSettingsAction(organizationId);
          if (res.success && res.data) {
            setFormData({
              promptpayNumber: res.data.promptpayNumber || "",
              promptpayName: res.data.promptpayName || "",
              baseDepositAmount: res.data.baseDepositAmount || 20,
              storeLayoutUrl: res.data.storeLayoutUrl || "",
            });
            setPreviewUrl(res.data.storeLayoutUrl || null);
          }
        } catch (error) {
          console.error("Failed to load settings");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSettings();
    }
  }, [isOpen, organizationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "baseDepositAmount" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, storeLayoutUrl: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let currentImageUrl = formData.storeLayoutUrl;

      if (selectedFile) {
        toast.info("กำลังอัปโหลดรูปภาพ...");
        const base64Data = await fileToBase64(selectedFile);
        const uploadRes = await uploadStoreLayoutAction(base64Data);

        if (!uploadRes.success || !uploadRes.url) {
          throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
        }
        currentImageUrl = uploadRes.url;
      } else if (!previewUrl) {
        currentImageUrl = "";
      }

      const finalData = {
        ...formData,
        storeLayoutUrl: currentImageUrl,
      };

      const result = await updateBookingSettings(organizationId, finalData);

      if (result.success) {
        toast.success(`บันทึกการตั้งค่าเรียบร้อยแล้ว!`);
        onClose();
        router.refresh();
      } else {
        toast.error(`เกิดข้อผิดพลาดในการบันทึก!`);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-white/20 dark:border-zinc-700/50 bg-white dark:bg-zinc-950 shadow-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full transition disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <Settings className="text-amber-500" /> ตั้งค่าระบบการจอง & รับมัดจำ
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-zinc-400 text-sm">กำลังโหลดข้อมูลตั้งค่า...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ===================================== */}
            {/* อัปโหลดรูปภาพแผนผังร้าน (จัดตรงกลาง) */}
            {/* ===================================== */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-4 text-left">
                แผนผังร้าน (Store Layout)
              </label>

              <div className="w-full flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative w-full max-w-md rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mx-auto shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Store Layout"
                      className="w-full h-auto object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full transition shadow-sm"
                      title="ลบรูปภาพ"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition mx-auto">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <ImagePlus className="w-10 h-10 mb-3 text-zinc-400" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-amber-500">
                          คลิกเพื่ออัปโหลด
                        </span>{" "}
                        รูปแผนผังร้าน
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        PNG, JPG, WEBP
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                <p className="text-xs text-zinc-500 mt-3 text-center w-full">
                  * รูปนี้จะถูกนำไปแสดงในขั้นตอนที่ลูกค้าเลือกโต๊ะ (Step 2)
                </p>
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* ===================================== */}
            {/* ข้อมูลพร้อมเพย์ */}
            {/* ===================================== */}
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                ชื่อบัญชีรับเงิน (แสดงบนหน้า QR Code)
              </label>
              <input
                type="text"
                name="promptpayName"
                value={formData.promptpayName}
                onChange={handleChange}
                placeholder="เช่น นาย สมชาย ใจดี"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition text-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                เบอร์พร้อมเพย์ / เลขบัตรประชาชน
              </label>
              <input
                type="text"
                name="promptpayNumber"
                value={formData.promptpayNumber}
                onChange={handleChange}
                placeholder="08X-XXX-XXXX"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition text-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                ยอดมัดจำเริ่มต้น (บาท)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="baseDepositAmount"
                  value={formData.baseDepositAmount}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition text-zinc-800 dark:text-zinc-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                  THB
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-300 font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white dark:text-zinc-950 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingBookingConfig;