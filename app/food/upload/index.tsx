import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    params.selectedDate ? Number(params.selectedDate) : 0
  );
  const [selected, setSelected] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length, // chỉ cho chọn số lượng còn lại
    });
    if (!result.canceled) {
      // Nếu chọn nhiều ảnh
      const newUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 3));
      // Gửi từng ảnh lên backend nếu muốn
      // newUris.forEach(uri => sendToBackend(uri));
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
      // sendToBackend(result.assets[0].uri);
    }
  };

  const sendToBackend = async (uri: string) => {
    try {
      // upload ảnh lên backend
      let formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "meal.jpg",
      } as any);

      const res = await fetch("http://your-backend/api/analyze", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();
      //setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const options = ["Sáng", "Trưa", "Tối", "Phụ", "Khác"];
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex bg-[#f6f6f6] pt-10">
          <View className="flex flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="chevron-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold self-center">Hình ảnh</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>
        <View className="flex gap-5">
          <View>
            <Text className="font-bold text-xl pt-5 pb-2">Loại bữa ăn</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {options.map((item) => {
                const isSelected = selected === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setSelected(item)}
                    className={`px-4 py-2 rounded-full ${isSelected ? "bg-cyan-blue" : "bg-white"}`}
                  >
                    <Text
                      className={`text-lg  ${isSelected ? "text-white" : "text-black"}`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View className="w-full h-64 bg-white rounded-md shadow-md flex items-center justify-center border-dashed border-2 border-black/20">
            <View className="size-20 flex items-center justify-center bg-cyan-blue/20 rounded-full">
              <FontAwesome6 name="image" color="black" size={24} />
            </View>
            <Text className="text-xl text-center">Chọn ảnh</Text>
          </View>

          <View className="flex flex-row items-center justify-center gap-5">
            <TouchableOpacity
              onPress={pickImage}
              className="self-center flex-row items-center justify-center gap-5 w-[40%] bg-white py-3 rounded-md shadow-md"
            >
              <FontAwesome6 name="upload" color="#19B1FF" size={20} />
              <Text className="text-xl text-black ">Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              className="self-center flex-row items-center justify-center gap-5 w-[40%] bg-white py-3 rounded-md shadow-md"
            >
              <FontAwesome6 name="camera" color="#19B1FF" size={20} />
              <Text className="text-xl text-black ">Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
          <View className="py-2">
            {images.length > 0 && <Text>Ảnh đã chọn ({images.length})</Text>}
            <View className="flex-row items-center gap-4 py-2">
              {images.map((uri, idx) => (
                <View key={idx} className="w-32 h-32 rounded-md relative">
                  <TouchableOpacity
                    className="absolute top-2 right-2 z-10 size-6 rounded-full bg-black/30 items-center justify-center"
                    onPress={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                  >
                    <FontAwesome6 name="x" size={10} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: "100%", height: "100%" }}
                    onPress={() => setPreviewUri(uri)}
                  >
                    <Image
                      source={{ uri }}
                      style={{ width: "100%", height: "100%", borderRadius: 8 }}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {previewUri && (
        <View className="absolute inset-0 bg-black/80 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute top-10 right-10 z-10 "
            onPress={() => setPreviewUri(null)}
          >
            <FontAwesome6 name="x" size={20} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewUri }}
            className="w-[90%] h-[70%]"
            resizeMode="contain"
          />
        </View>
      )}
      <View className="absolute bottom-10 left-0 right-0 p-4 bg-[#f6f6f6]">
        <TouchableOpacity
          onPress={() => {}}
          className="self-center flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
        >
          <Text className="text-xl text-white font-bold ">Tải ảnh lên</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;
