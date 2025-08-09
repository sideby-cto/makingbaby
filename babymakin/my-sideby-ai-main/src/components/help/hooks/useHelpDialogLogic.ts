
import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSubmitHandler } from "@/hooks/useSubmitHandler";
import { useMemoryLeakProtection } from "@/hooks/useMemoryLeakProtection";
import { HelpType } from "../types";

export const useHelpDialogLogic = (onOpenChange: (open: boolean) => void) => {
  const [type, setType] = useState<HelpType>("bug");
  const [details, setDetails] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [useCase, setUseCase] = useState("");
  const [priority, setPriority] = useState("medium");
  const { user } = useAuth();
  const { isSubmitting, submitWithHandler } = useSubmitHandler();
  const { createAbortController } = useMemoryLeakProtection();

  const sendWithFallback = useCallback(async (payload: any, maxRetries = 3) => {
    const payloadString = JSON.stringify(payload);
    console.log("📤 Attempting to send payload:", {
      size: payloadString.length,
      payload: payload
    });

    // Primary method: Use Supabase client
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Primary attempt ${attempt}/${maxRetries} using Supabase client`);
        
        const { data, error } = await supabase.functions.invoke('slack-notification', {
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log(`📥 Primary attempt ${attempt} response:`, { data, error });

        if (error) {
          throw new Error(`Supabase client error: ${error.message}`);
        }

        return data;
      } catch (primaryError) {
        console.warn(`⚠️ Primary attempt ${attempt} failed:`, primaryError);
        
        if (attempt === maxRetries) {
          console.log("🔄 Switching to fallback method with direct fetch");
          
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (!supabaseUrl) {
              throw new Error("Supabase URL not configured");
            }

            const functionUrl = `${supabaseUrl}/functions/v1/slack-notification`;
            console.log("🌐 Fallback fetch URL:", functionUrl);

            const response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: payloadString,
            });

            console.log("📡 Fallback fetch response:", {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText
            });

            if (!response.ok) {
              const errorText = await response.text().catch(() => 'Unable to read error');
              throw new Error(`Fallback fetch failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const fallbackData = await response.json();
            console.log("✅ Fallback method succeeded:", fallbackData);
            return fallbackData;
          } catch (fallbackError) {
            console.error("❌ Fallback method also failed:", fallbackError);
            throw new Error(`All delivery methods failed. Last error: ${fallbackError.message}`);
          }
        }
        
        const waitTime = 1000 * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      throw new Error("You must be logged in to send a request.");
    }

    // Validation based on type
    if (type === "feature-request") {
      if (featureDescription.trim().length < 10) {
        throw new Error("Please provide more details about the feature (at least 10 characters).");
      }
      if (useCase.trim().length < 10) {
        throw new Error("Please describe how you would use this feature (at least 10 characters).");
      }
    } else {
      if (details.trim().length < 10) {
        throw new Error("Please provide more details (at least 10 characters).");
      }
    }

    const submitFunction = async () => {
      const abortController = createAbortController();
      
      const firstName = type === "contact" 
        ? "Human Contact Request" 
        : type === "feature-request"
          ? "Feature Request"
          : "Bug Report";

      let payload: any;
      
      if (type === "feature-request") {
        payload = {
          type: "feature_request",
          user: {
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: "",
          },
          details: featureDescription,
          help_type: type,
          feature_description: featureDescription,
          use_case: useCase,
          priority: priority
        };
      } else {
        payload = {
          type: "support_request",
          user: {
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: "",
          },
          details,
          help_type: type
        };
      }

      console.log("🚀 Sending request with payload:", {
        type: payload.type,
        user_email: payload.user.email,
        help_type: payload.help_type,
        payload_size: JSON.stringify(payload).length
      });

      try {
        const result = await sendWithFallback(payload);
        console.log("✅ Request sent successfully:", result);
        return result;
      } catch (error) {
        console.error("❌ Failed to send request:", error);
        throw error;
      }
    };

    await submitWithHandler(submitFunction, {
      successMessage: "Your request has been sent to our team.",
      errorMessage: "Something went wrong. Please try again.",
      timeout: 30000,
      onSuccess: () => {
        setDetails("");
        setFeatureDescription("");
        setUseCase("");
        setPriority("medium");
        onOpenChange(false);
      }
    });
  }, [user, details, featureDescription, useCase, priority, type, submitWithHandler, onOpenChange, createAbortController, sendWithFallback]);

  const handleTypeChange = useCallback((value: string) => {
    setType(value as HelpType);
  }, []);

  const handleDetailsChange = useCallback((value: string) => {
    setDetails(value);
  }, []);

  const handleCloseDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return {
    type,
    details,
    featureDescription,
    useCase,
    priority,
    isSubmitting,
    setFeatureDescription,
    setUseCase,
    setPriority,
    handleSubmit,
    handleTypeChange,
    handleDetailsChange,
    handleCloseDialog
  };
};
