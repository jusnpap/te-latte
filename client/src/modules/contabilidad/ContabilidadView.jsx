import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';

export default function ContabilidadView() {
  const [reports, setReports] = useState([]);
  
  // Fechas locales (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const fetchReports = async () => {
    if (!startDate || !endDate) return;
    
    const startParts = startDate.split('-');
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0, 0);
    
    const endParts = endDate.split('-');
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pagada')
      .gte('closed_at', start.toISOString())
      .lte('closed_at', end.toISOString())
      .order('closed_at', { ascending: false });

    if (!error && data) {
      const formattedOrders = data.map(o => ({ 
        id: o.id, tableId: o.table_id, status: o.status, items: o.items, closedAt: o.closed_at, paymentMethod: o.payment_method 
      }));
      setReports(formattedOrders);
    }
  };

  const calculateTotals = () => {
    let total = 0;
    let byMethod = { efectivo: 0, tarjeta: 0, transferencia: 0 };
    
    reports.forEach(order => {
      const sub = order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const tax = sub * 0.16;
      const final = sub + tax;
      
      total += final;
      if (order.paymentMethod && byMethod[order.paymentMethod] !== undefined) {
        byMethod[order.paymentMethod] += final;
      }
    });

    return { total, byMethod };
  };

  const stats = calculateTotals();

  return (
    <div className="app-container" style={{ maxWidth: '1100px' }}>
      <div className="header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>📊</span> Módulo de Contabilidad
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Reportes financieros e historial de ventas.</p>
        </div>
        <Link to="/" className="btn btn-outline">Volver al Inicio</Link>
      </div>

      {/* Panel de Filtros */}
      <div className="glass animate-in" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Desde la fecha</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', borderRadius: '8px', fontFamily: 'inherit', colorScheme: 'dark' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Hasta la fecha</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', borderRadius: '8px', fontFamily: 'inherit', colorScheme: 'dark' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingBottom: '2px' }}>
          <button className="btn btn-primary" onClick={fetchReports} style={{ padding: '0.8rem 2rem' }}>🔍 Actualizar Reporte</button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid-auto animate-in" style={{ gap: '1.5rem', marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Total Vendido</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
            ${stats.total.toFixed(2)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '500' }}>Órdenes Cerradas</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {reports.length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '500' }}>Desglose por Método</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '1.1rem' }}>
            <span>Efectivo:</span> <strong>${stats.byMethod.efectivo.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '1.1rem' }}>
            <span>Tarjeta:</span> <strong>${stats.byMethod.tarjeta.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
            <span>Transferencia:</span> <strong>${stats.byMethod.transferencia.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Tabla Detallada */}
      <div className="glass animate-in" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Historial de Órdenes ({reports.length})</h2>
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No hay ventas registradas en las fechas seleccionadas.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', width: '80px' }}>ID</th>
                  <th style={{ padding: '1rem', width: '100px' }}>Mesa</th>
                  <th style={{ padding: '1rem', width: '180px' }}>Fecha/Hora</th>
                  <th style={{ padding: '1rem' }}>Productos Consumidos</th>
                  <th style={{ padding: '1rem', width: '120px' }}>Método</th>
                  <th style={{ padding: '1rem', width: '120px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice().map(order => {
                  const sub = order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                  const final = sub + (sub * 0.16);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }} title={order.id}>#{order.id.split('-')[0]}</td>
                      <td style={{ padding: '1rem' }}>Mesa {order.tableId}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(order.closedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {order.items.map((i, idx) => (
                            <span key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                              {i.quantity}x {i.name} {i.isToGo ? '🥡' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{order.paymentMethod}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>${final.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
