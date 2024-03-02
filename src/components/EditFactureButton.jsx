import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditFactureButton({ factureId, onFactureUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientTelephone: '',
    items: [],
    date: '',
    total: 0,
    type: '',
    status: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal) {
      const fetchFactureData = async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'))
          const token = userInfo?.token
          const response = await fetch(`${apiUrl}/api/invoice/${factureId}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
              'Content-Type': 'application/json',
            },
          })
          const data = await response.json()
          if (data.success) {
            setFormData({
              clientName: data.data.client.name,
              clientAddress: data.data.client.address,
              clientEmail: data.data.client.email,
              clientTelephone: data.data.client.telephone,
              items: data.data.items,
              date: new Date(data.data.date).toISOString().split('T')[0],
              total: data.data.total,
              type: data.data.type,
              status: data.data.status,
            })
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de la facture:', error)
        }
      }
      fetchFactureData()
    }
  }, [showModal, factureId])

  const handleChange = (e, index) => {
    if (e.target.name.startsWith('item-')) {
      const items = [...formData.items]
      const itemKey = e.target.name.split('-')[1] // ex: "ref", "description"
      items[index][itemKey] = e.target.value

      // Calcul automatique du total pour l'article
      if (itemKey === 'quantity' || itemKey === 'price') {
        const quantity = items[index].quantity || 0
        const price = items[index].price || 0
        items[index].total = quantity * price
      }

      setFormData({ ...formData, items })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }
  }

  const validateForm = () => {
    let errors = {}

    // Validation des champs selon les règles du modèle
    if (!formData.clientName)
      errors.clientName = 'Le nom du client est obligatoire'
    if (!formData.clientAddress)
      errors.clientAddress = "L'adresse du client est obligatoire"
    if (!formData.clientTelephone)
      errors.clientTelephone = 'Le numéro du client est obligatoire'

    if (!formData.type)
      errors.clientTelephone = 'Le numéro du client est obligatoire'

    formData.items.forEach((item, index) => {
      if (!item.ref)
        errors[`item-ref-${index}`] = 'La référence est obligatoire'
      if (!item.description)
        errors[`item-description-${index}`] = 'La description est obligatoire'
      if (item.quantity <= 0)
        errors[`item-quantity-${index}`] =
          'La quantité ne peut pas être négative ou egal a 0'
      if (item.price < 0)
        errors[`item-price-${index}`] = 'Le prix ne peut pas être négatif'
      if (!item.total)
        errors[`item-total-${index}`] = 'Le total est obligatoire'
    })

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/invoice/${factureId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            client: {
              name: formData.clientName,
              address: formData.clientAddress,
              email: formData.clientEmail,
              telephone: formData.clientTelephone,
            },
            items: formData.items,
            date: formData.date,

            type: formData.type,
            status: formData.status,
          }),
        })
        const data = await response.json()
        if (data.success) {
          setShowModal(false)
          onFactureUpdated()
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error)
      }
    }
  }

  const renderError = (fieldName) => {
    return (
      formErrors[fieldName] && (
        <div className="text-red-500 text-xs">{formErrors[fieldName]}</div>
      )
    )
  }

  const handleDeleteItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: updatedItems })
  }

  // Modèle pour un nouvel article
  const newArticleModel = {
    ref: '',
    description: '',
    quantity: 1,
    price: 0,
    total: 0,
  }

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, newArticleModel] })
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <form onSubmit={handleSubmit}>
              {/* Champs du client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom du client</span>
                </label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Nom du client"
                />
                {renderError('clientName')}
              </div>

              {/* Champ Adresse du client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Adresse du client</span>
                </label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  placeholder="Adresse du client"
                />
                {renderError('clientAddress')}
              </div>

              {/* Champ Email du client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email du client</span>
                </label>
                <input
                  className="input input-bordered"
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="Email du client"
                />
                {renderError('clientEmail')}
              </div>

              {/* Sélecteur de statut après le champ Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Statut de la facture</span>
                </label>
                <select
                  className="select select-bordered select-lg w-full max-w-xs"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Attente">En attente</option>
                  <option value="Payée">Payée</option>
                  <option value="Annullée">Annulée</option>
                </select>
                {renderError('status')}
              </div>

              {/* Champ Téléphone du client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Téléphone du client</span>
                </label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="clientTelephone"
                  value={formData.clientTelephone}
                  onChange={handleChange}
                  placeholder="Téléphone du client"
                />
                {renderError('clientTelephone')}
              </div>

              {/* ... Autres champs et gestion des articles avec affichage des erreurs */}
              {/* ... Gestion des articles */}
              {formData.items.map((item, index) => (
                <div key={index} className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">
                      Article {index + 1}
                    </span>
                  </label>
                  <label className="label">
                    <span className="label-text">Référence</span>
                  </label>
                  <input
                    className="input input-bordered my-1"
                    type="text"
                    name={`item-ref-${index}`}
                    value={item.ref}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Référence"
                  />
                  {renderError(`item-ref-${index}`)}
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <input
                    className="input input-bordered my-1"
                    type="text"
                    name={`item-description-${index}`}
                    value={item.description}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Description"
                  />
                  {renderError(`item-description-${index}`)}

                  <label className="label">
                    <span className="label-text">Quantité</span>
                  </label>
                  <input
                    className="input input-bordered my-1"
                    type="number"
                    name={`item-quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Quantité"
                  />
                  {renderError(`item-quantity-${index}`)}
                  <label className="label">
                    <span className="label-text">Prix unitaire</span>
                  </label>
                  <input
                    className="input input-bordered my-1"
                    type="number"
                    name={`item-price-${index}`}
                    value={item.price}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Prix unitaire"
                  />
                  {renderError(`item-price-${index}`)}
                  <label className="label">
                    <span className="label-text">Total</span>
                  </label>
                  <input
                    className="input input-bordered my-1"
                    type="number"
                    name={`item-total-${index}`}
                    value={item.total}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Total"
                    disabled // Rendre le champ grisé et non modifiable
                  />
                  {renderError(`item-total-${index}`)}
                  {/* Bouton de suppression */}
                  <button
                    className="btn btn-error btn-xs ml-2 my-1"
                    onClick={() => handleDeleteItem(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                className="btn btn-primary btn-xs ml-2 my-1"
                onClick={handleAddItem}
              >
                Ajouter un nouveau article
              </button>

              <div className="modal-action">
                <button className="btn btn-primary">Enregistrer</button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div className="alert alert-success">
            <span>Modification réussie.</span>
          </div>
        </div>
      )}
    </>
  )
}

EditFactureButton.propTypes = {
  factureId: PropTypes.string.isRequired,
  onFactureUpdated: PropTypes.func.isRequired,
}

export default EditFactureButton
