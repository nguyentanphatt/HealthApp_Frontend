import { useAppTheme } from "@/context/appThemeContext";
import { submitFoodRecord } from "@/services/food";
import { useModalStore } from "@/stores/useModalStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { openModal } = useModalStore();
  const [selectedTag, setSelectedTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const options = ["Sáng", "Trưa", "Tối", "Phụ", "Khác"];
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 3));
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const sendToBackend = async (uris: string[], tag: string) => {
    try {
      setIsUploading(true);
      console.log("Sending to backend:", uris, tag);

      for (let i = 0; i < uris.length; i++) {
        try {
          const res = await submitFoodRecord(uris[i], tag);
          console.log(`Upload ảnh ${i + 1} thành công:`, res);
          if (res.success) {
            if (res.name === "Invalid") {
              console.log("Ảnh ${i + 1} sai");
            } else {
              console.log("Ảnh ${i + 1} thành công");
            }
            queryClient.invalidateQueries({ queryKey: ["foodStatus"], exact: false });
            queryClient.invalidateQueries({ queryKey: ["foodWeekly"], exact: false });
          }
        } catch (err) {
          console.log(`Upload ảnh ${i + 1} thất bại:`, err);
          console.log("Ảnh ${i + 1} lỗi");
        }

        if (i < uris.length - 1) {
          await delay(300);
        }
      }
      router.push("/food");
    } catch (err) {
      console.error("Lỗi chung khi upload:", err);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <View className="flex-1 relative">
      <ScrollView
        className="flex-1 gap-2.5 pb-10 font-lato-regular pt-12" style={{ backgroundColor: theme.colors.background }}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <View className='flex flex-row items-center justify-between w-full'>
          <TouchableOpacity onPress={() => router.push("/food" as Href)} className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Hình ảnh")}</Text>
          <View className='size-14 rounded-full' style={{ backgroundColor: theme.mode === "dark" ? theme.colors.background : theme.colors.background }} />
        </View>
        <View className="flex gap-5 px-4">
          <View>
            <Text className="font-bold text-xl pt-5 pb-2" style={{ color: theme.colors.textPrimary }}>{t("Loại bữa ăn")}</Text>
            <View className="flex-row gap-3">
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => {
                  const isSelectedTag = selectedTag === item;
                  return (
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => setSelectedTag(item)}
                      className="px-4 py-2 rounded-full"
                      style={{
                        backgroundColor: isSelectedTag
                          ? "#19B1FF"
                          : theme.mode === "dark"
                            ? theme.colors.card
                            : "white",
                        marginRight: 0,
                      }}
                    >
                      <Text
                        className="text-lg"
                        style={{
                          color: isSelectedTag
                            ? "#fff"
                            : theme.mode === "dark"
                              ? theme.colors.textPrimary
                              : "black",
                        }}
                      >
                        {t(item)}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
          <View className="w-full h-64 rounded-md shadow-md flex items-center justify-center border-dashed border-2 border-black/20" style={{ backgroundColor: theme.colors.card }}>
            <View className="size-20 flex items-center justify-center bg-cyan-blue/20 rounded-full">
              <FontAwesome6 name="image" color={theme.colors.textPrimary} size={24} />
            </View>
            <Text className="text-xl text-center" style={{ color: theme.colors.textPrimary }}>{t("Chọn ảnh")}</Text>
          </View>

          <View className="flex flex-row items-center justify-center gap-5">
            <TouchableOpacity
              onPress={pickImage}
              className="self-center flex-row items-center justify-center gap-5 w-[40%] py-3 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}
            >
              <FontAwesome6 name="upload" color="#19B1FF" size={20} />
              <Text className="text-xl " style={{ color: theme.colors.textPrimary }}>{t("Thư viện")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePhoto}
              className="self-center flex-row items-center justify-center gap-5 w-[40%] py-3 rounded-md shadow-md" style={{ backgroundColor: theme.colors.card }}
            >
              <FontAwesome6 name="camera" color="#19B1FF" size={20} />
              <Text className="text-xl " style={{ color: theme.colors.textPrimary }}>{t("Chụp ảnh")}</Text>
            </TouchableOpacity>
          </View>
          <View className="py-2">
            {images.length > 0 && <Text style={{ color: theme.colors.textPrimary }}>{t("Ảnh đã chọn")} ({images.length})</Text>}
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
                    onPress={() => openModal("imageview", { uri: uri })}
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
      {images.length > 0 && (
        <View className="absolute bottom-10 left-0 right-0 p-4" style={{ backgroundColor: theme.colors.background }}>
          <TouchableOpacity
            onPress={() => {
              sendToBackend(images, selectedTag);
            }}
            className="self-center flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
          >
            <Text className="text-xl font-bold " style={{ color: theme.colors.textPrimary }}>{t("Tải ảnh lên")}</Text>
          </TouchableOpacity>
        </View>
      )}


      {isUploading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="rounded-lg p-6 flex items-center justify-center w-[90%] h-[300px]" style={{ backgroundColor: theme.colors.card }}>
            <ActivityIndicator size="large" color="#19B1FF" />
            <Text className="text-2xl font-bold mt-4 text-center" style={{ color: theme.colors.textPrimary }}>
              {t("AI đang phân tích...")}
            </Text>
            <Text className="text-lg mt-2 text-center" style={{ color: theme.colors.textPrimary }}>
              {t("Vui lòng chờ trong giây lát")}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Page;
