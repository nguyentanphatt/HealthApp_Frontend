import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ActionModalProps {
    visible: boolean;
    closeModal: () => void;
    title: string;
    options: Array<{
        label: string;
        onPress: () => void;
        isSelected?: boolean;
    }>;
}

export default function ActionModal({ visible, closeModal , title, options }: ActionModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                    <Text className="text-xl font-bold text-center mb-4">{title}</Text>
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                option.onPress();
                                closeModal();
                            }}
                            className="py-4 px-4 rounded-lg mb-2"
                            style={{
                                backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#19B1FF' : '#f9fafb'
                            }}
                        >
                            <Text className={`text-lg text-center ${index === 0 ? 'text-white font-bold' : index === 1 ? 'text-white font-bold' : 'text-gray-700'
                                } ${option.isSelected ? 'text-blue-600 font-bold' : 'text-gray-700'
                                }`}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        onPress={closeModal}
                        className="py-4 px-4 rounded-lg bg-gray-200"
                    >
                        <Text className="text-lg text-center text-gray-700">Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}