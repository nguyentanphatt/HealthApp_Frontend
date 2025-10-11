import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

const FilterSelector = ({ label, options, selected, setSelected }: { label: string, options: { label: string, value: string }[], selected: { label: string, value: string }, setSelected: (option: { label: string, value: string }) => void }) => {
  const { t } = useTranslation();
  const [dropdown, setDropdown] = useState(false);
  return (
    <View className='relative w-[180px] flex-row gap-3 items-center justify-center bg-white rounded-md shadow-md p-2' style={{ zIndex: 1000 }}>
    <Text className="text-lg">{t(label)}: </Text>
    <TouchableOpacity onPress={() => setDropdown(!dropdown)}
      className='flex-1 flex-row items-center justify-center gap-2'
    >
      <Text className="text-lg text-center" numberOfLines={1}>
            {t(selected.label)}
      </Text>
    </TouchableOpacity>

    {dropdown && (
      <View
        className='absolute top-10 right-0 bg-white rounded-md shadow-md p-2 min-w-[180px]'
        style={{ zIndex: 1001 }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => {
              setSelected(option);
              setDropdown(false);
            }}
            className="p-2"
          >
            <Text
              className={`text-lg text-center ${selected.value === option.value
                ? "text-blue-500 font-semibold"
                : "text-black"
                }`}
            >
              {t(option.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>

  )
}

export default FilterSelector