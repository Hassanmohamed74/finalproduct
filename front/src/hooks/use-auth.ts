import { useState } from "react";

export interface User {
  id?: string;
  userId?: string;
  email?: string;
  role?: "admin" | "teacher" | "student" | string;
  roles?: string[];
  permissions?: string[];
  branchId?: string;
  first_name?: string;
  last_name?: string;
}

// 1. التعريف يجب أن يكون هنا (أعلى الهوك)
const getStoredUser = (): User | null => {
  try {
    const item = localStorage.getItem("tms_user");
    return item
      ? JSON.parse(item)
      : {
          id: "1",
          userId: "1",
          email: "admin@speakup.com",
          branchId: "branch-uuid-1",
          role: "super_admin",
          roles: ["super_admin"],
          permissions: ["users:read", "users:create"],
        };
  } catch {
    return null;
  }
};

// 2. الاستخدام داخل الهوك
export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    user,
    isLoading,
    setUser: (u: User | null) => {
      setUser(u);
      if (u) {
        localStorage.setItem("tms_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("tms_user");
      }
    },
  };
}