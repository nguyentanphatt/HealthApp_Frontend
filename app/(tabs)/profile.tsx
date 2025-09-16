import ScheduleItem from "@/components/ScheduleItem";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";


const Profile = () => {
  return (
    <ScrollView
      className="flex-1 gap-2.5 px-4 py-16 font-lato-regular bg-[#f6f6f6]"
      stickyHeaderIndices={[0]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex flex-row items-center justify-between px-4">
        <View style={{ width: 24 }} />

        <Text className="text-3xl font-bold text-center py-5">
          Thông tin của bạn
        </Text>
        <TouchableOpacity onPress={() => ({})}>
          <FontAwesome6 name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex gap-6">
        <View className="w-[100px] h-[100px] bg-black/20 rounded-full self-center flex items-center justify-center">
          <FontAwesome6 name="user" color="black" size={24} />
        </View>

        <View className="flex items-center justify-center w-full p-4 bg-white rounded-md shadow-md">
          <Text className="text-xl">User124</Text>
        </View>

        <View className="bg-white rounded-md shadow-md p-4 flex gap-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-xl">Báo cáo hàng tuần</Text>
              <Text className="text-black/60">08/08 - 10/08 tháng 8</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={24} color="black" />
          </View>

          <View className="flex-row items-center justify-between h-auto">
            <View className="flex gap-2.5 max-w-[40%]">
              <ScheduleItem
                title="Tổng thời gian tập luyện"
                current="00:20:20"
                old="00:10:00"
                icon="chevron-up"
                iconColor="green"
              />
              <ScheduleItem
                title="Tổng thời gian ngủ trung bình"
                current="7h45m"
                old="5h50m"
                icon="chevron-up"
                iconColor="green"
              />
            </View>
            <View className="h-full w-1 bg-black/20" />
            <View className="flex gap-2.5 max-w-[40%]">
              <ScheduleItem
                title="Tổng số bước chân trung bình"
                current="2000"
                old="3000"
                icon="chevron-down"
                iconColor="red"
              />
              <ScheduleItem
                title="Lượng nuớc uống trung bình"
                current="2200ml"
                old="2200ml"
                icon="chevron-right"
                iconColor="orange"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
