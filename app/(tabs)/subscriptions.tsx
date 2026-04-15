import React, {useDeferredValue, useMemo, useState} from 'react'
import {FlatList, Text, TextInput, View} from 'react-native'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import SubscriptionCard from "@/components/SubscriptionCard";
import {useSubscriptions} from "@/lib/subscription-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [query, setQuery] = useState('');
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const {subscriptions} = useSubscriptions();
    const deferredQuery = useDeferredValue(query);
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const filteredSubscriptions = useMemo(() => {
        if (!normalizedQuery) {
            return subscriptions;
        }

        return subscriptions.filter((subscription) => {
            const searchIndex = [
                subscription.name,
                subscription.plan,
                subscription.category,
                subscription.billing,
                subscription.status,
                subscription.paymentMethod,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchIndex.includes(normalizedQuery);
        });
    }, [normalizedQuery, subscriptions]);

    return (
        <SafeAreaView className="flex-1  bg-background p-5">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4"/>}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-30"
                ListHeaderComponent={(
                    <View className="subscriptions-header">
                        <Text className="subscriptions-title">Subscriptions</Text>
                        <Text className="subscriptions-subtitle">
                            Search across your active, paused, and cancelled plans.
                        </Text>

                        <View className="subscriptions-search-wrap">
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search subscriptions"
                                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                                className="subscriptions-search-input"
                                autoCapitalize="none"
                                autoCorrect={false}
                                clearButtonMode="while-editing"
                                returnKeyType="search"
                                accessibilityLabel="Search subscriptions"
                                accessibilityHint="Enter text to filter your subscriptions"
                                accessibilityRole="search"
                            />
                        </View>

                        <Text className="subscriptions-results">
                            {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'result' : 'results'}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={(
                    <View className="subscriptions-empty">
                        <Text className="subscriptions-empty-title">
                            {normalizedQuery ? "No matches found" : "You have no subscriptions"}
                        </Text>
                        <Text className="subscriptions-empty-copy">
                            {normalizedQuery
                                ? "Try searching by service name, category, plan, or payment method."
                                : "Create a subscription from the home screen to start tracking your plans."}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}
export default Subscriptions
