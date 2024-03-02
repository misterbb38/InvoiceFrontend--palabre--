import { useState } from 'react'

function AddarticletForm() {
  const [reference, setReference] = useState('')
  const [prixUnitaire, setPrixUnitaire] = useState('')
  const [designation, setDesignation] = useState('')
  const [isLoading, setIsLoading] = useState(false) // État pour le chargement
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Commencer le chargement
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token

    try {
      const response = await fetch(`${apiUrl}/api/produit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference, prixUnitaire, designation }),
      })

      if (response.ok) {
        setToastMessage('article ajouté avec succès')
        setIsSuccess(true)

        setReference('')
        setPrixUnitaire('')
        setDesignation('')
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout du article")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false) // Arrêter le chargement une fois la requête terminée
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium base-content">Ref</label>
          <br />
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            className="w-80 mt-2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Designation
          </label>
          <br />
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
            className="w-80 mt-2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Prix unitaire
          </label>
          <br />
          <input
            type="number"
            value={prixUnitaire}
            onChange={(e) => setPrixUnitaire(e.target.value)}
            className="w-80 mt-2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        <button type="submit" className="mt-2 mb-2 btn btn-primary">
          Ajouter l'article
        </button>
      </form>
    </>
  )
}

export default AddarticletForm
