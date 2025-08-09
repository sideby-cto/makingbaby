-- Create function to bulk delete test users
CREATE OR REPLACE FUNCTION public.bulk_delete_test_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user RECORD;
  deletion_result jsonb;
  total_processed integer := 0;
  total_successful integer := 0;
  total_failed integer := 0;
  deletion_results jsonb := '[]'::jsonb;
  final_report jsonb;
BEGIN
  -- Only allow admin users to execute this function
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND email LIKE '%@sideby.ai'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied. Admin privileges required.',
      'total_processed', 0,
      'total_successful', 0,
      'total_failed', 0,
      'deletions', '[]'::jsonb
    );
  END IF;

  -- Log the start of bulk deletion
  RAISE NOTICE 'Starting bulk deletion of test users at %', now();

  -- Loop through all test users that are not already deleted and not admins
  FOR test_user IN 
    SELECT id, first_name, last_name, email, status
    FROM public.profiles 
    WHERE (
      LOWER(first_name) LIKE '%test%' 
      OR LOWER(last_name) LIKE '%test%'
    )
    AND status != 'deleted'
    AND email NOT LIKE '%@sideby.ai'
    ORDER BY created_at ASC
  LOOP
    BEGIN
      total_processed := total_processed + 1;
      
      RAISE NOTICE 'Processing user % (%): % %', 
        total_processed, test_user.email, test_user.first_name, test_user.last_name;
      
      -- Call the existing hard delete function
      SELECT public.hard_delete_user_account(test_user.id) INTO deletion_result;
      
      -- Check if deletion was successful
      IF (deletion_result->>'success')::boolean OR (deletion_result->>'partialSuccess')::boolean THEN
        total_successful := total_successful + 1;
        
        -- Add success record to results
        deletion_results := deletion_results || jsonb_build_array(
          jsonb_build_object(
            'user_id', test_user.id,
            'email', test_user.email,
            'name', CONCAT(test_user.first_name, ' ', test_user.last_name),
            'status', 'success',
            'deletion_details', deletion_result
          )
        );
        
        RAISE NOTICE 'Successfully deleted user: %', test_user.email;
      ELSE
        total_failed := total_failed + 1;
        
        -- Add failure record to results
        deletion_results := deletion_results || jsonb_build_array(
          jsonb_build_object(
            'user_id', test_user.id,
            'email', test_user.email,
            'name', CONCAT(test_user.first_name, ' ', test_user.last_name),
            'status', 'failed',
            'error', deletion_result->>'error'
          )
        );
        
        RAISE NOTICE 'Failed to delete user %: %', test_user.email, deletion_result->>'error';
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        total_failed := total_failed + 1;
        
        -- Add exception record to results
        deletion_results := deletion_results || jsonb_build_array(
          jsonb_build_object(
            'user_id', test_user.id,
            'email', test_user.email,
            'name', CONCAT(test_user.first_name, ' ', test_user.last_name),
            'status', 'failed',
            'error', SQLERRM
          )
        );
        
        RAISE NOTICE 'Exception deleting user %: %', test_user.email, SQLERRM;
    END;
  END LOOP;

  -- Build final report
  final_report := jsonb_build_object(
    'success', true,
    'message', 'Bulk test user deletion completed',
    'total_processed', total_processed,
    'total_successful', total_successful,
    'total_failed', total_failed,
    'success_rate', CASE 
      WHEN total_processed > 0 THEN ROUND((total_successful::numeric / total_processed) * 100, 2)
      ELSE 0 
    END,
    'completed_at', now(),
    'deletions', deletion_results
  );

  RAISE NOTICE 'Bulk deletion completed. Processed: %, Successful: %, Failed: %', 
    total_processed, total_successful, total_failed;

  RETURN final_report;
END;
$$;