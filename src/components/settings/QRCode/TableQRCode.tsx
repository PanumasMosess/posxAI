"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import {
  QrCode as QrIcon,
  Copy,
  Check,
  Loader2,
  Printer,
  RefreshCcw,
} from "lucide-react";
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
import { printTableQR } from "@/lib/printers/qz-service-tableqrcode";
import { toast } from "react-toastify";
import qz from "qz-tray";
import {
  getCertContentFromS3,
  signDataWithS3Key,
} from "@/lib/actions/actionIndex";

interface TableQRActionProps {
  tableId: number;
  tableName: string;
  organizationId: number;
}

export const TableQRAction = ({
  tableId,
  tableName,
  organizationId,
}: TableQRActionProps) => {
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);

  const isConnecting = useRef(false);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  const initQZSecurity = () => {
    qz.security.setCertificatePromise((resolve: any, reject: any) => {
      getCertContentFromS3(`digital-certificate_${organizationId}.txt`)
        .then((res) => {
          if (res.success && res.data) resolve(res.data);
          else reject("Load Cert Failed");
        })
        .catch(reject);
    });

    qz.security.setSignaturePromise((toSign: string) => {
      return function (resolve: any, reject: any) {
        signDataWithS3Key(toSign, organizationId.toString())
          .then((res) => {
            if (res.success && res.data) resolve(res.data);
            else reject("Sign Failed");
          })
          .catch(reject);
      };
    });
  };

const fetchPrinters = async () => {
   
    if (isLoadingPrinters) return;
    setIsLoadingPrinters(true);

    try {
      initQZSecurity();

      if (!qz.websocket.isActive()) {
        try {
          await qz.websocket.connect();
        } catch (err: any) {
         
          if (err.message && err.message.includes("Waiting for previous disconnect")) {
           
             await new Promise(resolve => setTimeout(resolve, 1000));         
             if (!qz.websocket.isActive()) {
                await qz.websocket.connect();
             }
          } else {
             
             try { 
               await qz.websocket.disconnect(); 
             } catch (e) {}
             
             await new Promise(resolve => setTimeout(resolve, 500));
             await qz.websocket.connect();
          }
        }
      }

      let foundPrinters: string[] = [];
      try {
        foundPrinters = await qz.printers.find();
      } catch (err: any) {
        console.warn("Stale connection detected. Reconnecting...", err);

        if (qz.websocket.isActive()) {
          try { await qz.websocket.disconnect(); } catch (e) {}
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        await qz.websocket.connect();
        foundPrinters = await qz.printers.find();
      }
      
      setPrinters(foundPrinters);
      if (!selectedPrinter) {
        try {
          const defaultPrinter = await qz.printers.getDefault();
          setSelectedPrinter(defaultPrinter);
        } catch (e) {
          if (foundPrinters.length > 0) setSelectedPrinter(foundPrinters[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching printers:", err);
    } finally {
      setIsLoadingPrinters(false);
    }
  };

  useEffect(() => {
    if (mounted && organizationId) {
      const timer = setTimeout(() => {
        fetchPrinters();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mounted, organizationId]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <QrIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }
  const qrUrl = `${origin}/orders?table=${tableId}&organizationId=${organizationId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintQR = async () => {
    if (!selectedPrinter) {
      toast.error("กรุณาเลือกเครื่องพิมพ์ก่อน");
      return;
    }
    setIsPrinting(true);
    const qrData = {
      url: qrUrl,
      tableName: tableName,
      printerName: selectedPrinter,
    };

    const result = await printTableQR(qrData, organizationId);

    if (result.success) {
      toast.success("พิมพ์เรียบร้อย");
      setIsPrinting(false);
    } else {
      toast.error(result.message);
      setIsPrinting(false);
    }
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

            <div className="flex gap-2 items-center">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                disabled={isLoadingPrinters}
              >
                <option
                  value=""
                  disabled
                  className="bg-background text-foreground"
                >
                  -- เลือกเครื่องพิมพ์ --
                </option>
                {printers.map((p) => (
                  <option
                    key={p}
                    value={p}
                    className="bg-background text-foreground"
                  >
                    {p}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-input bg-background hover:bg-accent hover:text-accent-foreground"
                onClick={fetchPrinters}
                title="ค้นหาเครื่องพิมพ์ใหม่"
                disabled={isLoadingPrinters}
              >
                <RefreshCcw
                  className={`h-4 w-4 text-foreground ${
                    isLoadingPrinters ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 border-black/10 hover:bg-zinc-100"
              onClick={handlePrintQR}
              disabled={isPrinting}
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังส่งคำสั่ง...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  พิมพ์ QR (Thermal 80mm)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
