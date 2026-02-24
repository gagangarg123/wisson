# 🏢 Wisson - Desk Booking System

A modern, responsive seat booking system built with React, TypeScript, and Tailwind CSS. Perfect for managing office seating arrangements with batch-based scheduling and real-time availability.

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration system
- 📅 **Batch-based Scheduling** - Week 1 & Week 2 batch management
- 🪑 **Interactive Floor Map** - Visual seat selection with real-time status
- 📊 **Admin Dashboard** - Complete administrative control
- 🏖️ **Holiday Management** - Integrated holiday calendar
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v20.19.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gagangarg123/wisson.git
   cd wisson
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📸 Screenshots

### Registration Page
![Registration Page](https://via.placeholder.com/800x600/1e40af/ffffff?text=Create+Account+Page)
*User registration with batch selection for Week 1 & Week 2 scheduling*

### Main Dashboard
*Interactive seat booking interface with real-time availability*

## 🏗️ Project Structure

```
wisson/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── booking/       # Seat booking components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── admin/         # Admin panel components
│   │   └── ui/            # Reusable UI components
│   ├── services/          # API services & mock database
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
└── package.json           # Project dependencies
```

## 🛠️ Technologies Used

- **Frontend**: React 19.2.3 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **State Management**: Zustand 5.0.11
- **Icons**: Lucide React 0.575.0
- **Date Handling**: date-fns 4.1.0
- **Notifications**: react-hot-toast 2.6.0

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🎯 How It Works

### Batch System
- **Batch 1**: Monday-Wednesday (Week 1), Thursday-Friday (Week 2)
- **Batch 2**: Thursday-Friday (Week 1), Monday-Wednesday (Week 2)
- **Flooder Seats**: Available to all users after 3 PM

### Seat Types
- **Designated Seats**: Assigned to specific batches
- **Flooder Seats**: Public seats available to everyone
- **3 PM Rule**: Non-designated users can book any available seat after 3 PM

### Booking Rules
- Users can only book one seat per day
- Holidays and weekends are automatically blocked
- Admin users have full control over all bookings

## 🔧 Configuration

The application uses a mock database for demonstration. In production, you would need to:

1. Replace `src/services/mockDatabase.ts` with actual API calls
2. Implement proper authentication with JWT
3. Connect to a real database (PostgreSQL, MongoDB, etc.)
4. Set up proper environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by modern office management needs
- Designed for optimal user experience

---

**Made with ❤️ by [Gagan Garg](https://github.com/gagangarg123)**
