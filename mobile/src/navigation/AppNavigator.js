
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { LayoutDashboard, Users, Trophy, Flag, FolderPlus, ListChecks } from 'lucide-react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HackathonListScreen from '../screens/HackathonListScreen';
import HackathonDetailScreen from '../screens/HackathonDetailScreen';
import ParticipantDashboardScreen from '../screens/ParticipantDashboardScreen';
import TeamScreen from '../screens/TeamScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import OrganizerHackathonScreen from '../screens/OrganizerHackathonScreen';
import OrganizerRoundsScreen from '../screens/OrganizerRoundsScreen';
import OrganizerJudgesScreen from '../screens/OrganizerJudgesScreen';
import JudgeDashboardScreen from '../screens/JudgeDashboardScreen';
import JudgingScreen from '../screens/JudgingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createStackNavigator();
const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
);

// Participant Tab
const ParticipantTab = createBottomTabNavigator();
const ParticipantNavigator = () => (
    <ParticipantTab.Navigator screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
    }}>
        <ParticipantTab.Screen
            name="Dashboard"
            component={ParticipantDashboardScreen}
            options={{ tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} /> }}
        />
        <ParticipantTab.Screen
            name="MyTeams"
            component={TeamScreen}
            options={{ tabBarIcon: ({ color }) => <Users size={24} color={color} /> }}
        />
        <ParticipantTab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ color }) => <Users size={24} color={color} /> }}
        />
    </ParticipantTab.Navigator>
);

// Organizer Tab
const OrganizerTab = createBottomTabNavigator();
const OrganizerNavigator = () => (
    <OrganizerTab.Navigator screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
    }}>
        <OrganizerTab.Screen
            name="Dashboard"
            component={OrganizerDashboardScreen}
            options={{ tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} /> }}
        />
        <OrganizerTab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ color }) => <Users size={24} color={color} /> }}
        />
    </OrganizerTab.Navigator>
);

// Judge Tab
const JudgeTab = createBottomTabNavigator();
const JudgeNavigator = () => (
    <JudgeTab.Navigator screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
    }}>
        <JudgeTab.Screen
            name="Dashboard"
            component={JudgeDashboardScreen}
            options={{ tabBarIcon: ({ color }) => <ListChecks size={24} color={color} /> }}
        />
        <JudgeTab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ color }) => <Users size={24} color={color} /> }}
        />
    </JudgeTab.Navigator>
);

const RootStack = createStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Public / Auth Flow
                <>
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                </>
            ) : (
                // Role Based Flow
                <>
                    {user.role === 'organizer' && (
                        <RootStack.Screen name="OrganizerApp" component={OrganizerNavigator} />
                    )}
                    {user.role === 'judge' && (
                        <RootStack.Screen name="JudgeApp" component={JudgeNavigator} />
                    )}
                    {(!user.role || user.role === 'participant') && (
                        <RootStack.Screen name="ParticipantApp" component={ParticipantNavigator} />
                    )}

                    {/* Common Screens accessible from dashboards */}
                    <RootStack.Screen name="HackathonDetail" component={HackathonDetailScreen} />
                    <RootStack.Screen name="SubmissionScreen" component={SubmissionScreen} />

                    {/* Organizer Specific Screens */}
                    <RootStack.Screen name="OrganizerHackathon" component={OrganizerHackathonScreen} />
                    <RootStack.Screen name="OrganizerRounds" component={OrganizerRoundsScreen} />
                    <RootStack.Screen name="OrganizerJudges" component={OrganizerJudgesScreen} />

                    {/* Judge Specific Screens */}
                    <RootStack.Screen name="JudgingScreen" component={JudgingScreen} />
                </>
            )}
        </RootStack.Navigator>
    );
};

export default AppNavigator;
