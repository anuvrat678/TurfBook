import React from 'react';
import { Globe, Users, Shield, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-[65px] bg-gray-800">
  {/* Content goes here */} <Navbar />
</div>
      
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              <span className="text-green-600">TurfBook</span> - Redefining Sports Booking
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting sports enthusiasts with premium facilities since 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Globe, title: '50+ Locations', text: 'Across major cities' },
              { icon: Users, title: '10K+ Users', text: 'Active community' },
              { icon: Shield, title: 'Secure Booking', text: '100% safe transactions' },
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <stat.icon className="w-12 h-12 text-green-600 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{stat.title}</h3>
                <p className="text-gray-600 text-center">{stat.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 text-gray-600">
                <p className="text-base md:text-lg">
                  Founded in 2023 by sports enthusiasts, TurfBook emerged from a simple idea - 
                  making sports facility booking as seamless as modern hotel reservations.
                </p>
                
              </div>
              <div className=" rounded-lg h-64 "><img  src="assets\images\aboutus.jpg"
            alt="Sports Ground"
            className="w-full h-full rounded-lg object-cover opacity-90" /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Transparency', icon: Shield, color: 'bg-green-100' },
              { title: 'Accessibility', icon: Users, color: 'bg-blue-100' },
              { title: 'Quality', icon: Globe, color: 'bg-purple-100' },
              { title: '24/7 Support', icon: Clock, color: 'bg-pink-100' },
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm text-center">
                <div className={`${value.color} w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <value.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{value.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;