import { WaterRecords } from "@/constants/type";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import InfoCard from "./InfoCard";

const WaterHistory = ({ filtered }: { filtered: WaterRecords[] }) => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const displayedData = showAll ? filtered : filtered.slice(0, 3);
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <View>
      {displayedData.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() =>
            router.push(
              `/water/edit?amount=${item.amount}&time=${item.time}&type=history` as Href
            )
          }
          className="mb-2.5"
        >
          <InfoCard
            title={formatTime(item.time)}
            content={`${item.amount} ml`}
          />
        </TouchableOpacity>
      ))}

      {filtered.length > 3 && (
        <TouchableOpacity onPress={() => setShowAll(!showAll)} className="py-5">
          <Text className="text-lg text-center text-black/60 font-semibold">
            {showAll ? "Ẩn bớt" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default WaterHistory;
