# 🎟️ Event Ticket Platform

A modern, full-featured event ticketing platform built with React, TypeScript, and Tailwind CSS. This application supports event creation, ticket sales, QR code validation, and comprehensive analytics.

## ✨ Features

### 👥 For Attendees
- 🔍 Browse and search published events
- 🎫 Purchase tickets with instant confirmation
- 📱 Generate QR codes for venue entry
- 📋 View all purchased tickets in one place
- 🌓 Dark/Light mode support

### 🎭 For Organisers
- 📅 Create and manage events
- 🎟️ Configure multiple ticket types with pricing
- 📊 Real-time analytics dashboard
  - Revenue tracking
  - Ticket sales statistics
  - Attendance rates
  - Event performance metrics
- 👥 Staff management system
- 📈 Event-level and organization-level analytics

### 🔐 For Staff
- ✅ QR code ticket validation
- 📱 Manual code entry support
- 📊 Real-time validation statistics
- 🎯 Event-specific access control

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend API running (see API documentation)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Event-TIcket-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
Event-TIcket-Frontend/
├── src/
│   ├── api/              # API integration layer
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components (routes)
│   ├── context/         # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript definitions
│   └── services/        # Business logic services
├── public/              # Static assets
└── ...config files
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure documentation.

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: Keycloak OAuth
- **State Management**: React Context API
- **Date Handling**: date-fns
- **Form Management**: React Hook Form

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Dark Mode**: Netflix-inspired dark theme with smooth transitions
- **Modern UI**: Gradient backgrounds, glassmorphism, and micro-animations
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML

## 🔐 Authentication

The platform uses Keycloak for authentication with three user roles:

1. **ATTENDEE**: Default role for event browsing and ticket purchasing
2. **ORGANISER**: Can create events, manage staff, and view analytics
3. **STAFF**: Can validate tickets at event venues

## 📱 Key Pages

### Public Pages
- `/` - Browse Events (Home)
- `/published-events/:id` - Event Details & Purchase
- `/my-tickets` - User's Tickets

### Organiser Portal
- `/dashboard` - Organiser Dashboard
- `/events` - Event Management
- `/events/create` - Create New Event
- `/events/:id` - Event Details
- `/events/:id/edit` - Edit Event
- `/events/:id/analytics` - Event Analytics
- `/events/:id/staff` - Staff Management
- `/event-stats` - All Events Statistics

### Staff Portal
- `/staff/validation` - Ticket Validation Interface

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
```

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Netflix-inspired dark theme colors
- Responsive container padding
- Custom breakpoints (xs, sm, md, lg, xl, 2xl)

## 📊 Analytics Features

- **Dashboard Overview**: Total events, revenue, tickets sold, attendance
- **Event Analytics**: Per-event performance metrics
- **Ticket Performance**: Sales by ticket type
- **Attendee Tracking**: Check-in rates and validation history
- **Staff Performance**: Individual staff validation statistics

## 🎫 Ticket System

- **Multiple Ticket Types**: Configure different pricing tiers
- **QR Code Generation**: Secure, time-limited QR codes
- **Manual Validation**: Backup code entry for offline validation
- **Single-Use Tickets**: Prevents duplicate entry
- **Real-time Status**: Track ticket lifecycle (purchased, used, expired)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- None currently reported

## 📞 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with React and Vite
- UI inspired by modern event platforms
- Dark theme inspired by Netflix

---

**Made with ❤️ for event organizers and attendees**
