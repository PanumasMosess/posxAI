"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { QrCode as QrIcon, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableQRActionProps {
  tableId: number;
  tableName: string;
}

export const TableQRAction = ({ tableId, tableName }: TableQRActionProps) => {
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <QrIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  const qrUrl = `${origin}/orders?table=${tableId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="ดู QR Code">
          <QrIcon className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            QR Code โต๊ะ: {tableName}
          </DialogTitle>
          <DialogDescription className="text-center">
            สแกนเพื่อสั่งอาหาร
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* กรอบสีขาวสำหรับ QR Code (เพื่อให้สแกนได้ง่ายใน Dark mode) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-zinc-100">
            <QRCode
              value={qrUrl}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>

          {/* ส่วน Copy Link */}
          <div className="w-full space-y-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="link"
                defaultValue={qrUrl}
                readOnly
                className="h-9 font-mono text-xs"
              />
              <Button
                size="sm"
                className="px-3"
                variant="secondary"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
