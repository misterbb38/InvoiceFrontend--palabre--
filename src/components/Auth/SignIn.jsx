import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LogoText from '../../images/logo-et-slogan.jpg'
// import Logo from '../../images/logo/logo.png';

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // Ajout d'un état pour le chargement
  const navigate = useNavigate()

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true) // Début du chargement
    try {
      const response = await fetch(`${apiUrl}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(
          'Échec de la connexion. Veuillez vérifier vos identifiants.'
        )
      }

      const data = await response.json()
      setLoading(false) // Arrêt du chargement

      // Stocker les infos de l'utilisateur et le token dans localStorage
      localStorage.setItem('userInfo', JSON.stringify(data))
      console.log(data)

      const currentDate = new Date()
      const expirationDate = new Date(data.dateExpiration)
      const daysUntilExpiration =
        (expirationDate - currentDate) / (1000 * 3600 * 24)

      if (data.userType === 'simple') {
        if (currentDate <= expirationDate) {
          if (daysUntilExpiration <= 7) {
            // Si l'abonnement expire dans 7 jours ou moins, rediriger vers /key
            navigate('/keyExpired')
          } else {
            // Sinon, continuer vers /dash
            navigate('/dash')
          }
        } else {
          // Si la date d'expiration est passée, rediriger vers /key
          navigate('/keyExpired')
        }
      } else {
        // Pour les autres types d'utilisateurs, rediriger vers /KeyGen
        navigate('/KeyGen')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false) // Fin du chargement
    }
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="/">
                {/* <img className="hidden dark:block" src={Logo} alt="Logo" /> */}
              </Link>
              <p className="2xl:px-20"></p>
              <img className="hidden dark:block " src={LogoText} alt="Logo" />
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <span className="mb-1.5 block font-medium">
                Commencez gratuitement
              </span>
              <h2 className="mb-9 text-2xl font-bold base-content">
                Connectez-vous à{' '}
                <span className="text-blue-700 font-bold">Factu</span>
                <span className="text-orange-500 font-bold">Flexe</span>
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium base-content">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium base-content">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {error && <div className="mb-4 text-red-500">{error}</div>}

                {loading ? (
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner text-primary"></span>
                  </div>
                ) : (
                  <input
                    type="submit"
                    value="Se connecter"
                    className="btn btn-primary w-full"
                  />
                )}
                <div className="mt-6 text-center">
                  <p>
                    Vous n avez pas de compte ?{' '}
                    <Link to="/signup" className="text-primary">
                      inscription
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn
