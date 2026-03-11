import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a2e22] text-[#f9f8f6] pt-16 pb-8 border-t border-[#2c4c3b]">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 gap-12 mb-16 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">Amani</span>
              <span className="font-serif text-2xl tracking-tight text-[#8fa89b]">Herbalists</span>
            </Link>
            <p className="text-[#8fa89b] text-sm leading-relaxed mb-6">
              Bridging Ancient Chinese Medical Wisdom with Kenyan Vitality. Restore balance to your Qi with time-honored herbal formulas.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 transition-colors rounded-full bg-white/5 text-[#8fa89b] hover:text-white hover:bg-white/10">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 transition-colors rounded-full bg-white/5 text-[#8fa89b] hover:text-white hover:bg-white/10">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 font-serif text-lg font-medium text-white">Explore</h3>
            <ul className="space-y-4 text-sm text-[#8fa89b]">
              <li><Link to="/shop" className="transition-colors hover:text-white">The Apothecary</Link></li>
              <li><Link to="/philosophy" className="transition-colors hover:text-white">Our Philosophy</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-white">Book a Consultation</Link></li>
              <li><Link to="/admin" className="transition-colors hover:text-white flex items-center gap-2">Admin Login <span className="w-2 h-2 rounded-full bg-[#4a7c59]"></span></Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="mb-6 font-serif text-lg font-medium text-white">Customer Care</h3>
            <ul className="space-y-4 text-sm text-[#8fa89b]">
              <li><a href="#" className="transition-colors hover:text-white">Shipping & Delivery</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Returns Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-white">Track Your Order</a></li>
              <li><a href="#" className="transition-colors hover:text-white">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-6 font-serif text-lg font-medium text-white">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-[#8fa89b]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4a7c59] shrink-0" />
                <span>Nairobi Wellness Center,<br/>Kajiado County, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#4a7c59] shrink-0" />
                <span>+254 712 345 678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#4a7c59] shrink-0" />
                <span>jambo@amaniherbalists.co.ke</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between pt-8 border-t border-white/10 md:flex-row text-[#8fa89b] text-sm">
          <p>&copy; {currentYear} Amani Herbalists. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;