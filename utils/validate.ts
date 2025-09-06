export const validateEmail = (email: string): string => {
  if (!email) return "Email không được để trống";

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Email không hợp lệ";
  }

  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) return "Mật khẩu không được để trống";

  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[^\s]{5,}$/;
  if (!regex.test(password)) {
    return "Mật khẩu phải có ít nhất 5 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt";
  }

  return "";
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string => {
  if (!confirmPassword) return "Xác nhận mật khẩu không được để trống";

  if (password !== confirmPassword) {
    return "Xác nhận mật khẩu không đúng";
  }

  return "";
};
