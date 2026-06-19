import React, { useState, useEffect } from 'react';

export default function OrderCard({ order, onDispatch, isCompleted }) {
  const [elapsed, setElapsed] = useState('');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    // Si ya está completada, podemos usar la fecha en que se despachó o simplemente no mostrar cronómetro activo.
    // Para simplificar, mostramos el tiempo transcurrido hasta ahora o lo congelamos.
    // Como no guardamos la hora exacta de "despachado" en el modelo rápido, dejaremos que corra o mostraremos un texto fijo.
    const updateTime = () => {
      const start = new Date(order.createdAt).getTime();
      const end = isCompleted && order.closedAt ? new Date(order.closedAt).getTime() : new Date().getTime(); // aproximación
      const diff = end - start;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsed(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
      if (!isCompleted) {
        setIsLate(diff > 10 * 60000); // Marca como tarde después de 10 minutos
      } else {
        setIsLate(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt, isCompleted, order.closedAt]);

  return (
    <div className="glass-card animate-in" style={{
      background: isLate ? 'rgba(218, 54, 51, 0.15)' : (isCompleted ? 'rgba(35, 134, 54, 0.1)' : 'rgba(255,255,255,0.03)'),
      border: `1px solid ${isLate ? 'rgba(218, 54, 51, 0.5)' : (isCompleted ? 'rgba(35, 134, 54, 0.3)' : 'var(--surface-border)')}`,
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      color: 'var(--text-main)',
      width: '320px',
      opacity: isCompleted ? 0.8 : 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Mesa {order.tableId}</h3>
        <span style={{ 
          fontSize: '0.9rem', 
          fontWeight: 'bold', 
          color: isLate ? '#ff6b6b' : (isCompleted ? 'var(--accent-green)' : 'var(--accent-yellow)'),
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(0,0,0,0.3)',
          padding: '0.2rem 0.6rem',
          borderRadius: '4px'
        }}>
          {isCompleted ? '✓' : '⏱'} {elapsed}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '300px', paddingRight: '0.5rem' }}>
        {order.items.map((item, idx) => {
          const isItemDispatched = item.dispatched;
          return (
            <div key={idx} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `3px solid ${isCompleted || isItemDispatched ? 'var(--accent-green)' : 'var(--primary-color)'}`, opacity: isItemDispatched && !isCompleted ? 0.6 : 1 }}>
              <div style={{ fontWeight: '500', fontSize: '1.1rem', textDecoration: isCompleted || isItemDispatched ? 'line-through' : 'none' }}>
                {item.quantity}x {item.name} {item.isToGo && <span style={{fontSize: '0.8rem', color: 'var(--accent-yellow)', textDecoration: 'none', marginLeft: '0.5rem'}}>(Para llevar)</span>}
              </div>
              {item.notes && <div style={{ color: '#ff9e9e', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{textDecoration: 'none'}}>⚠️</span> <span style={{textDecoration: 'none'}}>{item.notes}</span>
              </div>}
            </div>
          );
        })}
      </div>

      {!isCompleted && (
        <button 
          className="btn btn-success" 
          onClick={() => onDispatch(order.id)}
          style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}
        >
          ✔ Listo / Despachado
        </button>
      )}
    </div>
  );
}
