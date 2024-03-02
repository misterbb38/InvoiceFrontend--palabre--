import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditProduitButton({ produitId, onproduitUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    reference: '',
    prixUnitaire: '',
    designation: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && produitId) {
      fetchproduitData(produitId)
    }
  }, [showModal, produitId])

  const fetchproduitData = async (produitId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/produit/${produitId}`, {
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
      console.error('Erreur lors de la récupération du produit:', error)
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
    if (!formData.reference.trim()) errors.reference = 'Le ref est obligatoire.'
    if (!formData.prixUnitaire.toString().trim())
      errors.prixUnitaire = 'Le prix unitaire est obligatoire.'
    if (!formData.designation.trim())
      errors.designation = 'La designation est obligatoire.'
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
        const response = await fetch(`${apiUrl}/api/produit/${produitId}`, {
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
          onproduitUpdated() // Rappel pour actualiser la liste des produits
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du produit:', error)
      }
    }
  }

  const renderError = (fieldref) => {
    if (formErrors[fieldref]) {
      return (
        <span className="text-red-500 text-xs">{formErrors[fieldref]}</span>
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
              {/* Champs du formulaire pour éditer un produit */}
              <div className="form-control">
                <label className="label">Ref</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                />
                {renderError('reference')}
              </div>
              <div className="form-control">
                <label className="label">Prix unitaire</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixUnitaire"
                  value={formData.prixUnitaire}
                  onChange={handleChange}
                />
                {renderError('prixUnitaire')}
              </div>
              <div className="form-control">
                <label className="label">designation</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                />
                {renderError('designation')}
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
            Article mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditProduitButton.propTypes = {
  produitId: PropTypes.string.isRequired,
  onproduitUpdated: PropTypes.func.isRequired,
}

export default EditProduitButton
