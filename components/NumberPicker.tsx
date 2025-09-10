import React, { useRef, useState } from "react";
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Text,
    View,
} from "react-native";

const ITEM_HEIGHT = 50;
const numbers = Array.from({ length: 100 }, (_, i) => 200 + i * 10); // 200, 210, 220...

export default function NumberPicker() {
  const [selected, setSelected] = useState(250);
  const listRef = useRef<FlatList>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelected(numbers[index]);
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-bold mb-4">Lượng nước uống (ml)</Text>

      <FlatList
        ref={listRef}
        data={numbers}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => (
          <View
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              className={`${
                item === selected
                  ? "text-black font-bold text-2xl"
                  : "text-gray-400 text-xl"
              }`}
            >
              {item}
            </Text>
          </View>
        )}
      />

      <Text className="mt-4 text-xl">Đã chọn: {selected} ml</Text>
    </View>
  );
}
