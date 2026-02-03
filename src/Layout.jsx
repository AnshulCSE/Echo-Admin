import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Radio, FolderOpen, UserCircle, ChevronLeft, ChevronRight, Users, Bell, Settings as SettingsIcon } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State for user details
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const user = auth.currentUser;

  useEffect(() => {
    // Load from local storage (set during login)
    const storedRole = localStorage.getItem("adminRole");
    const storedName = localStorage.getItem("adminName");
    setRole(storedRole || "");
    setName(storedName || "Admin");
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear(); // Clear role data
    navigate("/login");
  };

  // Define All Menu Items
  const allMenuItems = [
    { 
      label: "Overview", 
      path: "/", 
      icon: <LayoutDashboard size={20} />,
      requiredRole: "super_admin" // Only Founders see this
    },
    { 
      label: "App Users", 
      path: "/users", 
      icon: <Users size={20} />,
      requiredRole: "super_admin" 
    },
    // NEW MARKETING TAB
    { 
      label: "Marketing", 
      path: "/marketing", 
      icon: <Bell size={20} />,
      requiredRole: "all" 
    },
    { 
      label: "Content Library", 
      path: "/content", 
      icon: <FolderOpen size={20} />,
      requiredRole: "all" // Everyone sees this
    },
    { 
      label: "App Config", 
      path: "/settings", 
      icon: <SettingsIcon size={20} />,
      requiredRole: "super_admin" 
    }
  ];

  // Filter Menu based on Role
  const menuItems = allMenuItems.filter(item => 
    item.requiredRole === "all" || item.requiredRole === role
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans transition-all duration-300">
      
      <aside className={`${isCollapsed ? "w-20" : "w-64"} border-r border-slate-800 bg-slate-900/50 flex flex-col fixed h-full z-10 backdrop-blur-xl transition-all duration-300`}>
        
        {/* LOGO */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50 h-20">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Radio className="text-white" size={16} />
                </div>
                <div><h1 className="font-bold text-white text-base tracking-tight">ZingFM</h1></div>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ${isCollapsed ? "mx-auto" : ""}`}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                <span className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* USER PROFILE */}
        <div className="p-4 border-t border-slate-800/50">
            {!isCollapsed ? (
                <div className="animate-in fade-in">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserCircle size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{name}</p>
                            <p className="text-[10px] text-slate-500 truncate capitalize">{role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-xs font-medium">
                        <LogOut size={16} /> <span>Sign Out</span>
                    </button>
                </div>
            ) : (
                <button onClick={handleLogout} className="flex justify-center w-full p-2 text-slate-400 hover:text-red-400" title="Sign Out">
                    <LogOut size={20} />
                </button>
            )}
        </div>
      </aside>

      <main className={`flex-1 ${isCollapsed ? "ml-20" : "ml-64"} p-8 bg-slate-950 min-h-screen transition-all duration-300`}>
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;