import CalendarSwiper from "@/components/CalendarSwiper";
import Card from "@/components/Card";
import ProgressItem from "@/components/ProgressItem";
import { Text, TouchableOpacity, View } from "react-native";
export default function HomeScreen() {
  return (
    <View className="flex flex-col gap-2.5 font-lato-regular px-4">
      <Text className="text-3xl font-bold text-center mt-14">HealthCare</Text>
      <CalendarSwiper />
      <Card title="Mục tiêu tuần" setting icon="ellipsis-vertical">
        <TouchableOpacity className="self-center flex-row items-center justify-center px-6 py-3 bg-cyan-blue rounded-full">
          <Text className="text-white">Đặt mục tiêu</Text>
        </TouchableOpacity>
      </Card>

      <Card title="Hoạt động hôm nay">
        <View className="flex flex-col gap-3">
          <ProgressItem color="#00FF55" index={0} unit="phút" icon="clock" />
          <ProgressItem
            color="#00D4FF"
            index={0}
            unit="bước"
            icon="person-running"
          />
          <ProgressItem color="#FFF200" index={0} unit="kcal" icon="bolt" />
        </View>
      </Card>
    </View>
  );
}
