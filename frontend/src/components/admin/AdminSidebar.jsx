import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  MapPin,
  Calendar,
  Users,
  BarChart,
  Settings,
} from 'lucide-react';

const AdminSidebar = ({ stats }) => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-green-500" />
          <span className="text-gray-800">TurfBook</span>
        </h1>
      </div>
      
      <nav className="mt-6 px-4 space-y-1">
        {[
          { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
          { name: 'Grounds', icon: MapPin, href: '/admin/grounds', count: stats?.totalGrounds },
          { name: 'Bookings', icon: Calendar, href: '/admin/bookings', count: stats?.activeBookings },
         
          { name: 'Analytics', icon: BarChart, href: '/admin/analytics' },
         
        ].map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
              {item.count !== undefined && (
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;