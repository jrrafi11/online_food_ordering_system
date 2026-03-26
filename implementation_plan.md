# Full-stack Online Food Ordering System

Build a comprehensive food ordering platform containing multi-role capabilities (User, Restaurant, Rider, Admin), real-time order tracking, and robust backend logic.

## User Review Required
> [!IMPORTANT]
> Since this is a massive application, I propose starting with a **monorepo-style structure** inside the root directory, containing one `backend` folder and one `frontend` folder. 
> For the frontend, I will build a single React application that dynamically renders different dashboards based on user role, rather than managing 4 separate frontend projects. 
> Let me know if you would prefer multiple distinct frontend applications instead.

## Proposed Changes

### Database
- We will be using MySQL. For ease of development, I plan to use `Sequelize` ORM on Node.js.
- Create tables: `Users`, `Restaurants`, `Riders`, `Food_Items`, `Orders`, `Order_Items`, `Reviews`, `Payments`.

### Backend: Node.js (Express)
- [NEW] `backend/` directory.
- `src/models`: Database models and relationships.
- `src/controllers`: Logic for users, restaurants, orders, etc.
- `src/routes`: API endpoints.
- `src/middleware`: JWT authentication, Role checking.
- `src/services`: WebSocket services for real-time notifications.

### Frontend: React (Vite)
- [NEW] `frontend/` directory.
- `src/components`: Reusable UI elements.
- `src/pages`: 
  - User views (Home, Restaurant Menu, Cart, Profile, Checkout)
  - Restaurant dashboard (Orders, Menu management)
  - Rider dashboard (Assigned deliveries)
  - Admin dashboard (Analytics, Managements)
- `src/context`: Authentication and global state handling.

## Verification Plan
### Automated Tests
- Include basic REST endpoint tests for user enrollment and order creation.

### Manual Verification
- Walk through the user lifecycle: Register as a user, register as a restaurant, add an item, place an order, accept the order, register as a rider, assign the rider, and deliver the order.
