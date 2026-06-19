import React, { useState } from 'react';

export default function OrderMenu({ menu, currentOrderItems, isExistingOrder, onAddItems, onSendOrder, onClose }) {
  const [localItems, setLocalItems] = useState([]);
  const activeMenu = menu.filter(item => item.is_active);
  const orderedCategories = ['principales', 'bebidas', 'acompañantes', 'arte'];
  const [activeTab, setActiveTab] = useState(orderedCategories[0]);

  const categoryTitles = {
    'principales': 'Platos Principales',
    'bebidas': 'Bebidas',
    'acompañantes': 'Algo para Acompañar',
    'arte': 'Experiencia de Arte'
  };

  const handleAddItem = (product) => {
    setLocalItems(prev => {
      const existing = prev.find(i => i.productId === product.id && i.notes === '');
      if (existing) {
        return prev.map(i => (i.productId === product.id && i.notes === '') ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1, notes: '', isToGo: false, toGoQuantity: 0 }];
    });
  };

  const handleRemoveLocal = (indexToRemove) => {
    setLocalItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateNotes = (indexToUpdate, notes) => {
    setLocalItems(prev => prev.map((item, idx) => idx === indexToUpdate ? { ...item, notes } : item));
  };

  const handleToggleToGo = (indexToUpdate, checked) => {
    setLocalItems(prev => prev.map((item, idx) => 
      idx === indexToUpdate ? { ...item, isToGo: checked, toGoQuantity: checked ? 1 : 0 } : item
    ));
  };

  const handleUpdateToGoQuantity = (indexToUpdate, delta) => {
    setLocalItems(prev => prev.map((item, idx) => {
      if (idx === indexToUpdate) {
        let newToGo = (item.toGoQuantity || 1) + delta;
        if (newToGo < 1) newToGo = 1;
        if (newToGo > item.quantity) newToGo = item.quantity;
        return { ...item, toGoQuantity: newToGo };
      }
      return item;
    }));
  };
  
  const handleUpdateQuantity = (indexToUpdate, delta) => {
    setLocalItems(prev => prev.map((item, idx) => {
      if (idx === indexToUpdate) {
        let newQty = item.quantity + delta;
        if (newQty < 1) newQty = 1;
        let newToGo = item.toGoQuantity || 0;
        if (newToGo > newQty) newToGo = newQty;
        return { ...item, quantity: newQty, toGoQuantity: newToGo };
      }
      return item;
    }));
  };

  const handleSend = () => {
    if (localItems.length === 0) return;
    if (isExistingOrder) {
      onAddItems(localItems);
    } else {
      onSendOrder(localItems);
    }
    setLocalItems([]);
    onClose();
  };

  const itemsForTab = activeMenu.filter(item => item.category === activeTab);

  return (
    <div className="glass animate-in responsive-flex" style={{ padding: '2rem', display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
      {/* Menu Categories and Items */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {orderedCategories.map(cat => {
            const hasItems = activeMenu.some(item => item.category === cat);
            if (!hasItems) return null;
            return (
              <button 
                key={cat} 
                className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(cat)}
                style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}
              >
                {categoryTitles[cat] || cat}
              </button>
            );
          })}
        </div>
        
        <div className="grid-auto">
          {itemsForTab.map(item => (
            <button 
              key={item.id} 
              className="glass-card"
              style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)', textAlign: 'left' }}
              onClick={() => handleAddItem(item)}
            >
              <span style={{ fontWeight: '500', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.name}</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '1.2rem' }}>${Number(item.price || 0).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: '320px', alignSelf: 'flex-start', position: 'sticky', top: '2rem' }}>
        <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Resumen de Orden</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Total: ${(
              (currentOrderItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0) + 
              localItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
            ).toFixed(2)}
          </span>
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Existing Items */}
          {currentOrderItems?.map((item, idx) => (
            <div key={`exist-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem', borderLeft: '3px solid var(--accent-green)', paddingLeft: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{item.quantity}x {item.name} <span style={{fontSize:'0.8rem'}}>(Enviado)</span></span>
                {item.isToGo && <span style={{fontSize:'0.8rem', color: 'var(--accent-yellow)'}}>({item.toGoQuantity || item.quantity} para llevar)</span>}
                {item.notes && <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{item.notes}</span>}
              </div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          {/* New Items */}
          {localItems.map((item, idx) => (
            <div key={`local-${idx}`} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => handleUpdateQuantity(idx, -1)} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem' }}>-</button>
                  <span style={{ fontWeight: '500' }}>{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(idx, 1)} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem' }}>+</button>
                  <span style={{ fontWeight: '500', marginLeft: '0.5rem' }}>{item.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => handleRemoveLocal(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '0.5rem' }}>×</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Notas (ej. sin azúcar)" 
                  value={item.notes}
                  onChange={(e) => handleUpdateNotes(idx, e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={item.isToGo} onChange={(e) => handleToggleToGo(idx, e.target.checked)} style={{ accentColor: 'var(--primary-color)' }} />
                    Para llevar
                  </label>
                  {item.isToGo && item.quantity > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-yellow)' }}>
                      <button onClick={() => handleUpdateToGoQuantity(idx, -1)} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem' }}>-</button>
                      <span>{item.toGoQuantity || 1} para llevar</span>
                      <button onClick={() => handleUpdateToGoQuantity(idx, 1)} className="btn btn-outline" style={{ padding: '0.1rem 0.4rem' }}>+</button>
                    </div>
                  )}
                  {item.isToGo && item.quantity === 1 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-yellow)' }}>(1 para llevar)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!currentOrderItems?.length && !localItems.length) && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              Añade productos para comenzar
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            className="btn btn-success" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={handleSend}
            disabled={localItems.length === 0}
          >
            {isExistingOrder ? 'Enviar Nuevos Ítems' : 'Enviar a Cocina'}
          </button>
          <button className="btn btn-outline" onClick={onClose} style={{ width: '100%' }}>
            Volver al Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
