import React from 'react';
import { Shield, Lock, Database, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Shield,
      title: 'Data Protection',
      content: 'We implement industry-standard security measures to protect your personal information.'
    },
    {
      icon: Lock,
      title: 'Information Usage',
      content: 'Your data is only used to provide and improve our services. We never sell your information.'
    },
    {
      icon: Database,
      title: 'Third Parties',
      content: 'We only share necessary information with verified partners for service delivery.'
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal data at any time.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-[65px] bg-gray-800">
  {/* Content goes here */} <Navbar />
</div>
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Privacy <span className="text-green-600">Policy</span>
            </h1>
            
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-600 mb-8">
                At TurfBook, we are committed to protecting your privacy. This policy explains how we collect,
                use, and safeguard your personal information.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {sections.map((section, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <section.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h3>
                      <p className="text-gray-600">{section.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                <li>Account information (name, email, contact details)</li>
                <li>Booking history and preferences</li>
                <li>Device and usage data for service improvement</li>
                <li>Payment information (processed securely through our partners)</li>
              </ul>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700">
                  For any privacy-related inquiries, contact our Data Protection Officer at 
                  <a href="#" className="underline ml-1">dpo@turfbook.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;