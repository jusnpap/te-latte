import React, { useState } from 'react';
import { supabase } from '../../supabase';

export default function MenuManager({ menu, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '', is_active: true });

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, price: item.price, category: item.category, is_active: item.is_active });
  };

  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({ name: '', price: '', category: 'principales', is_active: true });
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.price || !editForm.category) return;
    
    if (editingId === 'new') {
      await supabase.from('menu_items').insert([{
        name: editForm.name,
        price: parseFloat(editForm.price),
        category: editForm.category,
        is_active: editForm.is_active
      }]);
    } else {
      await supabase.from('menu_items').update({
        name: editForm.name,
        price: parseFloat(editForm.price),
        category: editForm.category,
        is_active: editForm.is_active
      }).eq('id', editingId);
    }
    
    setEditingId(null);
  };

  const handleToggleActive = async (item) => {
    await supabase.from('menu_items').update({ is_active: !item.is_active }).eq('id', item.id);
  };

  return (
    <div className="glass animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📋</span> Gestión de Catálogo</h2>
        <div>
          <button className="btn btn-primary" onClick={handleAddNew} style={{ marginRight: '1rem' }}>+ Nuevo Producto</button>
          <button className="btn btn-outline" onClick={onClose}>Cerrar Panel</button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem' }}>
        {editingId === 'new' && (
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--primary-color)' }}>
            <h3>Añadir Nuevo Producto</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <input type="text" placeholder="Nombre (ej. Empanadas)" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }} />
              <input type="number" placeholder="Precio ($)" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }} />
              <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }}>
                <option value="principales">Platos Principales</option>
                <option value="bebidas">Bebidas</option>
                <option value="acompañantes">Acompañantes</option>
                <option value="arte">Arte y Cerámica</option>
              </select>
              <button className="btn btn-success" onClick={handleSave}>Guardar</button>
              <button className="btn btn-outline" onClick={() => setEditingId(null)}>Cancelar</button>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nombre</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Categoría</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Precio</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Estado</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: item.is_active ? 1 : 0.5 }}>
                {editingId === item.id ? (
                  <td colSpan="5" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }} />
                      <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }} />
                      <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--surface-border)' }}>
                        <option value="principales">Platos Principales</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="acompañantes">Acompañantes</option>
                        <option value="arte">Arte y Cerámica</option>
                      </select>
                      <button className="btn btn-success" onClick={handleSave}>Guardar</button>
                      <button className="btn btn-outline" onClick={() => setEditingId(null)}>Cancelar</button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ padding: '1rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>${Number(item.price).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: item.is_active ? 'rgba(35, 134, 54, 0.2)' : 'rgba(218, 54, 51, 0.2)', 
                        color: item.is_active ? '#7ee787' : '#ff9e9e',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {item.is_active ? 'Activo' : 'Agotado/Oculto'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.9rem' }} onClick={() => handleEdit(item)}>Editar</button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderColor: item.is_active ? 'var(--accent-red)' : 'var(--accent-green)', color: item.is_active ? 'var(--accent-red)' : 'var(--accent-green)' }} onClick={() => handleToggleActive(item)}>
                        {item.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
