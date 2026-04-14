import "@/global.css";
import React, {type ReactNode} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

type AuthShellProps = {
    title: string;
    subtitle: string;
    badge: string;
    children: ReactNode;
};

const AuthShell = ({title, subtitle, badge, children}: AuthShellProps) => {
    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                className="auth-screen"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">R</Text>
                            </View>

                            <View>
                                <Text className="auth-wordmark">Recurly</Text>
                                <Text className="auth-wordmark-sub">Smart billing</Text>
                            </View>
                        </View>

                        <View className="auth-badge">
                            <Text className="auth-badge-text">{badge}</Text>
                        </View>

                        <Text className="auth-title">{title}</Text>
                        <Text className="auth-subtitle">{subtitle}</Text>
                    </View>

                    <View className="auth-card">{children}</View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AuthShell;
