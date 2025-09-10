import CalendarSwiper from "@/components/CalendarSwiper";
import InfoCard from "@/components/InfoCard";
import WaterVector from "@/components/vector/WaterVector";
import { WaterStatus } from "@/constants/type";
import { getWaterStatus, saveWaterRecord } from "@/services/water";
import { FontAwesome6 } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const Page = () => {
  const router = useRouter()
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState(360);
  const [waterStatus, setWaterStatus] = useState<WaterStatus>();
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(Date.now())
  const currentDateIso = new Date(currentDate).toISOString().split("T")[0];
  const items = Array.from({ length: 100 }, (_, i) => {
    const amount = (i + 1) * 10;
    return { label: `${amount}`, amount };
  });

  const handleCloseModal = () => {
    setVisible(false)
  }

  const fetchWaterStatus = async () => {
    try {
      setLoading(true);
      const res = await getWaterStatus()
      if(!res.success){
        console.error("Lỗi....")
      }
      setWaterStatus(res.data)
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterStatus();
  }, []);

  const handleConfirm = async (amount: number, time:string) => {
    console.log("amount", amount);
    console.log("time", time);
    
    
    try {
      await saveWaterRecord(amount, time)
      fetchWaterStatus();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
 

  const filtered = waterStatus?.history
    .filter((record) => record.time.startsWith(currentDateIso))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  return (
    <View className="flex-1 gap-2.5 px-4 py-10 h-[300px] font-lato-regular">
      <View className="flex flex-row items-center justify-between pt-5">
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
          <FontAwesome6 name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold  self-center">Nước</Text>
        <View style={{ width: 24 }} />
      </View>
      <CalendarSwiper />
      <View className="flex-row">
        <View className="relative flex-1 items-center justify-center bg-white rounded-md shadow-md mr-1">
          <WaterVector />
          <Text className="absolute top-2 right-2 text-black text-lg">
            - {waterStatus?.dailyGoal}
          </Text>
        </View>
        <View className="flex-1 justify-between ml-1">
          <InfoCard
            title="Mục tiêu"
            content={waterStatus?.dailyGoal.toString() || "2000ml"}
          />
          <InfoCard
            title="Tiến độ"
            content={waterStatus?.currentIntake.toString() || "0ml"}
            subcontent={
              ` / ${waterStatus?.dailyGoal.toString()}` || " / 2000ml"
            }
          />
          <TouchableOpacity className="flex flex-row items-center justify-center gap-2.5 bg-white p-2 rounded-md shadow-md h-[70px]">
            <FontAwesome6 name="calendar" size={24} color="black" />
            <Text className="text-xl">Nhắc nhở tôi</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex items-center justify-center py-4">
        <TouchableOpacity
          className="self-center flex-row items-center justify-center w-[70%] py-3 bg-cyan-blue rounded-full"
          onPress={() => setVisible(true)}
        >
          <Text className="text-xl text-white">Thêm</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 items-center justify-center bg-black/30">
          <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
            <Text className="text-2xl font-bold mb-4">
              Lượng nước uống (ml)
            </Text>
            <WheelPickerExpo
              height={240}
              width={250}
              initialSelectedIndex={items.findIndex((i) => i.amount === 360)}
              items={items.map((item) => ({
                label: item.label,
                value: item.amount,
              }))}
              selectedStyle={{
                borderColor: "gray",
                borderWidth: 0.5,
              }}
              renderItem={({ label }) => {
                return (
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "500",
                    }}
                  >
                    {label}
                  </Text>
                );
              }}
              onChange={({ item }) => setAmount(item.value)}
            />

            <TouchableOpacity
              onPress={() => {
                handleConfirm(amount, currentDate.toString());
                handleCloseModal();
              }}
              className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
            >
              <Text className="text-xl text-black font-bold ">Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView className="max-h-[400px]">
        <View className="flex gap-2.5">
          {loading ? (
            <Text className="text-center">Đang tải...</Text>
          ) : (
            filtered?.map((rec, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push(
                    `/water/edit?amount=${rec.amount}&time=${rec.time}` as Href
                  )
                }
              >
                <InfoCard
                  title={formatTime(rec.time)}
                  content={`${rec.amount} ml`}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Page;
