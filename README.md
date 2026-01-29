📦 posxAI - Smart Inventory Management
posxAI คือระบบจัดการสต็อกสินค้าอัจฉริยะ (Smart Inventory Management System) ที่สร้างขึ้นด้วย Next.js และ Prisma โดดเด่นด้วยการนำ AI เข้ามาช่วยในการทำงานต่างๆ เช่น การวิเคราะห์ข้อมูลจากใบเสร็จ, การสร้างรูปภาพสินค้า, และการค้นหาข้อมูลด้วยภาษามนุษย์

✨ Features (คุณสมบัติหลัก)
 - ระบบจัดการสต็อก: เพิ่ม, ลบ, แก้ไข, และดูรายการสินค้าในคลัง



🛠️ Tech Stack (เทคโนโลยีที่ใช้)
- Framework: Next.js
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Database ORM: Prisma
- Database: MySql
- AI: Google Gemini API
- File Storage: S3-Compatible Object Storage (DigitalOcean Spaces)
- Form Management: React Hook Form with Zod

🚀 Getting Started (เริ่มต้นใช้งาน)
1. Clone a Repository
- git clone https://github.com/PanumasMosess/posxAI.git
- cd posxAI
2. ติดตั้ง Dependencies
- npm install
3. ตั้งค่า Environment Variables
- DATABASE_URL="mysql://root:@localhost:3306/your_db"
- NODE_ENV="development"
- S3_BUCKET = 'you'
- NEXT_PUBLIC_S3_BUCKET_NAME = 'S3_NAME'
- SECRET_KEY = 'S3_SECRET_KEY'
- KEY = 'S3_KEY'
- ENDPOINT = 'S3_ENDPOINT'
- REGION = 'S3_REGION'
- CDN_IMG = 'S3_CDN_IMG' 
- GOOGLE_CLOUD_API_KEY='GOOGLE_CLOUD_API_KEY'
- OPENAI_API_KEY='OPENAI_API_KEY' (if your use open AI)
- DEEPSEEK_API_KEY='DEEPSEEK_API_KEY'
- GEMINI_API_KEY='GEMINI_API_KEY'
- GEMINI_MODEL='gemini-2.5-flash'  (model gemini)
4. Migrate ฐานข้อมูล
- npx prisma migrate dev
5. (Optional) Seed ข้อมูลเริ่มต้น
- npx prisma db seed

📜 Available Scripts (คำสั่งที่ใช้งานได้)
- npm run dev: รันแอปพลิเคชันในโหมดพัฒนา
- npm run build: สร้าง Production Build
- npm start: รัน Production Server
- npx prisma studio: เปิดหน้าเว็บสำหรับจัดการฐานข้อมูล
- npx prisma migrate dev: อัปเดต Schema ของฐานข้อมูล








