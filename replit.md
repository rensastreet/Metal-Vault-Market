# MetalVault - Global Precious Metals Marketplace

A sophisticated web application for buying, selling, and storing precious metals (Gold, Silver, Platinum, Palladium) across 10 global vault locations.

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Vite, TanStack Query, React Simple Maps
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Replit-provided)
- **Authentication**: Replit Auth (supports Google, GitHub, X, Apple, email/password)
- **Styling**: Tailwind CSS with custom dark theme

### Key Features
1. **Interactive Global Map**: Users can visualize and select from 10 vault locations worldwide
   - Toronto, New York, Delaware, London, Zurich, Frankfurt, Liechtenstein, Dubai, Singapore, Hong Kong
2. **Real-time Metal Trading**: Buy and sell 4 precious metals at current market prices
3. **Multi-vault Portfolio**: Store metals across different geographic locations
4. **Transaction History**: Complete audit trail of all trades
5. **Secure Authentication**: Protected routes with session management

## Database Schema

### Tables
- `users`: User accounts (managed by Replit Auth)
- `sessions`: Session storage (managed by Replit Auth)
- `metals`: Available precious metals (Gold, Silver, Platinum, Palladium)
- `vaults`: 10 global vault locations with coordinates
- `portfolios`: User holdings per metal per vault
- `transactions`: Complete transaction history

## API Endpoints

### Public
- `GET /api/metals` - List all available metals
- `GET /api/vaults` - List all vault locations
- `GET /api/login` - Initiate Replit Auth login
- `GET /api/logout` - Logout user

### Protected (requires authentication)
- `GET /api/auth/user` - Get current user profile
- `GET /api/portfolio` - Get user's portfolio across all vaults
- `GET /api/transactions` - Get user's transaction history
- `POST /api/transactions` - Create buy/sell transaction

## Project Structure

```
├── client/                      # Frontend React app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── GlobeMap.tsx   # Interactive world map
│   │   │   ├── VaultPanel.tsx  # Vault details & trading panel
│   │   │   └── Layout.tsx      # Main app layout
│   │   ├── pages/
│   │   │   ├── Landing.tsx     # Public landing page
│   │   │   └── Dashboard.tsx   # Main authenticated dashboard
│   │   ├── hooks/
│   │   │   └── use-auth.ts     # Authentication hook
│   │   └── index.css           # Dark theme styles
├── server/                      # Backend Express app
│   ├── db.ts                   # Database connection
│   ├── storage.ts              # Data access layer
│   ├── routes.ts               # API route handlers
│   └── replit_integrations/
│       └── auth/               # Replit Auth integration
├── shared/                      # Shared types between frontend/backend
│   ├── schema.ts               # Drizzle ORM schemas
│   ├── routes.ts               # API contract definitions
│   └── models/
│       └── auth.ts             # Auth-related types
```

## Design Philosophy
- **Dark premium aesthetic**: Deep blacks with gold/amber accents to evoke precious metals
- **Financial app UX**: Clean, professional interface similar to Coinbase/Robinhood
- **Geographic focus**: Map-first interface emphasizing global vault network

## Development

- Run `npm run dev` to start the development server
- Database migrations: `npm run db:push`
- All routes are protected by authentication except landing page and auth endpoints