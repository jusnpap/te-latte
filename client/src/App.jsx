import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { socket } from './socket';

import MeseroView from './modules/mesero/MeseroView';
import CocinaView from './modules/cocina/CocinaView';
import CajaView from './modules/caja/CajaView';
import ContabilidadView from './modules/contabilidad/ContabilidadView';

function Home() {
  return (
    <div className="app-container animate-in">
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #58a6ff, #a371f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Te-latte
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.2rem', fontWeight: 300 }}>Sistema de Gestión en Tiempo Real</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/mesero" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>📱</span> Módulo de Mesero
          </Link>
          <Link to="/cocina" className="btn glass-card" style={{ padding: '1.25rem', fontSize: '1.2rem', justifyContent: 'center', color: 'var(--text-main)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>🍳</span> Módulo de Cocina
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
  const [appState, setAppState] = useState({
    menu: { cafes: [], postres: [], sandwiches: [] },
    mesas: [],
    ordenes: []
  });

  useEffect(() => {
    socket.on('initial_state', (state) => {
      setAppState(state);
    });

    socket.on('state_updated', (state) => {
      setAppState(state);
    });

    return () => {
      socket.off('initial_state');
      socket.off('state_updated');
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mesero" element={<MeseroView appState={appState} socket={socket} />} />
        <Route path="/cocina" element={<CocinaView appState={appState} socket={socket} />} />
        <Route path="/caja" element={<CajaView appState={appState} socket={socket} />} />
        <Route path="/contabilidad" element={<ContabilidadView socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
