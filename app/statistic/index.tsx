import FoodWeeklyCard from '@/components/FoodWeeklyCard';
import SleepWeeklyCard from '@/components/SleepWeeklyCard';
import WaterWeeklyCard from '@/components/WaterWeeklyCard';
import WorkoutWeeklyCard from '@/components/WorkoutWeeklyCard';
import { foodWeekly, sleepWeekly, waterWeekly, workoutWeekly } from '@/services/statistics';
import { FontAwesome6 } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Statistic = () => {
    dayjs.extend(isoWeek);
    const { t } = useTranslation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [weekAnchorMs, setWeekAnchorMs] = useState<number>(Date.now());
    const weekStart = dayjs(weekAnchorMs).startOf('isoWeek');
    const weekEnd = weekStart.add(7, 'day');
    const currentWeekStart = dayjs().startOf('isoWeek');
    const isAtCurrentWeek = weekStart.isSame(currentWeekStart, 'day');
    const displayRange = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')} Năm ${weekEnd.format('YYYY')}`;

    const { data: foodWeeklyData, isLoading: isLoadingFoodWeeklyData } = useQuery({
        queryKey: ["foodWeeklyData", weekStart.valueOf()],
        queryFn: () => foodWeekly({ date: weekStart.valueOf() }),
        select: (res) => res.data,
        staleTime: 1000 * 60 * 5,
    });

    const { data: sleepWeeklyData, isLoading: isLoadingSleepWeeklyData } = useQuery({
        queryKey: ["sleepWeeklyData", weekStart.valueOf()],
        queryFn: () => sleepWeekly({ date: weekStart.valueOf() }),
        select: (res) => res.data,
        staleTime: 1000 * 60 * 5,
    });

    const { data: workoutWeeklyData, isLoading: isLoadingWorkoutWeeklyData } = useQuery({
        queryKey: ["workoutWeeklyData", weekStart.valueOf()],
        queryFn: () => workoutWeekly({ date: weekStart.valueOf() }),
        select: (res) => res.data,
        staleTime: 1000 * 60 * 5,
    });

    const { data: waterWeeklyData, isLoading: isLoadingWaterWeeklyData } = useQuery({
        queryKey: ["waterWeeklyData", weekStart.valueOf()],
        queryFn: () => waterWeekly({ date: weekStart.valueOf() }),
        select: (res) => res.data,
        staleTime: 1000 * 60 * 5,
    })

    useEffect(() => {
        const prevStart = weekStart.subtract(7, 'day').valueOf();
        const nextStart = weekStart.add(7, 'day').valueOf();
        queryClient.prefetchQuery({
            queryKey: ["foodWeeklyData", prevStart],
            queryFn: () => foodWeekly({ date: prevStart })
        });
        queryClient.prefetchQuery({
            queryKey: ["sleepWeeklyData", prevStart],
            queryFn: () => sleepWeekly({ date: prevStart })
        });
        queryClient.prefetchQuery({
            queryKey: ["workoutWeeklyData", prevStart],
            queryFn: () => workoutWeekly({ date: prevStart })
        });
        queryClient.prefetchQuery({
            queryKey: ["waterWeeklyData", prevStart],
            queryFn: () => waterWeekly({ date: prevStart })
        });
        if (!isAtCurrentWeek) {
            queryClient.prefetchQuery({
                queryKey: ["foodWeeklyData", nextStart],
                queryFn: () => foodWeekly({ date: nextStart })
            });
            queryClient.prefetchQuery({
                queryKey: ["sleepWeeklyData", nextStart],
                queryFn: () => sleepWeekly({ date: nextStart })
            });
            queryClient.prefetchQuery({
                queryKey: ["workoutWeeklyData", nextStart],
                queryFn: () => workoutWeekly({ date: nextStart })
            });
            queryClient.prefetchQuery({
                queryKey: ["waterWeeklyData", nextStart],
                queryFn: () => waterWeekly({ date: nextStart })
            });
        }
    }, [weekStart, queryClient, isAtCurrentWeek]);

    if (isLoadingFoodWeeklyData || isLoadingSleepWeeklyData || isLoadingWorkoutWeeklyData || isLoadingWaterWeeklyData || !foodWeeklyData || !sleepWeeklyData || !workoutWeeklyData || !waterWeeklyData) {
        return (
            <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color="#1D9BF0" />
            </View>
        )
    }
    return (
        <ScrollView
            className="flex-1 gap-2.5 font-lato-regular bg-[#f6f6f6]"
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
            <View className='flex-col items-center gap-5 bg-[#f6f6f6] py-10'>
                <View className='flex flex-row items-center justify-between w-full'>
                    <TouchableOpacity onPress={() => router.push(`/(tabs)/profile` as Href)} className='size-14 bg-[#f6f6f6] rounded-full flex items-center justify-center'>
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center">{t("Báo cáo chi tiết")}</Text>
                    <View className='size-14 bg-[#f6f6f6] rounded-full' />
                </View>
                <View className='bg-white rounded-md p-4 w-full flex-row items-center justify-between'>
                    <TouchableOpacity onPress={() => setWeekAnchorMs(weekStart.subtract(7, 'day').valueOf())} className='px-3 py-2 rounded-md bg-gray-100'>
                        <Text className='text-black'>{t("Trước")}</Text>
                    </TouchableOpacity>
                    <Text className='text-black font-semibold text-xl'>{displayRange}</Text>
                    {isAtCurrentWeek ? (
                        <View className='px-3 py-2 rounded-md opacity-0'>
                            <Text className='text-black'>{t("Sau")}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setWeekAnchorMs(weekStart.add(7, 'day').valueOf())}
                            className='px-3 py-2 rounded-md bg-gray-100'
                        >
                            <Text className='text-black'>{t("Sau")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>


            <View className='flex gap-5 px-4'>
                <FoodWeeklyCard data={foodWeeklyData} />
                <SleepWeeklyCard data={sleepWeeklyData} />
                <WorkoutWeeklyCard data={workoutWeeklyData} />
                <WaterWeeklyCard data={waterWeeklyData} />
            </View>
        </ScrollView>
    )
}

export default Statistic