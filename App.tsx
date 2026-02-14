
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  ClipboardList,
  BarChart3,
  Settings,
  PlusCircle,
  LogOut,
  Shield,
  LayoutDashboard,
  Users as UsersIcon,
  Key
} from 'lucide-react';

import Home from './pages/Home';
import NewOperative from './pages/NewOperative';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import OperativeDetails from './pages/OperativeDetails';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';

import { Operative, User, CatalogEntry } from './types';
import { OPERATIVE_TYPES, COLONIA_CATALOG as DEFAULT_COLONIES } from './constants';
import { removeAccents } from './utils';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [opTypes, setOpTypes] = useState<string[]>([]);
  const [coloniaCatalog, setColoniaCatalog] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Operatives
        const { data: ops } = await supabase.from('operatives').select('*').order('created_at', { ascending: false });
        if (ops) setOperatives(ops as Operative[]);

        // Fetch Users (Profiles)
        const { data: profs } = await supabase.from('profiles').select('*');
        if (profs && profs.length > 0) {
          setUsers(profs as User[]);
        } else {
          // SEED: If no users, create initial admin
          const initialAdmin: User = { id: '1', fullName: 'ADMINISTRADOR PRINCIPAL', username: 'admin', password: 'adm123', role: 'ADMIN' };
          const { error } = await supabase.from('profiles').insert([initialAdmin]);
          if (!error) setUsers([initialAdmin]);
        }

        // Fetch Op Types
        const { data: types } = await supabase.from('operative_types').select('name');
        if (types && types.length > 0) {
          setOpTypes(types.map(t => t.name));
        } else {
          // SEED: Operative Types
          const typesToInsert = OPERATIVE_TYPES.map(name => ({ name }));
          await supabase.from('operative_types').insert(typesToInsert);
          setOpTypes(OPERATIVE_TYPES);
        }

        // Fetch Colonia Catalog
        const { data: colonies } = await supabase.from('colonia_catalog').select('*');
        if (colonies && colonies.length > 0) {
          setColoniaCatalog(colonies as CatalogEntry[]);
        } else {
          // SEED: Colonies (Careful with large data, maybe omit or seed in batches)
          // For now, only seed if empty to avoid duplicates
          await supabase.from('colonia_catalog').insert(DEFAULT_COLONIES.slice(0, 100)); // Seed first 100 as sample
          setColoniaCatalog(DEFAULT_COLONIES);
        }

      } catch (err: any) {
        console.error('Error fetching data from Supabase:', err);
        setError(err.message || 'Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Faltan las variables de entorno de Supabase (URL o Anon Key). Por favor, agrégalas en el panel de Vercel.');
      setLoading(false);
    } else {
      fetchData();
    }

    const savedUser = localStorage.getItem('ixta_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // No longer syncing whole state to localStorage as primary source

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ixta_user');
  };

  const addOperative = async (op: Operative) => {
    const { error } = await supabase.from('operatives').insert([op]);
    if (!error) setOperatives(prev => [op, ...prev]);
    else alert('Error al guardar en la nube: ' + error.message);
  };

  const updateOperative = async (id: string, updates: Partial<Operative>) => {
    const { error } = await supabase.from('operatives').update(updates).eq('id', id);
    if (!error) setOperatives(prev => prev.map(op => op.id === id ? { ...op, ...updates } : op));
    else alert('Error al actualizar en la nube: ' + error.message);
  };

  const deleteOperative = async (id: string) => {
    if (!confirm('¿ESTÁ SEGURO DE ELIMINAR ESTE OPERATIVO?')) return;
    const { error } = await supabase.from('operatives').delete().eq('id', id);
    if (!error) setOperatives(prev => prev.filter(op => op.id !== id));
    else alert('Error al eliminar en la nube: ' + error.message);
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ password: newPassword }).eq('id', user.id);
    if (!error) {
      const updatedSelf = { ...user, password: newPassword };
      setUser(updatedSelf);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedSelf : u));
      localStorage.setItem('ixta_user', JSON.stringify(updatedSelf));
      alert('CONTRASEÑA ACTUALIZADA CORRECTAMENTE');
    } else {
      alert('Error al actualizar contraseña: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-blue-500 animate-pulse" />
          <p className="text-blue-500 font-black tracking-widest text-sm animate-pulse">CARGANDO SISTEMA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 text-center space-y-6">
          <div className="inline-flex p-4 bg-red-500/10 rounded-2xl">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase">ERROR DE SISTEMA</h2>
          <p className="text-slate-400 text-sm leading-relaxed uppercase">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all uppercase"
          >
            REINTENTAR CONEXIÓN
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login users={users} onLogin={(u) => { setUser(u); localStorage.setItem('ixta_user', JSON.stringify(u)); }} />;
  }

  // Permission Checks
  const canViewDashboard = ['ADMIN', 'DIRECTOR', 'REGIONAL', 'JEFE_DE_TURNO', 'JEFE_AGRUPAMIENTO', 'ANALISTA'].includes(user.role);
  const canViewStats = ['ADMIN', 'DIRECTOR', 'REGIONAL', 'JEFE_AGRUPAMIENTO', 'ANALISTA'].includes(user.role);
  const canAddOp = !['DIRECTOR', 'ANALISTA'].includes(user.role);
  const canManageUsers = user.role === 'ADMIN';
  const canManageCatalog = ['ADMIN', 'ANALISTA'].includes(user.role);
  const canUpdatePassword = ['ADMIN', 'DIRECTOR', 'REGIONAL', 'JEFE_AGRUPAMIENTO', 'ANALISTA'].includes(user.role);

  return (
    <Router>
      <div className="flex flex-col min-h-screen pb-24 md:pb-0 md:pl-20 bg-slate-950 text-slate-100 uppercase">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold">OPERATIVOS</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded uppercase">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </header>

        <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-20 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex md:flex-col items-center z-50">
          <div className="hidden md:flex items-center justify-center py-6 w-full">
            <Shield className="w-10 h-10 text-blue-500" />
          </div>

          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar w-full md:h-full items-center px-2 py-2 md:py-0 gap-1 md:gap-4 scroll-smooth">
            {canViewDashboard ? (
              <NavLink to="/" icon={<LayoutDashboard />} label="PANEL" />
            ) : (
              <NavLink to="/operatives" icon={<ClipboardList />} label="HISTORIAL" />
            )}

            {canViewStats && (
              <NavLink to="/stats" icon={<BarChart3 />} label="ESTADISTICAS" />
            )}

            {canAddOp && (
              <NavLink to="/new" icon={<PlusCircle />} label="NUEVO" />
            )}

            {canViewDashboard && (
              <NavLink to="/operatives" icon={<ClipboardList />} label="LISTA" />
            )}

            {(canManageUsers || canManageCatalog) && (
              <NavLink to="/admin" icon={<Settings />} label="ADMIN" />
            )}

            {canUpdatePassword && (
              <NavLink to="/profile" icon={<Key />} label="CONTRASEÑA" />
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center shrink-0 w-20 h-16 md:w-16 md:h-16 rounded-xl text-red-500 hover:bg-red-500/10 transition-all md:mt-auto md:mb-6"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-[9px] uppercase font-black tracking-tighter mt-1">SALIR</span>
            </button>
          </div>
        </nav>

        <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
          <Routes>
            <Route path="/" element={canViewDashboard ? <Home operatives={operatives} user={user} /> : <Navigate to="/operatives" />} />
            <Route path="/new" element={canAddOp ? <NewOperative operatives={operatives} addOperative={addOperative} opTypes={opTypes} user={user} coloniaCatalog={coloniaCatalog} /> : <Navigate to="/" />} />
            <Route path="/operatives" element={<Home operatives={operatives} showAll={true} user={user} />} />
            <Route path="/stats" element={canViewStats ? <Statistics operatives={operatives} opTypes={opTypes} /> : <Navigate to="/" />} />
            <Route path="/admin" element={(canManageUsers || canManageCatalog) ? <Admin opTypes={opTypes} setOpTypes={setOpTypes} operatives={operatives} users={users} setUsers={setUsers} currentUserRole={user.role} coloniaCatalog={coloniaCatalog} setColoniaCatalog={setColoniaCatalog} /> : <Navigate to="/" />} />
            <Route path="/operative/:id" element={<OperativeDetails operatives={operatives} updateOperative={updateOperative} role={user.role} userId={user.id} deleteOperative={deleteOperative} coloniaCatalog={coloniaCatalog} />} />
            <Route path="/profile" element={canUpdatePassword ? <UserProfile user={user} updatePassword={updatePassword} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center shrink-0 w-20 h-16 md:w-16 md:h-16 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-500' : 'text-slate-400 hover:bg-slate-800'}`}
    >
      {/* Cast to any to bypass type error for Lucide icon cloning */}
      {React.cloneElement(icon as any, { className: "w-6 h-6" })}
      <span className="text-[9px] uppercase font-black tracking-tighter mt-1">{label}</span>
    </Link>
  );
};

export default App;
