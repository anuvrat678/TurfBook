import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Github, Linkedin } from 'lucide-react';
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
           
            <h3 className="text-2xl font-bold">
              <Link to="/">
              <span className="text-green-500">Turf</span>
              <span>Book</span></Link>
            </h3>
            <p className="text-gray-400">
              Your premier destination for sports ground bookings. Find and book top-quality turfs in your city.
            </p>
            <div className="text-sm text-gray-500 italic">
              A portfolio project by Anuvrat Rajpurohit
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/about" className="hover:text-green-500 transition-colors" title="About Us">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/grounds" className="hover:text-green-500 transition-colors" title="Find Grounds">
                  Find Grounds
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-500 transition-colors" title="Contact Us">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacypolicy" className="hover:text-green-500 transition-colors" title="Privacy Policy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>123 Sports Lane Mumbai, Maharashtra 400001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>+91 0000000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>info@turfbook.demo</span>
              </li>
            </ul>
          </div>

          {/* Social Media & Developer Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a
                  href="https://github.com/anuvrat678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-800 hover:bg-green-500 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/in/anuvrat-rajpurohit-a4b3b7251/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-800 hover:bg-green-500 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href="https://twitter.com/anuvrat678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-800 hover:bg-green-500 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
              <div className="text-sm text-gray-400">
                <p>Developed by</p>
                <p className="text-green-400 font-semibold">Anuvrat Rajpurohit</p>
                <p className="text-xs mt-1">Full Stack Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} TurfBook. All rights reserved.

          </p>
          <div className="text-xs mt-2 text-gray-500">
            This is a portfolio project. All data shown is for demonstration purposes.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;