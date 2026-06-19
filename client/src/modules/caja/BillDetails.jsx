import React, { useState } from 'react';

export default function BillDetails({ table, order, onAddExtraClick, onCloseTable, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  if (!table || table.status === 'libre' || !order) {
    return (
      <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.2rem' }}>Selecciona una mesa ocupada para ver y cobrar la cuenta.</p>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const toGoItemsCount = order.items.reduce((acc, item) => item.isToGo ? acc + item.quantity : acc, 0);
  const toGoFee = toGoItemsCount * 0.25;
  const total = subtotal + toGoFee;

  const handlePrintAndClose = () => {
    onCloseTable(table.id, paymentMethod);
  };

  return (
    <div className="glass animate-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>
          {table.id === 0 ? 'Caja / Para Llevar' : `Mesa ${table.id}`}
        </h2>
        <span style={{ color: 'var(--text-muted)' }}>Orden #{order.id.split('-')[0]}</span>
      </div>

      <div style={{ marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Detalle de Consumo</h3>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ fontWeight: '600', color: 'var(--primary-color)', marginRight: '0.5rem' }}>{item.quantity}x</span> {item.name} {item.isToGo && <span style={{fontSize:'0.8rem', color:'var(--accent-yellow)'}}>(Para llevar +$0.25)</span>}
            </div>
            <span style={{ fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-outline" style={{ marginBottom: '1.5rem', width: '100%', padding: '0.75rem' }} onClick={onAddExtraClick}>
        + Agregar producto de última hora
      </button>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {toGoFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--accent-yellow)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
            <span>Recargo para llevar ($0.25 c/u)</span>
            <span>${toGoFee.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-green)', paddingTop: toGoFee === 0 ? '1rem' : 0, borderTop: toGoFee === 0 ? '1px solid var(--surface-border)' : 'none' }}>
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Método de Pago</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['efectivo', 'tarjeta', 'transferencia'].map(m => (
              <button 
                key={m}
                className={`btn ${paymentMethod === m ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, textTransform: 'capitalize', padding: '0.75rem 0' }}
                onClick={() => setPaymentMethod(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-success" style={{ flex: 2, padding: '1rem', fontSize: '1.1rem' }} onClick={handlePrintAndClose}>
            🖨️ Facturar y Cerrar
          </button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
