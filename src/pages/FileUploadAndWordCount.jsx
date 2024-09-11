import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`

const FileUploadAndWordCount = () => {
  const [fileData, setFileData] = useState([])
  const pricePerWord = 0.1 // Prix par mot
  const pricePerPage = 20 // Prix par page (300 mots par page)

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

  const handleWordUpload = (file) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result
      const result = await mammoth.extractRawText({ arrayBuffer })
      processText(file.name, result.value)
    }
    reader.readAsArrayBuffer(file)
  }

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

  const handleRemoveFile = (index) => {
    setFileData((prevData) => prevData.filter((_, i) => i !== index))
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Créer l'entête
    doc.text('Résumé des fichiers téléversés', 10, 10)

    // Générer le tableau avec autoTable
    autoTable(doc, {
      startY: 20,
      head: [
        [
          'Nom du fichier',
          'Nombre de mots',
          'Nombre de pages',
          'Prix par mot',
          'Prix par page',
        ],
      ],
      body: fileData.map((file) => [
        file.fileName,
        file.wordCount,
        file.pageCount,
        `${file.priceForWords.toFixed(2)} €`,
        `${file.priceForPages.toFixed(2)} €`,
      ]),
      foot: [
        [
          'Total',
          totalWords,
          totalPages,
          `${totalPriceWords.toFixed(2)} €`,
          `${totalPricePages.toFixed(2)} €`,
        ],
      ],
    })

    doc.save('file_summary.pdf')
  }

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
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Ajouter un fichier PDF ou Word</h3>
      <input
        type="file"
        onChange={handleFileUpload}
        accept=".pdf,.docx"
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
                  Supprimer
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

      <button onClick={generatePDF} className="btn btn-primary mt-4">
        Imprimer le tableau en PDF
      </button>
    </div>
  )
}

export default FileUploadAndWordCount
