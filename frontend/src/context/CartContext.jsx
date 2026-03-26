import { createContext, useCallback, useMemo, useState } from 'react';

const CART_KEY = 'food_cart';

const loadStoredCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadStoredCart);

  const persist = useCallback((nextItemsOrUpdater) => {
    setItems((prevItems) => {
      const nextItems =
        typeof nextItemsOrUpdater === 'function' ? nextItemsOrUpdater(prevItems) : nextItemsOrUpdater;
      localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
      return nextItems;
    });
  }, []);

  const addItem = useCallback(
    (foodItem, quantity = 1) => {
      persist((prevItems) => {
        const existing = prevItems.find((item) => item.id === foodItem.id);
        if (existing) {
          return prevItems.map((item) =>
            item.id === foodItem.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }

        return [...prevItems, { ...foodItem, quantity }];
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (id) => {
      persist((prevItems) => prevItems.filter((item) => item.id !== id));
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (id, quantity) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }

      persist((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [persist, removeItem]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const getQuantity = useCallback(
    (foodItemId) => {
      return items.find((item) => item.id === foodItemId)?.quantity || 0;
    },
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity), 0),
    [items]
  );

  const restaurantIds = useMemo(() => [...new Set(items.map((item) => item.restaurantId))], [items]);

  const groupedByRestaurant = useMemo(
    () =>
      Object.values(
        items.reduce((acc, item) => {
          const key = item.restaurantId || 'unknown';
          if (!acc[key]) {
            acc[key] = {
              restaurantId: item.restaurantId,
              restaurantName: item.restaurantName || 'Restaurant',
              items: [],
            };
          }
          acc[key].items.push(item);
          return acc;
        }, {})
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getQuantity,
      subtotal,
      totalItems,
      restaurantIds,
      groupedByRestaurant,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getQuantity,
      subtotal,
      totalItems,
      restaurantIds,
      groupedByRestaurant,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
