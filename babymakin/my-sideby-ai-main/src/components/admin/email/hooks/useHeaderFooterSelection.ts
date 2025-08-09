
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HeaderFooterTemplate } from "./useHeaderFooterTemplates";

export const useHeaderFooterSelection = () => {
  const [headerTemplates, setHeaderTemplates] = useState<HeaderFooterTemplate[]>([]);
  const [footerTemplates, setFooterTemplates] = useState<HeaderFooterTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("email_header_footer_templates")
          .select("*")
          .order("name");

        if (error) throw error;

        const typedTemplates = (data || []).map((template) => ({
          ...template,
          type: template.type as "header" | "footer",
        })) as HeaderFooterTemplate[];

        setHeaderTemplates(typedTemplates.filter(t => t.type === "header"));
        setFooterTemplates(typedTemplates.filter(t => t.type === "footer"));
      } catch (error) {
        console.error("Error loading header/footer templates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  return {
    headerTemplates,
    footerTemplates,
    loading,
  };
};
