"use client";

import SettingFormPrinter from "@/components/forms/SettingFormPrinter";
import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileBadge,
  FileKey,
  Loader2,
  Plus,
  Printer,
  Search,
  Settings,
  UploadCloud,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { uploadCertToS3 } from "@/lib/actions/actionIndex";
import { toast } from "react-toastify";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  userId: number;
  organizationId: number;
  reationdata: any[];
}
export function Data_table_setting_printers<TData, TValue>({
  columns,
  data,
  userId,
  organizationId,
  reationdata
}: DataTableProps<TData, TValue>) {
  const [openSheetInsertPrinter, setOpenSheetInsertPrinter] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleUploadFiles = async (e: FormEvent) => {
    e.preventDefault();
    if (!certFile && !keyFile) {
      toast.warning("กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    if (certFile) formData.append("cert", certFile);
    if (keyFile) formData.append("key", keyFile);
    formData.append("organizationId", organizationId.toString());

    try {
      const result = await uploadCertToS3(formData);

      if (result.success) {
        toast.success(result.message);
        setOpenUploadDialog(false);
        setCertFile(null);
        setKeyFile(null);
      } else {
        toast.error("ไม่สำเร็จ: " + result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ S3");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
            <Printer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              จัดการ Printers
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ตั้งค่าการเชื่อมต่อและตรวจสอบรายชื่อ Printer ทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="ค้นหา..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700"
                title="ตั้งค่า QZ Tray Certificate"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleUploadFiles}>
                <DialogHeader>
                  <DialogTitle>ตั้งค่า QZ Tray Security</DialogTitle>
                  <DialogDescription>
                    อัปโหลดไฟล์ Digital Certificate และ Private Key
                    เพื่อยืนยันตัวตน (Silent Print)
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label
                      htmlFor="cert-file"
                      className="flex items-center gap-2"
                    >
                      <FileBadge className="h-4 w-4 text-blue-500" />
                      Digital Certificate (.txt)
                    </Label>
                    <Input
                      id="cert-file"
                      type="file"
                      accept=".txt,.crt,.pem"
                      onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-[10px] text-zinc-500">
                      ไฟล์สาธารณะสำหรับยืนยันใบรับรอง
                    </p>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5 mt-2">
                    <Label
                      htmlFor="key-file"
                      className="flex items-center gap-2"
                    >
                      <FileKey className="h-4 w-4 text-amber-500" />
                      Private Key (.txt)
                    </Label>
                    <Input
                      id="key-file"
                      type="file"
                      accept=".txt,.key,.pem"
                      onChange={(e) => setKeyFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-[10px] text-zinc-500">
                      ไฟล์กุญแจส่วนตัว (เก็บรักษาเป็นความลับ)
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "กำลังบันทึก..." : "บันทึกไฟล์"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Sheet
            open={openSheetInsertPrinter}
            onOpenChange={setOpenSheetInsertPrinter}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-zinc-200 text-zinc-700 
                        hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100
                        dark:border-zinc-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่ม Printer
              </Button>
            </SheetTrigger>
            <SettingFormPrinter
              type={"create"}
              currentUserId={userId}
              organizationId={organizationId ?? 1}
              stateSheet={setOpenSheetInsertPrinter}
              stateForm={openSheetInsertPrinter}
              reationData={reationdata}
            />
          </Sheet>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <DataTablePagination table={table} />
      </div>
    </>
  );
}
