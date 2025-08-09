
export interface CentralizedTemplateFormData {
  reminder_type: string;
  email_template_id: string;
  template_variables: string;
  active: boolean;
  bypass_template: boolean;
}

export interface UseTemplateFormDataProps {
  templateId: string | null;
  initialData: any;
  mode: 'create' | 'edit';
  open: boolean;
}
