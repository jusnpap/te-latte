import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderCard from './OrderCard';

export default function CocinaView({ appState, socket }) {
  const [viewMode, setViewMode] = useState('pendientes'); // 'pendientes' | 'despachadas'

  const activeOrders = appState.ordenes.filter(o => o.status === 'recibida');
  const dispatchedOrders = appState.ordenes.filter(o => o.status === 'despachada');

  const handleDispatch = (orderId) => {
    socket.emit('dispatch_order', { orderId });
  };

  const currentOrders = viewMode === 'pendientes' ? activeOrders : dispatchedOrders;

  return (
    <div className="app-container" style={{ maxWidth: '100%' }}>
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>🍳</span> Módulo de Cocina
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestión de órdenes en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <button 
              className={`btn ${viewMode === 'pendientes' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setViewMode('pendientes')}
            >
              Pendientes ({activeOrders.length})
            </button>
            <button 
              className={`btn ${viewMode === 'despachadas' ? 'btn-success' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setViewMode('despachadas')}
            >
              Despachadas ({dispatchedOrders.length})
            </button>
          </div>
          <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <div className="glass animate-in" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {viewMode === 'pendientes' ? 'No hay órdenes pendientes' : 'No hay órdenes despachadas aún'}
          </h2>
          <p>{viewMode === 'pendientes' ? 'La cocina está libre por el momento. Buen trabajo.' : 'Las órdenes que marques como despachadas aparecerán aquí.'}</p>
        </div>
      ) : (
        <div className="animate-in" style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          overflowX: 'auto', 
          paddingBottom: '2rem',
          paddingTop: '0.5rem',
          alignItems: 'flex-start'
        }}>
          {currentOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDispatch={handleDispatch} 
              isCompleted={viewMode === 'despachadas'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
