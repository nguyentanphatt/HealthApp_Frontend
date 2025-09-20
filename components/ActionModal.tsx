import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ActionModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Array<{
        label: string;
        onPress: () => void;
        isSelected?: boolean;
    }>;
}

export default function ActionModal({ visible, onClose, title, options }: ActionModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                    <Text className="text-xl font-bold text-center mb-4">{title}</Text>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                option.onPress();
                                onClose();
                            }}
                            className={`py-4 px-4 rounded-lg mb-2 ${option.isSelected ? 'bg-blue-100' : 'bg-gray-50'
                                }`}
                        >
                            <Text className={`text-lg text-center ${option.isSelected ? 'text-blue-600 font-bold' : 'text-gray-700'
                                }`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        onPress={onClose}
                        className="py-3 px-4 rounded-lg bg-gray-200 mt-4"
                    >
                        <Text className="text-lg text-center text-gray-700">Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}