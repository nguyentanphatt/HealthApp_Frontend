import React, { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const InputWithIcon = ({icon, placeholder, value, onChangeText, ...props}: {
    icon?: string;
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
} & TextInputProps
) => {
    const [isFocused, setIsFocused] = useState(false);
  return (
    <View
      className={`flex-row items-center border-2 rounded-md p-2.5 ${
        isFocused ? "border-cyan-500" : "border-gray-300"
      }`}
    >
      {icon && <FontAwesome6 name={icon} size={20} color="black" />}
      <TextInput
        placeholder={placeholder}
        className="flex-1 px-2 py-2.5"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
};

export default InputWithIcon;
