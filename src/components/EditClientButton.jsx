import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditClientButton({ clientId, onClientUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    telephone: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && clientId) {
      fetchClientData(clientId)
    }
  }, [showModal, clientId])

  const fetchClientData = async (clientId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/client/${clientId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    let errors = {}
    if (!formData.name.trim()) errors.name = 'Le nom est obligatoire.'
    if (!formData.address.trim()) errors.address = "L'adresse est obligatoire."
    if (!formData.telephone.trim())
      errors.telephone = 'Le téléphone est obligatoire.'
    // Ajoutez ici d'autres validations selon vos besoins
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/client/${clientId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          setShowModal(false)
          onClientUpdated() // Rappel pour actualiser la liste des clients
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du client:', error)
      }
    }
  }

  const renderError = (fieldName) => {
    if (formErrors[fieldName]) {
      return (
        <span className="text-red-500 text-xs">{formErrors[fieldName]}</span>
      )
    }
    return null
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
              {/* Champs du formulaire pour éditer un client */}
              <div className="form-control">
                <label className="label">Nom</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {renderError('name')}
              </div>
              <div className="form-control">
                <label className="label">Adresse</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {renderError('address')}
              </div>
              <div className="form-control">
                <label className="label">Email</label>
                <input
                  className="input input-bordered"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {renderError('email')}
              </div>
              <div className="form-control">
                <label className="label">Téléphone</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
                {renderError('telephone')}
              </div>
              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
                </button>
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
        <div className="toast toast-center toast-end">
          <div className="alert alert-success">
            Client mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditClientButton.propTypes = {
  clientId: PropTypes.string.isRequired,
  onClientUpdated: PropTypes.func.isRequired,
}

export default EditClientButton
