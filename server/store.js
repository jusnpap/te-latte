const menu = {
  cafes: [
    { id: 'c1', name: 'Espresso', price: 2.50 },
    { id: 'c2', name: 'Capuccino', price: 3.50 },
    { id: 'c3', name: 'Latte', price: 3.80 },
    { id: 'c4', name: 'Americano', price: 2.80 },
  ],
  postres: [
    { id: 'p1', name: 'Torta de Chocolate', price: 4.50 },
    { id: 'p2', name: 'Cheesecake', price: 5.00 },
    { id: 'p3', name: 'Galleta de Avena', price: 2.00 },
  ],
  sandwiches: [
    { id: 's1', name: 'Mixto (Jamón y Queso)', price: 4.00 },
    { id: 's2', name: 'Pollo y Aguacate', price: 5.50 },
    { id: 's3', name: 'Vegetariano', price: 4.80 },
  ]
};

// Generamos 15 mesas por defecto
const mesas = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  status: 'libre', // 'libre' | 'ocupada'
  currentOrderId: null,
}));

// Almacén de órdenes activas e historial
// Una orden tiene: { id, tableId, items: [], status, createdAt }
let ordenes = [];
let nextOrderId = 1;

module.exports = {
  menu,
  mesas,
  ordenes,
  getInitialState: () => ({
    menu,
    mesas,
    ordenes: ordenes.filter(o => o.status !== 'pagada') // Solo enviamos las no pagadas al cliente
  }),
  createOrder: (tableId, items) => {
    const table = mesas.find(m => m.id === tableId);
    if (!table) return { error: 'Mesa no encontrada' };
    
    if (table.status === 'ocupada') {
      return { error: 'La mesa ya está ocupada' };
    }

    const newOrder = {
      id: nextOrderId++,
      tableId,
      items, // array de { productId, name, price, quantity, notes }
      status: 'recibida', // 'recibida' (para cocina) -> 'despachada' -> 'pagada' (caja)
      createdAt: new Date().toISOString()
    };

    ordenes.push(newOrder);
    table.status = 'ocupada';
    table.currentOrderId = newOrder.id;

    return { order: newOrder };
  },
  updateOrderItems: (orderId, newItems) => {
    const order = ordenes.find(o => o.id === orderId);
    if (!order) return { error: 'Orden no encontrada' };
    
    order.items = newItems;
    return { order };
  },
  addItemsToOrder: (orderId, itemsToAdd) => {
    const order = ordenes.find(o => o.id === orderId);
    if (!order) return { error: 'Orden no encontrada' };
    
    itemsToAdd.forEach(item => {
      const existing = order.items.find(i => 
        i.productId === item.productId && 
        i.notes === item.notes &&
        i.isToGo === item.isToGo &&
        !i.dispatched
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        order.items.push(item);
      }
    });

    if (order.status === 'despachada') {
      order.status = 'recibida';
    }

    return { order };
  },
  dispatchOrder: (orderId) => {
    const order = ordenes.find(o => o.id === orderId);
    if (!order) return { error: 'Orden no encontrada' };
    
    order.status = 'despachada';
    order.items = order.items.map(item => ({ ...item, dispatched: true }));
    return { order };
  },
  closeTable: (tableId, paymentMethod) => {
    const table = mesas.find(m => m.id === tableId);
    if (!table || table.status === 'libre') return { error: 'Mesa no válida' };

    const order = ordenes.find(o => o.id === table.currentOrderId);
    if (order) {
      order.status = 'pagada';
      order.paymentMethod = paymentMethod;
      order.closedAt = new Date().toISOString();
    }

    table.status = 'libre';
    table.currentOrderId = null;

    return { table, order };
  },
  getReports: (startISO, endISO) => {
    const start = new Date(startISO).getTime();
    const end = new Date(endISO).getTime();

    return ordenes.filter(o => {
      if (o.status !== 'pagada' || !o.closedAt) return false;
      const closed = new Date(o.closedAt).getTime();
      return closed >= start && closed <= end;
    });
  }
};
