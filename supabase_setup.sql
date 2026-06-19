-- Ejecuta este script completo en el SQL Editor de tu Dashboard de Supabase

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. Tabla de Mesas
create table if not exists public.mesas (
  id bigint primary key,
  status text not null default 'libre',
  current_order_id uuid
);

-- Insertar las 8 mesas por defecto (solo si no existen)
insert into public.mesas (id, status) values 
  (1, 'libre'), (2, 'libre'), (3, 'libre'), (4, 'libre'),
  (5, 'libre'), (6, 'libre'), (7, 'libre'), (8, 'libre')
on conflict (id) do nothing;

-- 2. Tabla de Órdenes
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  table_id bigint references public.mesas(id),
  status text not null default 'recibida', -- 'recibida', 'despachada', 'pagada'
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  payment_method text
);

-- Habilitar Realtime para que la app se actualice sola
alter publication supabase_realtime add table public.mesas;
alter publication supabase_realtime add table public.orders;

-- Para desarrollo rápido: Desactivar RLS (Row Level Security) 
-- Esto permite que el frontend conecte y modifique sin autenticación de usuarios.
alter table public.mesas disable row level security;
alter table public.orders disable row level security;
