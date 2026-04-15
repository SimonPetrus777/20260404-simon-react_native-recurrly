import {ClerkProvider} from "@clerk/expo";
import {tokenCache} from "@clerk/expo/token-cache";
import {SplashScreen, Stack} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";
import {PostHogProvider} from "posthog-react-native";
import {SubscriptionProvider} from "@/lib/subscription-context";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
        'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
        'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
        'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
        'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
        'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) return null;
    if (!publishableKey) throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file.');

    return (
        <PostHogProvider
            apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY!}
            options={{host: process.env.EXPO_PUBLIC_POSTHOG_HOST}}
        >
            <SubscriptionProvider>
                <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
                    <Stack screenOptions={{headerShown: false}}/>
                </ClerkProvider>
            </SubscriptionProvider>
        </PostHogProvider>
    );
}
