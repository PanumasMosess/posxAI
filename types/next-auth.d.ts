import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      surname: string;
      status: string;
      login_fail: number;
      birthday: Date;
      position_id: number;
      organizationId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    surname: string;
    status: string;
    login_fail: number;
    birthday: Date;
    position_id: number;
    organizationId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    surname: string;
    image: string;
    status: string;
    login_fail: number;
    birthday: Date;
    organizationId: number | null;
  }
}
