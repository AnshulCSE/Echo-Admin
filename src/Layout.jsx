import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Mic, ListMusic, LogOut, User, FileText } from "lucide-react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser; // Get the currently logged-in user

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/manage", label: "Manage Content", icon: <FileText size={20} /> },
    { path: "/add-story", label: "Create Story", icon: <PlusCircle size={20} /> },
    { path: "/add-episode", label: "Add Episode", icon: <Mic size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col p-4">
        
        {/* App Logo */}
        <div className="mb-8 flex items-center space-x-2 px-2">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <ListMusic className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Echo Admin
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`}
              >
                <span className={isActive ? "text-indigo-400" : "group-hover:text-white"}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE & LOGOUT SECTION */}
        <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="flex items-center px-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mr-3">
                    <User size={16} />
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Logged In As</p>
                    <p className="text-sm text-slate-300 truncate" title={user?.email}>
                        {user?.email || "Admin"}
                    </p>
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}