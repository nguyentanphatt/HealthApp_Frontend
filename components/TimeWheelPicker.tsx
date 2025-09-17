import React, { useState } from "react";
import { Text, View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

type TimePickerProps = {
  initialHour?: number;
  initialMinute?: number;
  onChange: (hour: number, minute: number) => void;
};

const TimeWheelPicker = ({
  initialHour = 0,
  initialMinute = 0,
  onChange,
}: TimePickerProps) => {
  const times = 9;

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: i.toString().padStart(2, "0"),
    value: i,
  }));

  const repeatedHours = Array.from({ length: times }).flatMap(() => hours);
  const middleHoursIndex = Math.floor(times / 2) * hours.length;

  const repeatedMinutes = Array.from({ length: times }).flatMap(() => minutes);
  const middleMinutesIndex = Math.floor(times / 2) * minutes.length;

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  const handleHourChange = (val: number) => {
    setHour(val);
    onChange(val, minute);
  };

  const handleMinuteChange = (val: number) => {
    setMinute(val);
    onChange(hour, val);
  };

  return (
    <View className="flex-row items-center justify-center mb-4">
      <WheelPickerExpo
        height={240}
        width={150}
        initialSelectedIndex={middleHoursIndex + initialHour}
        items={repeatedHours}
        selectedStyle={{ borderColor: "gray", borderWidth: 0 }}
        renderItem={({ label }) => (
          <Text style={{ fontSize: 28, fontWeight: "500" }}>{label}</Text>
        )}
        onChange={({ item }) => handleHourChange(item.value)}
      />

      <Text style={{ fontSize: 32, fontWeight: "600", marginHorizontal: 8 }}>
        :
      </Text>

      <WheelPickerExpo
        height={240}
        width={150}
        initialSelectedIndex={middleMinutesIndex + initialMinute}
        items={repeatedMinutes}
        selectedStyle={{ borderColor: "gray", borderWidth: 0 }}
        renderItem={({ label }) => (
          <Text style={{ fontSize: 28, fontWeight: "500" }}>{label}</Text>
        )}
        onChange={({ item }) => handleMinuteChange(item.value)}
      />
    </View>
  );
};

export default TimeWheelPicker;
