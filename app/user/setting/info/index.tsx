import { images } from '@/constants/image';
import { useUnits } from '@/hooks/useUnits';
import i18n from '@/plugins/i18n';
import { updateUserInfo } from '@/services/user';
import { useModalStore } from '@/stores/useModalStore';
import { useUserStore } from '@/stores/useUserStore';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
const Page = () => {
    const { openModal } = useModalStore();
    const { units, displayHeight, displayWeight, inputToBaseHeight, inputToBaseWeight } = useUnits();
    const { t } = useTranslation();
    const user = useUserStore(state => state.user)
    const initialValues = {
        userName: user?.fullName || "",
        height: user?.height ? displayHeight(user.height).value.toString() : "",
        weight: user?.weight ? displayWeight(user.weight).value.toString() : "",
        gender: user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : "Giới tính",
        birthday: user?.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : "Sinh nh�t",
        profileImage: user?.imageUrl || "noImg",
    };

    const [userName, setUserName] = useState<string>(initialValues.userName);
    const [height, setHeight] = useState<string>(initialValues.height);
    const [weight, setWeight] = useState<string>(initialValues.weight);
    const defaultStyles = useDefaultStyles();
    const [selected, setSelected] = useState<DateType>();
    const [showDateModal, setShowDateModal] = useState<boolean>(false);
    const [birthday, setBirthday] = useState<string>(initialValues.birthday);
    const [gender, setGender] = useState<string>(initialValues.gender);
    const [genderValue, setGenderValue] = useState<string>(user?.gender || "");
    const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
    const [profileImage, setProfileImage] = useState<string | "noImg">(initialValues.profileImage);
    const genderOptions = [
        { label: "Nam", value: "male" },
        { label: "Nữ", value: "female" }
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsMultipleSelection: false,
        });
        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            quality: 1,
        });
        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleUpdateUserInfo = async (fullName: string, height: string, weight: string, gender: string, birthday: string, imageUrl: string) => {
        const formatDate = birthday.split("/");
        const filename = imageUrl.split("/").pop() || `photo.jpg`;
        const formattedDate = `${formatDate[2]}-${formatDate[1]}-${formatDate[0]}`;

        const heightInCm = inputToBaseHeight(Number(height));
        const weightInKg = inputToBaseWeight(Number(weight));

        try {
            const response = await updateUserInfo(fullName, formattedDate, genderValue, heightInCm, weightInKg, filename);
            if (response.success) {
                Toast.show({
                    type: "success",
                    text1: "Cập nhật thông tin thành công",
                });
                router.push('/(tabs)/profile');
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (user) {
            setUserName(user.fullName || "");
            setHeight(user.height ? displayHeight(user.height).value.toString() : "");
            setWeight(user.weight ? displayWeight(user.weight).value.toString() : "");
            setGender(user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Giới tính");
            setGenderValue(user.gender || "");
            setBirthday(user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : "Sinh nhật");
            setProfileImage(user.imageUrl || "noImg");
        }
    }, [user, units]);




    const isChanged =
        userName !== initialValues.userName ||
        height !== initialValues.height ||
        weight !== initialValues.weight ||
        gender !== initialValues.gender ||
        birthday !== initialValues.birthday ||
        profileImage !== initialValues.profileImage ||
        profileImage === "noImg";

    useEffect(() => {
        const backAction = () => {
            if (isChanged) {
                openModal("delete", {
                    title: t("Dữ liệu chưa được lưu, bạn có muốn thoát ?"),
                    options: [
                        { label: t("Thoát"), onPress: () => router.push('/(tabs)/profile') },
                        { label: t("Lưu"), onPress: () => handleUpdateUserInfo(userName, height, weight, gender, birthday, profileImage ?? "") },
                    ]
                });
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [isChanged]);

    return (
        <ScrollView
            className="flex-1 gap-2.5 px-4 py-16 font-lato-regular bg-[#f6f6f6]"
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="flex flex-row items-center justify-between px-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome6 name="chevron-left" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-center py-5">
                    {t("Cập nhật thông tin")}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <View className="flex gap-6">
                <TouchableOpacity onPress={() => openModal("action", { options: [
                    { label: t("Thư viện"), onPress: pickImage },
                    { label: t("Chụp ảnh"), onPress: takePhoto }
                ] })} className="relative w-[100px] h-[100px] bg-black/20 rounded-full self-center flex items-center justify-center">
                    {profileImage !== "noImg" ? (
                        <Image
                            source={{ uri: profileImage }}
                            className="w-full h-full rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Image
                            source={images.noImg}
                            className="w-full h-full rounded-full"
                            resizeMode="cover"
                        />
                    )}
                    <View className="absolute top-2 right-0 size-[24px] rounded-full bg-white flex items-center justify-center z-20">
                        <FontAwesome6 name="plus" color="black" size={20} />
                    </View>
                </TouchableOpacity>

                <View className="flex bg-white p-2 rounded-md shadow-md mb-1">
                    <Text className="text-xl">{t("Tên người dùng")}</Text>
                    <View className="border-b-2 border-black w-full h-[50px]">
                        <TextInput
                            className="text-2xl"
                            defaultValue={userName.toString()}
                            onChangeText={(text) => setUserName(text)}
                        />
                    </View>
                </View>

                <View className='flex bg-white p-4 rounded-md shadow-md mb-1 gap-4'>
                    <TouchableOpacity onPress={() => setShowGenderModal(true)}>
                        <View className='flex-row items-center justify-between py-4'>
                            <View className='flex-row items-center gap-4'>
                                <View className='w-[30px] flex items-center justify-center'>
                                    <FontAwesome6 name="user" color="#19B1FF" size={24} />
                                </View>
                                <Text className="text-xl">{gender}</Text>
                            </View>
                        </View>
                        <View className='w-full h-0.5 bg-black/40' />
                    </TouchableOpacity>

                    <View className='gap-3'>
                        <View className='flex-row gap-2'>
                            <View className='w-[30px] flex items-center justify-center'>
                                <FontAwesome6 name="ruler-vertical" color="#19B1FF" size={24} />
                            </View>
                            <TextInput
                                className="text-xl flex-1"
                                value={height}
                                keyboardType="numeric"
                                onChangeText={(text) => setHeight(text)}
                                placeholder={`${t("Chiều cao")} (${units.height})`}
                                placeholderTextColor="gray"
                            />
                            <Text className="text-xl text-gray-500 mt-2.5">{units.height}</Text>
                        </View>
                        <View className='w-full h-0.5 bg-black/40' />
                    </View>

                    <View className='gap-3'>
                        <View className='flex-row gap-2'>
                            <View className='w-[30px] flex items-center justify-center'>
                                <FontAwesome6 name="dumbbell" color="#19B1FF" size={20} />
                            </View>
                            <TextInput
                                className="text-xl flex-1"
                                value={weight}
                                keyboardType="numeric"
                                onChangeText={(text) => setWeight(text)}
                                placeholder={`${t("Cân nặng")} (${units.weight})`}
                                placeholderTextColor="gray"
                            />
                            <Text className="text-xl text-gray-500 mt-2.5">{units.weight}</Text>
                        </View>
                        <View className='w-full h-0.5 bg-black/40' />
                    </View>

                    <TouchableOpacity onPress={() => setShowDateModal(true)}>
                        <View className='flex-row items-center justify-between py-2'>
                            <View className='flex-row items-center gap-3'>
                                <View className='w-[30px] flex items-center justify-center'>
                                    <FontAwesome6 name="cake-candles" color="#19B1FF" size={24} />
                                </View>
                                <Text className="text-xl">{birthday}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {isChanged && (
                <View className="flex flex-row items-center justify-between py-5">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/profile')}
                        className="flex-row items-center justify-center w-[45%] bg-white py-3 rounded-md shadow-md"
                    >
                        <Text className="text-xl text-black font-bold ">Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            handleUpdateUserInfo(userName, height, weight, gender, birthday, profileImage ?? "");
                        }}
                        className="flex-row items-center justify-center w-[45%] bg-cyan-blue py-3 rounded-md shadow-md"
                    >
                        <Text className="text-xl text-white font-bold ">Lưu</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={showDateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDateModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-xl font-bold text-center mb-4">{t("Chọn ngày sinh")}</Text>
                        <DateTimePicker
                            mode="single"
                            date={selected}
                            onChange={({ date }) => setSelected(date)}
                            locale={i18n.language}
                            styles={{
                                ...defaultStyles,
                                button_next_image: { tintColor: '#000' },
                                button_prev_image: { tintColor: '#000' },
                                day_cell: { borderRadius: 20, width: 40, height: 40 },
                                day_label: { color: 'black' },
                                today: { borderColor: '#19B1FF', borderWidth: 1 },
                                today_label: { color: 'black' },
                                selected: { backgroundColor: '#19B1FF' },
                                selected_label: { color: 'white' },
                                month_label: { color: 'black' },
                                month: { borderWidth: 0 },
                                selected_month: { borderWidth: 1, borderColor: '#19B1FF' },
                                month_selector_label: { color: 'black' },
                                year_label: { color: 'black' },
                                year: { borderWidth: 0 },
                                year_selector_label: { color: 'black' },
                                header: { color: 'black' },
                            }}

                        />
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={() => setShowDateModal(false)}
                                className="flex-1 py-3 px-4 rounded-lg bg-gray-200"
                            >
                                <Text className="text-lg text-center text-gray-700">{t("Hủy")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (selected) {
                                        const date = new Date(selected.toString());
                                        const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                                        setBirthday(formattedDate);
                                    }
                                    setShowDateModal(false);
                                }}
                                className="flex-1 py-3 px-4 rounded-lg bg-blue-500"
                            >
                                <Text className="text-lg text-center text-white font-bold">{t("Xác nhận")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showGenderModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenderModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-xl font-bold text-center mb-4">Chọn giới tính</Text>
                        {genderOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    setGender(option.label);
                                    setGenderValue(option.value);
                                    setShowGenderModal(false);
                                }}
                                className={`py-4 px-4 rounded-lg mb-2 ${gender === option.label ? 'bg-blue-100' : 'bg-gray-50'
                                    }`}
                            >
                                <Text className={`text-lg text-center ${gender === option.label ? 'text-blue-600 font-bold' : 'text-gray-700'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            onPress={() => setShowGenderModal(false)}
                            className="py-3 px-4 rounded-lg bg-gray-200 mt-4"
                        >
                            <Text className="text-lg text-center text-gray-700">Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View className="flex-1 items-center justify-center bg-black/30">
                    <View className="flex items-center justify-center p-4 bg-white w-[90%] rounded-md">
                        <Text className="text-lg font-bold mb-4">
                            {t("Dữ liệu chưa được lưu, bạn có muốn thoát ?")}
                        </Text>

                        <View className="flex flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/profile')}
                                className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
                            >
                                <Text className="text-xl text-black font-bold ">{t("Thoát")}</Text>
                            </TouchableOpacity>
                            <Text>|</Text>
                            <TouchableOpacity
                                onPress={() =>
                                    handleUpdateUserInfo(userName, height, weight, gender, birthday, profileImage ?? "")

                                }
                                className="self-center flex-row items-center justify-center w-[70%] py-3 rounded-full"
                            >
                                <Text className="text-xl text-black font-bold ">{t("Lưu")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal> */}
        </ScrollView >
    )
}

export default Page