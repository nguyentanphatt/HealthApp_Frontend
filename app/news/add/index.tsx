import { categoryBlog } from '@/constants/data'
import { createNewBlog } from '@/services/blog'
import { useModalStore } from '@/stores/useModalStore'
import { FontAwesome6 } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import * as ImagePicker from "expo-image-picker"
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
const index = () => {
    const router = useRouter();
    const { openModal } = useModalStore();
    const { t } = useTranslation();
    const [selectedTag, setSelectedTag] = useState({ label: "Khác", value: "other" });
    const [images, setImages] = useState<string[]>([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const scrollViewRef = useRef<ScrollView>(null);
    const contentInputRef = useRef<TextInput>(null);
    const pickImage = async () => {
        // Blur content input to prevent keyboard from showing after image selection
        contentInputRef.current?.blur();
        
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
        // Blur content input to prevent keyboard from showing after photo capture
        contentInputRef.current?.blur();
        
        let result = await ImagePicker.launchCameraAsync({
            quality: 1,
        });
        if (!result.canceled) {
            setImages((prev) => [...prev, result.assets[0].uri].slice(0, 3));
        }
    };

    const createMutation = useMutation({
        mutationFn: ({title, image, content, category}: {title:string, image:string, content:string, category:string}) => {
            const timestamp = new Date().getTime();
            console.log("image", image,
                "title", title,
                "content", content,
                "category", category,
                "timestamp", timestamp
            );
            
            return createNewBlog(title, image, content, timestamp, category);
        },
        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: "Thêm bài viết thành công",
            });
            router.push("/news");
        },
        onError: (error) => {
            console.log("error", error);
            Toast.show({
                type: "error",
                text1: "Thêm bài viết thất bại",
                text2: error.message,
            });
        },
    })

    const logData = (title:string, image:string, content:string, category:string) => {
        const date = new Date();
        const timestamp = date.getTime();
        let filename = "";
        if(image){
            filename = image.split('/').pop() || '';
        }
        
        console.log("title", title);
        console.log("image", image);
        console.log("filename", filename);
        console.log("content", content);
        console.log("createAt", timestamp);
        console.log("category", category);
    }

    return (
        <ScrollView 
            ref={scrollViewRef}
            className='flex-1 gap-2.5 px-4 pb-10 font-lato-regular bg-[#f6f6f6]'
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={[0]}
        >
            <View className="flex bg-[#f6f6f6] pt-16 py-10">
                <View className="flex flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome6 name="chevron-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold self-center">{t("Thêm bài viết")}</Text>
                    <TouchableOpacity onPress={() => createMutation.mutate({
                        title,
                        image: images[0],
                        content,
                        category: selectedTag.value
                    })}>
                        <Text className="text-2xl font-bold text-cyan-blue self-center">{t("Lưu")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className='flex gap-2.5'>
                <View>
                    <Text className='text-xl font-bold'>
                        {t("Tiêu đề")}
                    </Text>
                    <TextInput
                        placeholder={t("Tiêu đề")}
                        className="bg-white text-lg border-2 rounded-md border-black/20 p-2 mt-4"
                        value={title}
                        onChangeText={(text) => setTitle(text)}
                    />
                </View>

                <View>
                    <Text className="font-bold text-xl">{t("Chủ đề")}</Text>
                    <View className="flex-row gap-3 mt-4">
                        <FlatList
                            data={categoryBlog}
                            keyExtractor={(item) => item.value}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                            renderItem={({ item }) => {
                                const isSelectedTag = selectedTag.value === item.value;
                                return (
                                    <TouchableOpacity
                                        onPress={() => setSelectedTag(item)}
                                        className={`px-4 py-2 rounded-full ${isSelectedTag ? "bg-cyan-blue" : "bg-white"}`}
                                        style={{ marginRight: 0 }}
                                    >
                                        <Text
                                            className={`text-lg ${isSelectedTag ? "text-white" : "text-black"}`}
                                        >
                                            {t(item.label)}
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
                        ref={contentInputRef}
                        placeholder={t("Nội dung")}
                        className="text-lg border-2 rounded-md border-black/20 p-2 mt-4 bg-white"
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={(text) => {
                            setContent(text);
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 100);
                        }}
                        onFocus={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                        onContentSizeChange={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 10);
                        }}
                        style={{ 
                            minHeight: 100,
                            textAlignVertical: 'top'
                        }}
                    />
                </View>

                <View>
                    <Text className="font-bold text-xl">{t("Ảnh chủ đề")}</Text>
                    <TouchableOpacity onPress={() => openModal("action", {
                        title: t("Chọn ảnh"),
                        options: [
                            { label: t("Thư viện"), onPress: pickImage, backgroundColor: "#D1D5DC", textColor: 'black' },
                            { label: t("Chụp ảnh"), onPress: takePhoto, backgroundColor: "#D1D5DC", textColor: 'black' }
                        ]
                    })} className="w-full h-64 bg-white rounded-md shadow-md flex items-center justify-center border-dashed border-2 border-black/20 mt-4">
                        <View className="size-20 flex items-center justify-center bg-cyan-blue/20 rounded-full">
                            <FontAwesome6 name="image" color="black" size={24} />
                        </View>
                        <Text className="text-xl text-center">{t("Chọn ảnh")}</Text>
                    </TouchableOpacity>
                    <View className="pt-4">
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
                                        onPress={() => openModal("imageview", { uri: uri })}
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
                  <View className='h-[100px] bg-[#f6f6f6]'/>          
            </View >
        </ScrollView>
    )
}

export default index