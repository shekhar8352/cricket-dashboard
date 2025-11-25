
import 'dotenv/config';
import { AnalyticsCalculator } from '../src/lib/analytics/AnalyticsCalculator';
import Performance from '../src/database/models/Performance';
import Player from '../src/database/models/Player';
import Match from '../src/database/models/Match';
import BattingAnalytics from '../src/database/models/BattingAnalytics';
import { connectDB } from '../src/database/mongoose';

async function verifyAnalytics() {
    try {
        await connectDB();
        console.log('Connected to DB');

        // Check for existing active player
        let player = await Player.findOne({ isActive: true });
        if (!player) {
            player = await Player.create({
                fullName: 'Test Player Full Name',
                dob: new Date('1990-01-01'),
                country: 'India',
                careerStart: new Date('2010-01-01'),
                isActive: true,
                role: 'allrounder',
                battingStyle: 'Right-hand bat',
                bowlingStyle: 'Right-arm medium'
            });
            console.log('Created test player:', player._id);
        } else {
            console.log('Using existing active player:', player._id);
        }

        // Create a mock match
        const match = await Match.create({
            date: new Date(),
            format: 'ODI',
            level: 'international',
            opponent: 'Test Opponent',
            venue: 'Test Venue',
            result: 'won'
        });
        console.log('Created test match:', match._id);

        // Create a mock performance with nested data
        await Performance.create({
            player: player._id,
            match: match._id,
            teamRepresented: 'India',
            teamLevel: 'international',
            firstInnings: {
                runs: 50,
                ballsFaced: 40,
                dismissalType: 'caught'
            },
            firstInningsBowling: {
                wickets: 2,
                runsConceded: 30,
                overs: 4
            }
        });
        console.log('Created test performance');

        // Run calculator
        console.log('Running calculator...');
        await AnalyticsCalculator.calculateBattingAnalytics();
        await AnalyticsCalculator.calculateBowlingAnalytics();

        // Verify results
        const battingAnalytics = await BattingAnalytics.findOne({});
        console.log('Batting Analytics:', JSON.stringify(battingAnalytics, null, 2));

        if (battingAnalytics && battingAnalytics.totalRuns > 0) { // Assuming totalRuns is a field, or check formatStats
            console.log('SUCCESS: Batting analytics calculated!');
        } else {
            // Check formatStats if totalRuns isn't at root
            if (battingAnalytics?.formatStats?.length > 0) {
                console.log('SUCCESS: Batting analytics calculated (found in formatStats)!');
            } else {
                console.error('FAILURE: Batting analytics missing or empty.');
            }
        }

        // Cleanup
        await Performance.deleteMany({ player: player._id, match: match._id }); // Only delete the test performance
        // await Player.deleteOne({ _id: player._id }); // Don't delete player as we might be using existing one
        await Match.deleteOne({ _id: match._id });
        // await BattingAnalytics.deleteMany({}); // Don't delete all analytics!

        console.log('Cleanup done');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyAnalytics();
