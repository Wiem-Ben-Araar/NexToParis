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
      clientId: "Ov23lidlDeg3dUqvwQpZ",
      clientSecret: "1f6c291d04a38dcd68fbf71150d315afb60565a1",
    }),
    GoogleProvider({
      clientId: "226389726594-fuuff9p3e3trhqppjt4mpmmvivu5jh97.apps.googleusercontent.com",
      clientSecret: "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",
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
