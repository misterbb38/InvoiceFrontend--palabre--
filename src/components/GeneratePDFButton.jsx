import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/logo/logo.png'
import logoRight from '../images/logo2.png'

function GeneratePDFButton({ invoice }) {
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
  const { textColor, fillColor } = statusColors[invoice.status]

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
    doc.text(`${invoice.type}`, 20, 25)
    doc.text(` Nº ${invoice.invoiceNumber}`, 45, 25)
    doc.setFontSize(15)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor)
    doc.setFillColor(fillColor)
    // Dessin du rectangle de fond
    // Remplacez les valeurs 140, 30, 35, 10 par les coordonnées et dimensions souhaitées pour le rectangle
    doc.rect(20, 33, 23, 6, 'F')
    doc.text(`${invoice.status}`, 20, 37)
    doc.setTextColor(0, 0, 0)
    // doc.text("Anglais <> Français <> Portugais ", 140, 25)
    doc.setFontSize(14)
    doc.text('', 105, 30, null, null, 'center')

    doc.setFillColor(userColor) //
    doc.rect(20, 10, 170, 2, 'F') // Première ligne verte

    // Informations du client
    let currentY = 47 // Mise à jour pour utiliser currentY pour la position initiale

    doc.setFontSize(8) // Changez la taille à la valeur souhaitée
    doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
    doc.text(`Destinataire`, 130, currentY + 25)

    // Ajout de la ligne sous le texte 'MIAAE'
    doc
      .moveTo(103, currentY + 27) // Position de départ de la ligne
      .lineTo(200, currentY + 27) // Position finale de la ligne
      .stroke() // Dessine la ligne
    doc.text(` ${invoice.client.name}`, 130, currentY + 35)
    doc.setFontSize(8)
    doc.text(`${invoice.client.address}`, 130, currentY + 40)
    doc.text(`${invoice.client.email}`, 130, currentY + 45)
    doc.text(`${invoice.client.telephone}`, 130, currentY + 50)

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
    doc.text(
      `Date: ${new Date(invoice.date).toLocaleDateString()}`,
      170,
      currentY + 5
    )

    // Ajout de la ligne sous le texte 'Date'
    doc
      .moveTo(163, currentY + 7) // Position de départ de la ligne
      .lineTo(200, currentY + 7) // Position finale de la ligne
      .stroke() // Dessine la ligne

    // Ajout du texte 'MIAAE'
    doc.text(`MIAAE ${invoice.invoiceNumber}`, 175, currentY + 15)

    // Ajout de la ligne sous le texte 'MIAAE'
    doc
      .moveTo(163, currentY + 17) // Position de départ de la ligne
      .lineTo(200, currentY + 17) // Position finale de la ligne
      .stroke() // Dessine la ligne

    // Trier les articles par catégorie: Révision d'abord, puis Traduction
    const sortedItems = invoice.items.sort((a, b) => {
      if (a.category === 'Révision' && b.category === 'Traduction') return -1
      if (a.category === 'Traduction' && b.category === 'Révision') return 1
      return 0
    })

    let currentCategory = ''

    // En-tête des articles avec fond vert
    currentY += 60 // Adjust for marginBottom and header height
    doc.setFillColor(userColor)
    doc.rect(20, currentY, 170, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('Ref', 22, currentY + 5)
    doc.text('Désignation', 42, currentY + 5)
    doc.text('Nombre de mots', 112, currentY + 5)
    doc.text('Prix forfaitaire', 138, currentY + 5)
    doc.text('Total', 166, currentY + 5)
    currentY += 8

    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)

    sortedItems.forEach((item, index) => {
      // Si la catégorie change, ajouter un en-tête de catégorie avec un fond gris, texte centré et en gras
      if (item.category !== currentCategory) {
        currentCategory = item.category
        doc.setFillColor(200, 200, 200) // Couleur gris clair pour le fond des catégories
        doc.rect(20, currentY, 170, 6, 'F') // Hauteur réduite de la case catégorie
        doc.setFont('helvetica', 'bold') // Mettre le texte en gras
        doc.setTextColor(0, 0, 0) // Couleur du texte en noir
        doc.setFontSize(8)
        doc.text(
          `${currentCategory} des documents intitulés :`,
          105,
          currentY + 4,
          { align: 'center' }
        ) // Centrer le texte de la catégorie
        currentY += 8 // Ajouter de l'espace après le titre de la catégorie
      }

      // Ajouter les détails de l'article avec alternance de couleur de fond
      const itemTextHeight =
        doc.splitTextToSize(item.description, 50).length * 2.5 // Hauteur des lignes de texte réduite
      const itemHeight = itemTextHeight + 2 // Hauteur réduite pour moins d'espace

      // Alterner entre le fond gris foncé et vert foncé pour chaque article
      const isEven = index % 2 === 0
      doc.setFillColor(
        isEven ? 224 : 200,
        isEven ? 224 : 230,
        isEven ? 224 : 201
      ) // Gris clair moyen pour pairs, vert menthe pour impairs
      doc.rect(20, currentY, 170, itemHeight + 3, 'F') // Remplissage de l'arrière-plan

      if (currentY + itemHeight > 280) {
        doc.addPage()
        currentY = 20 // Réinitialiser la position Y après ajout d'une page
        addFooter()
      }

      // Centrage vertical des textes dans chaque ligne
      const textY = currentY + (itemHeight + 3) / 2 // Centrer le texte verticalement

      // Ajouter les colonnes avec du texte
      doc.setTextColor(0, 0, 0) // Texte en noir pour bien contraster avec le fond
      doc.text(item.ref, 22, textY, { baseline: 'middle' }) // Centrer le texte verticalement
      doc.text(doc.splitTextToSize(item.description, 60), 42, textY - 2, {
        baseline: 'middle',
      })
      doc.text(item.quantity.toString(), 112, textY, { baseline: 'middle' })

      const formattedPrice = formatNumber(item.price.toFixed(2))
      const formattedTotal = formatNumber(item.total.toFixed(2))

      // Définir un mappage entre les noms des devises et leurs symboles
      const currencySymbols = {
        euro: '€',
        dollar: '$',
        CFA: 'FCFA',
      }

      // Puis, lors de l'affichage, utiliser le symbole correspondant
      doc.text(
        `${formattedPrice} ${currencySymbols[invoice.currency] || invoice.currency}`,
        132,
        textY,
        {
          baseline: 'middle',
        }
      )
      doc.text(
        `${formattedTotal} ${currencySymbols[invoice.currency] || invoice.currency}`,
        162,
        textY,
        {
          baseline: 'middle',
        }
      )

      // Ajouter des colonnes avec des lignes verticales (pour les articles uniquement, pas pour les catégories)
      doc.setDrawColor(0, 0, 0)
      doc.line(20, currentY, 20, currentY + itemHeight + 3) // Ligne verticale gauche
      doc.line(40, currentY, 40, currentY + itemHeight + 3) // Ligne entre ref et description
      doc.line(110, currentY, 110, currentY + itemHeight + 3) // Ligne entre description et quantité
      doc.line(130, currentY, 130, currentY + itemHeight + 3) // Ligne entre quantité et prix
      doc.line(160, currentY, 160, currentY + itemHeight + 3) // Ligne entre prix et total
      doc.line(190, currentY, 190, currentY + itemHeight + 3) // Ligne verticale droite

      // Ajouter une ligne horizontale pour fermer chaque ligne d'article
      doc.line(20, currentY + itemHeight + 3, 190, currentY + itemHeight + 3) // Ligne horizontale de fermeture

      currentY += itemHeight + 4 // Réduction de l'espacement entre les articles
    })

    currentY += 8

    // Vérification pour l'ajout d'une page avant le total et les informations bancaires
    if (currentY > 280) {
      doc.addPage()
      currentY = 20 // Réinitialiser la position Y pour le contenu de la nouvelle page
      addFooter()
    }

    // Total

    // Fonction pour convertir un nombre en lettres (français)
    function nombreEnLettres(nombre) {
      const unite = [
        'zéro',
        'un',
        'deux',
        'trois',
        'quatre',
        'cinq',
        'six',
        'sept',
        'huit',
        'neuf',
      ]
      const dizaines = [
        'dix',
        'vingt',
        'trente',
        'quarante',
        'cinquante',
        'soixante',
        'soixante',
        'quatre-vingt',
        'quatre-vingt',
      ]
      const exceptions = [
        '',
        'onze',
        'douze',
        'treize',
        'quatorze',
        'quinze',
        'seize',
        'dix-sept',
        'dix-huit',
        'dix-neuf',
      ]

      if (nombre === 0) return unite[0]

      if (nombre < 20) {
        return nombre < 10 ? unite[nombre] : exceptions[nombre - 10]
      } else if (nombre < 100) {
        if (nombre === 80) return 'quatre-vingts'
        let dizaine = Math.floor(nombre / 10)
        let uniteIndex = nombre % 10
        let lien =
          uniteIndex === 1 && dizaine !== 8 && dizaine !== 7 ? ' et ' : '-'
        return (
          dizaines[dizaine - 1] +
          (uniteIndex === 0 && dizaine !== 8
            ? ''
            : dizaine === 7 || dizaine === 9
              ? 'dix-'
              : lien) +
          (dizaine === 7 || dizaine === 9
            ? exceptions[uniteIndex]
            : unite[uniteIndex])
        )
      } else if (nombre < 1000) {
        let reste = nombre % 100
        let cent = Math.floor(nombre / 100)
        return (
          (cent > 1 ? unite[cent] + ' ' : '') +
          'cent' +
          (reste > 0 ? ' ' + nombreEnLettres(reste) : '')
        )
      } else if (nombre < 1000000) {
        let reste = nombre % 1000
        let mille = Math.floor(nombre / 1000)
        return (
          (mille > 1 ? nombreEnLettres(mille) + ' mille' : 'mille') +
          (reste > 0 ? ' ' + nombreEnLettres(reste) : '')
        )
      }
      return 'Nombre hors limite'
    }

    // Fonction pour convertir la somme en lettres en CFA
    function convertirSommeEnLettres(montant) {
      let partieEntiere = Math.floor(montant)
      let centimes = Math.round((montant - partieEntiere) * 100)

      let partieEntiereEnLettres = nombreEnLettres(partieEntiere)
      let centimesEnLettres =
        centimes > 0 ? `et ${nombreEnLettres(centimes)} centimes` : ''

      return `${partieEntiereEnLettres} francs CFA ${centimesEnLettres}`
    }

    // Fonction pour convertir les devises en CFA
    function convertirEnCFA(montant, devise) {
      const tauxConversion = {
        USD: 600,
        EUR: 600,
        FCFA: 1,
      }

      return montant * (tauxConversion[devise] || 1) // Convertir selon le taux de la devise ou laisser inchangé si c'est déjà en FCFA
    }

    // Define the conversion rates
    const conversionRates = {
      EUR: 600,
      USD: 600,
    }

    // Function to convert the amount to FCFA
    // function convertToFCFA(amount, currency) {
    //   if (currency in conversionRates) {
    //     return amount * conversionRates[currency]
    //   }
    //   return amount // No conversion if currency is FCFA
    // }

    // Determine the total amount in the original currency
    const totalAmount = invoice.total
    const originalCurrency = invoice.currency // Assumed to be either 'EUR' or 'USD' or 'FCFA'
    const totalAmountFCFA = invoice.conversion

    // Set font size and color
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0) // Black for text

    // Display the total amount in the original currency
    doc.text(
      `MONTANT TOTAL ${formatNumber(totalAmount.toFixed(0))} ${originalCurrency}`,
      130,
      currentY
    )

    // Draw a horizontal line above and below the total amount
    doc.setDrawColor(0, 0, 0) // Black for lines
    doc.line(130, currentY - 5, 190, currentY - 5) // Line above

    // Move the position down for additional text

    // Display the total amount in FCFA
    if (originalCurrency !== 'FCFA') {
      doc.setTextColor(0, 100, 0) // Dark green for FCFA amount

      doc.text(
        `Montant à payer : ${formatNumber(totalAmountFCFA.toFixed(0))} FCFA`,
        130,
        currentY + 5
      )

      // Add horizontal lines above and below the new section
    }
    doc.setDrawColor(0, 0, 0) // Black for lines

    doc.line(130, currentY + 10, 190, currentY + 10) // Line below

    // Ajout du texte au PDF
    const montantEnDevise = invoice.total
    const montantEnCFA = invoice.conversion // Conversion en CFA
    const montantEnLettresCFA = convertirSommeEnLettres(montantEnCFA)

    // Couleur pour les montants en vert foncé
    const darkGreen = [0, 100, 0]

    // Configuration des lignes horizontales
    doc.setDrawColor(0, 0, 0) // Noir pour les lignes
    doc.line(20, currentY - 5, 100, currentY - 5) // Ligne horizontale supérieure

    // Texte noir pour l'explication et texte vert foncé pour les sommes
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0) // Noir pour le texte explicatif

    // Utiliser splitTextToSize pour ajuster le texte entre 20 et 100 de largeur
    const explicationText = doc.splitTextToSize(
      `Arrêté la présente facture à la somme de : ${formatNumber(montantEnCFA.toFixed(0))} XOF (${montantEnLettresCFA}).`,
      80 // largeur maximale de 80 unités
    )

    // Afficher le texte explicatif (noir)
    doc.text(explicationText, 20, currentY)

    // Ajuster la position Y pour la somme en chiffres (vert foncé)
    currentY += explicationText.length * 4 // Espacement en fonction de la longueur du texte

    // Si la devise n'est pas en FCFA, ajouter les informations de conversion
    if (invoice.currency !== 'CFA') {
      let exchangeRate = 1
      if (invoice.currency === 'euro') {
        exchangeRate = 655
      } else if (invoice.currency === 'dollar') {
        exchangeRate = 600
      }

      const montantEnCFA = invoice.conversion

      const conversionText = `À convertir en francs CFA (XOF) au taux de 1 ${invoice.currency} = ${exchangeRate} XOF.\nSoit Montant à payer : ${formatNumber(montantEnCFA.toFixed(0))} XOF (${convertirSommeEnLettres(montantEnCFA)}).`

      // Utiliser splitTextToSize pour ajuster le texte entre 20 et 80 de largeur
      const conversionTextLines = doc.splitTextToSize(conversionText, 80)
      doc.text(conversionTextLines, 20, currentY)
      currentY += conversionTextLines.length * 4
    }

    // Ajouter une ligne horizontale en bas du texte
    doc.line(20, currentY + 5, 100, currentY + 5) // Ligne horizontale inférieure

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
    // const bankInfo = [
    //   'COORDONNEES BANCAIRES', 'SOCIETE GENERALE', "RELEVE D'IDENTITE BANCAIRE",
    //   'Titulaire du compte: 01600 POMPIDOU', 'Domiciliation: XOF',
    //   'Code agence: SN011 01016 004000 334878 23', 'Devise du compte: SN08 SN011 01016 004000 334878 23',
    //   'RIB: SGSNSNDAXXX', 'IBAN: 0', 'BIC-SWIFT: 0'
    // ]
    // bankInfo.forEach((line, index) => {
    //   if (currentY > 270) { // Vérification avant chaque ligne pour les informations bancaires
    //     doc.addPage()
    //     currentY = 20
    //     addFooter()
    //   }

    //   // Réduire la longueur du rectangle et ajuster la taille de l'écriture
    //   const rectLength = 70 // Nouvelle longueur du rectangle, ajustez selon les besoins
    //   const fontSize = 8 // Nouvelle taille de l'écriture, ajustez selon les besoins

    //   if (index === 0) {
    //     doc.setFillColor(0, 100, 0)
    //     doc.rect(20, currentY, rectLength, 5, 'F')
    //     doc.setFontSize(fontSize)
    //   } else {
    //     doc.setFillColor(0, 128, 0)
    //     doc.rect(20, currentY, rectLength, 5, 'F')
    //     doc.setFontSize(fontSize)
    //   }

    //   doc.setTextColor(255, 255, 255)
    //   // Assurez-vous que le texte est bien aligné à l'intérieur du rectangle plus petit
    //   doc.text(line, 22, currentY + 3)
    //   currentY += 5
    // })

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
