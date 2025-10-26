# Cricket Analytics Dashboard

A comprehensive **single-player** cricket performance tracking and analytics platform built with Next.js, TypeScript, MongoDB, and modern UI components.

## Features

### 🏏 Single Player Focus
- Designed for tracking **one player's complete cricket career**
- Prevents multiple player entries to maintain data integrity
- Allows minor updates like team changes and career end dates

### 🎨 Modern UI/UX
- Built with **shadcn/ui** components for consistent, professional design
- **Dark mode support** with system preference detection and manual toggle
- Fully responsive design that works seamlessly on all devices
- Clean, intuitive interface optimized for cricket statistics

### 📊 Comprehensive Data Entry
- **Player Information**: Personal details, career timeline, playing style, and team history
- **Match Recording**: Multi-level tracking (School, Domestic, Ranji, IPL, International)
- **Performance Tracking**: Detailed batting, bowling, and fielding statistics for each match
- **Format Support**: Test, ODI, T20, First-class, List-A, T20 Domestic

### 📈 Advanced Analytics
- **Interactive Charts**: Visual representation using Chart.js with dark mode support
- **Multi-dimensional Analysis**: Filter by format, level, opponent, venue, and time period
- **Key Metrics Dashboard**: Batting average, strike rate, bowling average, economy rate
- **Performance Trends**: Track progress over time with detailed trend analysis

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Theme**: next-themes for dark mode support
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd cricket-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
MONGODB_URL="your-mongodb-connection-string"
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Data

1. **Player Setup** (One-time):
   - Navigate to **Data Entry** → **Player Info** tab
   - Enter the player's basic information and career details
   - **Note**: Only one player can be added to maintain system integrity

2. **Match Entry**:
   - Go to **Data Entry** → **Match Details** tab
   - Add match information including level, format, date, venue, and opponent
   - Include optional details like toss information and series details

3. **Performance Recording**:
   - Use **Data Entry** → **Performance** tab
   - Select a previously entered match from the dropdown
   - Add batting, bowling, and fielding statistics as applicable
   - All performance metrics are optional and flexible

### Viewing Analytics

1. Navigate to the **Analytics Dashboard**
2. Use format and level filters to narrow down data analysis
3. View key statistics cards for quick performance overview
4. Analyze interactive charts for performance trends and patterns
5. Review detailed tables for opponent and venue-specific breakdowns
6. Toggle between light and dark modes using the theme switcher

## Data Models

The application uses the following main data models:

- **Player**: Personal information and career details
- **Match**: Match-specific information and metadata
- **Performance**: Individual match performance data
- **Competition**: Tournament and series information
- **Stats**: Aggregated statistics by format and level

## Dark Mode Support

The application features comprehensive dark mode support:
- **System Detection**: Automatically follows your device's theme preference
- **Manual Toggle**: Use the theme toggle button in the navigation bar
- **Persistent Storage**: Theme preference is saved and remembered
- **Component Theming**: All UI components adapt seamlessly to dark/light themes
- **Chart Theming**: Analytics charts automatically adjust colors for optimal visibility

## Single Player Architecture

This application is specifically designed for tracking one player's career:
- **Unique Player Constraint**: Only one active player allowed in the system
- **Data Integrity**: Prevents confusion and maintains clean, focused analytics
- **Minor Updates Allowed**: Team changes, career end dates, and team history can be updated
- **Career Tracking**: Complete journey from school level to international cricket

## API Endpoints

- `POST /api/players` - Create new player (restricted to one active player)
- `GET /api/players` - Fetch player information
- `PUT /api/players` - Update player details (limited fields)
- `POST /api/matches` - Create new match
- `GET /api/matches` - Fetch all matches
- `POST /api/performances` - Create new performance record
- `GET /api/performances` - Fetch all performances
- `GET /api/analytics` - Fetch analytics data with optional format/level filters

## Troubleshooting

### Styling Issues
If you encounter styling problems:

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Verify Tailwind CSS is working**:
   - Check that `tailwind.config.ts` exists
   - Ensure `postcss.config.mjs` is properly configured
   - Verify `globals.css` imports are correct

3. **Component styling not working**:
   - Ensure all shadcn/ui dependencies are installed
   - Check that CSS variables are defined in `globals.css`
   - Verify theme provider is wrapped around the app

### Dark Mode Issues
If dark mode isn't working:
- Check that `next-themes` is installed
- Verify `ThemeProvider` is properly configured in layout
- Ensure `darkMode: "class"` is set in `tailwind.config.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.