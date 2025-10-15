import { useState, useEffect } from "react";
import SmartphoneList from "./SmartphoneList.jsx";
import AjouterSmartphone from "./AjouterSmartphone.jsx";
import DetaillerSmartphone from "./DetaillerSmartphone.jsx";
import EditerSmartphone from "./EditerSmartphone.jsx";

// -------------------------------
// CORRECTION : Utilisez la variable correctement

//const API_BASE = "http://localhost:5000/api/smartphones";
const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/smartphones`;
// -------------------------------

function Classe() {
  const [smartphones, setSmartphones] = useState([]);
  const [section, setSection] = useState("list"); // list | add | detail | edit
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [editingPhone, setEditingPhone] = useState(null);
  const [search, setSearch] = useState(""); // état pour la recherche

  // Fonction pour charger les smartphones depuis le backend
  const getSmartphones = async () => {
    try {
      console.log("Tentative de connexion à:", API_BASE); // Pour debug
      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      const data = await res.json();
      setSmartphones(data);
    } catch (err) {
      console.error("Erreur fetch:", err);
      alert(`Erreur de connexion: ${err.message}`);
    }
  };

  // Charger au démarrage
  useEffect(() => {
    getSmartphones();
  }, []);

  // Ajouter smartphone
  const ajouterSmartphone = async (phone) => {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phone),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }
      
      await getSmartphones(); // recharge depuis la base
      setSection("list");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout: " + err.message);
    }
  };

  // Supprimer smartphone
  const supprimer = async (id) => {
    const code = prompt("Entrez le code de suppression :");
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "x-delete-code": code,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erreur : ${error.message}`);
        return;
      }

      await getSmartphones(); // recharge depuis la base
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // Voir détail - CORRIGÉ avec meilleur debug
  const voirDetail = async (phone) => {
    try {
      // Utilise _id pour MongoDB (prioritaire)
      const id = phone._id || phone.id;
      console.log("ID utilisé pour détail:", id, "Phone:", phone);
      
      const res = await fetch(`${API_BASE}/${id}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur détail - réponse:", res.status, errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Détails reçus:", data);
      setSelectedPhone(data);
      setSection("detail");
    } catch (err) {
      console.error("Erreur détail complète:", err);
      alert("Erreur lors du chargement des détails: " + err.message);
    }
  };

  // Préparer édition
  const editPhone = (phone) => {
    setEditingPhone(phone);
    setSection("edit");
  };

  // Sauvegarder édition - CORRIGÉ avec meilleur debug
  const sauvegarderEdition = async (updatedPhone) => {
    try {
      const id = updatedPhone._id || updatedPhone.id;
      console.log("Édition - ID:", id, "Data:", updatedPhone);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPhone),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue'}`);
      }
      
      await getSmartphones(); // recharge depuis la base
      setSection("list");
      setEditingPhone(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification: " + err.message);
    }
  };

  // Liste filtrée côté affichage (pas côté base)
  const filteredSmartphones = smartphones.filter((p) => {
    const nom = p.nom || "";
    const marque = p.marque || "";
    return (
      nom.toLowerCase().includes(search.toLowerCase()) ||
      marque.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between bg-blue-800 text-white">
        {/* Logo à gauche */}
        <div className="flex items-center gap-2 font-bold text-xl">
          <img
            src="images/logo.jpeg"
            alt="Logo"
            className="w-20 h-20 rounded-full object-cover"
          />
          Gestion Smartphones
        </div>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par nom ou marque..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 rounded text-black w-80"
        />

        {/* Bouton ajouter */}
        <button
          onClick={() => setSection("add")}
          className="hover:bg-blue-600 px-4 py-2 rounded"
        >
          Ajouter smartphone
        </button>
      </div>

      {/* Contenu dynamique */}
      {section === "list" && (
        <SmartphoneList
          smartphones={filteredSmartphones}
          onSelect={voirDetail}
          supprimer={supprimer}
          onAdd={() => setSection("add")}
        />
      )}

      {section === "add" && (
        <AjouterSmartphone
          ajouterSmartphone={ajouterSmartphone}
          onCancel={() => setSection("list")}
        />
      )}

      {section === "detail" && selectedPhone && (
        <DetaillerSmartphone
          phone={selectedPhone}
          onCancel={() => setSection("list")}
          editPhone={editPhone}
        />
      )}

      {section === "edit" && editingPhone && (
        <EditerSmartphone
          phone={editingPhone}
          onSave={sauvegarderEdition}
          onCancel={() => {
            setSection("list");
            setEditingPhone(null);
          }}
        />
      )}
    </div>
  );
}

export default Classe;