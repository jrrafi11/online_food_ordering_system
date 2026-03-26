# Phase 2 Blueprint: Multi-Restaurant Checkout

This blueprint is prepared and intentionally **not implemented** in Phase 1.

## Objectives
- Allow users to keep items from multiple restaurants in one cart experience.
- Split checkout into multiple child orders (one per restaurant).
- Preserve current order lifecycle compatibility for restaurant/rider/admin modules.

## Proposed Data Model
- `checkout_sessions`
  - `id`, `user_id`, `status`, `subtotal`, `delivery_total`, `service_total`, `discount_total`, `grand_total`, `payment_method`, `payment_status`, timestamps
- `checkout_session_orders`
  - `id`, `checkout_session_id`, `order_id`, `restaurant_id`, `restaurant_subtotal`, `restaurant_delivery_fee`, timestamps

Current `orders` and `order_items` stay as-is and remain the source of per-restaurant fulfillment.

## API Contract Plan
- `POST /api/v1/checkout/sessions`
  - Input: grouped cart payload with multiple restaurants + delivery details + payment method
  - Output: checkout session details + created child order list
- `GET /api/v1/checkout/sessions/:id`
  - Output: session summary + all child order statuses
- `GET /api/v1/orders?sessionId=:id`
  - Optional filter for child orders under a session

## Checkout Flow Plan
1. Validate grouped cart restaurant-by-restaurant.
2. Compute per-restaurant subtotal/min-order validation/delivery fee.
3. Create a session record.
4. Create one order per restaurant in a single transaction.
5. Attach created orders to the session.
6. Return consolidated payload for frontend confirmation screen.

## Compatibility & Migration
- Existing single-order checkout continues to work during transition.
- New checkout-session routes run behind feature flag `FEATURE_MULTI_RESTAURANT_CHECKOUT`.
- Add migration scripts for new tables only; no destructive changes to existing order tables.
- Frontend toggles between current checkout and session-based checkout by feature flag.

## Acceptance Criteria for Phase 2
- Mixed-restaurant cart is accepted and split correctly.
- Failure in one child order aborts whole session transaction.
- Session page shows consolidated status and payment state.
- Existing role dashboards remain unchanged except optional session references.
