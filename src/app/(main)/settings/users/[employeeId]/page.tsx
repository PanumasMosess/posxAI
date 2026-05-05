"use server";
import ProfileClient from "@/components/settings/users/ProfileClient";
import prisma from "@/lib/prisma";
const page = async ({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) => {
  const resolvedParams = await params;
  const targetUserId = parseInt(resolvedParams.employeeId);

  const profileData = await prisma.employeepin.findUnique({
    where: { id: targetUserId },
  });

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  // 2. ดึงข้อมูล Position
  const positionData = await prisma.posiotion.findUnique({
    where: { id: profileData.position_id },
    select: { position_name: true },
  });

  return (
    <ProfileClient profileData={profileData} positionData={positionData} />
  );
};

export default page;
