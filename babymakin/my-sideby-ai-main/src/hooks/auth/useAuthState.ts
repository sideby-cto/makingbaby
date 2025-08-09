
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
    formError,
    setFormError,
    toast
  };
};
