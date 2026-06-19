import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import OrderCard from './OrderCard';

export default function CocinaView({ appState }) {
  // Solo mostramos las órdenes que no estén pagadas
  const pendingOrders = appState.ordenes.filter(o => o.status !== 'pagada');

  const handleDispatchOrder = async (orderId) => {
    const order = pendingOrders.find(o => o.id === orderId);
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
          <p style={{ color: 'var(--text-muted)' }}>Visualiza y despacha los pedidos pendientes.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="glass animate-in" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
          <h2>¡Excelente trabajo!</h2>
          <p>No hay órdenes pendientes en este momento.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {pendingOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDispatch={handleDispatchOrder} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
