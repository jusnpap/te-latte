const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const store = require('./store');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Permitir cualquier origen en desarrollo
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Enviar estado inicial al conectarse
  socket.emit('initial_state', store.getInitialState());

  // Crear una nueva orden (Mesero)
  socket.on('create_order', ({ tableId, items }) => {
    const result = store.createOrder(tableId, items);
    if (result.error) {
      socket.emit('error_message', result.error);
    } else {
      io.emit('state_updated', store.getInitialState());
    }
  });

  // Agregar ítems a una orden existente (Mesero o Caja)
  socket.on('add_items_to_order', ({ orderId, items }) => {
    const result = store.addItemsToOrder(orderId, items);
    if (result.error) {
      socket.emit('error_message', result.error);
    } else {
      io.emit('state_updated', store.getInitialState());
    }
  });

  // Actualizar ítems (reemplazar la lista completa, útil para eliminar)
  socket.on('update_order_items', ({ orderId, items }) => {
    const result = store.updateOrderItems(orderId, items);
    if (result.error) {
      socket.emit('error_message', result.error);
    } else {
      io.emit('state_updated', store.getInitialState());
    }
  });

  // Marcar orden como despachada (Cocina)
  socket.on('dispatch_order', ({ orderId }) => {
    const result = store.dispatchOrder(orderId);
    if (result.error) {
      socket.emit('error_message', result.error);
    } else {
      io.emit('state_updated', store.getInitialState());
    }
  });

  // Cerrar mesa y pagar (Caja)
  socket.on('close_table', ({ tableId, paymentMethod }) => {
    const result = store.closeTable(tableId, paymentMethod);
    if (result.error) {
      socket.emit('error_message', result.error);
    } else {
      io.emit('state_updated', store.getInitialState());
    }
  });

  // Reportes (Contabilidad)
  socket.on('request_reports', ({ startDate, endDate }) => {
    const reports = store.getReports(startDate, endDate);
    socket.emit('reports_data', reports);
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Servidor de WebSockets corriendo en http://localhost:${PORT}`);
});
