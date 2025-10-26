# Cricket Analytics Dashboard

A comprehensive cricket performance tracking and analytics platform built with Next.js, MongoDB, and Chart.js.

## Features

### Data Entry
- **Player Management**: Add detailed player information including personal details, career timeline, and team history
- **Match Recording**: Comprehensive match data entry with support for all formats (Test, ODI, T20, etc.) and levels (School, Domestic, Ranji, IPL, International)
- **Performance Tracking**: Detailed batting, bowling, and fielding statistics for each match

### Analytics Dashboard
- **Interactive Charts**: Visual representation of performance data using Chart.js
- **Multi-dimensional Analysis**: Filter by format, level, opponent, venue, and time period
- **Key Metrics**: Batting average, strike rate, bowling average, economy rate, and more
- **Performance Trends**: Track progress over time with detailed trend analysis

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form with Zod validation

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

1. **Player Information**: Navigate to Data Entry → Player Info tab
   - Fill in personal details, career information, and team history
   - All required fields are marked with *

2. **Match Details**: Navigate to Data Entry → Match Details tab
   - Enter match information including level, format, date, venue, and opponent
   - Add optional details like toss information and series details

3. **Performance Data**: Navigate to Data Entry → Performance tab
   - Select a previously entered match
   - Add batting, bowling, and fielding statistics
   - System automatically calculates derived metrics like strike rate and economy

### Viewing Analytics

1. Navigate to the Analytics Dashboard
2. Use filters to narrow down data by format and level
3. View key statistics cards for quick overview
4. Analyze detailed charts for performance trends
5. Review tabular data for specific breakdowns

## Data Models

The application uses the following main data models:

- **Player**: Personal information and career details
- **Match**: Match-specific information and metadata
- **Performance**: Individual match performance data
- **Competition**: Tournament and series information
- **Stats**: Aggregated statistics by format and level

## API Endpoints

- `POST /api/players` - Create new player
- `GET /api/players` - Fetch all players
- `POST /api/matches` - Create new match
- `GET /api/matches` - Fetch all matches
- `POST /api/performances` - Create new performance record
- `GET /api/performances` - Fetch all performances
- `GET /api/analytics` - Fetch analytics data with optional filters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.