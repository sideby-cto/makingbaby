import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { StudentSuccessSign, CreateStudentSuccessSign } from '@/types/student-success';

export const useStudentSuccessSigns = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-success-signs', studentId],
    queryFn: async () => {
      let query = supabase
        .from('student_success_signs')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching student success signs:', error);
        throw error;
      }

      return data as StudentSuccessSign[];
    },
    enabled: true
  });
};

export const useCreateStudentSuccessSign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signData: CreateStudentSuccessSign) => {
      const { data, error } = await supabase
        .from('student_success_signs')
        .insert(signData)
        .select()
        .single();

      if (error) {
        console.error('Error creating student success sign:', error);
        throw error;
      }

      return data as StudentSuccessSign;
    },
    onSuccess: (data) => {
      // Invalidate and refetch student success signs queries
      queryClient.invalidateQueries({ queryKey: ['student-success-signs'] });
      queryClient.invalidateQueries({ queryKey: ['student-success-signs', data.student_id] });
    }
  });
};

export const useUpdateStudentSuccessSign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateStudentSuccessSign>) => {
      const { data, error } = await supabase
        .from('student_success_signs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student success sign:', error);
        throw error;
      }

      return data as StudentSuccessSign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-success-signs'] });
      queryClient.invalidateQueries({ queryKey: ['student-success-signs', data.student_id] });
    }
  });
};

export const useDeleteStudentSuccessSign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('student_success_signs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student success sign:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-success-signs'] });
    }
  });
};