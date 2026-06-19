import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabase';
import { menuData } from './menu';

import MeseroView from './modules/mesero/MeseroView';
import CocinaView from './modules/cocina/CocinaView';
import CajaView from './modules/caja/CajaView';
import ContabilidadView from './modules/contabilidad/ContabilidadView';

function Home() {
  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass animate-in" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>☕ Te-latte</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>Sistema Integrado de Gestión</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/mesero" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📱</span> Módulo de Mesero
          </Link>
          <Link to="/cocina" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>👨‍🍳</span> Módulo de Cocina
          </Link>
          <Link to="/caja" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>💻</span> Módulo de Caja
          </Link>
          <Link to="/contabilidad" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📊</span> Módulo de Contabilidad
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [appState, setAppState] = useState({ mesas: [], ordenes: [], menu: menuData });

  useEffect(() => {
    // 1. Fetch initial state
    const fetchState = async () => {
      const { data: mesasData } = await supabase.from('mesas').select('*').order('id');
      const { data: ordersData } = await supabase.from('orders').select('*').neq('status', 'pagada');
      
      // Convertimos el snake_case de Postgres a camelCase para React
      const formattedMesas = mesasData?.map(m => ({ id: m.id, status: m.status, currentOrderId: m.current_order_id })) || [];
      const formattedOrders = ordersData?.map(o => ({ id: o.id, tableId: o.table_id, status: o.status, items: o.items, createdAt: o.created_at })) || [];
      
      setAppState({ mesas: formattedMesas, ordenes: formattedOrders, menu: menuData });
    };

    fetchState();

    // 2. Subscribe to real-time changes
    const channel = supabase.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, payload => {
        fetchState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
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
        <Route path="/" element={<Home />} />
        <Route path="/mesero" element={<MeseroView appState={appState} />} />
        <Route path="/cocina" element={<CocinaView appState={appState} />} />
        <Route path="/caja" element={<CajaView appState={appState} />} />
        <Route path="/contabilidad" element={<ContabilidadView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
