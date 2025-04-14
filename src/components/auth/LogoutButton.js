"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutButton({
  variant = "default",
  size = "default",
  className = "",
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await logout();

      toast.success("Logged out", {
        description: "You have been successfully logged out",
      });

      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: "There was a problem logging out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
