import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import MesaMap from '../../components/MesaMap';
import OrderMenu from './OrderMenu';

export default function MeseroView({ appState }) {
  const [selectedMesa, setSelectedMesa] = useState(null);

  const handleMesaClick = (mesa) => {
    setSelectedMesa(mesa);
  };

  const handleSendOrder = async (items) => {
    if (!selectedMesa) return;

    // 1. Insertar nueva orden en Supabase
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert([{ table_id: selectedMesa.id, items }])
      .select()
      .single();

    if (error) {
      console.error("Error al crear la orden:", error);
      return;
    }

    // 2. Actualizar el estado de la mesa a ocupada
    await supabase
      .from('mesas')
      .update({ status: 'ocupada', current_order_id: newOrder.id })
      .eq('id', selectedMesa.id);

    setSelectedMesa(null);
  };

  const handleAddItems = async (itemsToAdd) => {
    if (!selectedMesa || !selectedMesa.currentOrderId) return;
    
    // Buscar la orden actual
    const order = appState.ordenes.find(o => o.id === selectedMesa.currentOrderId);
    if (!order) return;

    // Lógica de agrupamiento idéntica a la que teníamos en el backend
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

    // Actualizar la orden en Supabase
    await supabase
      .from('orders')
      .update({ items: updatedItems, status: 'recibida' })
      .eq('id', selectedMesa.currentOrderId);

    setSelectedMesa(null);
  };

  const currentOrder = selectedMesa && selectedMesa.status === 'ocupada'
    ? appState.ordenes.find(o => o.id === selectedMesa.currentOrderId)
    : null;

  return (
    <div className="app-container">
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>📱</span> Módulo de Mesero
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Toma y gestiona los pedidos de las mesas.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      <MesaMap 
        mesas={appState.mesas} 
        onMesaClick={handleMesaClick} 
        selectedMesaId={selectedMesa?.id}
      />

      {selectedMesa && (
        <div className="animate-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(13, 17, 23, 0.95)', backdropFilter: 'blur(8px)',
          zIndex: 50, padding: '2rem', overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              {selectedMesa.status === 'ocupada' ? `Agregando a Mesa ${selectedMesa.id}` : `Nueva Orden - Mesa ${selectedMesa.id}`}
            </h2>
            
            <OrderMenu 
              menu={appState.menu}
              currentOrderItems={currentOrder?.items || []}
              isExistingOrder={selectedMesa.status === 'ocupada'}
              onAddItems={handleAddItems}
              onSendOrder={handleSendOrder}
              onClose={() => setSelectedMesa(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
