import { FontAwesome6 } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const LockScreen = ({ setIsLocked }: { setIsLocked: (isLocked: boolean) => void }) => {
    const TRACK_WIDTH = 280;
    const KNOB_SIZE = 56;
    const MAX_X = TRACK_WIDTH - KNOB_SIZE;
    const knobX = useRef(new Animated.Value(0)).current;
    const knobXValueRef = useRef(0);
    const trackFillWidth = knobX.interpolate({
        inputRange: [0, MAX_X],
        outputRange: [KNOB_SIZE / 2, TRACK_WIDTH - KNOB_SIZE / 2],
        extrapolate: 'clamp',
    });

    const resetKnob = () => {
        knobX.stopAnimation();
        Animated.timing(knobX, { toValue: 0, duration: 160, useNativeDriver: false }).start();
        knobXValueRef.current = 0;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gesture) => {
                const next = Math.max(0, Math.min(MAX_X, gesture.dx));
                knobX.setValue(next);
                knobXValueRef.current = next;
            },
            onPanResponderRelease: () => {
                if (knobXValueRef.current >= MAX_X * 0.8) {
                    Animated.timing(knobX, { toValue: MAX_X, duration: 120, useNativeDriver: false }).start(() => {
                        setIsLocked(false);
                        resetKnob();
                    });
                } else {
                    resetKnob();
                }
            },
        })
    ).current;
    return (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            <View style={StyleSheet.absoluteFill} pointerEvents='auto' />

            <View className='absolute inset-x-4 bottom-[10%] rounded-2xl flex-row items-center justify-between px-4 py-4'>
                <FontAwesome6 name="lock" size={22} color="black" />
                <View className='flex-1 items-center justify-center'>
                    <View style={{ width: TRACK_WIDTH, height: KNOB_SIZE, borderRadius: KNOB_SIZE, backgroundColor: '#c4c4c4', overflow: 'hidden', justifyContent: 'center' }}>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: trackFillWidth,
                                backgroundColor: 'white',
                            }}
                        />
                        <View className='absolute left-4 right-4 flex-row items-center justify-between'>
                            {Array.from({ length: 10 }).map((_, i) => (
                                <FontAwesome6 key={i} name="chevron-right" size={16} color="black" />
                            ))}
                        </View>
                        <Animated.View
                            {...panResponder.panHandlers}
                            style={{
                                position: 'absolute',
                                width: KNOB_SIZE,
                                height: KNOB_SIZE,
                                borderRadius: KNOB_SIZE / 2,
                                backgroundColor: 'white',
                                elevation: 3,
                                transform: [{ translateX: knobX }],
                            }}
                        >
                            <View className='flex-1 items-center justify-center'>
                                <FontAwesome6 name="chevron-right" size={20} color="black" />
                            </View>
                        </Animated.View>
                    </View>
                </View>
                <FontAwesome6 name="unlock" size={22} color="black" />
            </View>
        </View>
    )
}

export default LockScreen