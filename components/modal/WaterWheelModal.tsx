import { useAppTheme } from '@/context/appThemeContext';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

const WaterWheelModal = ({ title, items, initialValue, currentDate, handleConfirm, closeModal }: any) => {
  const { theme } = useAppTheme();
  const [amount, setAmount] = useState(initialValue);
  const data = useMemo(
    () => items.map((it: any) => ({ label: it.label, value: it.amount })),
    [items]
  );
  // Do not auto-scroll to initial value; start at top with the first item centered
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<FlatList<{ label: string; value: number }>>(null);

  const CONTAINER_HEIGHT = 240;
  const ITEM_HEIGHT = 48;
  const LIST_WIDTH = 250;
  const verticalPadding = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const handleMomentumEnd = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setSelectedIndex(clamped);
    setAmount(data[clamped]?.value);
  };

  return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeModal}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
          <View className="flex items-center justify-center p-4 w-[90%] rounded-md" style={{ backgroundColor: theme.colors.card, zIndex: 1 }}>
            <Text className="text-2xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>{title}</Text>

            <View style={{ height: CONTAINER_HEIGHT, width: LIST_WIDTH, backgroundColor: theme.colors.card }}>
              <FlatList
                ref={listRef}
                data={data}
                keyExtractor={(_, index) => `w-${index}`}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingTop: verticalPadding, paddingBottom: verticalPadding }}
                renderItem={({ item, index }) => (
                  <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: index === selectedIndex ? '600' : '500',
                        color: theme.colors.textPrimary,
                        opacity: index === selectedIndex ? 1 : 0.35,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                )}
                onMomentumScrollEnd={handleMomentumEnd}
                onScroll={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                  const clamped = Math.max(0, Math.min(idx, data.length - 1));
                  if (clamped !== selectedIndex) setSelectedIndex(clamped);
                }}
                scrollEventThrottle={16}
              />
            </View>
  
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