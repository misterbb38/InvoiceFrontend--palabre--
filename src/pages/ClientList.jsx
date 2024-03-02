import { useEffect, useState } from 'react'
import EditClientButton from '../components/EditClientButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'

function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false) // Ajout d'un état pour le chargement
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour charger les clients
  const fetchClients = async () => {
    setLoading(true) // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/client`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setClients(data.data)
      } else {
        console.error('Failed to fetch clients')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  }
  // Utilisez useEffect pour charger les clients au montage du composant
  useEffect(() => {
    fetchClients()
  }, [])

  // Définir refreshClients comme un appel à fetchClients pour recharger les données
  const refreshClients = () => {
    fetchClients()
  }

  // Fonction pour supprimer un client
  const deleteClient = async (clientId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/client/${clientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // Rafraîchir la liste des clients après la suppression
        fetchClients()
      } else {
        console.error('Failed to delete client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
    }
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Client" />
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
                <th className="font-bold text-lg text-base-content">Nom</th>
                <th className="font-bold text-lg text-base-content">Email</th>
                <th className="font-bold text-lg text-base-content">Adresse</th>
                <th className="font-bold text-lg text-base-content">
                  Téléphone
                </th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.address}</td>
                  <td>{client.telephone}</td>
                  <td>
                    <div className="flex justify-around space-x-1">
                      <EditClientButton
                        clientId={client._id}
                        onClientUpdated={refreshClients}
                      />
                      <button
                        className="btn btn-error"
                        onClick={() => deleteClient(client._id)}
                      >
                        Supprimer
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

export default ClientList
