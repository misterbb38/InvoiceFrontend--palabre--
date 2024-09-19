import { useState, useEffect } from 'react'
import { themeChange } from 'theme-change'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute' // Assurez-vous d'importer ProtectedRoute
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import SignIn from './components/Auth/SignIn'
import SignUp from './components/Auth/SignUp'
import HomeContent from './components/index'
import Facture from './pages/Facture'
import Devis from './pages/Devis'
import Formulaire from './pages/Formulaire'
import Instruction from './pages/Instruction'
import Parametre from './pages/Parametre'
import ClientList from './pages/ClientList'
import ProduitList from './pages/ProduitList'
import Home from './pages/home'
import FileUploadAndWordCount from './pages/FileUploadAndWordCount'
import AllFileDataTable from './pages/AllFileDataTable'
import GenerateAccessKey from './components/GenerateAccessKey'
import KeyExpired from './components/KeyExpired'
import SuperAdminRoute from './components/SuperAdminRoute' // Assurez-vous que le chemin est correct

import Notifications from './components/Notifications'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarOpen && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => themeChange(false), [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/keyExpired" element={<KeyExpired />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/keyGen"
            element={
              <SuperAdminRoute>
                <GenerateAccessKey />
              </SuperAdminRoute>
            }
          />

          <Route path="/dash" element={<AppLayout />}>
            <Route index element={<HomeContent />} />
            <Route path="Facture" element={<Facture />} />
            <Route path="Devis" element={<Devis />} />
            <Route path="client" element={<ClientList />} />
            <Route path="article" element={<ProduitList />} />
            <Route path="Formulaire" element={<Formulaire />} />
            <Route path="instruction" element={<Instruction />} />
            <Route path="notification" element={<Notifications />} />
            <Route path="enum" element={<FileUploadAndWordCount />} />
            <Route path="enumTab" element={<AllFileDataTable />} />
            <Route path="parametre" element={<Parametre />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
