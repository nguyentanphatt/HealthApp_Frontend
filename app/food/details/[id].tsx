import { meals, nutritionFields } from "@/constants/data";
import { images } from "@/constants/image";
import { useAppTheme } from "@/context/appThemeContext";
import { deleteFoodRecordById, getFoodById, updateFoodRecord } from "@/services/food";
import { useModalStore } from "@/stores/useModalStore";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const Page = () => {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { id, selectedDate } = useLocalSearchParams();
  const { openModal } = useModalStore();
  const queryClient = useQueryClient();
  const router = useRouter();
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

  useEffect(() => {
    if (foodDetail?.tag) {
      setSelectedMeal(foodDetail.tag);
    }
  }, [foodDetail?.tag]);

  const updateFoodRecordMutation = useMutation({
    mutationFn: async ({ id, hour, minute, tag }: { id: string; hour: number; minute: number; tag: string }) => {
      if (!foodDetail) throw new Error("Missing foodDetail");

      const date = foodDetail.loggedAt ? new Date(foodDetail.loggedAt) : new Date();
      date.setHours(hour, minute, 0, 0);

      const timestamp = date.getTime();

      return updateFoodRecord(id, timestamp.toString(), tag);
    },
    onSuccess: (res) => {
      if (res.success) {
        console.log("Cập nhật thành công");
        queryClient.invalidateQueries({ queryKey: ["foodStatus"] });
        queryClient.invalidateQueries({ queryKey: ["foodWeekly"] });
        refetchFoodDetail();
      }
    },
    onError: (err) => {
      console.log("Error updating food record:", err);
    },
  });

  const deleteFoodRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteFoodRecordById(id);
    },
    onSuccess: async (res, variables) => {
      if (res.success) {
        console.log("Xoá thành công");
        queryClient.invalidateQueries({ queryKey: ["foodStatus", { date: selectedDate }] });
        queryClient.invalidateQueries({ queryKey: ["foodWeekly", { date: selectedDate }] });
        router.push(`/food?selectedDate=${selectedDate}` as Href);
      }
    },
    onError: (err) => {
      console.log("Error deleting food record:", err);
    },
  });

  const loading = loadingFoodDetail;
  if (loading || !foodDetail) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
      </View>
    );
  }

  const isChanged =
    hour !== hourVN ||
    minute !== minuteVN ||
    selectedMeal !== (foodDetail?.tag || "Sáng");
  return (
    <View className="flex-1 relative pt-12" style={{ backgroundColor: theme.colors.background }}>

      <View className="flex px-4 py-5" style={{ backgroundColor: theme.colors.background }}>
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Thức ăn")}</Text>
          <TouchableOpacity onPress={() => openModal("delete", { confirmDelete: () => deleteFoodRecordMutation.mutate(id as string) })}>
            <FontAwesome6 name="trash" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {dropdown && (
        <Pressable
          onPress={() => setDropdown(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}
        />
      )}
      <ScrollView
        className="flex-1 gap-2.5 px-4 font-lato-regular" style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
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
            onPress={() => openModal("timepicker", { initialHour: hour, initialMinute: minute, handleConfirm: (h: number, m: number) => { setHour(h); setMinute(m); } })}
            className="rounded-full shadow-md flex-row items-center justify-between h-auto px-6 py-3 gap-5" style={{ backgroundColor: theme.colors.card }}
          >
            <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>
              {hour.toString().padStart(2, "0")} :{" "}
              {minute.toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>

          <View className="relative w-full">
            <View className="rounded-md shadow-md flex-row items-center justify-between w-full p-4 relative z-10" style={{ backgroundColor: theme.colors.card }}>
              <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>{t("Loại bữa ăn")}</Text>
              <TouchableOpacity onPress={() => setDropdown(!dropdown)}>
                <Text className="text-xl" style={{ color: theme.colors.textPrimary }}>
                  {t(selectedMeal)}
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
                    backgroundColor: theme.colors.card,
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
                        className={`text-xl ${selectedMeal === meal
                          ? "text-blue-500 font-semibold"
                          : theme.mode === "dark" ? "text-white" : "text-black"
                          }`}
                      >
                        {t(meal)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="rounded-md shadow-md flex items-center justify-center w-full h-auto p-4 gap-5" style={{ backgroundColor: theme.colors.card }}>
            <Text className="text-xl font-bold self-start" style={{ color: theme.colors.textPrimary }}>
              {t("Thông tin dinh dưỡng")}
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className=" text-lg" style={{ color: theme.colors.textPrimary }}>Calo</Text>
              <View className="border border-dashed flex-1 mx-2" style={{ borderColor: theme.colors.border }} />
              <Text className=" text-lg" style={{ color: theme.colors.textPrimary }}>
                {foodDetail?.calories}
                {"kcal"}
              </Text>
            </View>
            {nutritionFields.map((field) => (
              <View
                key={field.key}
                className="flex-row items-center justify-between"
              >
                <Text className=" text-lg" style={{ color: theme.colors.textPrimary }}>{t(field.label)}</Text>
                <View className="border border-dashed border-black flex-1 mx-2" style={{ borderColor: theme.colors.border }} />
                <Text className=" text-lg" style={{ color: theme.colors.textPrimary }}>
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
              className="self-center flex-row items-center justify-center w-[45%] py-3 rounded-md" style={{ backgroundColor: theme.colors.card }}
            >
              <Text className="text-xl font-bold " style={{ color: theme.colors.textPrimary }}>{t("Hủy")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                updateFoodRecordMutation.mutate({ id: id as string, hour, minute, tag: selectedMeal });
              }}
              className="self-center flex-row items-center justify-center bg-cyan-blue w-[45%] py-3 rounded-md"
            >
              <Text className="text-xl font-bold text-white">{t("Hoàn tất")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Page;
