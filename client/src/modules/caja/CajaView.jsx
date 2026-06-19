import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MesaMap from '../../components/MesaMap';
import BillDetails from './BillDetails';
import OrderMenu from '../mesero/OrderMenu';

export default function CajaView({ appState, socket }) {
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
    setIsAddingExtra(false);
  };

  const handleAddItems = (items) => {
    if (!selectedMesa || !selectedMesa.currentOrderId) return;
    socket.emit('add_items_to_order', { orderId: selectedMesa.currentOrderId, items });
    setIsAddingExtra(false);
  };

  const handleCloseTable = (tableId, paymentMethod) => {
    socket.emit('close_table', { tableId, paymentMethod });
    setSelectedMesa(null);
    setIsAddingExtra(false);
  };

  // Obtenemos la orden actual de la mesa seleccionada, si existe
  const currentOrder = selectedMesa && selectedMesa.status === 'ocupada'
    ? appState.ordenes.find(o => o.id === selectedMesa.currentOrderId)
    : null;

  return (
    <div className="app-container">
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>💻</span> Módulo de Caja
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Centro de control de facturación y pagos.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', height: '75vh', minHeight: '650px', position: 'relative' }}>
        {/* Lado izquierdo: Mapa de Mesas */}
        <div style={{ flex: 2, overflowY: 'auto' }}>
          <MesaMap 
            mesas={appState.mesas} 
            onMesaClick={handleMesaClick}
            selectedMesaId={selectedMesa?.id}
          />
        </div>

        {/* Lado derecho: Detalles de la Cuenta */}
        <div style={{ flex: 1.5, minWidth: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <BillDetails 
            table={selectedMesa}
            order={currentOrder}
            onAddExtraClick={() => setIsAddingExtra(true)}
            onCloseTable={handleCloseTable}
            onCancel={() => { setSelectedMesa(null); setIsAddingExtra(false); }}
          />
        </div>

        {/* Modal para Agregar Extras con el mismo menú del mesero */}
        {isAddingExtra && selectedMesa && (
          <div className="animate-in" style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(13, 17, 23, 0.95)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            borderRadius: '16px'
          }}>
            <h2 style={{ marginBottom: '0.5rem', marginLeft: '1rem' }}>Agregando Extra a Mesa {selectedMesa.id}</h2>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <OrderMenu 
                menu={appState.menu}
                currentOrderItems={currentOrder?.items || []}
                isExistingOrder={true}
                onAddItems={handleAddItems}
                onSendOrder={() => {}}
                onClose={() => setIsAddingExtra(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
