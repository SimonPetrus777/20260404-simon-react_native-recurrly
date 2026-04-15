import React, {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from "react";
import {HOME_SUBSCRIPTIONS} from "@/constants/data";

type SubscriptionContextValue = {
    subscriptions: Subscription[];
    addSubscription: (subscription: Subscription) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider = ({children}: { children: ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

    const addSubscription = useCallback((subscription: Subscription) => {
        setSubscriptions((currentSubscriptions) => [subscription, ...currentSubscriptions]);
    }, []);

    const value = useMemo(() => ({
        subscriptions,
        addSubscription,
    }), [subscriptions, addSubscription]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptions = () => {
    const context = useContext(SubscriptionContext);

    if (!context) {
        throw new Error("useSubscriptions must be used within SubscriptionProvider");
    }

    return context;
};
