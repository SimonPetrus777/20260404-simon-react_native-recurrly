import "@/global.css";
import AuthShell from "@/components/auth/AuthShell";
import AuthTextField from "@/components/auth/AuthTextField";
import {
    getClerkFieldError,
    getClerkGlobalError,
    hasFieldErrors,
    mergeFieldErrors,
    navigateAfterAuth,
    validateCode,
    validateEmail,
    validatePassword,
} from "@/lib/auth";
import {useAuth, useSignUp} from "@clerk/expo";
import cn from "clsx";
import {Link, useRouter} from "expo-router";
import React, {useMemo, useState} from "react";
import {Pressable, Text, View} from "react-native";

const SignUp = () => {
    const {signUp, errors, fetchStatus} = useSignUp();
    const {isSignedIn} = useAuth();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [isResendingCode, setIsResendingCode] = useState(false);

    const isSubmitting = fetchStatus === 'fetching';
    const needsVerification =
        signUp?.status === 'missing_requirements'
        && signUp.unverifiedFields.includes('email_address')
        && signUp.missingFields.length === 0;

    const fieldErrors = useMemo(
        () =>
            mergeFieldErrors(localErrors, {
                emailAddress: getClerkFieldError(errors, 'emailAddress') ?? '',
                password: getClerkFieldError(errors, 'password') ?? '',
                code: getClerkFieldError(errors, 'code') ?? '',
            }),
        [errors, localErrors],
    );

    const globalError = getClerkGlobalError(errors);

    const handleSubmit = async () => {
        const nextErrors = {
            emailAddress: validateEmail(emailAddress) ?? '',
            password: validatePassword(password, 'sign-up') ?? '',
        };

        setLocalErrors(nextErrors);
        setStatusMessage(null);

        if (hasFieldErrors(nextErrors)) return;

        const {error} = await signUp.password({
            emailAddress: emailAddress.trim(),
            password,
        });

        if (error) return;

        await signUp.verifications.sendEmailCode();
        setStatusMessage(`Check ${emailAddress.trim()} for your verification code.`);
    };

    const handleVerify = async () => {
        const codeError = validateCode(code) ?? '';
        setLocalErrors((currentValue) => ({...currentValue, code: codeError}));
        setStatusMessage(null);

        if (codeError) return;

        setResendError(null);
        await signUp.verifications.verifyEmailCode({code: code.trim()});

        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({session, decorateUrl}) => {
                    if (session?.currentTask) return;
                    navigateAfterAuth({decorateUrl, router});
                },
            });
        }
    };

    const handleResendEmailCode = async () => {
        if (isResendingCode) return;

        setIsResendingCode(true);
        setResendError(null);
        setStatusMessage(null);

        try {
            await signUp.verifications.sendEmailCode();
            setStatusMessage(`A fresh code was sent to ${emailAddress.trim()}.`);
        } catch (error) {
            const nextError = error instanceof Error ? error.message : 'We could not send a new code. Try again.';
            setResendError(nextError);
        } finally {
            setIsResendingCode(false);
        }
    };

    if (signUp?.status === 'complete' || isSignedIn) return null;

    return (
        <AuthShell
            badge="Start in minutes"
            title={needsVerification ? 'Verify your email' : 'Create your account'}
            subtitle={
                needsVerification
                    ? 'We sent a quick code to confirm it\'s really you before we open your workspace.'
                    : 'Set up your secure workspace and start keeping every renewal under control.'
            }
        >
            <View className="auth-toggle-row">
                <Link href="/(auth)/sign-in" asChild>
                    <Pressable className="auth-toggle-pill">
                        <Text className="auth-toggle-text">Sign in</Text>
                    </Pressable>
                </Link>

                <Link href="/(auth)/sign-up" asChild>
                    <Pressable className="auth-toggle-pill auth-toggle-pill-active">
                        <Text className="auth-toggle-text auth-toggle-text-active">Create account</Text>
                    </Pressable>
                </Link>
            </View>

            <View className="auth-form">
                {statusMessage ? (
                    <View className="auth-status-card">
                        <Text className="auth-status-text">{statusMessage}</Text>
                    </View>
                ) : null}

                {globalError ? <Text className="auth-error">{globalError}</Text> : null}
                {resendError ? <Text className="auth-error">{resendError}</Text> : null}

                {needsVerification ? (
                    <>
                        <AuthTextField
                            label="Verification code"
                            value={code}
                            onChangeText={(value) => setCode(value.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            autoComplete="one-time-code"
                            textContentType="oneTimeCode"
                            placeholder="Enter the 6-digit code"
                            maxLength={6}
                            error={fieldErrors.code}
                        />

                        <Pressable
                            className={cn('auth-button', isSubmitting && 'auth-button-disabled')}
                            onPress={handleVerify}
                            disabled={isSubmitting}
                        >
                            <Text className="auth-button-text">Verify and enter app</Text>
                        </Pressable>

                        <Pressable
                            className={cn('auth-secondary-button', isResendingCode && 'auth-button-disabled')}
                            onPress={handleResendEmailCode}
                            disabled={isResendingCode}
                        >
                            <Text className="auth-secondary-button-text">
                                {isResendingCode ? 'Sending...' : 'Resend code'}
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <AuthTextField
                            label="Work email"
                            value={emailAddress}
                            onChangeText={setEmailAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            autoComplete="email"
                            textContentType="emailAddress"
                            placeholder="Enter your email"
                            error={fieldErrors.emailAddress}
                        />

                        <AuthTextField
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoComplete="new-password"
                            textContentType="newPassword"
                            placeholder="Create a password"
                            error={fieldErrors.password}
                            actionLabel={showPassword ? 'Hide' : 'Show'}
                            onActionPress={() => setShowPassword((currentValue) => !currentValue)}
                        />

                        <Text className="auth-helper">
                            Use 8+ characters so your renewal data and payment history stay protected.
                        </Text>

                        <Pressable
                            className={cn(
                                'auth-button',
                                (!emailAddress.trim() || !password || isSubmitting) && 'auth-button-disabled',
                            )}
                            onPress={handleSubmit}
                            disabled={!emailAddress.trim() || !password || isSubmitting}
                        >
                            <Text className="auth-button-text">Create account</Text>
                        </Pressable>

                        <View nativeID="clerk-captcha"/>
                    </>
                )}
            </View>

            <View className="auth-link-row">
                <Text className="auth-link-copy">Already managing subscriptions?</Text>
                <Link href="/(auth)/sign-in">
                    <Text className="auth-link">Sign in</Text>
                </Link>
            </View>

            <Text className="auth-trust-copy">
                Recurrly uses encrypted session storage on device so your access stays protected between launches.
            </Text>
        </AuthShell>
    );
};

export default SignUp;
