"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Control, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FormFieldImageUploadProps {
  control: Control<any>;
  name: string;
  label: string;
}

export function FormFieldImageUpload({
  control,
  name,
  label,
}: FormFieldImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
            field.onChange(file);
            setFileType(file.type);

            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
          } else {
            setPreview(null);
            setFileType(null);
          }
        };

        const handleRemoveImage = () => {
          setPreview(null);
          setFileType(null);
          field.onChange(null);
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="w-full flex flex-col items-center gap-4">
                <div
                  className="w-full h-52 rounded-lg border-2 border-dashed flex items-center justify-center bg-primary-foreground relative hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => inputRef.current?.click()}
                >
                  {preview ? (
                    <>
                      {fileType?.startsWith("image/") ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : fileType === "application/pdf" ? (
                        <object
                          data={preview}
                          type="application/pdf"
                          width="100%"
                          height="100%"
                          className="rounded-lg"
                        >
                          <p>เบราว์เซอร์ของคุณไม่รองรับการแสดงผล PDF โดยตรง</p>
                        </object>
                      ) : (
                        <div className="text-center text-gray-500">
                          <p>ไม่สามารถพรีวิวไฟล์ประเภทนี้ได้</p>
                        </div>
                      )}

                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 flex flex-col items-center">
                      <Upload className="h-8 w-8 mb-2" />
                      <p>คลิกเพื่ออัปโหลดรูปภาพหรือ PDF</p>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*, .pdf"
                  ref={inputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
