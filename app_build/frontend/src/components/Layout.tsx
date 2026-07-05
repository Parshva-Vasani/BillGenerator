import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, UserCircle, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'New Invoice', path: '/invoice', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            <h1 className="text-xl font-black text-blue-600 tracking-tight leading-tight">Fruits Billing<br/>& Analytics</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍎</span>
            <h1 className="text-xl font-black text-blue-600 tracking-tight">Fruits Billing</h1>
          </div>
          <button onClick={onLogout} className="text-red-600">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-50 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
