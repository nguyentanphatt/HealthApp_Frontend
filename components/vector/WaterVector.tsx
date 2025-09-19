import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";

interface WaterVectorProps {
  progress?: number;
  animated?: boolean;
}

const WaterVector: React.FC<WaterVectorProps> = ({ 
  progress = 0, 
  animated = true 
}) => {
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const [waveOffset, setWaveOffset] = useState(0);
  // Animated water level and amplitude for subtle splash when progress changes
  const levelAnim = useRef(new Animated.Value(progress)).current;
  const [level, setLevel] = useState(progress);
  const amplitudeAnim = useRef(new Animated.Value(1)).current;
  const [amplitude, setAmplitude] = useState(1);

  useEffect(() => {
    if (!animated) return;
    waveAnimation.setValue(0);

    const loop = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 5500,
        easing: Easing.linear,
        useNativeDriver: false,
        isInteraction: false,

      }),
      { iterations: -1, resetBeforeIteration: true }
    );
    loop.start();

    const listener = waveAnimation.addListener(({ value }) => {
      setWaveOffset(value);
    });

    return () => {
      loop.stop();
      waveAnimation.removeListener(listener);
    };
  }, [animated]);

  // Animate level and add a small amplitude bump whenever progress changes
  useEffect(() => {
    const levelListener = levelAnim.addListener(({ value }) => setLevel(value));
    Animated.timing(levelAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // brief splash: increase amplitude then settle
    const ampListener = amplitudeAnim.addListener(({ value }) => setAmplitude(value));
    Animated.sequence([
      Animated.timing(amplitudeAnim, {
        toValue: 1.4,
        duration: 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(amplitudeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    return () => {
      levelAnim.removeListener(levelListener);
      amplitudeAnim.removeListener(ampListener);
    };
  }, [progress]);

  const waterLevel = 80 - (level / 100) * 75;

  const generateWavePath = (phaseOffset: number, waveIntensity: number = 1) => {
    const baseWaveHeight = 2 * amplitude;
    const frequency = 0.12;
    let path = `M 0 ${waterLevel}`;
    
    for (let x = 0; x <= 68; x += 0.8) {
      const dropPosition = x / 68; // 0 to 1
      const dropWidth = Math.sin(dropPosition * Math.PI);
      const waveHeight = baseWaveHeight * waveIntensity * dropWidth;
      
      //wave 1
      const wave1 = Math.sin((x * frequency) + (waveOffset * Math.PI * 2) + (phaseOffset * Math.PI)) * waveHeight;
      const wave2 = Math.sin((x * frequency * 1.5) + (waveOffset * Math.PI * 3) + (phaseOffset * Math.PI * 0.7)) * waveHeight * 0.3;
      
      const y = waterLevel + wave1 + wave2;
      path += ` L ${x} ${y}`;
    }
    
    path += ` L 68 80 L 0 80 Z`;
    return path;
  };

  const OUTLINE_PATH =
    "M34 80C24.7175 80 16.8137 76.8037 10.2887 70.4112C3.76292 64.0196 0.5 56.2379 0.5 47.0662C0.5 42.6888 1.39583 38.5 3.1875 34.5C4.97917 30.5 7.33333 26.9167 10.25 23.75L34 0.5L57.75 23.75C60.6667 26.9167 63.0208 30.5017 64.8125 34.505C66.6042 38.5083 67.5 42.7033 67.5 47.09C67.5 56.28 64.2371 64.0625 57.7113 70.4375C51.1862 76.8125 43.2825 80 34 80Z";
  const INNER_PATH =
    "M34 76.5C42.3333 76.5 49.4167 73.6667 55.25 68C61.0833 62.3333 64 55.3654 64 47.0962C64 43.1704 63.25 39.4325 61.75 35.8825C60.25 32.3325 58.0833 29.2213 55.25 26.5488L34 5.5L12.75 26.5488C9.91667 29.2213 7.75 32.3325 6.25 35.8825C4.75 39.4325 4 43.1704 4 47.0962C4 55.3654 6.91667 62.3333 12.75 68C18.5833 73.6667 25.6667 76.5 34 76.5Z";

  return (
    <Svg width={150} height={200} viewBox="0 0 68 80" fill="none">
      <Defs>
        <ClipPath id="waterClip">
          <Path d={INNER_PATH} />
        </ClipPath>
      </Defs>

      {progress > 0 && (
        <G clipPath="url(#waterClip)">
          <Path
            d={`M 0 ${waterLevel} L 68 ${waterLevel} L 68 80 L 0 80 Z`}
            fill="#E3F2FD"
            opacity={0.3}
          />
          <Path
            d={generateWavePath(0, 1)}
            fill="#4FC3F7"
            opacity={0.9}
          />
          <Path
            d={generateWavePath(0.3, 0.7)}
            fill="#29B6F6"
            opacity={0.7}
          />
          <Path
            d={generateWavePath(0.6, 0.5)}
            fill="#03A9F4"
            opacity={0.5}
          />
          <Path
            d={generateWavePath(0.9, 0.3)}
            fill="#81D4FA"
            opacity={0.3}
          />
        </G>
      )}

      <Path d={`${OUTLINE_PATH}${INNER_PATH}`} fill="black" stroke="black" strokeWidth="0.05" />
    </Svg>
  );
};

export default WaterVector;
