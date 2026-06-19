import React from 'react';

export default function MesaMap({ mesas, onMesaClick, selectedMesaId }) {
  // Posiciones físicas de las mesas según el plano del restaurante
  const gridPositions = {
    13: { col: 2, row: 1 },
    1:  { col: 1, row: 2 },
    5:  { col: 2, row: 2 },
    8:  { col: 3, row: 2 },
    2:  { col: 1, row: 3 },
    6:  { col: 2, row: 3 },
    9:  { col: 3, row: 3 },
    3:  { col: 1, row: 4 },
    7:  { col: 2, row: 4 },
    10: { col: 3, row: 4 },
    4:  { col: 1, row: 5 },
    11: { col: 1, row: 6 },
    12: { col: 2, row: 6 },
  };

  const getMesa = (id) => mesas.find(m => m.id === id);
  const cajaMesa = getMesa(0);

  const renderMesa = (mesaId) => {
    const mesa = getMesa(mesaId);
    const pos = gridPositions[mesaId];
    
    if (!mesa) {
      // Renderizar un placeholder vacío para mantener la cuadrícula si la mesa no existe en DB aún
      return <div key={`empty-${mesaId}`} style={pos ? { gridColumn: pos.col, gridRow: pos.row } : {}} />;
    }

    const isOccupied = mesa.status === 'ocupada';
    const isSelected = selectedMesaId === mesa.id;
    
    return (
      <button
        key={mesa.id}
        onClick={() => onMesaClick(mesa)}
        className="glass-card"
        style={{
          ...(pos ? { gridColumn: pos.col, gridRow: pos.row } : {}),
          padding: '1.25rem',
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
          transition: 'all 0.2s ease',
          minHeight: '110px'
        }}
      >
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isOccupied ? 'var(--accent-red)' : 'var(--accent-green)',
          boxShadow: `0 0 10px ${isOccupied ? 'var(--accent-red)' : 'var(--accent-green)'}`
        }} />
        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center' }}>
          {mesa.id}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isOccupied ? 'Ocupada' : 'Libre'}
        </span>
      </button>
    );
  };

  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
        <span style={{ color: 'var(--primary-color)' }}>📍</span> Plano del Restaurante
      </h2>
      
      {/* Botón de Caja (Arriba, ancho completo) */}
      {cajaMesa && (
        <button
          onClick={() => onMesaClick(cajaMesa)}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '400px',
            marginBottom: '2rem',
            padding: '1rem',
            border: selectedMesaId === 0 ? '2px solid var(--primary-color)' : `1px solid ${cajaMesa.status === 'ocupada' ? 'rgba(218, 54, 51, 0.4)' : 'rgba(35, 134, 54, 0.4)'}`,
            background: cajaMesa.status === 'ocupada' ? 'rgba(218, 54, 51, 0.1)' : 'rgba(35, 134, 54, 0.1)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-main)',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}
        >
          🥡 Caja / Mostrador (Para Llevar)
        </button>
      )}

      {/* Cuadrícula Física */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(6, auto)', 
        gap: '1rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        {Object.keys(gridPositions).map(id => renderMesa(Number(id)))}
      </div>
    </div>
  );
}
