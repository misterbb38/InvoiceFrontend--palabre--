import { useState } from 'react'
import PropTypes from 'prop-types'

function FilterFactures({ onFilter }) {
  const [filters, setFilters] = useState({
    name: '',
    date: '',
    year: '',
    month: '',
    total: '',
  })

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilter = () => {
    onFilter(filters)
  }

  return (
    <div className="filter-factures  base-content bg-base-100 ">
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="name"
        placeholder="Nom du client"
        value={filters.name}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="date"
        name="date"
        placeholder="Coisis une date"
        value={filters.date}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="number"
        name="year"
        placeholder="Année"
        value={filters.year}
        onChange={handleInputChange}
      />
      {/* <input
            type="number"
            name="month"
            placeholder="Mois"
            value={filters.month}
            onChange={handleInputChange}
        />
        <input
            type="number"
            name="total"
            placeholder="Total"
            value={filters.total}
            onChange={handleInputChange}
        /> */}
      <select
        className=" base-content bg-base-100 select select-bordered select-primary w-auto max-w-xs mx-2"
        name="status"
        value={filters.status}
        onChange={handleInputChange}
      >
        <option value="">Tous les statuts</option>
        <option value="Attente">Attente</option>
        <option value="Payée">Payée</option>
        <option value="Annullée">Annulée</option>
      </select>
      <button
        className="btn btn-outline btn-primary w-auto mx-2"
        onClick={handleFilter}
      >
        Filtrer
      </button>
    </div>
  )
}
FilterFactures.propTypes = {
  onFilter: PropTypes.func.isRequired,
}

export default FilterFactures
