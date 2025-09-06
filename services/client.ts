import axios from 'axios';
export const client = axios.create({
  baseURL: "http://168.138.168.177:25565/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});
