# Event Ticket Platform - Project Structure

## 📁 Root Directory Structure

```
Event-TIcket-Frontend/
├── .git/                      # Git version control
├── .idea/                     # IDE configuration (optional, can be gitignored)
├── .vite/                     # Vite build cache
├── node_modules/              # Dependencies
├── src/                       # Source code (main application)
├── .eslintrc.cjs             # ESLint configuration
├── .gitignore                # Git ignore rules
├── api documntation.md       # API documentation
├── index.html                # HTML entry point
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript config for Node
├── vite.config.ts            # Vite bundler configuration
└── PROJECT_STRUCTURE.md      # This file
```

## 📂 Source Code Structure (`src/`)

```
src/
├── api/                       # API integration layer
│   ├── client.ts             # Axios HTTP client configuration
│   └── endpoints/            # API endpoint modules
│       ├── analytics.ts      # Analytics endpoints
│       ├── events.ts         # Event management endpoints
│       ├── organiser.ts      # Organiser-specific endpoints
│       ├── publishedEvents.ts # Public event browsing endpoints
│       ├── staff.ts          # Staff management endpoints
│       └── tickets.ts        # Ticket purchase/validation endpoints
│
├── components/               # Reusable React components
│   ├── common/              # Generic UI components
│   │   ├── Badge.tsx        # Status badges
│   │   ├── Button.tsx       # Button component
│   │   ├── Card.tsx         # Card container
│   │   ├── Input.tsx        # Form input
│   │   ├── ProfileDropdown.tsx # User profile menu
│   │   ├── PromoteToOrganiserButton.tsx # Role promotion
│   │   ├── RoleBadges.tsx   # User role display
│   │   └── ThemeToggle.tsx  # Dark/light mode toggle
│   │
│   ├── feedback/            # User feedback components
│   │   └── Spinner.tsx      # Loading spinner
│   │
│   ├── forms/               # Form components
│   │   └── (form components)
│   │
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # App header
│   │   ├── PageContainer.tsx # Page wrapper
│   │   └── Sidebar.tsx      # Navigation sidebar
│   │
│   ├── modals/              # Modal dialogs
│   │   └── (modal components)
│   │
│   └── organiser/           # Organiser-specific components
│       └── analytics/       # Analytics components
│           ├── DashboardOverview.tsx # Analytics overview
│           └── MetricCard.tsx        # Metric display card
│
├── config/                   # Configuration files
│   └── keycloak.ts          # Keycloak authentication config
│
├── context/                  # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   └── ThemeContext.tsx     # Theme (dark/light mode) state
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   └── useTheme.ts          # Theme hook
│
├── pages/                    # Page components (routes)
│   ├── auth/                # Authentication pages
│   │   └── Callback.tsx     # OAuth callback handler
│   │
│   ├── organiser/           # Organiser portal pages
│   │   ├── Events/          # Event management
│   │   │   ├── EventCreate.tsx
│   │   │   ├── EventDetails.tsx
│   │   │   ├── EventEdit.tsx
│   │   │   └── EventList.tsx
│   │   ├── Dashboard.tsx    # Organiser dashboard
│   │   ├── EventAnalyticsDashboard.tsx # Event analytics
│   │   ├── EventStaffManagement.tsx # Staff management
│   │   ├── EventStats.tsx   # Event statistics
│   │   └── Settings.tsx     # Organiser settings
│   │
│   ├── public/              # Public-facing pages
│   │   ├── BrowseEvents.tsx # Event browsing (home)
│   │   ├── MyTickets.tsx    # User's purchased tickets
│   │   └── PublishedEventDetails.tsx # Event details & purchase
│   │
│   ├── shared/              # Shared pages
│   │   └── (shared components)
│   │
│   └── staff/               # Staff portal pages
│       └── StaffValidation.tsx # Ticket validation
│
├── routes/                   # Routing configuration
│   └── AppRoutes.tsx        # Main route definitions
│
├── services/                 # Business logic services
│   └── keycloakService.ts   # Keycloak authentication service
│
├── types/                    # TypeScript type definitions
│   ├── analytics.ts         # Analytics types
│   ├── index.ts             # Main type exports
│   └── (other type files)
│
├── utils/                    # Utility functions
│   ├── formatters.ts        # Date/currency formatters
│   ├── jwt.ts               # JWT token utilities
│   └── roles.ts             # Role checking utilities
│
├── App.tsx                   # Main App component
├── index.css                # Global styles & Tailwind imports
└── main.tsx                 # Application entry point
```

## 🎯 Key Features by Directory

### `/api/endpoints/`
- **analytics.ts**: Event analytics, revenue tracking, attendee stats
- **events.ts**: CRUD operations for events
- **publishedEvents.ts**: Public event browsing and search
- **staff.ts**: Staff account generation and management
- **tickets.ts**: Ticket purchasing and QR code generation

### `/pages/`
- **organiser/**: Full event management dashboard
- **public/**: Event browsing and ticket purchasing
- **staff/**: Ticket validation interface
- **auth/**: OAuth/Keycloak authentication flow

### `/components/`
- **common/**: Reusable UI components (buttons, cards, inputs)
- **layout/**: App structure (header, sidebar, containers)
- **organiser/analytics/**: Analytics-specific components
- **feedback/**: Loading states and user feedback

## 🗑️ Files/Folders to Keep Gitignored

The following should be in `.gitignore`:
- `node_modules/`
- `.vite/`
- `.idea/` (IDE-specific)
- `.DS_Store` (macOS)
- `dist/` (build output)
- `.env` (environment variables)

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- **Frontend Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **Authentication**: Keycloak OAuth
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 🎨 Color Scheme

- **Light Mode**: Gray/Blue palette
- **Dark Mode**: Netflix-inspired dark theme
  - `netflix-black`: #141414
  - `netflix-dark`: #1f1f1f
  - `netflix-gray`: #2a2a2a

## 🔐 User Roles

1. **ATTENDEE**: Browse events, purchase tickets
2. **ORGANISER**: Create/manage events, view analytics
3. **STAFF**: Validate tickets at venue
