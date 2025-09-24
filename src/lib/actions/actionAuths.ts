"use server";

import { SignInSchema } from "../formValidationSchemas";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export const verifyCredentials = async (finalData: SignInSchema) => {
  try {
    const username = finalData.username;
    const password = finalData.password;
    const result = await signIn("credentials", {
      username,
      password,
      redirectTo: "/home",
    });

    return result;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Invalid credentials",
          };
        default:
          return {
            message: "Something went wrong.",
          };
      }
    }
    throw error;
  }
};

export const handleSignOut = async () => {
  await signOut({ redirectTo: "/" });
};

export const googleLogin = async () => {
  const result = await signIn("google", { redirectTo: "/home" });
};
