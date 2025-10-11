import React, { useEffect, useState } from "react";
import { GestureResponderEvent, PanResponder, PanResponderGestureState, Text, View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const RADIUS = 130;
const STROKE_WIDTH = 30;

type CircularTimePickerProps = {
  initialStartAngle?: number;
  initialEndAngle?: number;
  onChange?: (payload: {
    startAngle: number;
    endAngle: number;
    startTime: string;
    endTime: string;
  }) => void;
  onStartChange?: (angle: number, time: string) => void;
  onEndChange?: (angle: number, time: string) => void;
};

export default function CircularTimePicker({
  initialStartAngle = 0,
  initialEndAngle = 180,
  onChange,
  onStartChange,
  onEndChange,
}: CircularTimePickerProps) {
  const [startAngle, setStartAngle] = useState(initialStartAngle);
  const [endAngle, setEndAngle] = useState(initialEndAngle); 
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(null);

  // Tính giờ từ góc theo format 24h (0° = 0h, 90° = 6h, 180° = 12h, 270° = 18h)
  const getTimeFromAngle = (deg: number) => {
    const totalHours = (deg / 360) * 24;
    let hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours % 1) * 60);
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      // Chỉ bắt đầu khi touch gần các handle
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = RADIUS + STROKE_WIDTH;
      const centerY = RADIUS + STROKE_WIDTH;
      
      const startPos = polarToCartesian(centerX, centerY, RADIUS, startAngle);
      const endPos = polarToCartesian(centerX, centerY, RADIUS, endAngle);
      
      const distStart = Math.hypot(locationX - startPos.x, locationY - startPos.y);
      const distEnd = Math.hypot(locationX - endPos.x, locationY - endPos.y);
      
      return distStart <= 30 || distEnd <= 30; // 30px touch area
    },
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = RADIUS + STROKE_WIDTH;
      const centerY = RADIUS + STROKE_WIDTH;
      
      const startPos = polarToCartesian(centerX, centerY, RADIUS, startAngle);
      const endPos = polarToCartesian(centerX, centerY, RADIUS, endAngle);
      
      const distStart = Math.hypot(locationX - startPos.x, locationY - startPos.y);
      const distEnd = Math.hypot(locationX - endPos.x, locationY - endPos.y);
      
      if (distStart <= distEnd) {
        setActiveHandle("start");
      } else {
        setActiveHandle("end");
      }
    },
    onPanResponderMove: (evt: GestureResponderEvent, gesture: PanResponderGestureState) => {
      if (!activeHandle) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = RADIUS + STROKE_WIDTH;
      const centerY = RADIUS + STROKE_WIDTH;
      
      const dx = locationX - centerX;
      const dy = locationY - centerY;
      
      // Tính góc từ tọa độ touch
      let newAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      
      // Bù trừ để khớp với polarToCartesian và rotation -90
      newAngle = newAngle + 90;
      
      // Chuyển từ -180..180 sang 0..360
      if (newAngle < 0) newAngle += 360;
      if (newAngle >= 360) newAngle -= 360;
      
      if (activeHandle === "start") {
        setStartAngle(newAngle);
      } else {
        setEndAngle(newAngle);
      }
    },
    onPanResponderRelease: () => {
      setActiveHandle(null);
      // Emit only when user stops dragging
      onStartChange?.(startAngle, startTime);
      onEndChange?.(endAngle, endTime);
      onChange?.({ startAngle, endAngle, startTime, endTime });
    },
    onPanResponderTerminate: () => {
      setActiveHandle(null);
      onStartChange?.(startAngle, startTime);
      onEndChange?.(endAngle, endTime);
      onChange?.({ startAngle, endAngle, startTime, endTime });
    },
  });

  const startTime = getTimeFromAngle(startAngle);
  const endTime = getTimeFromAngle(endAngle);

  // Emit initial values so parent gets defaults without interaction
  useEffect(() => {
    onStartChange?.(startAngle, startTime);
    onEndChange?.(endAngle, endTime);
    onChange?.({ startAngle, endAngle, startTime, endTime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 300,
      }}
      {...panResponder.panHandlers}
    >
      <Svg
        width={(RADIUS + STROKE_WIDTH) * 2}
        height={(RADIUS + STROKE_WIDTH) * 2}
        fill={"#f6f6f6"}
      >
        <G
          rotation=""
          originX={RADIUS + STROKE_WIDTH}
          originY={RADIUS + STROKE_WIDTH}
        >
          {/* Vòng ban đêm */}
          <Circle
            cx={RADIUS + STROKE_WIDTH}
            cy={RADIUS + STROKE_WIDTH}
            r={RADIUS}
            stroke="#00000066"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Vòng ban ngày - follow theo góc từ start đến end */}
          <Path
            d={describeArc(
              RADIUS + STROKE_WIDTH,
              RADIUS + STROKE_WIDTH,
              RADIUS,
              startAngle,
              endAngle
            )}
            stroke="#19B1FF"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Handle bắt đầu với icon 🌙 */}
          <Circle
            cx={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                startAngle
              ).x
            }
            cy={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                startAngle
              ).y
            }
            r={14}
            fill={activeHandle === "start" ? "#155dfc" : "#19B1FF"}
            stroke="white"
            strokeWidth={1}
          />
          <SvgText
            x={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                startAngle
              ).x
            }
            y={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                startAngle
              ).y
            }
            fontSize="10"
            fill="white"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            🌙
          </SvgText>

          {/* Handle kết thúc với icon ☀️ */}
          <Circle
            cx={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                endAngle
              ).x
            }
            cy={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                endAngle
              ).y
            }
            r={14}
            fill={activeHandle === "end" ? "#155dfc" : "#19B1FF"}
            stroke="white"
            strokeWidth={1}
          />
          <SvgText
            x={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                endAngle
              ).x
            }
            y={
              polarToCartesian(
                RADIUS + STROKE_WIDTH,
                RADIUS + STROKE_WIDTH,
                RADIUS,
                endAngle
              ).y
            }
            fontSize="10"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ☀️
          </SvgText>
        </G>

        {/* Các text 0, 6, 12, 18 - bên trong vòng tròn */}
        <G>
          {[
            { angle: 0, text: "0" },
            { angle: 90, text: "6" },
            { angle: 180, text: "12" },
            { angle: 270, text: "18" },
          ].map((marker, index) => {
            const pos = polarToCartesian(
              RADIUS + STROKE_WIDTH,
              RADIUS + STROKE_WIDTH,
              RADIUS - 30,
              marker.angle
            );
            return (
              <SvgText
                key={index}
                x={pos.x}
                y={pos.y}
                fontSize="16"
                fill="black"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {marker.text}
              </SvgText>
            );
          })}
        </G>
      </Svg>

      <View style={{ position: "absolute", alignItems: "center" }}>
        <View className="flex-row items-center gap-5">
          <Text className="text-xl">🌙</Text>
          <Text className="text-black text-3xl font-bold font-lato-regular w-[80px]">
            {startTime}
          </Text>
        </View>
        <View className="flex-row items-center gap-5">
          <Text className="text-xl">☀️</Text>
          <Text className="text-black text-3xl font-bold font-lato-regular w-[80px]">
            {endTime}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Hàm vẽ cung tròn
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);

  // Tính delta angle, xử lý trường hợp qua midnight
  let delta = endAngle - startAngle;
  if (delta < 0) delta += 360;
  
  const largeArcFlag = delta <= 180 ? "0" : "1";

  const d = ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(" ");

  return d;
}
