// import { useState, useRef } from 'react'
// import PropTypes from 'prop-types'
// import { PDFDocument } from 'pdf-lib'

// const UploadDocumentButton = ({ onDocumentProcessed }) => {
//   const [selectedOption, setSelectedOption] = useState('words')
//   const [fileName, setFileName] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const fileInputRef = useRef(null)

//   const countWords = (text) => {
//     const trimmedText = text.trim()
//     if (!trimmedText) return 0
//     return trimmedText.split(/\s+/).length
//   }

//   const countPdfPages = async (file) => {
//     try {
//       const data = await file.arrayBuffer()
//       const pdfDoc = await PDFDocument.load(data)
//       return pdfDoc.getPageCount()
//     } catch (error) {
//       console.error('Erreur lors du comptage des pages PDF:', error)
//       return 0
//     }
//   }

//   const handleFileChange = (event) => {
//     const file = event.target.files[0]
//     if (file) {
//       setFileName(file.name)
//     } else {
//       setFileName('')
//     }
//   }

//   const handleFileProcessing = async () => {
//     if (!fileName) return

//     setIsLoading(true)

//     const file = fileInputRef.current.files[0]
//     let quantity = 0
//     try {
//       if (file.type === 'application/pdf') {
//         if (selectedOption === 'pages') {
//           quantity = await countPdfPages(file)
//         } else {
//           const text = await file.text()
//           quantity = countWords(text)
//         }
//       } else if (
//         file.type ===
//           'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
//         file.type === 'application/msword'
//       ) {
//         const mammoth = await import('mammoth')
//         const arrayBuffer = await file.arrayBuffer()
//         const { value } = await mammoth.extractRawText({ arrayBuffer })
//         quantity =
//           selectedOption === 'words'
//             ? countWords(value)
//             : estimateWordPages(value)
//       }

//       if (quantity > 0) {
//         onDocumentProcessed({ fileName: file.name, quantity })
//       } else {
//         console.warn('Aucune page ou mot compté, vérifiez le fichier.')
//       }
//     } catch (error) {
//       console.error('Erreur lors du traitement du fichier :', error)
//     } finally {
//       setIsLoading(false)
//       resetFileInput()
//     }
//   }

//   const estimateWordPages = (text) => {
//     const wordsPerPage = 300
//     const wordCount = countWords(text)
//     return Math.ceil(wordCount / wordsPerPage)
//   }

//   const resetFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = ''
//       setFileName('')
//     }
//   }

//   return (
//     <div className="mt-6">
//       <div className="mb-3">
//         <label className="block text-sm font-medium">
//           Choisissez un fichier Word ou PDF
//         </label>
//         <input
//           type="file"
//           accept=".doc,.docx,.pdf"
//           onChange={handleFileChange}
//           className="mt-1 w-full file-input file-input-bordered file-input-primary max-w-xs"
//           ref={fileInputRef}
//         />
//       </div>
//       <div className="mb-3">
//         <label className="block text-sm font-medium">Compter par :</label>
//         <div className="flex gap-3">
//           <label className="inline-flex items-center">
//             <input
//               type="radio"
//               name="countOption"
//               className="radio radio-primary"
//               value="words"
//               checked={selectedOption === 'words'}
//               onChange={() => setSelectedOption('words')}
//             />
//             <span className="ml-2">Nombre de mots</span>
//           </label>
//           <label className="inline-flex items-center">
//             <input
//               type="radio"
//               name="countOption"
//               value="pages"
//               className="radio radio-primary"
//               checked={selectedOption === 'pages'}
//               onChange={() => setSelectedOption('pages')}
//             />
//             <span className="ml-2">Nombre de pages</span>
//           </label>
//         </div>
//       </div>
//       {fileName && <p>Fichier sélectionné : {fileName}</p>}
//       <div className="mt-4">
//         <button
//           type="button"
//           onClick={handleFileProcessing}
//           className="btn btn-primary"
//           disabled={isLoading || !fileName}
//         >
//           Compter
//         </button>
//       </div>
//       {isLoading && (
//         <div className="flex items-center justify-center mt-4">
//           <span className="loading loading-spinner text-primary"></span>
//           <span className="ml-2">Traitement du fichier...</span>
//         </div>
//       )}
//     </div>
//   )
// }

// // Définition des PropTypes
// UploadDocumentButton.propTypes = {
//   onDocumentProcessed: PropTypes.func.isRequired,
// }

// export default UploadDocumentButton

import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { PDFDocument } from 'pdf-lib'

const UploadDocumentButton = ({ onDocumentProcessed }) => {
  const [selectedOption, setSelectedOption] = useState('words')
  const [fileName, setFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const countWords = (text) => {
    // Utiliser une expression régulière pour capturer les séquences de mots
    const wordArray = text.match(/\b[\w'-]+\b/g)
    return wordArray ? wordArray.length : 0
  }

  const countPdfPages = async (file) => {
    try {
      const data = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(data)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error('Erreur lors du comptage des pages PDF:', error)
      return 0
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setFileName(file.name)
    } else {
      setFileName('')
    }
  }

  const handleFileProcessing = async () => {
    if (!fileName) return

    setIsLoading(true)

    const file = fileInputRef.current.files[0]
    let quantity = 0
    try {
      if (file.type === 'application/pdf') {
        if (selectedOption === 'pages') {
          quantity = await countPdfPages(file)
        } else {
          const text = await file.text()
          quantity = countWords(text)
        }
      } else if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const { value } = await mammoth.extractRawText({ arrayBuffer })
        quantity =
          selectedOption === 'words'
            ? countWords(value)
            : estimateWordPages(value)
      }

      if (quantity > 0) {
        onDocumentProcessed({ fileName: file.name, quantity })
      } else {
        console.warn('Aucune page ou mot compté, vérifiez le fichier.')
      }
    } catch (error) {
      console.error('Erreur lors du traitement du fichier :', error)
    } finally {
      setIsLoading(false)
      resetFileInput()
    }
  }

  const estimateWordPages = (text) => {
    const wordsPerPage = 300
    const wordCount = countWords(text)
    return Math.ceil(wordCount / wordsPerPage)
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      setFileName('')
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-3">
        <label className="block text-sm font-medium">
          Choisissez un fichier Word ou PDF
        </label>
        <input
          type="file"
          accept=".doc,.docx"
          onChange={handleFileChange}
          className="mt-1 w-full file-input file-input-bordered file-input-primary max-w-xs"
          ref={fileInputRef}
        />
      </div>
      <div className="mb-3">
        <label className="block text-sm font-medium">Compter par :</label>
        <div className="flex gap-3">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="countOption"
              className="radio radio-primary"
              value="words"
              checked={selectedOption === 'words'}
              onChange={() => setSelectedOption('words')}
            />
            <span className="ml-2">Nombre de mots</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="countOption"
              value="pages"
              className="radio radio-primary"
              checked={selectedOption === 'pages'}
              onChange={() => setSelectedOption('pages')}
            />
            <span className="ml-2">Nombre de pages</span>
          </label>
        </div>
      </div>
      {fileName && <p>Fichier sélectionné : {fileName}</p>}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleFileProcessing}
          className="btn btn-primary"
          disabled={isLoading || !fileName}
        >
          Compter
        </button>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center mt-4">
          <span className="loading loading-spinner text-primary"></span>
          <span className="ml-2">Traitement du fichier...</span>
        </div>
      )}
    </div>
  )
}

// Définition des PropTypes
UploadDocumentButton.propTypes = {
  onDocumentProcessed: PropTypes.func.isRequired,
}

export default UploadDocumentButton
