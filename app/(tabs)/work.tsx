import QuestionFlow from '@/components/QuestionFlow';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const Work = () => {
  const [showQuestions, setShowQuestions] = useState(false);

  const handleQuestionComplete = (answers: number[]) => {
    console.log('Answers:', answers);
    Alert.alert(
      'Hoàn thành!',
      'Cảm ơn bạn đã hoàn thành khảo sát. Chúng tôi sẽ tạo kế hoạch tập luyện phù hợp với bạn.',
      [
        {
          text: 'OK',
          onPress: () => setShowQuestions(false)
        }
      ]
    );
  };

  if (showQuestions) {
    return <QuestionFlow onComplete={handleQuestionComplete} />;
  }

  return (
    <View className='flex-1 bg-white'>
      <View className='flex-1 justify-center items-center px-6'>
        <Text className='text-3xl font-bold text-center mb-4 text-gray-800'>
          Khảo sát tập luyện
        </Text>
        <Text className='text-lg text-center text-gray-600 mb-8'>
          Hãy trả lời một vài câu hỏi để chúng tôi có thể tạo kế hoạch tập luyện phù hợp nhất với bạn
        </Text>
        <TouchableOpacity 
          className='bg-cyan-blue px-8 py-4 rounded-full'
          onPress={() => setShowQuestions(true)}
        >
          <Text className='text-white text-lg font-semibold'>Bắt đầu khảo sát</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Work;