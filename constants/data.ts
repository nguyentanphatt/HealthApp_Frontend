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

export const categoryBlog = [
  {
    id: 1,
    label: "Nước",
    value: "water",
  },
  {
    id: 2,
    label: "Thức ăn",
    value: "food",
  },

  {
    id: 3,
    label: "Vận động",
    value: "fitness",
  },

  {
    id: 4,
    label: "Giấc ngủ",
    value: "sleep",
  },

  {
    id: 5,
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
    id: 2,
    label: "Cũ nhất",
    value: "oldest",
  },
  {
    id: 3,
    label: "Yêu thích ↑",
    value: "favorite-increase",
  },
  {
    id: 4,
    label: "Yêu thích ↓",
    value: "favorite-decrease",
  },
]

export const workQuestions = [
  {
    id: 1,
    question: "Mục tiêu chính khi bạn tập luyện là gì?",
    answers: [
      {
        id: 1,
        answer: "Giảm căng thẳng, tăng sự linh hoạt",
      },
      {
        id: 2,
        answer: "Tăng cơ, cải thiện sức mạnh",
      },
      {
        id: 3,
        answer: "Cải thiện sức bền và tim mạch",
      },
      {
        id: 4,
        answer: "Giảm cân, kiểm soát vóc dáng",
      },
      {
        id: 5,
        answer: "Khác",
      }
    ]
  },
  {
    id: 2,
    question: "Bạn thích kiểu vận động nào nhất?",
    answers: [
      {
        id: 1,
        answer: "Động tác chậm, tập trung vào hơi thở",
      },
      {
        id: 2,
        answer: "Chuyển động nhanh, nhiều năng lượng",
      },
      {
        id: 3,
        answer: "Dùng tạ hoặc kháng lực",
      },
      {
        id: 4,
        answer: "Bài tập có nhịp điệu, theo nhạc",
      },
      {
        id: 5,
        answer: "Khác",
      }
    ]
  },
  {
    id: 3,
    question: "Bạn có dụng cụ tập không?",
    answers: [
      {
        id: 1,
        answer: "Không có dụng cụ",
      },
      {
        id: 2,
        answer: "Có một vài dụng cụ nhỏ (dây kháng lực, tạ tay, thảm tập, v.v.)",
      },
      {
        id: 3,
        answer: "Có đầy đủ dụng cụ (tạ đòn, máy tập, ghế tập, v.v.)",
      }
    ]
  }
]