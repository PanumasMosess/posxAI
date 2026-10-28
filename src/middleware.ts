import { auth } from "@/auth";
import { NextResponse } from "next/server";

// ขยายร่างจาก export { auth as middleware } มาเป็น auth((req) => { ... }) 
// เพื่อให้ระบบล็อกอินทำงานควบคู่กับการดักจับช่องโหว่ได้
export default auth((req) => {
  const requestHeaders = new Headers(req.headers);

  // 🚨 1. ดักจับขาเข้า: ป้องกันการยิง Payload อันตราย (RCE)
  const contentEncoding = requestHeaders.get("content-encoding");
  if (contentEncoding?.includes("br")) {
    return NextResponse.json(
      { error: "Brotli compression is disabled for security reasons." },
      { status: 403 }
    );
  }

  // 🚨 2. ดักจับขาออก: ลบ 'br' ทิ้ง เพื่อหลอก Node.js ว่าเบราว์เซอร์ไม่รองรับ Brotli
  const acceptEncoding = requestHeaders.get("accept-encoding");
  if (acceptEncoding?.includes("br")) {
    const newEncoding = acceptEncoding
      .replace(/\bbr\b,?/g, "")
      .replace(/,\s*$/, "")
      .trim();
    requestHeaders.set("accept-encoding", newEncoding);
  }

  // ปล่อยผ่าน Request ที่ปลอดภัยแล้วให้ทำงานต่อ
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  // matcher ตัวเดิมของคุณ นำมาใช้ได้เลยครับ
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};