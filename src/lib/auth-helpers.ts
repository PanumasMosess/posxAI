"use server";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const userSignIn = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  try {
    const user = await prisma.employees.findFirst({
      where: {
        username: username,
        status: "ON",
      },
    });

    if (!user || !user.password) {
      // console.log("User not found or has no password.");
      return null;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        id: user.id.toString(),
        email: user.email ?? "non@mail.co",
        image: user.img ?? "/icon.png",
      };
    }

    // console.log("Password does not match.");
    return null;
  } catch (error) {
    // console.error("Authentication error:", error);
    return null;
  }
};
