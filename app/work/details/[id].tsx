import { getWorkoutVideoById } from '@/services/workout';
import { FontAwesome6 } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import YoutubePlayer from "react-native-youtube-iframe";

const Page = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTime, setActiveTime] = useState(0);
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [kcal, setKcal] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { data: video, isLoading } = useQuery({
        queryKey: ['workoutVideo', id],
        queryFn: () => getWorkoutVideoById(id as string),
    });

    useEffect(() => {
        if (isWorkoutActive) {
            intervalRef.current = setInterval(() => {
                setActiveTime(prev => {
                    const newTime = prev + 1;
                    if (newTime % 10 === 0) {
                        setKcal((newTime / 10) * 0.8);
                    }
                    return newTime;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isWorkoutActive]);

    const formatTimeFromSeconds = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartWorkout = () => {
        setIsWorkoutActive(true);
        setActiveTime(0);
        setKcal(0);
    };

    const handleStopWorkout = () => {
        setIsWorkoutActive(false);
    };

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color="#19B1FF" />
            </View>
        );
    }

    if (!video?.video?.videoId) {
        return (
            <View className='flex-1 items-center justify-center'>
                <Text>{t("Không tìm thấy video")}</Text>
            </View>
        );
    }

    return (
        <View className='flex-1 relative bg-[#f6f6f6] pt-12 px-4'>
            <View className="flex flex-row items-center justify-between pb-8">
                <TouchableOpacity onPress={() => (router.push('/(tabs)/work' as Href))} className="w-[30px]">
                    <FontAwesome6 name="chevron-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-center py-5">
                    {t("Chi tiết bài tập")}
                </Text>
                <View className="w-[30px] rounded-full bg-[#f6f6f6]" />
            </View>
            <View className='bg-black rounded-lg overflow-hidden' style={{ aspectRatio: 16 / 9 }}>
                <YoutubePlayer
                    height={250}
                    play={false}
                    videoId={video.video.videoId}
                />
            </View>

            {!isWorkoutActive && (
                <View className='p-4 bg-white rounded-md shadow-md my-4'>
                    <Text className='text-xl font-bold mb-4'>{video?.video?.title}</Text>
                    <Text className='text-sm text-gray-600 mb-4'>{video?.video?.description}</Text>
                    <Text className='text-sm text-gray-600 mb-4'>by {video?.video?.channelTitle}</Text>
                </View>
            )}

            <View className={`absolute bottom-32 left-0 right-0 items-center justify-start gap-5 ${isWorkoutActive ? 'bottom-64' : 'bottom-32'}`}>
                <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                    <Text className='text-lg text-black/60'>Thời gian</Text>
                    <Text className='text-xl text-black font-bold'>{formatTimeFromSeconds(activeTime)}</Text>
                </View>
                <View className='flex items-center justify-center bg-white rounded-md shadow-md p-2 w-[45%]'>
                    <Text className='text-lg text-black/60'>Kcal</Text>
                    <Text className='text-xl text-black font-bold'>{kcal} kcal</Text>
                </View>

                <TouchableOpacity
                    className={`self-center flex-row items-center justify-center w-[70%] py-3 rounded-full ${isWorkoutActive ? 'bg-red-500' : 'bg-cyan-blue'
                        }`}
                    onPress={isWorkoutActive ? handleStopWorkout : handleStartWorkout}
                >
                    <Text className="text-xl text-white">
                        {isWorkoutActive ? t("Dừng luyện tập") : t("Bắt đầu luyện tập")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Page