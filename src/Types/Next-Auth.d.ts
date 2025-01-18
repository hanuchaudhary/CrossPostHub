import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface User extends DefaultUser {
        
        id?: string;
        username?: string;
    }

    interface Session extends DefaultSession {
        user: {
            id?: string;
            username?: string;
        } & DefaultSession["user"];
    }
}