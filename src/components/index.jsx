import { useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import UseInvoiceStats from './dataInvoice/UseInvoiceStats'
import UseFilteredStats from './dataInvoice/UseFilteredStats'
import Graphpaid from './graph/GraphPaid'
import Graphpending from './graph/GraphPending'
import GraphCancelled from './graph/GraphCancelled'
import GraphFilter from './graph/GraphFilter'
import ClientInvoiceSummary from './SummaryClient'
import ClientMonthlyStats from './ClientMonthlyStats'
import SelectYear from './SelectYear' // Assurez-vous que ce composant existe pour sélectionner l'année
const HomeContent = () => {
  const [selectedYear, setSelectedYear] = useState('2024')
  const stats = UseInvoiceStats(selectedYear)

  const filteredStats = UseFilteredStats()
  console.log(stats)
  console.log(filteredStats)

  let countpaid = 0,
    totalAmountpaid = 0,
    countpending = 0,
    totalAmountpending = 0,
    countCancelled = 0,
    totalAmountCancelled = 0,
    totalCount = 0
  // Calcul des statistiques basé sur les données récupérées
  if (stats) {
    stats.forEach(({ _id, totalAmount, count }) => {
      switch (_id.status) {
        case 'Payée':
          countpaid += count
          totalAmountpaid += totalAmount
          break
        case 'Attente':
          countpending += count
          totalAmountpending += totalAmount
          break
        case 'Annullée':
          countCancelled += count
          totalAmountCancelled += totalAmount
          break
        default:
          break
      }
    })
    totalCount = stats.reduce((acc, curr) => acc + curr.count, 0)
  }

  const percentagepaid = ((countpaid / totalCount) * 100).toFixed(1) || 0
  const percentagepending = ((countpending / totalCount) * 100).toFixed(1) || 0
  const percentageCancelled =
    ((countCancelled / totalCount) * 100).toFixed(1) || 0

  return (
    <div className=" bg-base-100 p-4">
      <NavigationBreadcrumb pageName="Acceuil" />

      {/* Section supérieure avec quatre boîtes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="box bg-base-300 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Choisir une année</h2>
          <SelectYear
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
        </div>
        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures payées
            </h2>
            <span className="text-xs font-bold">Nombre: {countpaid}</span>
            <p className="text-xs font-bold">somme:{totalAmountpaid} cfa</p>
            <p className="text-xs font-bold">poucentage:{percentagepaid}% </p>
          </div>
          <div>
            <Graphpaid selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>

        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures en attente
            </h2>
            <span className="text-xs font-bold">Nombre: {countpending}</span>
            <p className="text-xs font-bold">somme:{totalAmountpending} cfa</p>
            <p className="text-xs font-bold">
              poucentage:{percentagepending}%{' '}
            </p>
          </div>
          <div>
            <Graphpending selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>
        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures annullées
            </h2>
            <span className="text-xs font-bold">Nombre: {countCancelled}</span>
            <p className="text-xs font-bold">
              somme:{totalAmountCancelled} cfa
            </p>
            <p className="text-xs font-bold">
              poucentage:{percentageCancelled}%{' '}
            </p>
          </div>
          <div>
            <GraphCancelled selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>
      </div>
      {/* Section divisée en deux parties */}
      <div className="flex flex-wrap -mx-4 mb-8">
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie gauche */}
          <div className="bg-base-300 p-4 rounded-lg shadow h-[50vh]">
            <GraphFilter />
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie droite, divisé verticalement */}
          <div className="flex flex-col space-y-4">
            <div className="mt-2 bg-base-300 p-4 rounded-lg shadow h-[24vh]">
              <ClientInvoiceSummary selectedYear={selectedYear} />
            </div>
            <div className="bg-base-300 p-4 rounded-lg shadow h-[24vh]">
              <ClientMonthlyStats selectedYear={selectedYear} />
            </div>
          </div>
        </div>
      </div>

      {/* Div large de 300px en bas */}
      {/* <div className="w-full mb-8" >
        <div className="bg-base-300 p-4 rounded-lg shadow" style={{ minWidth: "300px", minHeight:"200px" }}>Contenu Large</div>
      </div> */}
    </div>
  )
}

export default HomeContent
