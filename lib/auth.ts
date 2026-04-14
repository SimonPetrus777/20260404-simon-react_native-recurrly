type FieldErrors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | null => {
    const normalizedValue = value.trim();

    if (!normalizedValue) return 'Enter your email address.';
    if (!emailPattern.test(normalizedValue)) return 'Enter a valid email address.';

    return null;
};

export const validatePassword = (value: string, mode: 'sign-in' | 'sign-up'): string | null => {
    if (!value) return 'Enter your password.';
    if (mode === 'sign-up' && value.length < 8) return 'Use at least 8 characters.';

    return null;
};

export const validateCode = (value: string): string | null => {
    if (!value.trim()) return 'Enter the verification code.';
    if (value.trim().length < 6) return 'Use the 6-digit code from your inbox.';

    return null;
};

export const getClerkFieldError = (errors: unknown, fieldName: string): string | null => {
    const fieldGroup = (errors as { fields?: Record<string, { message?: string }> })?.fields;
    const fieldError = fieldGroup?.[fieldName]?.message;

    return typeof fieldError === 'string' && fieldError.length > 0 ? fieldError : null;
};

export const getClerkGlobalError = (errors: unknown): string | null => {
    const globalError = (errors as { message?: string })?.message;
    if (typeof globalError === 'string' && globalError.length > 0) return globalError;

    const rootError = getClerkFieldError(errors, 'root');
    if (rootError) return rootError;

    return null;
};

export const mergeFieldErrors = (...errorMaps: Array<FieldErrors | null | undefined>): FieldErrors => {
    return errorMaps.reduce<FieldErrors>((accumulator, currentValue) => {
        if (!currentValue) return accumulator;
        return {...accumulator, ...currentValue};
    }, {});
};

export const hasFieldErrors = (errors: FieldErrors): boolean => Object.values(errors).some(Boolean);

type DecorateUrl = (path: string) => string;

type AuthNavigateParams = {
    decorateUrl: DecorateUrl;
    router: { replace: (path: string) => void };
    targetPath?: string;
};

export const navigateAfterAuth = ({decorateUrl, router, targetPath = '/'}: AuthNavigateParams) => {
    const nextPath = decorateUrl(targetPath);

    if (typeof window !== 'undefined' && nextPath.startsWith('http')) {
        window.location.href = nextPath;
        return;
    }

    router.replace(nextPath);
};
