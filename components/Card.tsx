import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ReactNode, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CardProps {
    title: string,
    subtitle?:string,
    setting?: boolean,
    children: ReactNode,
    icon?:string,
    settingsOptions?: { title: string, href: string }[]
}

const Card = ({title, subtitle, setting = false, icon, children, settingsOptions = []}: CardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <View
      className="bg-white rounded-md shadow-md flex justify-between gap-5 w-full px-4 py-4"
      onStartShouldSetResponder={() => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
        return false;
      }}
      onResponderMove={() => {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }}
    >
      <View className="flex flex-row items-center justify-between relative">
        <View className="flex">
          <Text className="font-bold text-xl">{title}</Text>
          {subtitle && <Text className="text-black/60">{subtitle}</Text>}
        </View>
        {setting && (
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMenuOpen((prev) => !prev)}
              className="p-1"
            >
              <FontAwesome6 name={icon} size={20} color="black" />
            </TouchableOpacity>
            {isMenuOpen && (
              <>
                {/* Backdrop inside card bounds to capture outside taps within the card */}
                <TouchableOpacity
                  className="absolute inset-0"
                  activeOpacity={1}
                  onPress={() => setIsMenuOpen(false)}
                />
                <View
                  className="absolute top-0 right-0 bg-white rounded-md shadow-xl z-50 w-40"
                  style={{ elevation: 5 }}
                >
                  {settingsOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.title + opt.href}
                      onPress={() => {
                        setIsMenuOpen(false);
                        if (opt.href) router.push(opt.href as any);
                      }}
                      className="px-3 py-3"
                      activeOpacity={0.7}
                    >
                      <Text className="text-xl text-black">{opt.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>
      {children}
    </View>
  );
}

export default Card