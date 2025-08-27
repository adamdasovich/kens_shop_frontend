import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Instagram, Facebook, X } from 'lucide-react'
import logoKen from '../../assets/logo_ken.jpg'

const Footer = () => {
  return (
    <footer className="bg-wood-900 text-wood-50">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-wood-50 rounded-lg flex items-center justify-center">
                <span className="text-wood-900 font-bold text-xl font-serif"><img className='w-12 h-12 bg-wood-50 rounded-lg flex items-center justify-center' src={logoKen} alt='Kens logo' width={85} height={85}/></span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Taylor BenchWorks</h3>
                <p className="text-wood-300 text-sm">Fine Handcrafted Furniture</p>
              </div>
            </div>
            <p className="text-wood-300 mb-6 leading-relaxed">
              Creating heirloom-quality furniture with traditional craftsmanship and modern design. 
              Each piece is meticulously handcrafted using the finest materials and time-honored techniques.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-wood-800 hover:bg-wood-700 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-wood-800 hover:bg-wood-700 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              {/* <a href="#" className="w-10 h-10 bg-wood-800 hover:bg-wood-700 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-3">
              <Link to="/" className="block text-wood-300 hover:text-wood-100 transition-colors">
                Home
              </Link>
              <Link to="/showcase" className="block text-wood-300 hover:text-wood-100 transition-colors">
                Showcase
              </Link>
              <Link to="/store" className="block text-wood-300 hover:text-wood-100 transition-colors">
                Store
              </Link>
              <Link to="/videos" className="block text-wood-300 hover:text-wood-100 transition-colors">
                Videos
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-wood-400" />
                <span className="text-wood-300">ken@taylorbenchworks.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-wood-400" />
                <span className="text-wood-300">(905) 376-1934</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-wood-400 mt-0.5" />
                <span className="text-wood-300">
                  103 Victoria Street<br />
                  Colbourne, ON K0K 1S0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-wood-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-wood-400 text-sm">
            © 2024 Taylor BenchWorks. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="text-wood-400 hover:text-wood-300 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-wood-400 hover:text-wood-300 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="#" className="text-wood-400 hover:text-wood-300 text-sm transition-colors">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer