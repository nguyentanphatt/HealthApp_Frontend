import React, { useState } from "react";
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const InputWithIcon = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  ...props
}: {
  icon?: string;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean
  error?:string;
} & TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = !!secureTextEntry
  const borderColor = error
    ? "border-red-500"
    : isFocused
      ? "border-cyan-500"
      : "border-gray-300";
  return (
    <View className="w-full relative">
      <View
        className={`flex-row items-center border-2 rounded-md p-2.5 ${borderColor}`}
      >
        {icon && <FontAwesome6 name={icon} size={20} color="black" />}
        <TextInput
          placeholder={placeholder}
          className="flex-1 px-2 py-2.5"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <FontAwesome6
              name={showPassword ? "eye" : "eye-slash"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>
      <View className="absolute left-0 top-full">
        {error ? (
          <Text className="text-red-500 text-sm mt-1">{error}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default InputWithIcon;
