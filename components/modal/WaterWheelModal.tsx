import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import WheelPickerExpo from 'react-native-wheel-picker-expo';

const WaterWheelModal = ({ title, items, initialValue, currentDate, handleConfirm, closeModal }: any) => {
    const [amount, setAmount] = useState(initialValue);
  
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
            <Text className="text-2xl font-bold mb-4">{title}</Text>
  
            <WheelPickerExpo
              height={240}
              width={250}
              initialSelectedIndex={items.findIndex(
                (i: any) => i.amount === initialValue
              )}
              items={items.map((item: any) => ({
                label: item.label,
                value: item.amount,
              }))}
              selectedStyle={{
                borderColor: "gray",
                borderWidth: 0.5,
              }}
              renderItem={({ label }) => (
                <Text style={{ fontSize: 28, fontWeight: "500" }}>{label}</Text>
              )}
              onChange={({ item }) => setAmount(item.value)}
            />
  
            <TouchableOpacity
              onPress={() => {
                handleConfirm(amount, currentDate.toString());
                closeModal();
              }}
              className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full bg-cyan-blue"
            >
              <Text className="text-xl text-white font-bold">Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

export default WaterWheelModal