function Smartphone({ smartphone, onSelect, supprimer }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap text-gray-900 border-b border-gray-200">
        {smartphone.id || smartphone._id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
        <div 
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={() => onSelect(smartphone)}
        >
          {smartphone.nom}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-700 border-b border-gray-200">
        {smartphone.prix} €
      </td>
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
        <div className="flex space-x-2">
          {/* Bouton Voir Détails */}
          <button
            onClick={() => onSelect(smartphone)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
          >
            Voir détails
          </button>
          
          {/* Bouton Supprimer - CORRIGÉ */}
          <button
            onClick={() => supprimer(smartphone)}  // ✅ Envoie l'objet complet
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
}

export default Smartphone;