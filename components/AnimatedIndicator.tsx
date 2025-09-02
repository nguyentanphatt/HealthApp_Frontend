import { useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export const AnimatedIndicator = ({ active }: { active: boolean }) => {
  const width = useSharedValue(active ? 16 : 8);
  const bgColor = active ? "#19B1FF" : "rgba(0,0,0,0.6)";

  useEffect(() => {
    width.value = withTiming(active ? 16 : 8, { duration: 200 });
  }, [active, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: 8,
    borderRadius: 999,
    backgroundColor: bgColor,
    marginHorizontal: 4,
  }));

  return <Animated.View style={animatedStyle} />;
};
