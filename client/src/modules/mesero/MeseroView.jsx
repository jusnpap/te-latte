import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MesaMap from '../../components/MesaMap';
import OrderMenu from './OrderMenu';

export default function MeseroView({ appState, socket }) {
  const [selectedMesa, setSelectedMesa] = useState(null);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleSendOrder = (items) => {
    if (!selectedMesa) return;
    socket.emit('create_order', { tableId: selectedMesa.id, items });
    setSelectedMesa(null);
  };

  const handleAddItems = (items) => {
    if (!selectedMesa || !selectedMesa.currentOrderId) return;
    socket.emit('add_items_to_order', { orderId: selectedMesa.currentOrderId, items });
    setSelectedMesa(null);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>📱</span> Módulo de Mesero
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Selecciona una mesa para tomar el pedido.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      {!selectedMesa ? (
        <div className="animate-in">
          <MesaMap 
            mesas={appState.mesas} 
            onMesaClick={handleMesaClick} 
          />
        </div>
      ) : (
        <div className="animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '12px' }}>
            <h2 style={{ margin: 0 }}>Mesa {selectedMesa.id}</h2>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '999px', 
              fontSize: '0.9rem', 
              fontWeight: '500',
              background: selectedMesa.status === 'ocupada' ? 'rgba(218, 54, 51, 0.2)' : 'rgba(35, 134, 54, 0.2)',
              color: selectedMesa.status === 'ocupada' ? 'var(--accent-red)' : 'var(--accent-green)'
            }}>
              {selectedMesa.status === 'ocupada' ? 'Ocupada' : 'Libre'}
            </span>
          </div>
          
          <OrderMenu 
            menu={appState.menu}
            currentOrderItems={
              selectedMesa.status === 'ocupada' 
                ? appState.ordenes.find(o => o.id === selectedMesa.currentOrderId)?.items || []
                : []
            }
            isExistingOrder={selectedMesa.status === 'ocupada'}
            onAddItems={handleAddItems}
            onSendOrder={handleSendOrder}
            onClose={() => setSelectedMesa(null)}
          />
        </div>
      )}
    </div>
  );
}
