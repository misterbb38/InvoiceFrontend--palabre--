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
    currency: 'CFA', // Champ devise existant
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
              currency: data.data.currency || 'CFA', // Récupération de la devise
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
    if (typeof index === 'number') {
      // Gestion des champs des articles
      const items = [...formData.items]
      const target = e.target
      const name = target.name
      const value = target.value

      if (name === 'category') {
        items[index].category = value
      } else {
        items[index][name] = value

        // Calcul automatique du total de l'article
        if (name === 'quantity' || name === 'price') {
          const quantity = parseFloat(items[index].quantity) || 0
          const price = parseFloat(items[index].price) || 0
          items[index].total = quantity * price
        }
      }
      setFormData({ ...formData, items })
    } else {
      // Gestion des autres champs
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

    if (!formData.type) errors.type = 'Le type de document est obligatoire'

    if (!formData.currency) errors.currency = 'La devise est obligatoire'

    formData.items.forEach((item, index) => {
      if (!item.ref)
        errors[`item-ref-${index}`] = 'La référence est obligatoire'
      if (!item.description)
        errors[`item-description-${index}`] = 'La description est obligatoire'
      if (item.quantity <= 0)
        errors[`item-quantity-${index}`] =
          'La quantité ne peut pas être négative ou égale à 0'
      if (item.price < 0)
        errors[`item-price-${index}`] = 'Le prix ne peut pas être négatif'
      if (!item.total && item.total !== 0)
        errors[`item-total-${index}`] = 'Le total est obligatoire'
      if (!item.category)
        errors[`item-category-${index}`] = 'La catégorie est obligatoire'
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
            currency: formData.currency,
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
    category: 'Traduction', // Catégorie par défaut
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
          <div className="modal-box max-w-3xl">
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

              {/* Adresse du client */}
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

              {/* Email du client */}
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

              {/* Téléphone du client */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Téléphone du client</span>
                </label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="clientTelephone"
                  value={formData.clientTelephone}
                  onChange={handleChange}
                  placeholder="Téléphone du client"
                />
                {renderError('clientTelephone')}
              </div>

              {/* Champ Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  className="select select-bordered"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionnez un type --</option>
                  <option value="facture">Facture</option>
                  <option value="devis">Devis</option>
                </select>
                {renderError('type')}
              </div>

              {/* Champ Devise */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Devise</span>
                </label>
                <select
                  className="select select-bordered"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="CFA">CFA</option>
                  <option value="euro">Euro</option>
                  <option value="dollar">Dollar</option>
                </select>
                {renderError('currency')}
              </div>

              {/* Champ Statut */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Statut de la facture</span>
                </label>
                <select
                  className="select select-bordered"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionnez un statut --</option>
                  <option value="Attente">En attente</option>
                  <option value="Payée">Payée</option>
                  <option value="Annullée">Annulée</option>
                </select>
                {renderError('status')}
              </div>

              {/* Gestion des articles */}
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="form-control border p-4 my-2 rounded-md"
                >
                  <label className="label">
                    <span className="label-text font-bold">
                      Article {index + 1}
                    </span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text">Référence</span>
                      </label>
                      <input
                        className="input input-bordered my-1 w-full"
                        type="text"
                        name="ref"
                        value={item.ref}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Référence"
                      />
                      {renderError(`item-ref-${index}`)}
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <input
                        className="input input-bordered my-1 w-full"
                        type="text"
                        name="description"
                        value={item.description}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Description"
                      />
                      {renderError(`item-description-${index}`)}
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Quantité</span>
                      </label>
                      <input
                        className="input input-bordered my-1 w-full"
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Quantité"
                      />
                      {renderError(`item-quantity-${index}`)}
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Prix unitaire</span>
                      </label>
                      <input
                        className="input input-bordered my-1 w-full"
                        type="number"
                        name="price"
                        value={item.price}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Prix unitaire"
                      />
                      {renderError(`item-price-${index}`)}
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Total</span>
                      </label>
                      <input
                        className="input input-bordered my-1 w-full"
                        type="number"
                        name="total"
                        value={item.total}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="Total"
                        disabled // Rendre le champ en lecture seule
                      />
                      {renderError(`item-total-${index}`)}
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text">Catégorie</span>
                      </label>
                      <div className="flex items-center my-1">
                        <label className="mr-4">
                          <input
                            type="radio"
                            name={`category-${index}`}
                            value="Traduction"
                            checked={item.category === 'Traduction'}
                            onChange={(e) =>
                              handleChange(
                                {
                                  target: {
                                    name: 'category',
                                    value: e.target.value,
                                  },
                                },
                                index
                              )
                            }
                          />{' '}
                          Traduction
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`category-${index}`}
                            value="Révision"
                            checked={item.category === 'Révision'}
                            onChange={(e) =>
                              handleChange(
                                {
                                  target: {
                                    name: 'category',
                                    value: e.target.value,
                                  },
                                },
                                index
                              )
                            }
                          />{' '}
                          Révision
                        </label>
                      </div>
                      {renderError(`item-category-${index}`)}
                    </div>
                  </div>
                  {/* Bouton de suppression */}
                  <button
                    className="btn btn-error btn-xs mt-2"
                    type="button"
                    onClick={() => handleDeleteItem(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                className="btn btn-primary btn-sm my-2"
                type="button"
                onClick={handleAddItem}
              >
                Ajouter un nouvel article
              </button>

              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
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
