import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'public/data.json');

export async function POST(request: Request) {
  const body = await request.json();
  const { email, prenom, nom, dateDeNaissance, adresse, numeroDeTelephone } = body;

  
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const userExists = data.users.some((user: any) => user.email === email);

  if (userExists) {
    return NextResponse.json({ error: 'Utilisateur déjà enregistré.' }, { status: 400 });
  }


  data.users.push({
    email,
    prenom,
    nom,
    dateDeNaissance,
    adresse,
    numeroDeTelephone,
  });


  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

  return NextResponse.json({ message: 'Utilisateur enregistré avec succès.' }, { status: 200 });
}
