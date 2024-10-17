"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaCheckCircle } from "react-icons/fa";

const usersData = require("/public/data.json");

const geocodeAddress = async (
  adresse: string
): Promise<{ lat: number; lon: number }> => {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
      adresse
    )}&limit=1`
  );
  if (!response.ok) throw new Error("Erreur lors de l'appel à l'API");
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    const [lon, lat] = data.features[0].geometry.coordinates;
    return { lat, lon };
  }
  throw new Error("Adresse non trouvée ou invalide");
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const UpdateProfileClient = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    prenom: "",
    nom: "",
    dateDeNaissance: "",
    adresse: "",
    numeroDeTelephone: "",
  });

  const [isUpdated, setIsUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const user = usersData.users.find(
            (u: any) => u.email === session?.user?.email
          );
          if (user) {
            setFormData({
              email: user.email || session.user.email || "",
              prenom: user.prenom || "",
              nom: user.nom || "",
              dateDeNaissance: user.dateDeNaissance || "",
              adresse: user.adresse || "",
              numeroDeTelephone: user.numeroDeTelephone || "",
            });
          } else {
            const fullName = session.user.name || "";
            const nameParts = fullName.split(" ");
            const prenom = nameParts[0];
            const nom = nameParts.slice(1).join(" ");

            setFormData({
              email: session.user.email || "",
              prenom: prenom,
              nom: nom,
              dateDeNaissance: "",
              adresse: "",
              numeroDeTelephone: "",
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur :",
            error
          );
        }
      } else if (status === "unauthenticated") {
        router.push("/");
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateFormData = () => {
    const { email, prenom, nom, dateDeNaissance, adresse, numeroDeTelephone } =
      formData;
    const today = new Date();
    const birthDate = new Date(dateDeNaissance);
    const newErrorMessages: string[] = [];

    if (!prenom) newErrorMessages.push("Le prénom est requis.");
    if (!nom) newErrorMessages.push("Le nom est requis.");
    if (!email) newErrorMessages.push("L'email est requis.");
    if (!dateDeNaissance)
      newErrorMessages.push("La date de naissance est requise.");
    if (birthDate > today)
      newErrorMessages.push(
        "La date de naissance ne peut pas être dans le futur."
      );
    if (!adresse) newErrorMessages.push("L'adresse est requise.");
    if (!numeroDeTelephone)
      newErrorMessages.push("Le numéro de téléphone est requis.");

    setErrorMessages(newErrorMessages);
    return newErrorMessages.length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessages([]);
    try {
      if (!validateFormData()) {
        setLoading(false);
        return;
      }

      const user = usersData.users.find(
        (u: any) => u.email === session?.user?.email
      );

      if (
        user &&
        formData.email === user.email &&
        formData.prenom === user.prenom &&
        formData.nom === user.nom &&
        formData.dateDeNaissance === user.dateDeNaissance &&
        formData.adresse === user.adresse &&
        formData.numeroDeTelephone === user.numeroDeTelephone
      ) {
        setErrorMessages([
          "Aucune modification apportée. Profil déjà à jour !",
        ]);
        setIsUpdated(true);
        setLoading(false);
        return;
      }

      const { lat, lon } = await geocodeAddress(formData.adresse);

      const parisLat = 48.8566;
      const parisLon = 2.3522;
      const distance = calculateDistance(lat, lon, parisLat, parisLon);

      if (distance > 50) {
        setErrorMessages([
          "L'adresse doit être située à moins de 50 km de Paris.",
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/updateprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Mise à jour échouée");

      alert(result.message);
      setIsUpdated(true);
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMessages([
        "Une erreur est survenue : " + (error?.message || error),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    router.push("/");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-center">Chargement en cours...</div>
        {/* Ici, vous pouvez ajouter un spinner ou une animation de chargement si souhaité */}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/paris-4.jpg')" }}
    >
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Mettre à jour le profil
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              name="dateDeNaissance"
              value={formData.dateDeNaissance}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="numeroDeTelephone"
              value={formData.numeroDeTelephone}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            />
          </div>
          {errorMessages.length > 0 && (
            <div className="text-red-600 text-sm">
              <ul>
                {errorMessages.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBackHome}
              className="text-orange-500 hover:underline"
            >
              Retour
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 transition duration-200"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
          {isUpdated && (
            <div className="text-green-600 mt-4">
              <FaCheckCircle /> Profil mis à jour avec succès !
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileClient;
