// Quick test script to reprocess the user session
fetch('https://upffcxqiozqhdgfesmji.supabase.co/functions/v1/reprocess-user-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZmZjeHFpb3pxaGRnZmVzbWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODU4NTcsImV4cCI6MjA1Mzc2MTg1N30.RNkakuJDMiO4bvN7Y1p-NlZYHr5obgOnDcwLQMdElLg'
  },
  body: JSON.stringify({
    userId: 'e5a67ee9-d30e-4f26-bafd-bf20b9ba4ab6',
    conversationId: '139239'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));