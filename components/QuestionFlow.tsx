import { workQuestions } from '@/constants/data';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface QuestionFlowProps {
  onComplete: (answers: number[]) => void;
}

const QuestionFlow = ({ onComplete }: QuestionFlowProps) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [slideAnim] = useState(new Animated.Value(0));

  const currentQuestion = workQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === workQuestions.length - 1;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  const handleSelectAnswer = (answerId: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerId;
    setSelectedAnswers(newAnswers);

    setTimeout(() => {
      if (isLastQuestion) {
        onComplete(newAnswers);
      } else {
        nextQuestion();
      }
    }, 500);
  };

  const nextQuestion = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentQuestionIndex(prev => prev + 1);
    });
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex(prev => prev - 1);
      });
    }
  };

  const slideStyle = {
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
    opacity: slideAnim,
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 pt-12">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <FontAwesome6 name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        
        <Text className="text-2xl font-semibold">Khảo sát</Text>
        
        <View className="w-10" />
      </View>

      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Câu {currentQuestionIndex + 1}/{workQuestions.length}</Text>
          <Text className="text-sm text-gray-600">{Math.round(((currentQuestionIndex + 1) / workQuestions.length) * 100)}%</Text>
        </View>
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View 
            className="bg-cyan-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / workQuestions.length) * 100}%` }}
          />
        </View>
      </View>

      <Animated.View style={[slideStyle, { flex: 1 }]}>
        <View className="justify-center items-center px-6">
          <Text className="text-2xl font-bold text-center mb-8 text-gray-800">
            {currentQuestion.question}
          </Text>

          <View className="w-full gap-4">
            {currentQuestion.answers.map((answer) => (
              <TouchableOpacity
                key={answer.id}
                className={`w-full border-2 rounded-full p-4 ${
                  selectedAnswers[currentQuestionIndex] === answer.id
                    ? 'bg-cyan-blue border-cyan-blue'
                    : 'bg-gray-100 border-gray-300'
                }`}
                onPress={() => handleSelectAnswer(answer.id)}
              >
                <Text
                  className={`text-lg text-center ${
                    selectedAnswers[currentQuestionIndex] === answer.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {answer.answer}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      <View className="flex-row justify-between items-center p-6">
        <TouchableOpacity
          onPress={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-full ${
            currentQuestionIndex === 0
              ? 'bg-gray-200'
              : 'bg-gray-100'
          }`}
        >
          <Text className={`text-lg ${
            currentQuestionIndex === 0
              ? 'text-gray-400'
              : 'text-gray-700'
          }`}>
            Trước
          </Text>
        </TouchableOpacity>

        {!isLastQuestion && (
          <TouchableOpacity
            onPress={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className={`px-6 py-3 rounded-full ${
              selectedAnswers[currentQuestionIndex] === undefined
                ? 'bg-gray-200'
                : 'bg-cyan-blue'
            }`}
          >
            <Text className={`text-lg ${
              selectedAnswers[currentQuestionIndex] === undefined
                ? 'text-gray-400'
                : 'text-white'
            }`}>
              Tiếp
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default QuestionFlow;
