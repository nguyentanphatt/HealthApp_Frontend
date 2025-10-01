import ActionModal from '@/components/ActionModal'
import { FontAwesome6 } from '@expo/vector-icons'
import * as ImagePicker from "expo-image-picker"
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
const index = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const [selectedTag, setSelectedTag] = useState({ label: "Khác", value: "other" });
    const [images, setImages] = useState<string[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: 3 - images.length,
        });
        if (!result.canceled) {
            const newUris = result.assets.map((asset) => asset.uri);
            setImages((prev) => [...prev, ...newUris].slice(0, 3));
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            quality: 1,
        });
        if (!result.canceled) {
            setImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
        }
    };
    const options = [
        {
            id: 2,
            label: "Nước",
            value: "water",
        },
        {
            id: 3,
            label: "Thức ăn",
            value: "food",
        },

        {
            id: 4,
            label: "Vận động",
            value: "fitness",
        },

        {
            id: 5,
            label: "Giấc ngủ",
            value: "sleep",
        },

        {
            id: 6,
            label: "Khác",
            value: "other",
        },
    ]
    return (
        <View className='flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]'>
            <View className="flex bg-[#f6f6f6] pt-16 py-10">
                <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold  self-center">{t("Thêm tin tức")}</Text>
                    <TouchableOpacity>
                        <Text className="text-2xl font-bold text-cyan-blue self-center">{t("Lưu")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className='flex gap-2.5'>
                <View>
                    <Text className='text-lg font-bold'>
                        {t("Tiêu đề")}
                    </Text>
                    <TextInput
                        placeholder={t("Tiêu đề")}
                        className="text-lg font-bold border-2 rounded-md border-black/20 p-2 mt-4"
                    />
                </View>

                <View>
                    <Text className="font-bold text-xl">{t("Loại")}</Text>
                    <View className="flex-row gap-3 mt-4">
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                            renderItem={({ item }) => {
                                const isSelectedTag = selectedTag === item;
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedTag(item)}
                                        className={`px-4 py-2 rounded-full ${isSelectedTag ? "bg-cyan-blue" : "bg-white"}`}
                                        style={{ marginRight: 0 }}
                                    >
                                        <Text
                                            className={`text-lg ${isSelectedTag ? "text-white" : "text-black"}`}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>

                </View>


                <View>
                    <Text className="font-bold text-xl">{t("Nội dung")}</Text>
                    <TextInput
                        placeholder={t("Nội dung")}
                        className="text-lg border-2 rounded-md border-black/20 p-2 h-[100px] mt-4"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>
                <View>
                    <Text className="font-bold text-xl">{t("Ảnh")}</Text>
                    <TouchableOpacity onPress={() => setOpenModal(true)} className="w-full h-64 bg-white rounded-md shadow-md flex items-center justify-center border-dashed border-2 border-black/20 mt-4">
                        <View className="size-20 flex items-center justify-center bg-cyan-blue/20 rounded-full">
                            <FontAwesome6 name="image" color="black" size={24} />
                        </View>
                        <Text className="text-xl text-center">{t("Chọn ảnh")}</Text>
                    </TouchableOpacity>
                    <View className="py-4">
                        {images.length > 0 && <Text>{t("Ảnh đã chọn")} ({images.length})</Text>}
                        <View className="flex-row items-center gap-4 py-2">
                            {images.map((uri, idx) => (
                                <View key={idx} className="w-32 h-32 rounded-md relative">
                                    <TouchableOpacity
                                        className="absolute top-2 right-2 z-10 size-6 rounded-full bg-black/30 items-center justify-center"
                                        onPress={() =>
                                            setImages(images.filter((_, i) => i !== idx))
                                        }
                                    >
                                        <FontAwesome6 name="x" size={10} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ width: "100%", height: "100%" }}
                                        onPress={() => setPreviewUri(uri)}
                                    >
                                        <Image
                                            source={{ uri }}
                                            style={{ width: "100%", height: "100%", borderRadius: 8 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <ActionModal
                    visible={openModal}
                    onClose={() => setOpenModal(false)}
                    title={t("Chọn ảnh")}
                    options={[
                        {
                            label: t("Thư viện"),
                            onPress: pickImage
                        },
                        {
                            label: t("Chụp ảnh"),
                            onPress: takePhoto
                        }
                    ]}
                />

                <Modal
                    visible={!!previewUri}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setPreviewUri(null)}
                >
                    <View className="flex-1 bg-black/90 items-center justify-center">
                        <TouchableOpacity 
                            className="absolute top-12 right-4 z-10"
                            onPress={() => setPreviewUri(null)}
                        >
                            <View className="w-10 h-10 bg-black/50 rounded-full items-center justify-center">
                                <FontAwesome6 name="x" size={20} color="white" />
                            </View>
                        </TouchableOpacity>
                        
                        {previewUri && (
                            <Image
                                source={{ uri: previewUri }}
                                style={{ 
                                    width: '90%', 
                                    height: '80%',
                                    resizeMode: 'contain'
                                }}
                            />
                        )}
                    </View>
                </Modal>
            </View >
        </View>
    )
}

export default index