import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/logo/logo.png'
import logoRight from '../images/logo2.png'

function GeneratePDFButton({ invoice, currency }) {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
  })

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchUserProfile = async () => {
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      try {
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        console.log(data)
        setUser({
          nom: data.nom || '',
          prenom: data.prenom || '',
          adresse: data.adresse || '',
          email: data.email || '',
          telephone: data.telephone || '',
          devise: data.devise || '',
          logo: data.logo || '', // Initialiser avec le chemin de l'image stockée
          site: data.site || '',
          Type: user.Type || '',
          nomEntreprise: data.nomEntreprise || '',
          couleur: data.couleur || '',
        })
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const getColorValue = (colorName) => {
    const colorMap = {
      rouge: '#FF0000', // Rouge
      vert: '#008000', // Vert
      bleu: '#0000FF', // Bleu
      jaune: '#FFFF00', // Jaune
      orange: '#FFA500', // Orange
      violet: '#800080', // Violet
      rose: '#FFC0CB', // Rose
      marron: '#A52A2A', // Marron
      gris: '#808080', // Gris
      noir: '#000000', // Noir
    }

    return colorMap[colorName.toLowerCase()] || '#000000' // Retourne noir par défaut si la couleur n'est pas trouvée
  }

  // Définition des couleurs de fond basées sur le statut
  const statusColors = {
    Attente: { textColor: '#FFFFFF', fillColor: '#FFA500' }, // Orange avec texte blanc
    Payée: { textColor: '#FFFFFF', fillColor: '#008000' }, // Vert avec texte blanc
    Annullée: { textColor: '#FFFFFF', fillColor: '#FF0000' }, // Rouge avec texte blanc
  }

  // Récupération de la configuration de couleur basée sur le statut
  const { textColor, fillColor } = statusColors[invoice.status]

  const generatePDF = () => {
    const doc = new jsPDF()
    const userColor = getColorValue(user.couleur) // Obtenez la couleur hexadécimale

    const addFooter = () => {
      const footerY = 277 // Y position for footer adjust if needed
      doc.setFillColor(userColor) // Vert clair
      doc.rect(20, footerY, 170, 2, 'F')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Adresse : ${user.adresse} `, 50, footerY + 6)
      doc.text(`E-mail : ${user.email}`, 50, footerY + 12)
      doc.text(
        `Site Web : ${user.site}, Tél : ${user.telephone}`,
        50,
        footerY + 18
      )
    }

    // Ajouter le pied de page à la première page
    addFooter()

    // Ajout des logos et du texte central
    const imgLeft = new Image()
    imgLeft.src = user.logo ? `${apiUrl}/${user.logo.replace(/\\/g, '/')}` : logoLeft
    const imgRight = new Image()
    imgRight.src = logoRight
    // Dimensions originales de l'image
    const imgWidth = imgLeft.width
    const imgHeight = imgLeft.height
    // Largeur maximale pour l'image dans le PDF
    const maxWidth = 30 // Exemple : 35 unités de largeur dans le PDF

    // Calcul du rapport hauteur/largeur de l'image
    const ratio = imgWidth / imgHeight

    // Calcul de la nouvelle hauteur en conservant le rapport hauteur/largeur
    const newHeight = maxWidth / ratio

    // Ajout de l'image au PDF avec les nouvelles dimensions
    // La largeur est définie sur maxWidth et la hauteur est ajustée pour conserver le rapport
    doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, newHeight)
    //doc.addImage(imgLeft, 'PNG', 20, 5, 35, 30)
    // doc.addImage(imgRight, 'PNG', 140, 5, 60, 30)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(userColor)
    doc.text(`${invoice.type}`, 140, 30)
    doc.text(` Nº ${invoice.invoiceNumber}`, 165, 30)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor)
    doc.setFillColor(fillColor)
    // Dessin du rectangle de fond
    // Remplacez les valeurs 140, 30, 35, 10 par les coordonnées et dimensions souhaitées pour le rectangle
    doc.rect(140, 33, 23, 6, 'F')
    doc.text(`${invoice.status}`, 140, 37)
    doc.setTextColor(0, 0, 0)
    // doc.text("Anglais <> Français <> Portugais ", 140, 25)
    doc.setFontSize(14)
    doc.text('', 105, 30, null, null, 'center')

    doc.setFillColor(userColor) //
    doc.rect(20, 40, 170, 2, 'F') // Première ligne verte

    // Informations du client
    let currentY = 47 // Mise à jour pour utiliser currentY pour la position initiale
    doc.setFontSize(12) // Changez la taille à la valeur souhaitée
    doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
    doc.text(` ${invoice.client.name}`, 130, currentY)
    doc.setFontSize(10)
    doc.text(`${invoice.client.address}`, 130, currentY + 5)
    doc.text(`${invoice.client.email}`, 130, currentY + 10)
    doc.text(`${invoice.client.telephone}`, 130, currentY + 15)

    // En-tête de la facture
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
    doc.text(`${user.nomEntreprise}`, 30, currentY)

    doc.setFontSize(10)
    doc.text(`${user.email}`, 30, currentY + 5)
    doc.text(`${user.telephone}`, 30, currentY + 10)
    doc.text(
      `Date: ${new Date(invoice.date).toLocaleDateString()}`,
      30,
      currentY + 15
    )

    // En-tête des articles avec fond vert
    currentY += 25 // Adjust for marginBottom and header height
    doc.setFillColor(userColor)
    doc.rect(20, currentY, 170, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text('Ref', 22, currentY + 8)
    doc.text('Désignation', 42, currentY + 8)
    doc.text('Qte', 112, currentY + 8)
    doc.text('Prix', 138, currentY + 8)
    doc.text('Total', 166, currentY + 8)
    currentY += 20

    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    invoice.items.forEach((item, index) => {
      const itemTextHeight =
        doc.splitTextToSize(item.description, 60).length * 5
      const itemHeight = itemTextHeight + 5 // Ajouter une marge
      if (currentY + itemHeight > 280) {
        doc.addPage()
        currentY = 20 // Réinitialiser la position Y après l'ajout d'une page
        addFooter()
      }
      const textY = currentY + itemHeight / 2 - itemTextHeight / 2
      doc.text(item.ref, 22, textY)
      doc.text(doc.splitTextToSize(item.description, 60), 42, textY)
      doc.text(item.quantity.toString(), 112, textY)
      doc.text(`${item.price.toFixed(2)} ${currency}`, 132, textY)
      doc.text(`${item.total.toFixed(2)} ${currency}`, 162, textY)
      if (index < invoice.items.length - 1) {
        doc.setDrawColor(0)
        doc.line(20, currentY + itemHeight + 2, 190, currentY + itemHeight + 2)
      }
      currentY += itemHeight + 5
    })

    // Vérification pour l'ajout d'une page avant le total et les informations bancaires
    if (currentY > 280) {
      doc.addPage()
      currentY = 20 // Réinitialiser la position Y pour le contenu de la nouvelle page
      addFooter()
    }

    // Total
    doc.setFontSize(12)
    doc.text(
      `MONTANT TOTAL HT: ${invoice.total.toFixed(2)} ${currency}`,
      120,
      currentY
    )

    // Informations bancaires
        currentY += 20 // Espace avant les informations bancaires
        const bankInfo = [
            "COORDONNEES BANCAIRES", "SOCIETE GENERALE", "RELEVE D'IDENTITE BANCAIRE",
            "Titulaire du compte: 01600 POMPIDOU", "Domiciliation: XOF",
            "Code agence: SN011 01016 004000 334878 23", "Devise du compte: SN08 SN011 01016 004000 334878 23",
            "RIB: SGSNSNDAXXX", "IBAN: 0", "BIC-SWIFT: 0"
        ]
        bankInfo.forEach((line, index) => {
          if (currentY > 270) { // Vérification avant chaque ligne pour les informations bancaires
              doc.addPage()
              currentY = 20
              addFooter()
          }

          // Réduire la longueur du rectangle et ajuster la taille de l'écriture
          const rectLength = 70 // Nouvelle longueur du rectangle, ajustez selon les besoins
          const fontSize = 8 // Nouvelle taille de l'écriture, ajustez selon les besoins

          if (index === 0) {
              doc.setFillColor(0, 100, 0)
              doc.rect(20, currentY, rectLength, 5, 'F')
              doc.setFontSize(fontSize)
          } else {
              doc.setFillColor(0, 128, 0)
              doc.rect(20, currentY, rectLength, 5, 'F')
              doc.setFontSize(fontSize)
          }

          doc.setTextColor(255, 255, 255)
          // Assurez-vous que le texte est bien aligné à l'intérieur du rectangle plus petit
          doc.text(line, 22, currentY + 3)
          currentY += 5
      })

    //Dernière ligne verte
    if (currentY > 270) {
      // Encore une vérification avant d'ajouter la ligne finale
      doc.addPage()
      currentY = 20
      addFooter()
    }
    currentY += 20 // Espace avant les informations bancaires
    //doc.setFillColor(144, 238, 144)
    //doc.rect(20, currentY, 170, 2, 'F')
    // doc.setFontSize(10)
    // doc.setTextColor(0, 0, 0)
    // doc.text("Adresse : Sacré Cœur 3, Villa n° 8974 – Code Postal : 11000, Dakar,", 50, currentY + 6)
    // doc.text("E-mail : kebsamadou@gmail.com / amadoukkebe@palabresak2.com", 50, currentY + 12)
    // doc.text("Site Web : www.palabresak2.com, Tél : +221 77 871 25 11", 50, currentY + 18)

    // doc.save(`facture-${invoice._id}.pdf`)
    const blob = doc.output('blob')
    // Créez une URL à partir du blob
    const url = URL.createObjectURL(blob)
    // Ouvrez le PDF dans un nouvel onglet
    window.open(url, '_blank')
    // Optionnel : libérez l'URL du blob après ouverture
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn btn-primary" onClick={generatePDF}>
      <FontAwesomeIcon icon={faFilePdf} />
    </button>

  )
}

GeneratePDFButton.propTypes = {
  invoice: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
}

export default GeneratePDFButton
