import { worldCricketVenues } from './venues';

// Get venues by country from the venues.ts file
export const getVenuesByCountry = (country: string): string[] => {
    return worldCricketVenues
        .filter(venue => venue.country === country)
        .map(venue => venue.name);
};

// Get all available countries
export const getAvailableCountries = (): string[] => {
    const countries = [...new Set(worldCricketVenues.map(venue => venue.country))];
    return countries.sort();
};

// Get venues suitable for specific formats (based on capacity and facilities)
export const getVenuesForFormat = (country: string, format: string): string[] => {
    const countryVenues = worldCricketVenues.filter(venue => venue.country === country);

    switch (format) {
        case 'Test':
        case 'First-class':
            // Prefer larger venues for Test cricket
            return countryVenues
                .filter(venue => (venue.capacity || 0) >= 20000)
                .map(venue => venue.name);

        case 'T20':
        case 'T20-domestic':
            // Prefer venues with floodlights for T20
            return countryVenues
                .filter(venue => venue.floodlights)
                .map(venue => venue.name);

        case 'ODI':
        case 'List-A':
        default:
            // All venues suitable for ODI
            return countryVenues.map(venue => venue.name);
    }
};

export interface TournamentPreset {
    id: string;
    name: string;
    type: 'bilateral' | 'triangular' | 'tournament' | 'league';
    format: 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic' | 'mixed';
    level: 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international';
    description: string;
    hostCountry?: string;
    structure: {
        groupStage?: boolean;
        knockoutStage?: boolean;
        finalStage?: boolean;
        totalTeams: number;
        matchesPerTeam?: number;
        totalMatches: number;
    };
    teams: string[];
    venues: string[];
    preferredVenues?: string[]; // Specific venues for this tournament
    duration: {
        startMonth: number; // 1-12
        endMonth: number;
        durationDays: number;
    };
}

export const indianTournamentPresets: TournamentPreset[] = [
    // Domestic Tournaments
    {
        id: 'ranji-trophy',
        name: 'Ranji Trophy',
        type: 'tournament',
        format: 'First-class',
        level: 'Ranji',
        description: 'Premier domestic first-class cricket championship of India',
        hostCountry: 'India',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 38,
            matchesPerTeam: 8,
            totalMatches: 120
        },
        teams: [
            'Mumbai', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
            'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
            'Bengal', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh',
            'Jammu & Kashmir', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Assam',
            'Tripura', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim',
            'Arunachal Pradesh', 'Goa', 'Bihar', 'Uttarakhand', 'Chandigarh',
            'Puducherry', 'Andaman & Nicobar', 'Services', 'Railways', 'Baroda', 'Saurashtra'
        ],
        venues: getVenuesForFormat('India', 'First-class'),
        preferredVenues: getVenuesForFormat('India', 'First-class').slice(0, 6),
        duration: {
            startMonth: 1, // January
            endMonth: 3,   // March
            durationDays: 90
        }
    },
    {
        id: 'vijay-hazare-trophy',
        name: 'Vijay Hazare Trophy',
        type: 'tournament',
        format: 'List-A',
        level: 'List-A',
        description: 'Premier domestic one-day cricket tournament of India',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 38,
            matchesPerTeam: 6,
            totalMatches: 85
        },
        teams: [
            'Mumbai', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
            'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
            'Bengal', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh',
            'Jammu & Kashmir', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Assam',
            'Tripura', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim',
            'Arunachal Pradesh', 'Goa', 'Bihar', 'Uttarakhand', 'Chandigarh',
            'Puducherry', 'Andaman & Nicobar', 'Services', 'Railways', 'Baroda', 'Saurashtra'
        ],
        venues: [
            'Narendra Modi Stadium', 'Eden Gardens', 'M. Chinnaswamy Stadium',
            'Rajiv Gandhi International Stadium', 'Punjab Cricket Association Stadium'
        ],
        preferredVenues: [
            'Narendra Modi Stadium', 'Eden Gardens', 'M. Chinnaswamy Stadium',
            'Rajiv Gandhi International Stadium'
        ],
        duration: {
            startMonth: 11, // November
            endMonth: 12,   // December
            durationDays: 45
        }
    },
    {
        id: 'syed-mushtaq-ali-trophy',
        name: 'Syed Mushtaq Ali Trophy',
        type: 'tournament',
        format: 'T20-domestic',
        level: 'domestic',
        description: 'Premier domestic T20 cricket tournament of India',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 38,
            matchesPerTeam: 5,
            totalMatches: 70
        },
        teams: [
            'Mumbai', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
            'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
            'Bengal', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Himachal Pradesh',
            'Jammu & Kashmir', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Assam',
            'Tripura', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim',
            'Arunachal Pradesh', 'Goa', 'Bihar', 'Uttarakhand', 'Chandigarh',
            'Puducherry', 'Andaman & Nicobar', 'Services', 'Railways', 'Baroda', 'Saurashtra'
        ],
        venues: [
            'Eden Gardens', 'Wankhede Stadium', 'M. Chinnaswamy Stadium',
            'Sawai Mansingh Stadium', 'MA Chidambaram Stadium'
        ],
        preferredVenues: [
            'Eden Gardens', 'Wankhede Stadium', 'M. Chinnaswamy Stadium',
            'Sawai Mansingh Stadium'
        ],
        duration: {
            startMonth: 10, // October
            endMonth: 11,   // November
            durationDays: 30
        }
    },
    {
        id: 'ipl',
        name: 'Indian Premier League (IPL)',
        type: 'league',
        format: 'T20',
        level: 'IPL',
        description: 'Premier T20 franchise cricket league of India',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 10,
            matchesPerTeam: 14,
            totalMatches: 74
        },
        teams: [
            'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore',
            'Kolkata Knight Riders', 'Delhi Capitals', 'Rajasthan Royals',
            'Punjab Kings', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants'
        ],
        venues: [
            'Wankhede Stadium', 'MA Chidambaram Stadium', 'M. Chinnaswamy Stadium',
            'Eden Gardens', 'Feroz Shah Kotla', 'Sawai Mansingh Stadium',
            'Punjab Cricket Association Stadium', 'Rajiv Gandhi International Stadium',
            'Narendra Modi Stadium'
        ],
        preferredVenues: [
            'Wankhede Stadium', 'MA Chidambaram Stadium', 'M. Chinnaswamy Stadium',
            'Eden Gardens', 'Feroz Shah Kotla', 'Narendra Modi Stadium'
        ],
        duration: {
            startMonth: 3, // March
            endMonth: 5,   // May
            durationDays: 60
        }
    },
    {
        id: 'duleep-trophy',
        name: 'Duleep Trophy',
        type: 'tournament',
        format: 'First-class',
        level: 'domestic',
        description: 'Zonal first-class cricket tournament of India',
        structure: {
            groupStage: true,
            knockoutStage: false,
            finalStage: true,
            totalTeams: 6,
            matchesPerTeam: 3,
            totalMatches: 10
        },
        teams: [
            'India A', 'India B', 'India C', 'India D', 'India E', 'India F'
        ],
        venues: [
            'M. Chinnaswamy Stadium', 'Rural Development Trust Stadium',
            'KSCA Cricket Ground'
        ],
        duration: {
            startMonth: 9, // September
            endMonth: 9,   // September
            durationDays: 20
        }
    },
    {
        id: 'deodhar-trophy',
        name: 'Deodhar Trophy',
        type: 'tournament',
        format: 'List-A',
        level: 'List-A',
        description: 'Zonal one-day cricket tournament of India',
        structure: {
            groupStage: false,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 3,
            matchesPerTeam: 2,
            totalMatches: 4
        },
        teams: [
            'India A', 'India B', 'India C'
        ],
        venues: [
            'JSCA International Stadium Complex', 'Barabati Stadium'
        ],
        duration: {
            startMonth: 7, // July
            endMonth: 7,   // July
            durationDays: 10
        }
    },

    // International Tournaments
    {
        id: 'asia-cup-odi',
        name: 'Asia Cup (ODI)',
        type: 'tournament',
        format: 'ODI',
        level: 'international',
        description: 'Premier ODI tournament featuring Asian cricket teams',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 6,
            matchesPerTeam: 4,
            totalMatches: 13
        },
        teams: [
            'India', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'Nepal'
        ],
        venues: [
            'Dubai International Cricket Stadium', 'Sheikh Zayed Stadium',
            'Sharjah Cricket Stadium', 'R. Premadasa Stadium'
        ],
        preferredVenues: [
            'Dubai International Cricket Stadium', 'Sheikh Zayed Stadium', 'Sharjah Cricket Stadium'
        ],
        duration: {
            startMonth: 8, // August
            endMonth: 9,   // September
            durationDays: 20
        }
    },
    {
        id: 'asia-cup-t20',
        name: 'Asia Cup (T20)',
        type: 'tournament',
        format: 'T20',
        level: 'international',
        description: 'Premier T20 tournament featuring Asian cricket teams',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 6,
            matchesPerTeam: 4,
            totalMatches: 13
        },
        teams: [
            'India', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'Hong Kong'
        ],
        venues: [
            'Dubai International Cricket Stadium', 'Sheikh Zayed Stadium',
            'Sharjah Cricket Stadium'
        ],
        preferredVenues: [
            'Dubai International Cricket Stadium', 'Sheikh Zayed Stadium', 'Sharjah Cricket Stadium'
        ],
        duration: {
            startMonth: 8, // August
            endMonth: 9,   // September
            durationDays: 15
        }
    },
    {
        id: 'world-cup-odi',
        name: 'ICC Cricket World Cup',
        type: 'tournament',
        format: 'ODI',
        level: 'international',
        description: 'Premier ODI World Cup tournament',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 10,
            matchesPerTeam: 9,
            totalMatches: 48
        },
        teams: [
            'India', 'Australia', 'England', 'New Zealand', 'South Africa',
            'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'Netherlands'
        ],
        venues: [
            'Narendra Modi Stadium', 'Wankhede Stadium', 'Eden Gardens',
            'M. Chinnaswamy Stadium', 'MA Chidambaram Stadium', 'Feroz Shah Kotla'
        ],
        preferredVenues: [
            'Narendra Modi Stadium', 'Wankhede Stadium', 'Eden Gardens',
            'M. Chinnaswamy Stadium', 'MA Chidambaram Stadium', 'Feroz Shah Kotla'
        ],
        duration: {
            startMonth: 10, // October
            endMonth: 11,   // November
            durationDays: 45
        }
    },
    {
        id: 't20-world-cup',
        name: 'ICC T20 World Cup',
        type: 'tournament',
        format: 'T20',
        level: 'international',
        description: 'Premier T20 World Cup tournament',
        structure: {
            groupStage: true,
            knockoutStage: true,
            finalStage: true,
            totalTeams: 16,
            matchesPerTeam: 5,
            totalMatches: 45
        },
        teams: [
            'India', 'Australia', 'England', 'New Zealand', 'South Africa',
            'Pakistan', 'Sri Lanka', 'Bangladesh', 'Afghanistan', 'West Indies',
            'Ireland', 'Scotland', 'Netherlands', 'UAE', 'Namibia', 'Zimbabwe'
        ],
        venues: [
            'Melbourne Cricket Ground (MCG)', 'Sydney Cricket Ground (SCG)',
            'Adelaide Oval', 'The Gabba', 'Perth Stadium'
        ],
        preferredVenues: [
            'Melbourne Cricket Ground (MCG)', 'Sydney Cricket Ground (SCG)',
            'Adelaide Oval', 'The Gabba', 'Perth Stadium'
        ],
        duration: {
            startMonth: 10, // October
            endMonth: 11,   // November
            durationDays: 30
        }
    },
    {
        id: 'bilateral-test-series',
        name: 'Bilateral Test Series',
        type: 'bilateral',
        format: 'Test',
        level: 'international',
        description: 'Bilateral Test series between two nations',
        structure: {
            groupStage: false,
            knockoutStage: false,
            finalStage: false,
            totalTeams: 2,
            matchesPerTeam: 3,
            totalMatches: 3
        },
        teams: ['Home Team', 'Away Team'],
        venues: [], // Will be populated based on host country
        preferredVenues: [], // Will be set based on host country
        duration: {
            startMonth: 11, // November
            endMonth: 2,    // February
            durationDays: 90
        }
    },
    {
        id: 'bilateral-odi-series',
        name: 'India ODI Series (Home)',
        type: 'bilateral',
        format: 'ODI',
        level: 'international',
        description: 'Bilateral ODI series with India as home team',
        structure: {
            groupStage: false,
            knockoutStage: false,
            finalStage: false,
            totalTeams: 2,
            matchesPerTeam: 5,
            totalMatches: 5
        },
        teams: ['India', 'Opponent'],
        venues: [
            'Narendra Modi Stadium', 'Wankhede Stadium', 'Eden Gardens',
            'M. Chinnaswamy Stadium', 'Punjab Cricket Association Stadium'
        ],
        duration: {
            startMonth: 1, // January
            endMonth: 2,   // February
            durationDays: 30
        }
    },
    {
        id: 'bilateral-t20-series',
        name: 'India T20I Series (Home)',
        type: 'bilateral',
        format: 'T20',
        level: 'international',
        description: 'Bilateral T20I series with India as home team',
        structure: {
            groupStage: false,
            knockoutStage: false,
            finalStage: false,
            totalTeams: 2,
            matchesPerTeam: 3,
            totalMatches: 3
        },
        teams: ['India', 'Opponent'],
        venues: [
            'Eden Gardens', 'Wankhede Stadium', 'M. Chinnaswamy Stadium'
        ],
        duration: {
            startMonth: 12, // December
            endMonth: 1,    // January
            durationDays: 15
        }
    }
];

export const getTournamentPreset = (id: string): TournamentPreset | undefined => {
    return indianTournamentPresets.find(preset => preset.id === id);
};

export const getTournamentsByLevel = (level: string): TournamentPreset[] => {
    return indianTournamentPresets.filter(preset => preset.level === level);
};

export const getTournamentsByFormat = (format: string): TournamentPreset[] => {
    return indianTournamentPresets.filter(preset => preset.format === format);
};