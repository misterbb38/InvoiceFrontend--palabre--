import { useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import { Trash2 } from 'lucide-react'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const FileUploadAndWordCount = () => {
  const [fileData, setFileData] = useState([])
  const [pricePerWord, setPricePerWord] = useState(0) // Permettre à l'utilisateur de définir le prix par mot
  const [pricePerPage, setPricePerPage] = useState(0) // Permettre à l'utilisateur de définir le prix par page
  const [projectName, setProjectName] = useState('') // Champ pour le nom du projet

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // URL de l'API

  // Gestion du téléchargement de fichiers
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop().toLowerCase()

    if (fileExtension === 'pdf') {
      handlePDFUpload(file)
    } else if (fileExtension === 'docx') {
      handleWordUpload(file)
    } else {
      alert('Veuillez télécharger un fichier PDF ou Word (DOCX).')
    }
  }

  // Gestion du téléchargement et traitement des fichiers PDF
  const handlePDFUpload = async (file) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result)
      const pdf = await pdfjsLib.getDocument(typedArray).promise
      let text = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => item.str).join(' ')
      }

      processText(file.name, text)
    }
    reader.readAsArrayBuffer(file)
  }

  // Gestion du téléchargement et traitement des fichiers Word (DOCX)
  const handleWordUpload = (file) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result
      const result = await mammoth.extractRawText({ arrayBuffer })
      processText(file.name, result.value)
    }
    reader.readAsArrayBuffer(file)
  }

  // Traitement du texte récupéré et ajout au tableau
  const processText = (fileName, text) => {
    const wordCount = text.split(/\s+/).length
    const pageCount = Math.ceil(wordCount / 300)
    const priceForWords = wordCount * pricePerWord
    const priceForPages = pageCount * pricePerPage

    setFileData((prevData) => [
      ...prevData,
      {
        fileName,
        wordCount,
        pageCount,
        priceForWords,
        priceForPages,
      },
    ])
  }

  // Suppression d'un fichier du tableau
  const handleRemoveFile = (index) => {
    setFileData((prevData) => prevData.filter((_, i) => i !== index))
  }

  // Enregistrement des données dans la base de données
  const handleSaveToDatabase = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(`${apiUrl}/api/fileData/save-file-data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName, // Ajouter le nom du projet
          fileData, // Envoyer le tableau de données des fichiers
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l’enregistrement')
      }

      const data = await response.json()
      if (data.status === 'success') {
        alert('Données enregistrées avec succès !')
        setFileData([]) // Réinitialiser le tableau après l'enregistrement
      }
    } catch (error) {
      alert('Erreur lors de l’enregistrement des données : ' + error.message)
    }
  }

  // Calculs des totaux
  const totalWords = fileData.reduce((acc, file) => acc + file.wordCount, 0)
  const totalPages = fileData.reduce((acc, file) => acc + file.pageCount, 0)
  const totalPriceWords = fileData.reduce(
    (acc, file) => acc + file.priceForWords,
    0
  )
  const totalPricePages = fileData.reduce(
    (acc, file) => acc + file.priceForPages,
    0
  )

  return (
    <div className="p-4  bg-base-100 min-h-[800px]">
      <NavigationBreadcrumb pageName="Facture" />
      <div className="divider"></div>
      <h3 className="text-lg font-bold mb-4">Calcule de projet</h3>

      <div className="flex mb-4 space-x-4">
        <div>
          <label className="block mb-2">Nom du projet :</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>

        <div>
          <label className="block mb-2">Prix par mot :</label>
          <input
            type="number"
            value={pricePerWord}
            onChange={(e) => setPricePerWord(Number(e.target.value))}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>

        <div>
          <label className="block mb-2">Prix par page :</label>
          <input
            type="number"
            value={pricePerPage}
            onChange={(e) => setPricePerPage(Number(e.target.value))}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
      </div>

      <input
        type="file"
        onChange={handleFileUpload}
        accept=".doc,.docx"
        className="file-input file-input-bordered file-input-primary mb-4"
      />

      <table className="table w-full">
        <thead>
          <tr>
            <th>Nom du fichier</th>
            <th>Nombre de mots</th>
            <th>Nombre de pages</th>
            <th>Prix par mot</th>
            <th>Prix par page</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fileData.map((file, index) => (
            <tr key={index}>
              <td>{file.fileName}</td>
              <td>{file.wordCount}</td>
              <td>{file.pageCount}</td>
              <td>{file.priceForWords.toFixed(2)} FCFA</td>
              <td>{file.priceForPages.toFixed(2)} FCFA</td>
              <td>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 size={24} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th>Total</th>
            <th>{totalWords} mots</th>
            <th>{totalPages} pages</th>
            <th>{totalPriceWords.toFixed(2)} FCFA</th>
            <th>{totalPricePages.toFixed(2)} FCFA</th>
            <th></th>
          </tr>
        </tfoot>
      </table>

      <button onClick={handleSaveToDatabase} className="btn btn-primary mt-4">
        Enregistrer
      </button>
    </div>
  )
}

export default FileUploadAndWordCount
