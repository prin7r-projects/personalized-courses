import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isOperator: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isOperator?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isOperator?: boolean;
  }
}
