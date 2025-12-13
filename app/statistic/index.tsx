import FoodWeeklyCard from '@/components/FoodWeeklyCard';
import SleepWeeklyCard from '@/components/SleepWeeklyCard';
import WaterWeeklyCard from '@/components/WaterWeeklyCard';
import WorkoutWeeklyCard from '@/components/WorkoutWeeklyCard';
import { useAppTheme } from '@/context/appThemeContext';
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
    const { theme } = useAppTheme();
    const [weekAnchorMs, setWeekAnchorMs] = useState<number>(Date.now());
    const weekStart = dayjs(weekAnchorMs).startOf('isoWeek');
    const weekEnd = weekStart.add(7, 'day');
    const currentWeekStart = dayjs().startOf('isoWeek');
    const isAtCurrentWeek = weekStart.isSame(currentWeekStart, 'day');
    const displayRange = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM')} ${t("Năm")} ${weekEnd.format('YYYY')}`;
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

    return (
        <View className='flex-1 pt-12' style={{ backgroundColor: theme.colors.background }}>
            <View className='flex-col items-center gap-5 py-5' style={{ backgroundColor: theme.colors.background }}>
                <View className='flex flex-row items-center justify-between w-full'>
                    <TouchableOpacity onPress={() => router.push(`/(tabs)/profile` as Href)} className='size-14 rounded-full flex items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
                        <FontAwesome6 name="chevron-left" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center" style={{ color: theme.colors.textPrimary }}>{t("Báo cáo chi tiết")}</Text>
                    <View className='size-14 rounded-full' style={{ backgroundColor: theme.mode === "dark" ? theme.colors.card : theme.colors.background }} />
                </View>
                <View className='rounded-md p-4 w-full flex-row items-center justify-between' style={{ backgroundColor: theme.colors.card }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setWeekAnchorMs(weekStart.subtract(7, 'day').valueOf())} className='px-3 py-2 rounded-md' style={{ backgroundColor: theme.colors.secondaryCard }}>
                        <Text className='' style={{ color: theme.colors.textPrimary }}>{t("Trước")}</Text>
                    </TouchableOpacity>
                    <Text className='font-semibold text-xl' style={{ color: theme.colors.textPrimary }}>{displayRange}</Text>
                    {isAtCurrentWeek ? (
                        <View className='px-3 py-2 rounded-md opacity-0'>
                            <Text className='' style={{ color: theme.colors.textPrimary }}>{t("Sau")}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => setWeekAnchorMs(weekStart.add(7, 'day').valueOf())}
                            className='px-3 py-2 rounded-md' style={{ backgroundColor: theme.colors.secondaryCard }}>
                            <Text className='' style={{ color: theme.colors.textPrimary }}>{t("Sau")}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <ScrollView
                className="flex-1 gap-2.5 font-lato-regular"
                style={{ backgroundColor: theme.colors.background }}
                showsVerticalScrollIndicator={false}
            >
                <View className='flex gap-5 px-4 pb-12'>
                    {isLoadingFoodWeeklyData || !foodWeeklyData ? (
                        <LoadingBlock label={t("Đang tải dữ liệu dinh dưỡng") as string} />
                    ) : (
                        <FoodWeeklyCard data={foodWeeklyData} />
                    )}

                    {isLoadingSleepWeeklyData || !sleepWeeklyData ? (
                        <LoadingBlock label={t("Đang tải dữ liệu giấc ngủ") as string} />
                    ) : (
                        <SleepWeeklyCard data={sleepWeeklyData} />
                    )}

                    {isLoadingWorkoutWeeklyData || !workoutWeeklyData ? (
                        <LoadingBlock label={t("Đang tải dữ liệu vận động") as string} />
                    ) : (
                        <WorkoutWeeklyCard data={workoutWeeklyData} />
                    )}

                    {isLoadingWaterWeeklyData || !waterWeeklyData ? (
                        <LoadingBlock label={t("Đang tải dữ liệu nước uống") as string} />
                    ) : (
                        <WaterWeeklyCard data={waterWeeklyData} />
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

export default Statistic

function LoadingBlock({ label }: { label: string }) {
    return (
        <View className='rounded-md p-6 items-center justify-center' style={{ backgroundColor: '#00000010' }}>
            <ActivityIndicator size="small" color="#1D9BF0" />
            <Text className='mt-2'>{label}</Text>
        </View>
    );
}
