import QuestionFlow from '@/components/QuestionFlow';
import WorkoutVideo from '@/components/WorkoutVideo';
import { workQuestions } from '@/constants/data';
import { useAppTheme } from '@/context/appThemeContext';
import { workoutSurvey } from '@/services/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const Work = () => {
  const { theme } = useAppTheme();
  const [showQuestions, setShowQuestions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [finished, setFinished] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  useEffect(() => {
    (async () => {
      try {
        const existing = await AsyncStorage.getItem('workout_category');
        if (existing) {
          setFinished(true);

          return;
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);
  const handleQuestionComplete = async (answers: number[]) => {
    try {
      setAnalyzing(true);
      const payload = {
        questions: workQuestions.map((q, index) => ({
          id: String(q.id ?? index + 1),
          question: q.question,
          answer: q.answers.find(a => a.id === answers[index])?.answer ?? ''
        }))
      };
      console.log("payload", payload);


      const res = await workoutSurvey(payload);
      setAnalyzing(false);
      console.log("res", res);
      setFinished(true);
      if (res?.success || res?.category) {
        setShowQuestions(false);
        await queryClient.invalidateQueries({ queryKey: ['videos'] });
        await AsyncStorage.setItem('workout_category', 'true');

      } else {
        Alert.alert(t("Có lỗi"), t("Không nhận được kết quả. Vui lòng thử lại."));
      }
    } catch (error) {
      setAnalyzing(false);
      console.log("error", error);

      Alert.alert(t("Có lỗi"), t("Không thể phân tích khảo sát. Vui lòng thử lại."));
    }
  };
  

  if (initializing) {
    return (
      <View className='flex-1 items-center justify-center' style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.textPrimary} />
      </View>
    );
  }

  if (showQuestions) {
    return (
      <View className='flex-1'>
        <QuestionFlow onComplete={handleQuestionComplete} />
        {analyzing && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
            <View className="rounded-lg p-6 flex items-center justify-center w-[90%] h-[300px]" style={{ backgroundColor: theme.colors.card }}>
              <ActivityIndicator size="large" color={theme.colors.textPrimary} />
              <Text className="text-2xl font-bold mt-4 text-center" style={{ color: theme.colors.textPrimary }}>
                {t("AI đang phân tích...")}
              </Text>
              <Text className="text-lg text-gray-600 mt-2 text-center" style={{ color: theme.colors.textSecondary }}>
                {t("Vui lòng chờ trong giây lát")}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View className='flex-1' style={{ backgroundColor: theme.colors.background }}>
      {finished ? <WorkoutVideo /> :
        <View className='flex-1 justify-center items-center px-6'>
          <Text className='text-3xl font-bold text-center mb-4' style={{ color: theme.colors.textPrimary }}>
            {t("Khảo sát tập luyện")}
          </Text>
          <Text className='text-lg text-center py-4' style={{ color: theme.colors.textSecondary }}>
            {t("Hãy trả lời một vài câu hỏi để chúng tôi có thể tạo kế hoạch tập luyện phù hợp nhất với bạn")}
          </Text>
          <TouchableOpacity
            className='bg-cyan-blue px-8 py-4 rounded-full'
            onPress={() => setShowQuestions(true)}
          >
            <Text className='text-white text-lg font-semibold'>{t("Bắt đầu khảo sát")}</Text>
          </TouchableOpacity>
        </View>
      }
    </View>
  );
}

export default Work;