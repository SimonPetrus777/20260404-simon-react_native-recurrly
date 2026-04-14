import {useClerk, useUser} from '@clerk/expo'
import {Pressable, Text, View} from 'react-native'
import React from 'react'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const {signOut} = useClerk();
    const {user} = useUser();

    return (
        <SafeAreaView className="flex-1  bg-background p-5">
            <View className="gap-4">
                <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
                <View className="rounded-3xl border border-border bg-card p-5">
                    <Text className="text-sm font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                        Signed in as
                    </Text>
                    <Text className="mt-2 text-xl font-sans-bold text-primary">
                        {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account owner'}
                    </Text>
                    <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                        Manage access for your subscription workspace.
                    </Text>
                </View>

                <Pressable className="auth-button mt-0" onPress={() => signOut()}>
                    <Text className="auth-button-text">Sign out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}
export default Settings
