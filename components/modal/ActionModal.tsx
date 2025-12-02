import { useAppTheme } from "@/context/appThemeContext";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ActionModalProps {
    visible: boolean;
    closeModal: () => void;
    title: string;
    options: Array<{
        label: string;
        onPress: () => void;
        isSelected?: boolean;
        backgroundColor?: string;
        textColor?: string;
    }>;
}

export default function ActionModal({ visible, closeModal , title, options }: ActionModalProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="rounded-t-3xl p-6" style={{ backgroundColor: theme.colors.card }}>
                    <Text className="text-xl font-bold text-center mb-4" style={{ color: theme.colors.textPrimary }}>{title}</Text>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                option.onPress();
                                closeModal();
                            }}
                            className="py-4 px-4 rounded-lg mb-2"
                            style={{
                                backgroundColor: option.backgroundColor || '#d1d4dc'
                            }}
                        >
                            <Text 
                                style={{ color: option.textColor || 'black' }} 
                                className="text-lg text-center"
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        onPress={closeModal}
                        className="py-4 px-4 rounded-lg bg-gray-200"
                    >
                        <Text className="text-lg text-center text-gray-700">{t("Hủy")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}