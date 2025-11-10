import TimeWheelPicker from "@/components/TimeWheelPicker";
import { useAppTheme } from "@/context/appThemeContext";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
type TimeWheelModalProps = {
  initialHour: number;
  initialMinute: number;
  handleConfirm: (hour: number, minute: number) => void;
  closeModal: () => void;
  title?: string;
};

const TimeWheelModal = ({
  initialHour,
  initialMinute,
  handleConfirm,
  closeModal,
  title = "Chỉnh giờ",
}: TimeWheelModalProps) => {
  const { theme } = useAppTheme();
  const [hour, setHour] = React.useState(initialHour);
  const [minute, setMinute] = React.useState(initialMinute);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
      <TouchableOpacity className="flex-1 items-center justify-center bg-black/30" onPress={closeModal}>
        <View className="flex items-center justify-center p-4 w-[90%] rounded-md" style={{ backgroundColor: theme.colors.card }}>
          {title && <Text className="text-2xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>{title}</Text>}

          <TimeWheelPicker
            initialHour={initialHour}
            initialMinute={initialMinute}
            onChange={(h, m) => {
              setHour(h);
              setMinute(m);
            }}
          />

          <TouchableOpacity
            onPress={() => {
              handleConfirm(hour, minute);
              closeModal();
            }}
            className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full bg-cyan-blue"
          >
            <Text className="text-xl text-white font-bold">Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default TimeWheelModal;
