import { deleteFoodRecordById, getFoodById, updateFoodRecord } from "@/services/food";
import { FontAwesome6 } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import TimeWheelPicker from "@/components/TimeWheelPicker";
import { images } from "@/constants/image";
import Toast from "react-native-toast-message";
const Page = () => {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const {
    data: foodDetail,
    isLoading: loadingFoodDetail,
    refetch: refetchFoodDetail,
  } = useQuery({
    queryKey: ["foodDetail", id],
    queryFn: () => getFoodById(id as string),
    staleTime: 1000 * 60 * 5,
    select: (res) => res.data,
  });

  const isoString = foodDetail?.loggedAt;
  const date = isoString ? new Date(isoString) : null;
  const hourVN = date ? date.getHours() : 0;
  const minuteVN = date ? date.getMinutes() : 0;

  const [hour, setHour] = useState(hourVN);
  const [minute, setMinute] = useState(minuteVN);
  const [selectedMeal, setSelectedMeal] = useState(foodDetail?.tag || "Sáng");

  useEffect(() => {
    if (foodDetail?.loggedAt) {
      const date = new Date(foodDetail.loggedAt);
      setHour(date.getHours());
      setMinute(date.getMinutes());
    }
  }, [foodDetail]);

  const loading = loadingFoodDetail;
  if (loading || !foodDetail) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const nutritionFields = [
    { label: "Chất đạm", key: "protein" },
    { label: "Chất béo", key: "fat" },
    { label: "Chất xơ", key: "fiber" },
    { label: "Tinh bột", key: "starch" },
  ];

  const meals = ["Sáng", "Trưa", "Tối", "Phụ", "Khác"];

  const handleSave = async (id:string , hour: number, minute: number, tag:string) => {
    if (!foodDetail) return;
    const date = foodDetail.loggedAt
      ? new Date(foodDetail.loggedAt)
      : new Date();

    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const utcISOString = date.toISOString();
    const timestamp = new Date(utcISOString).getTime();
    console.log("timestamp", timestamp);
    
    console.log("UTC ISO String:", utcISOString);
    console.log("id", id);
    console.log("tag", tag);
    
    
    
    try {
      const res = await updateFoodRecord(id, timestamp.toString(), tag);
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Cập nhật thành công",
        });
        queryClient.invalidateQueries({ queryKey: ["foodStatus"] });
        queryClient.invalidateQueries({ queryKey: ["foodWeekly"] });
        refetchFoodDetail();
      }
    } catch (error) {
      console.log("Error updating food record:", error);
      
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteFoodRecordById(id);
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Xoá thành công",
        });
        queryClient.invalidateQueries({ queryKey: ["foodStatus"] });
        queryClient.invalidateQueries({ queryKey: ["foodWeekly"] });
        router.back();
      }
    } catch (error) {
      console.error("Error deleting food record:", error);
    }
  };

  const isChanged =
    hour !== hourVN ||
    minute !== minuteVN ||
    selectedMeal !== (foodDetail?.tag || "Sáng");

  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex bg-[#f6f6f6] pt-16 py-10">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center">Thức ăn</Text>
          <TouchableOpacity onPress={() => setConfirmVisible(true)}>
            <FontAwesome6 name="trash" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View className="flex-1 justify-end items-center bg-black/30">
          <View className="bg-white w-[80%] p-5 rounded-t-2xl shadow-lg">
            <Text className="text-xl text-center mb-10">
              Bạn có xác nhận muốn xóa ?
            </Text>
            <View className="flex-row items-center justify-between h-auto w-full">
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="rounded-lg w-[45%]"
              >
                <Text className="text-black text-center text-xl font-bold">
                  Không
                </Text>
              </TouchableOpacity>
              <View className="h-5 w-0.5 bg-black/20" />
              <TouchableOpacity
                onPress={() => handleDelete(id as string)}
                className=" rounded-lg w-[45%]"
              >
                <Text className="text-red-500 text-center text-xl font-bold">
                  Có
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View className="flex items-center justify-center gap-5 pt-10">
        <Image
          source={
            foodDetail?.imageUrl ? { uri: foodDetail.imageUrl } : images.food01
          }
          width={300}
          height={300}
          className="w-[350px] h-[300px] rounded-lg"
        />

        <TouchableOpacity
          onPress={() => setVisible(true)}
          className="bg-white rounded-full shadow-md flex-row items-center justify-between h-auto px-6 py-3 gap-5"
        >
          <Text className="text-xl">
            {hour.toString().padStart(2, "0")} :{" "}
            {minute.toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/30">
            <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
              <TimeWheelPicker
                initialHour={hour}
                initialMinute={minute}
                onChange={(h, m) => {
                  setHour(h);
                  setMinute(m);
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                }}
                className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
              >
                <Text className="text-xl text-black font-bold ">Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="relative w-full bg-gray-100">
          <View className="bg-white rounded-md shadow-md flex-row items-center justify-between w-full p-4 relative z-10">
            <Text className="text-xl">Loại bữa ăn</Text>
            <TouchableOpacity onPress={() => setDropdown(!dropdown)}>
              <Text className="text-xl">
                {"Bữa "}
                {selectedMeal}
              </Text>
            </TouchableOpacity>

            {dropdown && (
              <View
                style={{
                  position: "absolute",
                  top: 40,
                  right: 0,
                  width: "auto",
                  paddingHorizontal: 8,
                  backgroundColor: "white",
                  borderRadius: 8,
                  marginTop: 8,
                  zIndex: 999,
                  elevation: 10,
                }}
              >
                {meals.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    onPress={() => {
                      setSelectedMeal(meal);
                      setDropdown(false);
                    }}
                    className="p-2"
                  >
                    <Text
                      className={`text-xl ${
                        selectedMeal === meal
                          ? "text-blue-500 font-semibold"
                          : "text-black"
                      }`}
                    >
                      Bữa {meal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="bg-white rounded-md shadow-md flex items-center justify-center w-full h-auto p-4 gap-5">
          <Text className="text-xl font-bold self-start">
            Thông tin dinh dưỡng
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className=" text-lg">Calo</Text>
            <View className="border border-dashed border-black flex-1 mx-2" />
            <Text className=" text-lg">
              {foodDetail?.calories}
              {"kcal"}
            </Text>
          </View>
          {nutritionFields.map((field) => (
            <View
              key={field.key}
              className="flex-row items-center justify-between"
            >
              <Text className=" text-lg">{field.label}</Text>
              <View className="border border-dashed border-black flex-1 mx-2" />
              <Text className=" text-lg">
                {foodDetail?.[field.key as keyof typeof foodDetail]}
                {"g"}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {isChanged && (
        <View className="flex-row items-center justify-between py-5">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            className="self-center flex-row items-center bg-white justify-center w-[45%] py-3 rounded-md"
          >
            <Text className="text-xl text-black font-bold ">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleSave(id as string, hour, minute, selectedMeal);
            }}
            className="self-center flex-row items-center justify-center bg-cyan-blue w-[45%] py-3 rounded-md"
          >
            <Text className="text-xl text-white font-bold ">Hoàn tất</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default Page;
