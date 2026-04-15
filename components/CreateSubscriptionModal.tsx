import "@/global.css";
import React, {useEffect, useState} from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import dayjs from "dayjs";
import cn from "clsx";
import AuthTextField from "@/components/auth/AuthTextField";
import {
    SUBSCRIPTION_CATEGORIES,
    SUBSCRIPTION_CATEGORY_COLORS,
    SUBSCRIPTION_FREQUENCIES,
} from "@/constants/data";
import {icons} from "@/constants/icons";

const CreateSubscriptionModal = ({
    visible,
    onClose,
    onCreateSubscription,
}: CreateSubscriptionModalProps) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<SubscriptionFrequency>("Monthly");
    const [category, setCategory] = useState<(typeof SUBSCRIPTION_CATEGORIES)[number]>("Entertainment");
    const [nameError, setNameError] = useState<string | null>(null);
    const [priceError, setPriceError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) {
            setName("");
            setPrice("");
            setFrequency("Monthly");
            setCategory("Entertainment");
            setNameError(null);
            setPriceError(null);
        }
    }, [visible]);

    const handleClose = () => {
        setName("");
        setPrice("");
        setFrequency("Monthly");
        setCategory("Entertainment");
        setNameError(null);
        setPriceError(null);
        onClose();
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const normalizedPrice = Number(price.replace(",", "."));

        let hasError = false;

        if (!trimmedName) {
            setNameError("Subscription name is required.");
            hasError = true;
        } else {
            setNameError(null);
        }

        if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
            setPriceError("Enter a valid price greater than zero.");
            hasError = true;
        } else {
            setPriceError(null);
        }

        if (hasError) {
            return;
        }

        const now = dayjs();
        const renewalDate = frequency === "Monthly" ? now.add(1, "month") : now.add(1, "year");
        const subscription: Subscription = {
            id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${now.valueOf()}`,
            name: trimmedName,
            price: normalizedPrice,
            category,
            status: "active",
            startDate: now.toISOString(),
            renewalDate: renewalDate.toISOString(),
            icon: icons.wallet,
            billing: frequency,
            currency: "USD",
            color: SUBSCRIPTION_CATEGORY_COLORS[category],
        };

        onCreateSubscription(subscription);
        handleClose();
    };

    const hasInvalidDraft = !name.trim() || !Number.isFinite(Number(price.replace(",", "."))) || Number(price.replace(",", ".")) <= 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                className="modal-overlay"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Pressable className="flex-1 justify-end" onPress={handleClose}>
                    <Pressable className="modal-container" onPress={() => undefined}>
                        <View className="modal-header">
                            <Text className="modal-title">New Subscription</Text>
                            <Pressable className="modal-close" onPress={handleClose}>
                                <Text className="modal-close-text">x</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerClassName="modal-body"
                        >
                            <View className="auth-form">
                                <AuthTextField
                                    label="Name"
                                    value={name}
                                    onChangeText={(value) => {
                                        setName(value);
                                        if (nameError && value.trim()) {
                                            setNameError(null);
                                        }
                                    }}
                                    placeholder="Netflix, Figma, Claude..."
                                    error={nameError}
                                />

                                <AuthTextField
                                    label="Price"
                                    value={price}
                                    onChangeText={(value) => {
                                        setPrice(value);
                                        const normalizedPrice = Number(value.replace(",", "."));
                                        if (priceError && Number.isFinite(normalizedPrice) && normalizedPrice > 0) {
                                            setPriceError(null);
                                        }
                                    }}
                                    placeholder="12.99"
                                    keyboardType="decimal-pad"
                                    error={priceError}
                                />

                                <View className="auth-field">
                                    <Text className="auth-label">Frequency</Text>
                                    <View className="picker-row">
                                        {SUBSCRIPTION_FREQUENCIES.map((option) => (
                                            <Pressable
                                                key={option}
                                                className={cn("picker-option", frequency === option && "picker-option-active")}
                                                onPress={() => setFrequency(option)}
                                            >
                                                <Text
                                                    className={cn(
                                                        "picker-option-text",
                                                        frequency === option && "picker-option-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Category</Text>
                                    <View className="category-scroll">
                                        {SUBSCRIPTION_CATEGORIES.map((option) => (
                                            <Pressable
                                                key={option}
                                                className={cn("category-chip", category === option && "category-chip-active")}
                                                onPress={() => setCategory(option)}
                                            >
                                                <Text
                                                    className={cn(
                                                        "category-chip-text",
                                                        category === option && "category-chip-text-active",
                                                    )}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                <Pressable
                                    className={cn("auth-button", hasInvalidDraft && "auth-button-disabled")}
                                    onPress={handleSubmit}
                                >
                                    <Text className="auth-button-text">Create Subscription</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CreateSubscriptionModal;
