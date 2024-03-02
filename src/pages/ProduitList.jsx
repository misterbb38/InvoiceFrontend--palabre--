import { useEffect, useState } from 'react'
import EditProduitButton from '../components/EditProduitButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function ProduitList() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(false) // Ajout d'un état pour le chargement
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour charger les produits
  const fetchProduits = async () => {
    setLoading(true) // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/produit`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setProduits(data.data)
      } else {
        console.error('Failed to fetch produits')
      }
    } catch (error) {
      console.error('Error fetching produits:', error)
    } finally {
      setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  }
  // Utilisez useEffect pour charger les produits au montage du composant
  useEffect(() => {
    fetchProduits()
  }, [])

  // Définir refreshproduits comme un appel à fetchproduits pour recharger les données
  const refreshProduits = () => {
    fetchProduits()
  }

  // Fonction pour supprimer un produit
  const deleteProduit = async (produitId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/produit/${produitId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // Rafraîchir la liste des produits après la suppression
        fetchProduits()
      } else {
        console.error('Failed to delete produit')
      }
    } catch (error) {
      console.error('Error deleting produit:', error)
    }
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Article" />
      <div className="divider"></div>
      {loading ? (
        <div className="loading loading-spinner text-primary">
          <div className="loader">Chargement...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content">Ref</th>
                <th className="font-bold text-lg text-base-content">
                  Designation
                </th>
                <th className="font-bold text-lg text-base-content">
                  {' '}
                  prixUnitaire
                </th>

                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((produit) => (
                <tr key={produit._id}>
                  <td>{produit.reference}</td>
                  <td>{produit.designation}</td>
                  <td>{produit.prixUnitaire}</td>

                  <td>
                    <div className="flex justify-around space-x-1">
                      <EditProduitButton
                        produitId={produit._id}
                        onproduitUpdated={refreshProduits}
                      />
                      <button
                        className="btn btn-error"
                        onClick={() => deleteProduit(produit._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProduitList
