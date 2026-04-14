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
import {useSignIn} from "@clerk/expo";
import cn from "clsx";
import {Link, useRouter} from "expo-router";
import React, {useMemo, useState} from "react";
import {Pressable, Text, View} from "react-native";

const SignIn = () => {
    const {signIn, errors, fetchStatus} = useSignIn();
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
    const needsEmailCode = signIn?.status === 'needs_client_trust';

    const fieldErrors = useMemo(
        () =>
            mergeFieldErrors(localErrors, {
                emailAddress: getClerkFieldError(errors, 'identifier') ?? getClerkFieldError(errors, 'emailAddress') ?? '',
                password: getClerkFieldError(errors, 'password') ?? '',
                code: getClerkFieldError(errors, 'code') ?? '',
            }),
        [errors, localErrors],
    );

    const globalError = getClerkGlobalError(errors);

    const handleSubmit = async () => {
        const nextErrors = {
            emailAddress: validateEmail(emailAddress) ?? '',
            password: validatePassword(password, 'sign-in') ?? '',
        };

        setLocalErrors(nextErrors);
        setStatusMessage(null);

        if (hasFieldErrors(nextErrors)) return;

        const {error} = await signIn.password({
            emailAddress: emailAddress.trim(),
            password,
        });

        if (error) return;

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({session, decorateUrl}) => {
                    if (session?.currentTask) return;
                    navigateAfterAuth({decorateUrl, router});
                },
            });
            return;
        }

        if (signIn.status === 'needs_client_trust') {
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code',
            );

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode();
                setStatusMessage(`We sent a verification code to ${emailAddress.trim()}.`);
            }
        }
    };

    const handleVerify = async () => {
        const codeError = validateCode(code) ?? '';
        setLocalErrors((currentValue) => ({...currentValue, code: codeError}));
        setStatusMessage(null);

        if (codeError) return;

        setResendError(null);
        await signIn.mfa.verifyEmailCode({code: code.trim()});

        if (signIn.status === 'complete') {
            await signIn.finalize({
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

        try {
            await signIn.mfa.sendEmailCode();
            setStatusMessage(`A fresh verification code was sent to ${emailAddress.trim()}.`);
        } catch (error) {
            const nextError = error instanceof Error ? error.message : 'We could not send a new code. Try again.';
            setResendError(nextError);
        } finally {
            setIsResendingCode(false);
        }
    };

    return (
        <AuthShell
            badge="Secure sign in"
            title={needsEmailCode ? 'One more step' : 'Welcome back'}
            subtitle={
                needsEmailCode
                    ? 'Verify this device to keep your billing data protected.'
                    : 'Sign in to continue tracking renewals, spend, and active plans.'
            }
        >
            <View className="auth-toggle-row">
                <Link href="/(auth)/sign-in" asChild>
                    <Pressable className="auth-toggle-pill auth-toggle-pill-active">
                        <Text className="auth-toggle-text auth-toggle-text-active">Sign in</Text>
                    </Pressable>
                </Link>

                <Link href="/(auth)/sign-up" asChild>
                    <Pressable className="auth-toggle-pill">
                        <Text className="auth-toggle-text">Create account</Text>
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

                {needsEmailCode ? (
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
                            <Text className="auth-button-text">Verify and continue</Text>
                        </Pressable>

                        <Pressable
                            className={cn('auth-secondary-button', isResendingCode && 'auth-button-disabled')}
                            onPress={handleResendEmailCode}
                            disabled={isResendingCode}
                        >
                            <Text className="auth-secondary-button-text">
                                {isResendingCode ? 'Sending...' : 'Send a new code'}
                            </Text>
                        </Pressable>

                        <Pressable
                            className="auth-secondary-button"
                            onPress={() => {
                                signIn.reset();
                                setCode('');
                                setStatusMessage(null);
                            }}
                        >
                            <Text className="auth-secondary-button-text">Use a different account</Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <AuthTextField
                            label="Email"
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
                            autoComplete="password"
                            textContentType="password"
                            placeholder="Enter your password"
                            error={fieldErrors.password}
                            actionLabel={showPassword ? 'Hide' : 'Show'}
                            onActionPress={() => setShowPassword((currentValue) => !currentValue)}
                        />

                        <Text className="auth-helper">Your session stays encrypted on this device.</Text>

                        <Pressable
                            className={cn(
                                'auth-button',
                                (!emailAddress.trim() || !password || isSubmitting) && 'auth-button-disabled',
                            )}
                            onPress={handleSubmit}
                            disabled={!emailAddress.trim() || !password || isSubmitting}
                        >
                            <Text className="auth-button-text">Continue</Text>
                        </Pressable>
                    </>
                )}
            </View>

            <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up">
                    <Text className="auth-link">Create your account</Text>
                </Link>
            </View>

            <Text className="auth-trust-copy">
                By continuing, you agree to keep your billing workspace secure and accessible only to authorized team members.
            </Text>
        </AuthShell>
    );
};

export default SignIn;
