import "@/global.css";
import React from "react";
import {Pressable, Text, TextInput, View, type TextInputProps} from "react-native";
import cn from "clsx";

type AuthTextFieldProps = TextInputProps & {
    label: string;
    error?: string | null;
    actionLabel?: string;
    onActionPress?: () => void;
};

const AuthTextField = ({label, error, actionLabel, onActionPress, ...props}: AuthTextFieldProps) => {
    return (
        <View className="auth-field">
            <Text className="auth-label">{label}</Text>

            <View className={cn('auth-input-wrap', error && 'auth-input-error')}>
                <View className="auth-input-row">
                    <TextInput
                        className="auth-input"
                        placeholderTextColor="rgba(8, 17, 38, 0.45)"
                        {...props}
                    />

                    {actionLabel && onActionPress ? (
                        <Pressable className="auth-input-action" onPress={onActionPress}>
                            <Text className="auth-input-action-text">{actionLabel}</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}
        </View>
    );
};

export default AuthTextField;
