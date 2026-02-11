
import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { colors, spacing } from '../theme';

const Layout = ({ children, scrollable = true, style, contentContainerStyle }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {scrollable ? (
                <ScrollView
                    style={[styles.scroll, style]}
                    contentContainerStyle={[styles.content, contentContainerStyle]}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.content, styles.flex, style]}>
                    {children}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl, // Extra padding for bottom tabs
    },
    flex: {
        flex: 1,
    }
});

export default Layout;
