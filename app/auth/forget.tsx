import InputWithIcon from "@/components/InputWithIcon";
import { images } from "@/constants/image";
import i18n from "@/plugins/i18n";
import { changePassword, sendOtp, verifyResetPassword } from "@/services/user";
import { useToastStore } from "@/stores/useToast";
import { validateConfirmPassword, validateEmail, validatePassword } from "@/utils/validate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";


const Signup = () => {
    const router = useRouter()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpFocused, setIsOtpFocused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [errorMessage, setErrorMessage] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const { t } = useTranslation();
    const { addToast } = useToastStore();

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const stored = await AsyncStorage.getItem('temp_language');
                if (stored === 'en' || stored === 'vi') {
                    await i18n.changeLanguage(stored);
                }
            } catch (error) {
                console.error('Error loading language:', error);
            }
        };
        loadLanguage();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleSendOtp = async () => {
        const response = await sendOtp(email);
        if (response.success) {
            console.log("OTP sent successfully");
            addToast(t("Đã gửi mã OTP"), "success");
            setTimeLeft(5 * 60); // 5 minutes countdown
        }
        else {
            addToast(response.message, "error");
        }
    };

    const handleResetPassword = async () => {
        const response = await verifyResetPassword(email, otp);
        if (response.success) {
            const resetResponse = await changePassword({email, newPassword: password});
            if (resetResponse.success) {
                router.push('/auth/signin')
            }
            else {
                addToast(resetResponse.message, "error");
            }
        }
        else {
            addToast(response.message, "error");
        }
    };

    return (
        <View className="font-lato-regular flex-1 items-center py-10 h-full">
            <Text className="text-2xl font-bold text-center py-20">{t("Quên mật khẩu")}</Text>
            <Image
                source={images.star}
                className="-z-10 absolute top-1/5 -right-[10%] w-[100px] h-[100px]"
            />
            <Image
                source={images.star}
                className="-z-10 absolute top-[20%] -left-[15%] w-[100px] h-[100px]"
            />
            <View className=" items-center justify-center w-full gap-[6%] z-10 bg-white/40 backdrop-blur-md px-5">
                <InputWithIcon
                    icon="envelope"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => {
                        const emailError = validateEmail(email);
                        setErrorMessage((prev) => ({ ...prev, email: t(emailError) }));
                    }}
                    error={errorMessage.email}
                />

                <View className="flex-row w-full gap-5">
                    <View
                        className={`flex-row items-center border-2 w-[80%] rounded-md p-2.5 ${isOtpFocused ? "border-cyan-blue" : "border-gray-300"}`}
                    >
                        <TextInput
                            placeholder={t("Mã OTP")}
                            className="flex-1 px-2 py-2.5 text-black"
                            onFocus={() => setIsOtpFocused(true)}
                            onBlur={() => setIsOtpFocused(false)}
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>
                    <TouchableOpacity
                        className="flex items-center justify-center py-4 px-3 bg-cyan-blue rounded-md"
                        onPress={() => handleSendOtp()}
                        disabled={timeLeft > 0}
                        style={{ opacity: timeLeft > 0 ? 0.6 : 1, minWidth: 60 }}
                    >
                        <Text className="text-white text-xs font-medium">
                            {timeLeft > 0 ? formatTime(timeLeft) : t("Gửi")}
                        </Text>
                    </TouchableOpacity>
                </View>

                <InputWithIcon
                    icon="key"
                    placeholder={t("Mật khẩu mới")}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => {
                        const passwordError = validatePassword(password);
                        setErrorMessage((prev) => ({ ...prev, password: t(passwordError) }));
                    }}
                    error={errorMessage.password}
                />
                <InputWithIcon
                    icon="key"
                    placeholder={t("Xác nhận mật khẩu")}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onBlur={() => {
                        const confirmPasswordError = validateConfirmPassword(
                            password,
                            confirmPassword
                        );
                        setErrorMessage((prev) => ({
                            ...prev,
                            confirmPassword: t(confirmPasswordError),
                        }));
                    }}
                    error={errorMessage.confirmPassword}
                />
                <TouchableOpacity
                    className="flex items-center justify-center py-4 w-full bg-cyan-blue rounded-full"
                    onPress={handleResetPassword}
                >
                    <Text className="text-white">{t("Đặt lại")}</Text>
                </TouchableOpacity>
            </View>
            <View className="flex items-center gap-2">
                <Text className="text-black/50">
                    {t("Đã có tài khoản? ")}{" "}
                    <Link href={"/auth/signin"} className="text-cyan-blue">
                        {t("Đăng nhập")}
                    </Link>
                </Text>
            </View>
        </View>
    );
};

export default Signup;