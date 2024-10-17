import NextAuth, { NextAuthOptions, User as AdapterUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import fs from "fs";
import path from "path";

interface User {
  name: string | null | undefined;
  email: string;
  image: string | null | undefined;
}

interface ExistingUser {
  nom: string;
  prenom: string;
  email: string;
  image: string | null | undefined;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User | AdapterUser }) {
      const filePath = path.resolve("./public/data.json");

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const userExists = data.users.some(
        (existingUser: ExistingUser) => existingUser.email === user.email
      );

      if (!userExists) {
        const names = user.name ? user.name.split(" ") : [];
        const prenom = names.shift() || "";
        const nom = names.join(" ");

        data.users.push({
          nom: nom || "",
          prenom: prenom || "",
          email: user.email,
          image: user.image || null,
        });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      }

      return true;
    },
  },
};

export default NextAuth(authOptions);
