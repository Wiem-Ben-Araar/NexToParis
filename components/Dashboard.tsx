"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion"; 

const Dashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <p className="text-gray-500 text-xl">Loading...</p>; 
    }

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' }); 
    };

    const handleUpdateProfile = () => {
        router.push("/update"); 
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/Paris.jpg')" }}>
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center opacity-90">
                <motion.h1 
                    className="text-4xl font-bold mb-6 text-blue-700"
                    initial={{ opacity: 0, translateY: -20 }} 
                    animate={{ opacity: 1, translateY: 0 }} 
                    transition={{ duration: 0.5 }} 
                >
                    Bienvenue à Paris
                </motion.h1>
                {session ? (
                    <>
                        <motion.p
                            className="text-lg text-green-600 mb-4"
                            initial={{ opacity: 0, translateY: -20 }} 
                            animate={{ opacity: 1, translateY: 0 }} 
                            transition={{ duration: 0.5, delay: 0.2 }} 
                        >
                            Bonjour, {session.user?.name}!
                        </motion.p>
                        <motion.button
                            onClick={handleUpdateProfile} 
                            className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-600 transition duration-300 mb-4"
                            whileHover={{ scale: 1.05 }} 
                        >
                            Mettre à jour le profil
                        </motion.button>
                        <motion.button
                            onClick={handleSignOut} 
                            className="bg-red-500 text-white py-2 px-6 rounded-lg shadow hover:bg-red-600 transition duration-300"
                            whileHover={{ scale: 1.05 }} 
                        >
                            Déconnexion
                        </motion.button>
                    </>
                ) : (
                    <div className="text-center">
                        <motion.p
                            className="text-lg text-red-600 mb-4"
                            initial={{ opacity: 0, translateY: -20 }} 
                            animate={{ opacity: 1, translateY: 0 }} 
                            transition={{ duration: 0.5, delay: 0.2 }} 
                        >
                            Vous n'êtes pas connecté.
                        </motion.p>
                        <motion.button
                            onClick={() => signIn("google")}
                            className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-600 transition duration-300 mb-2"
                            whileHover={{ scale: 1.05 }} 
                        >
                            Se connecter avec Google
                        </motion.button>
                        <motion.button
                            onClick={() => signIn("github")}
                            className="bg-gray-800 text-white py-2 px-6 rounded-lg shadow hover:bg-gray-700 transition duration-300"
                            whileHover={{ scale: 1.05 }} 
                        >
                            Se connecter avec GitHub
                        </motion.button>
                    </div>
                )}
                <div className="mt-6">
                    <p className="text-sm text-gray-600">Explorez Paris comme un vrai Parisien!</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
