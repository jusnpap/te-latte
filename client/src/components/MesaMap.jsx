import React from 'react';

export default function MesaMap({ mesas, onMesaClick, selectedMesaId }) {
  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'var(--primary-color)' }}>📍</span> Mapa de Mesas
      </h2>
      <div className="grid-auto">
        {mesas.map((mesa) => {
          const isOccupied = mesa.status === 'ocupada';
          const isSelected = selectedMesaId === mesa.id;
          
          return (
            <button
              key={mesa.id}
              onClick={() => onMesaClick(mesa)}
              className="glass-card"
              style={{
                padding: '1.5rem',
                border: isSelected 
                  ? '2px solid var(--primary-color)' 
                  : `1px solid ${isOccupied ? 'rgba(218, 54, 51, 0.4)' : 'rgba(35, 134, 54, 0.4)'}`,
                background: isOccupied 
                  ? 'linear-gradient(135deg, rgba(218, 54, 51, 0.1), rgba(218, 54, 51, 0.05))'
                  : 'linear-gradient(135deg, rgba(35, 134, 54, 0.1), rgba(35, 134, 54, 0.05))',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-main)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isOccupied ? 'var(--accent-red)' : 'var(--accent-green)',
                boxShadow: `0 0 10px ${isOccupied ? 'var(--accent-red)' : 'var(--accent-green)'}`
              }} />
              <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Mesa {mesa.id}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isOccupied ? 'Ocupada' : 'Libre'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
