export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

      <p className="text-lg font-medium text-gray-500 animate-pulse">
        กำลังจัดเตรียมข้อมูล...
      </p>
    </div>
  );
}
