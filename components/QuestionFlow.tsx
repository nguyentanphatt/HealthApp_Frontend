import { workQuestions } from '@/constants/data';
import { useAppTheme } from '@/context/appThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuestionFlowProps {
  onComplete: (answers: number[]) => void;
}

const QuestionFlow = ({ onComplete }: QuestionFlowProps) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  const currentQuestion = workQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === workQuestions.length - 1;

  const handleSelectAnswer = (answerId: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerId;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleComplete = () => {
    if (isLastQuestion) {
      onComplete(selectedAnswers);
    } else {
      nextQuestion();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex-row items-center justify-between p-4 pt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <FontAwesome6 name="chevron-left" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <Text className="text-2xl font-semibold" style={{ color: theme.colors.textPrimary }}>Khảo sát</Text>

        <View className="w-10" />
      </View>

      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>Câu {currentQuestionIndex + 1}/{workQuestions.length}</Text>
          <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>{Math.round(((currentQuestionIndex + 1) / workQuestions.length) * 100)}%</Text>
        </View>
        <View className="w-full bg-gray-100 rounded-full h-2">
          <View
            className="bg-cyan-blue h-2 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / workQuestions.length) * 100}%` }}
          />
        </View>
      </View>

      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-center mb-8" style={{ color: theme.colors.textPrimary }}>
          {currentQuestion.question}
        </Text>

        <View className="w-full gap-4">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === answer.id;

            return (
              <TouchableOpacity
                key={answer.id}
                className="w-full border-2 rounded-full p-4"
                activeOpacity={1}
                style={{
                  backgroundColor: isSelected
                    ? "#19B1FF"
                    : theme.mode === "dark"
                      ? theme.colors.card
                      : "#f3f4f6",
                  borderColor: isSelected
                    ? "#19B1FF"
                    : theme.mode === "dark"
                      ? theme.colors.border
                      : "#d1d5db",
                }}
                onPress={() => handleSelectAnswer(answer.id)}
              >
                <Text
                  className="text-lg text-center"
                  style={{
                    color: isSelected
                      ? "#fff"
                      : theme.mode === "dark"
                        ? theme.colors.textPrimary
                        : "#000",
                  }}
                >
                  {answer.answer}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-row justify-between items-center p-6">
        <TouchableOpacity
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 rounded-full"
          style={{
            backgroundColor:
              currentQuestionIndex === 0
                ? theme.mode === "dark"
                  ? theme.colors.card
                  : theme.colors.secondaryCard
                : theme.mode === "dark"
                  ? theme.colors.secondaryCard
                  : theme.colors.secondaryCard,
          }}
        >
          <Text
            className="text-lg"
            style={{
              color:
                currentQuestionIndex === 0
                  ? theme.mode === "dark"
                    ? theme.colors.textSecondary
                    : theme.colors.textSecondary
                  : theme.mode === "dark"
                    ? theme.colors.textPrimary
                    : theme.colors.textSecondary,
            }}
          >
            Trước
          </Text>
        </TouchableOpacity>

        {!isLastQuestion ? (
          <TouchableOpacity
            onPress={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: selectedAnswers[currentQuestionIndex] === undefined
                ? theme.mode === "dark"
                  ? theme.colors.card
                  : "#e5e7eb"
                : "#19B1FF"
            }}
          >
            <Text 
              className="text-lg"
              style={{
                color: selectedAnswers[currentQuestionIndex] === undefined
                  ? theme.mode === "dark"
                    ? theme.colors.textSecondary
                    : "#9ca3af"
                  : "#ffffff"
              }}
            >
              Tiếp
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleComplete}
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: "#19B1FF" }}
          >
            <Text className="text-lg" style={{ color: "#ffffff" }}>Hoàn thành</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default QuestionFlow;
