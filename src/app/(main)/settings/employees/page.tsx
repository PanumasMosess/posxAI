import { auth } from "@/auth";
import SettingEmployeePage from "@/components/settings/employees/SettingEmployeePage";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  const userId = session?.user?.id ? parseInt(session.user.id) : 0;
  const organizationId = session?.user.organizationId ?? 0;

  const itemsData = await prisma.employees.findMany({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const itemsDataPosition = await prisma.posiotion.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const itemsDataPermission = await prisma.permission.findMany({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const itemsDataMember = await prisma.member.findMany({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const itemsDataEmployeePin = await prisma.employeepin.findMany({
    where: {
      organizationId: organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const relatedData = {
    positions: itemsDataPosition,
    members: itemsDataMember,
    employeePins: itemsDataEmployeePin,
    permissions: itemsDataPermission,
  };

  return (
    <SettingEmployeePage
      initialItems={itemsData}
      relatedData={relatedData}
      userId={userId}
      organizationId={organizationId}
    ></SettingEmployeePage>
  );
};

export default page;
