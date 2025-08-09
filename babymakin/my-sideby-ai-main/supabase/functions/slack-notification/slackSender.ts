export async function sendToSlack(webhookUrl, message) {
  try {
    console.log('🔗 Sending to Slack webhook...');
    console.log('📨 Message payload size:', JSON.stringify(message).length);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
      body: JSON.stringify(message)
    });
    console.log('📡 Slack response status:', response.status);
    console.log('📡 Slack response ok:', response.ok);
    if (!response.ok) {
      const errorText = await response.text().catch(()=>'Unable to read error response');
      console.error('❌ Slack API error response:', errorText);
      throw new Error(`Slack API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const responseText = await response.text().catch(()=>'ok');
    console.log('✅ Slack response:', responseText);
    console.log('✅ Successfully sent to Slack');
    return {
      success: true,
      response: responseText
    };
  } catch (error) {
    console.error('❌ Slack sending error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message || 'Unknown error occurred while sending to Slack'
    };
  }
}
