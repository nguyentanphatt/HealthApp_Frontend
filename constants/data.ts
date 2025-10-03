import { images } from "./image";
export const introductionData = [
  {
    id: 1,
    title: "Theo dõi từng bước chân",
    description:
      "Đo số bước đi, quãng đường và lượng calo tiêu hao mỗi ngày. Giúp bạn duy trì vận động và đạt mục tiêu sức khỏe.",
    image: images.fitness,
    blurBg: images.blur01,
  },
  {
    id: 2,
    title: "Ngủ ngon hơn mỗi đêm",
    description:
      "Ghi lại thời gian ngủ, chất lượng giấc ngủ và đưa ra gợi ý để bạn ngủ sâu hơn.",
    image: images.sleep,
    blurBg: images.blur02,
  },
  {
    id: 3,
    title: "Đủ nước, đủ năng lượng",
    description:
      "Nhắc nhở uống nước đúng giờ và theo dõi lượng nước bạn uống mỗi ngày.",
    image: images.drink,
    blurBg: images.blur03,
  },
  {
    id: 4,
    title: "Ăn uống thông minh",
    description:
      "Ghi lại bữa ăn, tính toán lượng calo và dinh dưỡng để giúp bạn duy trì chế độ ăn lành mạnh.",
    image: images.food,
    blurBg: images.blur04,
  },
];

export const nutritionFields = [
  { label: "Chất đạm", key: "protein" },
  { label: "Chất béo", key: "fat" },
  { label: "Chất xơ", key: "fiber" },
  { label: "Tinh bột", key: "starch" },
];

export const meals = ["Sáng", "Trưa", "Tối", "Phụ", "Khác"];

export const options = [
  {
    id: 1,
    label: "Tất cả",
    value: "all",
  },
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

export const sortOptions = [
  {
    id: 1,
    label: "Mới nhất",
    value: "newest",
  },
  {
    id: 1,
    label: "Cũ nhất",
    value: "oldest",
  },
  {
    id: 1,
    label: "Yêu thích ↑",
    value: "favorite-increase",
  },
  {
    id: 1,
    label: "Độ yêu ↓",
    value: "favorite-decrease",
  },
]