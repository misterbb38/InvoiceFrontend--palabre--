import { useState, useEffect } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import GeneratePDFButtonFile from '../components/GeneratePDFButtonFile'

const AllFileDataTable = () => {
  const [fileData, setFileData] = useState([]) // Stockage des données de fichiers
  const [loading, setLoading] = useState(true) // Indicateur de chargement
  const [error, setError] = useState('') // Stockage des erreurs

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // URL de l'API

  // Fonction pour récupérer toutes les données de fichiers
  const fetchAllFileData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(`${apiUrl}/api/fileData/get-all-file-data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const data = await response.json()
      if (data.status === 'success') {
        setFileData(data.data) // Mettre à jour les données du tableau
      } else {
        setError('Échec de la récupération des données')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Utiliser useEffect pour récupérer les données au chargement du composant
  useEffect(() => {
    fetchAllFileData()
  }, [])

  // Si les données sont en cours de chargement, afficher un indicateur
  if (loading) {
    return <p>Chargement des données...</p>
  }

  // Si une erreur survient, afficher un message d'erreur
  if (error) {
    return <p>Erreur : {error}</p>
  }

  // Si tout est correct, afficher le tableau avec les données
  return (
    <div className="p-4 bg-base-100 min-h-[800px]">
      <NavigationBreadcrumb pageName="Facture" />
      <h3 className="text-lg font-bold mb-4">Liste </h3>
      <div className="divider"></div>
      <table className="table w-full">
        <thead>
          <tr>
            <th className="font-bold text-lg text-base-content">
              Nom du projet
            </th>
            <th className="font-bold text-lg text-base-content">
              Nombre de mots
            </th>
            <th className="font-bold text-lg text-base-content">
              Nombre de pages
            </th>
            <th className="font-bold text-lg text-base-content">
              Total Nbr de mots
            </th>
            <th className="font-bold text-lg text-base-content">
              Total Nbr de pages
            </th>
            <th className="font-bold text-lg text-base-content">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fileData.map((file, index) => (
            <tr key={index}>
              <td>{file.projectName || 'N/A'}</td>
              <td>{file.totalWordCount}</td>
              <td>{file.totalPageCount}</td>
              <td>{file.totalPriceForPages}</td>
              <td>{file.totalPriceForWords}</td>
              <td>
                <GeneratePDFButtonFile file={file} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AllFileDataTable
