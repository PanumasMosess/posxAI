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
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    surname: string;
    status: string;
    login_fail: number;
    birthday: Date;
    position_id: number;
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
  }
}
