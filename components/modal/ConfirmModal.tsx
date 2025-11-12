import { useAppTheme } from "@/context/appThemeContext";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface ConfirmModalProps {
  closeModal: () => void;
  title: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ConfirmModal = ({ closeModal, title, onConfirm, onCancel }: ConfirmModalProps) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  };

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-[80%] p-6 rounded-2xl shadow-lg" style={{ backgroundColor: theme.colors.card }}>
          <Text className="text-xl font-bold text-center mb-6" style={{ color: theme.colors.textPrimary }}>
            {t("Bạn có muốn")} {title} {t("không")}?
          </Text>
          <View className="flex-row items-center justify-between gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-4 px-4 rounded-lg"
              style={{ backgroundColor: theme.colors.secondaryCard }}
            >
              <Text className="text-lg text-center font-bold" style={{ color: theme.colors.textPrimary }}>
                {t("Không")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-4 px-4 rounded-lg bg-cyan-blue"
            >
              <Text className="text-lg text-center font-bold text-white">
                {t("Có")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
