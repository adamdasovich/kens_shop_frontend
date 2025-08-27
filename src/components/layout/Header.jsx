import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, ShoppingBag, Video, Eye, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import logoKen from '../../assets/logo_ken.jpg'

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/')
        setIsProfileOpen(false)
    }

    const navLinks = [
        {name: 'Home', path: '/', public: true},
        {name: 'Showcase', path: '/showcase', public: true, icon: Eye},
        {name: 'Store', path: '/store', public: false, icon: ShoppingBag},
        {name: 'Videos', path: '/videos', public: false, icon: Video},
    ]

    const publicLinks = navLinks.filter(link => link.public)
    const privateLinks = navLinks.filter(link => !link.public)

    return (
    <header className="sticky top-0 z-50 glassmorphism border-b border-wood-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-wood-700 rounded-lg flex items-center justify-center group-hover:bg-wood-800 transition-colors">
              <span className="text-wood-50 font-bold text-xl font-serif"><img src={logoKen} alt='Kens logo' width={85} height={85}/></span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-wood-900">Taylor BenchWorks</h1>
              <p className="text-sm text-wood-600">Fine Handcrafted Furniture</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}
            
            {isAuthenticated && privateLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
              >
                <div className="flex items-center space-x-2">
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-wood-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-wood-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-wood-50" />
                  </div>
                  <span className="font-medium text-wood-700">
                    {user?.first_name || user?.username}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-wood-200 py-2"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-wood-700 hover:bg-wood-50 transition-colors"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-wood-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-wood-200 py-4"
            >
              <nav className="flex flex-col space-y-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      {link.icon && <link.icon className="w-4 h-4" />}
                      <span>{link.name}</span>
                    </div>
                  </Link>
                ))}
                
                {isAuthenticated && privateLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <link.icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                ))}

                {/* Mobile Auth */}
                <div className="pt-4 border-t border-wood-200">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-wood-100"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 p-3 rounded-lg hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full btn-ghost text-center"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full btn-primary text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
    )
}
export default Header