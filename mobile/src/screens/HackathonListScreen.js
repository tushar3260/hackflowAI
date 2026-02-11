
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import api, { SERVER_URL } from '../api/config';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { colors, typography, spacing, borderRadius } from '../theme';
import { Calendar, Users, MapPin } from 'lucide-react-native';

const HackathonListScreen = ({ navigation }) => {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHackathons = async () => {
        try {
            const res = await api.get('/hackathons');
            setHackathons(res.data);
        } catch (e) {
            console.log('Error fetching hackathons', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchHackathons();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHackathons();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('HackathonDetail', { id: item._id })}
        >
            <Card style={styles.card}>
                <View style={styles.imageContainer}>
                    {item.banner ? (
                        <Image
                            source={{ uri: `${SERVER_URL}${item.banner}` }}
                            style={styles.banner}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.banner, styles.placeholderBanner]}>
                            <Text style={styles.placeholderText}>{item.title?.charAt(0)}</Text>
                        </View>
                    )}
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {new Date(item.startDate).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Users size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>
                                {item.participants?.length || 0} Joined
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <Layout scrollable={false}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explore Hackathons</Text>
                <Text style={styles.headerSubtitle}>Find your next challenge</Text>
            </View>

            <FlatList
                data={hackathons}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hackathons found</Text>
                        </View>
                    )
                }
            />
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    headerSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    card: {
        marginBottom: spacing.lg,
        borderWidth: 0,
        elevation: 2,
    },
    imageContainer: {
        height: 150,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    placeholderBanner: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 48,
        color: colors.surface,
        fontWeight: typography.weight.bold,
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        color: colors.surface,
        fontSize: typography.size.xs,
        textTransform: 'uppercase',
        fontWeight: typography.weight.bold,
    },
    content: {
        padding: spacing.md,
    },
    title: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    metaContainer: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: typography.size.xs,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
    }
});

export default HackathonListScreen;
