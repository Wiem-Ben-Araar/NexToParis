import { authOptions } from "../../../lib/authOptions";
import UpdateProfileClient from "./UpdateProfileClient"; 
import { getServerSession } from "next-auth/next"; 
import { NextResponse } from 'next/server';

export default async function UpdateProfilePage() {
  // Fetch session data on the server
  const session = await getServerSession(authOptions);


  if (!session) {
    return NextResponse.redirect('/login'); 
  }

 
  return <UpdateProfileClient session={session} />;
}
