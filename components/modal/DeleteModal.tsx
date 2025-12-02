import { useAppTheme } from '@/context/appThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

const DeleteModal = ({closeModal, confirmDelete, visible}: {closeModal: () => void, confirmDelete: () => void, visible: boolean}) => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
    return (
    <Modal  
    visible
    transparent
    animationType="fade"
    onRequestClose={closeModal}
  >
    <View className="flex-1 justify-end items-center bg-black/30">
      <View className="w-[80%] p-5 rounded-t-2xl shadow-lg" style={{ backgroundColor: theme.colors.card }}>
        <Text className="text-xl text-center mb-10" style={{ color: theme.colors.textPrimary }}>
          {t("Bạn có xác nhận muốn xóa ?")}
        </Text>
        <View className="flex-row items-center justify-between h-auto w-full">
          <TouchableOpacity
            onPress={() => {
              closeModal()
            }}
            className="rounded-lg w-[45%]"
          >
            <Text className="text-center text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
              {t("Không")}
            </Text>
          </TouchableOpacity>
          <View className="h-5 w-0.5" style={{ backgroundColor: theme.colors.border }} />
          <TouchableOpacity
            onPress={() => {
                confirmDelete();
                closeModal();
              }}
            className=" rounded-lg w-[45%]"
          >
            <Text className="text-red-500 text-center text-xl font-bold">
              {t("Có")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  )
}

export default DeleteModal