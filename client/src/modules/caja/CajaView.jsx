import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import MesaMap from '../../components/MesaMap';
import BillDetails from './BillDetails';
import OrderMenu from '../mesero/OrderMenu';

export default function CajaView({ appState }) {
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [isAddingExtra, setIsAddingExtra] = useState(false);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
    setIsAddingExtra(false);
  };

  const handleAddItems = async (itemsToAdd) => {
    if (!selectedMesa || !selectedMesa.currentOrderId) return;
    
    const order = appState.ordenes.find(o => o.id === selectedMesa.currentOrderId);
    if (!order) return;

    let updatedItems = [...order.items];
    itemsToAdd.forEach(item => {
      const existing = updatedItems.find(i => 
        i.productId === item.productId && 
        i.notes === item.notes &&
        i.isToGo === item.isToGo &&
        !i.dispatched
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        updatedItems.push(item);
      }
    });

    await supabase
      .from('orders')
      .update({ items: updatedItems, status: 'recibida' })
      .eq('id', selectedMesa.currentOrderId);

    setIsAddingExtra(false);
  };

  const handleCloseTable = async (tableId, paymentMethod) => {
    const mesa = appState.mesas.find(m => m.id === tableId);
    if (!mesa || !mesa.currentOrderId) return;

    // 1. Marcar la orden como pagada
    await supabase
      .from('orders')
      .update({ 
        status: 'pagada', 
        closed_at: new Date().toISOString(), 
        payment_method: paymentMethod 
      })
      .eq('id', mesa.currentOrderId);

    // 2. Liberar la mesa
    await supabase
      .from('mesas')
      .update({ status: 'libre', current_order_id: null })
      .eq('id', tableId);

    setSelectedMesa(null);
    setIsAddingExtra(false);
  };

  // Obtenemos la orden actual de la mesa seleccionada
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
        <div style={{ flex: 2, overflowY: 'auto' }}>
          <MesaMap 
            mesas={appState.mesas} 
            onMesaClick={handleMesaClick}
            selectedMesaId={selectedMesa?.id}
          />
        </div>

        <div style={{ flex: 1.5, minWidth: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          <BillDetails 
            table={selectedMesa}
            order={currentOrder}
            onAddExtraClick={() => setIsAddingExtra(true)}
            onCloseTable={handleCloseTable}
            onCancel={() => { setSelectedMesa(null); setIsAddingExtra(false); }}
          />
        </div>

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
