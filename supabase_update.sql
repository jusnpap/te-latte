-- Ejecuta este script en el SQL Editor de Supabase (haz clic en "Run without RLS")

-- 1. Tabla de Usuarios (Login)
create table if not exists public.app_users (
  username text primary key,
  password text not null,
  role text not null
);

-- Insertar usuarios por defecto
insert into public.app_users (username, password, role) values 
  ('mesero', 'mesero123', 'mesero'),
  ('cocina', 'cocina123', 'cocina'),
  ('caja', 'caja123', 'caja'),
  ('admin', 'admin123', 'contabilidad')
on conflict (username) do nothing;

-- 2. Tabla de Menú (Productos Dinámicos)
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null,
  category text not null, -- 'cafes', 'postres', 'sandwiches' u otras
  is_active boolean not null default true
);

-- Migrar el menú original a la base de datos (solo si está vacía)
insert into public.menu_items (name, price, category)
select name, price, category from (
  values 
    ('Espresso', 2.50, 'cafes'),
    ('Capuccino', 3.50, 'cafes'),
    ('Latte', 3.80, 'cafes'),
    ('Americano', 2.80, 'cafes'),
    ('Cheesecake', 4.50, 'postres'),
    ('Brownie', 3.00, 'postres'),
    ('Tarta de Manzana', 4.00, 'postres'),
    ('Mixto (Jamón y Queso)', 4.00, 'sandwiches'),
    ('Pollo y Aguacate', 5.50, 'sandwiches'),
    ('Vegetariano', 4.80, 'sandwiches')
) as v(name, price, category)
where not exists (select 1 from public.menu_items);

-- Habilitar Realtime para el menú
alter publication supabase_realtime add table public.menu_items;

-- Desactivar RLS para acceso sin cuenta de Supabase Auth
alter table public.app_users disable row level security;
alter table public.menu_items disable row level security;
