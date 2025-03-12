import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, FileText, Trophy, Coins } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <ul className="flex space-x-4">
            <li>
              <NavLink 
                to="/user-data" 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>User Data</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/post-data" 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Post Data</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/leaderboards" 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Trophy className="mr-2 h-4 w-4" />
                <span>Leaderboards</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/payments" 
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Coins className="mr-2 h-4 w-4" />
                <span>Payments</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;