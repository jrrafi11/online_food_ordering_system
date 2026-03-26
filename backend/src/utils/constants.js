const USER_ROLES = {
  USER: 'user',
  RESTAURANT: 'restaurant',
  RIDER: 'rider',
  ADMIN: 'admin',
};

const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

module.exports = {
  USER_ROLES,
  ORDER_STATUSES,
};
