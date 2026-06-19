import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

import LoginView from './modules/login/LoginView';
import MeseroView from './modules/mesero/MeseroView';
import CocinaView from './modules/cocina/CocinaView';
import CajaView from './modules/caja/CajaView';
import ContabilidadView from './modules/contabilidad/ContabilidadView';

function Home({ currentUser, onLogout }) {
  if (!currentUser) return <Navigate to="/login" />;

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass animate-in" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
           <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Cerrar Sesión ({currentUser.username})</button>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>☕ Te-latte</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>Sistema Integrado de Gestión</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(currentUser.role === 'mesero' || currentUser.role === 'contabilidad') && (
            <Link to="/mesero" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📱</span> Módulo de Mesero
            </Link>
          )}
          {(currentUser.role === 'cocina' || currentUser.role === 'contabilidad') && (
            <Link to="/cocina" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>👨‍🍳</span> Módulo de Cocina
            </Link>
          )}
          {(currentUser.role === 'caja' || currentUser.role === 'contabilidad') && (
            <Link to="/caja" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>💻</span> Módulo de Caja
            </Link>
          )}
          {currentUser.role === 'contabilidad' && (
            <Link to="/contabilidad" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📊</span> Módulo de Contabilidad
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appState, setAppState] = useState({ mesas: [], ordenes: [], menu: [] });

  useEffect(() => {
    const fetchState = async () => {
      const { data: mesasData } = await supabase.from('mesas').select('*').order('id');
      const { data: ordersData } = await supabase.from('orders').select('*').neq('status', 'pagada');
      const { data: menuData } = await supabase.from('menu_items').select('*').order('category');
      
      const formattedMesas = mesasData?.map(m => ({ id: m.id, status: m.status, currentOrderId: m.current_order_id })) || [];
      const formattedOrders = ordersData?.map(o => ({ id: o.id, tableId: o.table_id, status: o.status, items: o.items, createdAt: o.created_at })) || [];
      const formattedMenu = menuData || [];
      
      setAppState({ mesas: formattedMesas, ordenes: formattedOrders, menu: formattedMenu });
    };

    fetchState();

    const channel = supabase.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, payload => {
        fetchState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
        fetchState();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginView onLogin={setCurrentUser} />} />
        <Route path="/" element={<Home currentUser={currentUser} onLogout={() => setCurrentUser(null)} />} />
        <Route path="/mesero" element={currentUser ? <MeseroView appState={appState} /> : <Navigate to="/login" />} />
        <Route path="/cocina" element={currentUser ? <CocinaView appState={appState} /> : <Navigate to="/login" />} />
        <Route path="/caja" element={currentUser ? <CajaView appState={appState} /> : <Navigate to="/login" />} />
        <Route path="/contabilidad" element={currentUser ? <ContabilidadView /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
