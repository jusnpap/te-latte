import React, { useState } from 'react';
import { supabase } from '../../supabase';

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, ingresa usuario y contraseña');
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (fetchError || !data) {
      setError('Usuario no encontrado o base de datos no configurada.');
      return;
    }

    if (data.password !== password) {
      setError('Contraseña incorrecta');
      return;
    }

    // Ingreso exitoso
    onLogin({ username: data.username, role: data.role });
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass animate-in" style={{ padding: '3rem', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>☕ Te-latte</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Acceso de Personal</p>
        </div>
        
        {error && <div style={{ background: 'rgba(218, 54, 51, 0.2)', padding: '0.75rem', borderRadius: '8px', color: '#ff9e9e', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Usuario</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', borderRadius: '8px', outline: 'none' }}
              placeholder="Ej: caja"
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: '#fff', borderRadius: '8px', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
