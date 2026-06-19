import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import OrderCard from './OrderCard';

export default function CocinaView({ appState }) {
  const [activeTab, setActiveTab] = useState('pendientes');

  const pendingOrders = appState.ordenes.filter(o => o.status === 'recibida');
  const dispatchedOrders = appState.ordenes.filter(o => o.status === 'despachada');

  const displayOrders = activeTab === 'pendientes' ? pendingOrders : dispatchedOrders;

  const handleDispatchOrder = async (orderId) => {
    const order = appState.ordenes.find(o => o.id === orderId);
    if (!order) return;
    
    const updatedItems = order.items.map(item => ({ ...item, dispatched: true }));
    
    await supabase
      .from('orders')
      .update({ status: 'despachada', items: updatedItems })
      .eq('id', orderId);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>👨‍🍳</span> Módulo de Cocina
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualiza y despacha los pedidos.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'pendientes' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('pendientes')}
          style={{ flex: 1, padding: '1rem' }}
        >
          Pendientes ({pendingOrders.length})
        </button>
        <button 
          className={`btn ${activeTab === 'despachadas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('despachadas')}
          style={{ flex: 1, padding: '1rem', backgroundColor: activeTab === 'despachadas' ? 'var(--accent-green)' : 'transparent', borderColor: activeTab === 'despachadas' ? 'transparent' : 'var(--surface-border)' }}
        >
          Despachadas ({dispatchedOrders.length})
        </button>
      </div>

      {displayOrders.length === 0 ? (
        <div className="glass animate-in" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            {activeTab === 'pendientes' ? '🎉' : '💤'}
          </span>
          <h2>{activeTab === 'pendientes' ? '¡Excelente trabajo!' : 'Aún no hay despachos'}</h2>
          <p>{activeTab === 'pendientes' ? 'No hay órdenes pendientes en este momento.' : 'Las órdenes terminadas aparecerán aquí.'}</p>
        </div>
      ) : (
        <div className="grid-auto">
          {displayOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDispatch={handleDispatchOrder}
              isCompleted={activeTab === 'despachadas'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
