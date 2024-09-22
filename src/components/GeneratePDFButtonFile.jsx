import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/logo/logo.png'
import logoRight from '../images/logo2.png'

function GeneratePDFButton({ invoice, currency, file }) {
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

  function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

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
  // const { textColor, fillColor } = statusColors[invoice.status]

  const generatePDF = () => {
    const doc = new jsPDF()
    const userColor = getColorValue(user.couleur) // Obtenez la couleur hexadécimale

    const addFooter = () => {
      const footerY = 277 // Y position for footer adjust if needed
      doc.setFillColor(userColor) // Vert clair
      doc.rect(20, footerY, 170, 2, 'F')
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text('Titulaire du compte : KEBE AMADOU KETHIEL', 30, footerY + 6)
      doc.text(
        'Domiciliation : Pompidou x Raffanel, Immeuble Yoro LAM SENEGAL',
        30,
        footerY + 12
      )
      doc.text('Code agence : 01600 POMPIDOU', 30, footerY + 18)
      doc.text(`RIB : SN011 01016 004000334878 2:`, 130, footerY + 6)
      doc.text(`IBAN : SN08 SN011 01016 004000334`, 130, footerY + 12)
      doc.text(`Devise du compte : XOF`, 130, footerY + 18)
    }

    // Ajouter le pied de page à la première page
    addFooter()

    // Ajout des logos et du texte central
    const imgLeft = new Image()
    imgLeft.src = user.logo
      ? `${apiUrl}/${user.logo.replace(/\\/g, '/')}`
      : logoLeft
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
    doc.addImage(imgLeft, 'PNG', 160, 15, maxWidth, newHeight)
    //doc.addImage(imgLeft, 'PNG', 20, 5, 35, 30)
    // doc.addImage(imgRight, 'PNG', 140, 5, 60, 30)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(userColor)
    // doc.text(`${invoice.type}`, 20, 25)
    // doc.text(` Nº ${invoice.invoiceNumber}`, 45, 25)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    // doc.setTextColor(textColor)
    // doc.setFillColor(fillColor)
    // Dessin du rectangle de fond
    // Remplacez les valeurs 140, 30, 35, 10 par les coordonnées et dimensions souhaitées pour le rectangle
    // doc.rect(20, 33, 23, 6, 'F')
    // doc.text(`${invoice.status}`, 20, 37)
    // doc.setTextColor(0, 0, 0)
    // doc.text("Anglais <> Français <> Portugais ", 140, 25)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('', 105, 30, null, null, 'center')

    doc.setFillColor(userColor) //
    doc.rect(20, 10, 170, 2, 'F') // Première ligne verte

    // Informations du client
    let currentY = 47 // Mise à jour pour utiliser currentY pour la position initiale

    doc.setFontSize(8) // Changez la taille à la valeur souhaitée
    doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
    // doc.text(`Destinataire`, 130, currentY + 25)

    // Ajout de la ligne sous le texte 'MIAAE'
    // doc
    //   .moveTo(103, currentY + 27) // Position de départ de la ligne
    //   .lineTo(200, currentY + 27) // Position finale de la ligne
    //   .stroke() // Dessine la ligne
    // doc.text(` ${invoice.client.name}`, 130, currentY + 35)
    // doc.setFontSize(8)
    // doc.text(`${invoice.client.address}`, 130, currentY + 40)
    // doc.text(`${invoice.client.email}`, 130, currentY + 45)
    // doc.text(`${invoice.client.telephone}`, 130, currentY + 50)

    // En-tête de la facture
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
    doc.text(`PALABRES AK²`, 20, currentY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(
      `Sacré Cœur 3, Villa n° 8974, Code postal : 11000, Dakar`,
      20,
      currentY + 5
    )
    doc.text(
      `Amadou Kéthiel KEBE - Traducteur Freelance - anglais, français, portugais`,
      20,
      currentY + 10
    )
    doc.text(`+221 33 867 57 10 / +221 77 871 25 11`, 20, currentY + 15)
    doc.text(`amadoukkebe@palabresak2.com`, 20, currentY + 20)
    doc.setFont('helvetica', 'bold')
    doc.text(`N.I.N.E.A: 008643860`, 20, currentY + 25)
    // Ajout du texte
    // doc.text(
    //   `Date: ${new Date(invoice.date).toLocaleDateString()}`,
    //   170,
    //   currentY + 5
    // )

    // Ajout de la ligne sous le texte 'Date'
    // doc
    //   .moveTo(163, currentY + 7) // Position de départ de la ligne
    //   .lineTo(200, currentY + 7) // Position finale de la ligne
    //   .stroke() // Dessine la ligne

    // Ajout du texte 'MIAAE'
    // doc.text(`MIAAE ${invoice.invoiceNumber}`, 175, currentY + 15)

    // Ajout de la ligne sous le texte 'MIAAE'
    // doc
    //   .moveTo(163, currentY + 17) // Position de départ de la ligne
    //   .lineTo(200, currentY + 17) // Position finale de la ligne
    //   .stroke() // Dessine la ligne

    // Trier les articles par catégorie: Révision d'abord, puis Traduction
    // const sortedItems = invoice.items.sort((a, b) => {
    //   if (a.category === 'Révision' && b.category === 'Traduction') return -1
    //   if (a.category === 'Traduction' && b.category === 'Révision') return 1
    //   return 0
    // })

    let currentCategory = ''

    // En-tête des articles avec fond vert
    currentY += 60 // Adjust for marginBottom and header height
    doc.setFillColor(userColor)
    doc.rect(20, currentY, 170, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('Nom du fichier', 22, currentY + 5)
    doc.text('Nbrs de mots', 100, currentY + 5)
    doc.text('Nbrs de pages', 125, currentY + 5)
    doc.text('Prix par mot', 150, currentY + 5)
    doc.text('Prix par page', 170, currentY + 5)
    currentY += 20

    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)

    // Parcours des fichiers et ajout de chaque fichier comme ligne du tableau
    file.fileData.forEach((item) => {
      // Définir la couleur de remplissage pour un gris léger (par exemple, RGB: 220, 220, 220)
      doc.setFillColor(220, 220, 220)

      // Dessiner le rectangle pour chaque ligne
      doc.rect(20, currentY - 5, 170, 10, 'F') // Fond gris pour toute la ligne (largeur de 170)

      // Ajouter le texte dans les colonnes après avoir dessiné le fond gris
      doc.text(item.fileName, 22, currentY, { maxWidth: 75 })
      doc.text(item.wordCount.toString(), 110, currentY)
      doc.text(item.pageCount.toString(), 135, currentY)
      doc.text(item.priceForWords.toFixed(0), 150, currentY)
      doc.text(item.priceForPages.toFixed(0), 170, currentY)

      currentY += 10 // Espacement entre les lignes
    })

    currentY += 8

    // Affichage des totaux
    doc.text('Total :', 22, currentY)
    doc.text(file.totalWordCount.toString(), 110, currentY)

    doc.text(file.totalPageCount.toString(), 135, currentY)

    doc.text(`${file.totalPriceForWords.toFixed(0)} ${currency}`, 150, currentY)

    doc.text(`${file.totalPriceForPages.toFixed(0)} ${currency}`, 170, currentY)

    // Vérification pour l'ajout d'une page avant le total et les informations bancaires
    if (currentY > 280) {
      doc.addPage()
      currentY = 20 // Réinitialiser la position Y pour le contenu de la nouvelle page
      addFooter()
    }

    // Total

    // Set font size and color
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0) // Black for text

    // Couleur pour les montants en vert foncé

    // Texte noir pour l'explication et texte vert foncé pour les sommes
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0) // Noir pour le texte explicatif

    // Réinitialiser la couleur du texte pour les prochains éléments
    doc.setTextColor(0, 0, 0)

    // Ajuster la position Y pour la suite du texte
    currentY += 10

    // Fonction auxiliaire pour formater les nombres avec des espaces
    function formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    // Informations bancaires
    currentY += 20 // Espace avant les informations bancaires

    //Dernière ligne verte
    if (currentY > 270) {
      // Encore une vérification avant d'ajouter la ligne finale
      doc.addPage()
      currentY = 20
      addFooter()
    }
    currentY += 20 // Espace avant les informations bancaires

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
  file: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
}

export default GeneratePDFButton
