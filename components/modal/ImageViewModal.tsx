import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Image, Modal, TouchableOpacity, View } from "react-native";

type ImagePreviewModalProps = {
  uri: string | null;
  closeModal: () => void;
};

const ImagePreviewModal = ({ uri, closeModal }: ImagePreviewModalProps) => {
  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="fullScreen"
      onRequestClose={closeModal}
    >
      <View className="flex-1 bg-black/60 items-center justify-center">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => closeModal()}
          >
            <View className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
              <FontAwesome6 name="x" size={20} color="white" />
            </View>
          </TouchableOpacity>

          {uri && (
            <Image
              source={{ uri: uri }}
              style={{
                width: '90%',
                height: '80%',
                resizeMode: 'contain'
              }}
            />
          )}
        </View>
    </Modal>
  );
};

export default ImagePreviewModal;
