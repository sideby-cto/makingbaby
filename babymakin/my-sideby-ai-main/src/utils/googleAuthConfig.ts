export interface GoogleAuthValidationResult {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  configuredDomains: string[];
  currentDomain: string;
}

export const validateGoogleAuthConfiguration = (): GoogleAuthValidationResult => {
  const currentOrigin = window.location.origin;
  const currentDomain = window.location.hostname;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Expected domains for this project
  const expectedDomains = [
    '4b299215-7346-4848-8a38-c1f8c765b07b.lovableproject.com',
    'localhost',
    'my.sideby.ai'
  ];
  
  // Check if current domain is expected
  const isDomainRecognized = expectedDomains.some(domain => currentDomain.includes(domain));
  
  if (!isDomainRecognized) {
    issues.push(`Current domain "${currentDomain}" is not in the expected list`);
    recommendations.push(`Add "${currentOrigin}" to Google Cloud Console Authorized JavaScript origins`);
  }
  
  // Check HTTPS requirement
  if (!window.location.protocol.startsWith('https') && !currentDomain.includes('localhost')) {
    issues.push('Not using HTTPS - Google OAuth requires secure connections in production');
    recommendations.push('Ensure your domain uses HTTPS for Google OAuth to work');
  }
  
  // Check for basic browser support
  try {
    localStorage.setItem('google-auth-test', 'test');
    localStorage.removeItem('google-auth-test');
  } catch (e) {
    issues.push('Local storage access may be restricted');
    recommendations.push('Check if third-party cookies are enabled in your browser');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    configuredDomains: expectedDomains,
    currentDomain
  };
};

export const getRequiredGoogleCloudSettings = () => {
  const currentOrigin = window.location.origin;
  
  return {
    authorizedJavaScriptOrigins: [
      'https://4b299215-7346-4848-8a38-c1f8c765b07b.lovableproject.com',
      'http://localhost:3000',
      'https://localhost:3000',
      'https://my.sideby.ai',
      currentOrigin // Include current origin
    ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    
    authorizedRedirectUris: [
      'https://upffcxqiozqhdgfesmji.supabase.co/auth/v1/callback',
      'https://4b299215-7346-4848-8a38-c1f8c765b07b.lovableproject.com/auth/callback',
      'http://localhost:3000/auth/callback',
      'https://my.sideby.ai/auth/callback'
    ],
    
    supabaseCallbackUrl: 'https://upffcxqiozqhdgfesmji.supabase.co/auth/v1/callback'
  };
};

export const isLovableEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname.includes('lovableproject.com') || 
         hostname.includes('lovable.app') ||
         hostname === 'localhost';
};

export const getEnvironmentType = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    return 'Local Development';
  } else if (hostname.includes('lovableproject.com')) {
    return 'Lovable Preview';
  } else if (hostname.includes('lovable.app')) {
    return 'Lovable Deployed';
  } else if (hostname.includes('sideby.ai')) {
    return 'Production';
  } else {
    return 'Custom Domain';
  }
};

export const logConfigurationHelp = () => {
  const settings = getRequiredGoogleCloudSettings();
  const validation = validateGoogleAuthConfiguration();
  
  console.group('🔧 Google Cloud Console Configuration Help');
  console.log('📋 Step-by-Step Setup for Google OAuth:');
  console.log('');
  
  console.log('🔗 1. Go to Google Cloud Console:');
  console.log('   https://console.cloud.google.com/apis/credentials');
  console.log('');
  
  console.log('🆔 2. Create OAuth 2.0 Client ID (if not already created):');
  console.log('   • Click "Create Credentials" → "OAuth Client ID"');
  console.log('   • Application type: "Web application"');
  console.log('   • Name: sideby-oauth (or any name you prefer)');
  console.log('');
  
  console.log('🌐 3. Add Authorized JavaScript origins (COPY/PASTE these):');
  settings.authorizedJavaScriptOrigins.forEach(origin => {
    console.log(`   ${origin}`);
  });
  console.log('');
  
  console.log('🔄 4. Add Authorized redirect URIs (COPY/PASTE these):');
  settings.authorizedRedirectUris.forEach(uri => {
    console.log(`   ${uri}`);
  });
  console.log('');
  
  console.log('⚙️ 5. Configure Supabase Dashboard:');
  console.log(`   • Go to: https://supabase.com/dashboard/project/upffcxqiozqhdgfesmji/auth/providers`);
  console.log(`   • Enable Google provider`);
  console.log(`   • Add your Google Client ID and Secret from step 2`);
  console.log(`   • Site URL: ${window.location.origin}`);
  console.log(`   • Redirect URLs: ${window.location.origin}/**`);
  console.log('');
  
  console.log('🔧 6. Common Issues & Solutions:');
  console.log('   • "refused to connect" error: Domain not authorized in Google Console');
  console.log('   • "unauthorized_client" error: Check Client ID and domain configuration');
  console.log('   • "invalid_request" error: Verify redirect URLs match exactly');
  console.log('   • Note: Using redirect-only mode (no popups/iframes)');
  console.log('');
  
  if (!validation.isValid) {
    console.log('⚠️ Current Configuration Issues:');
    validation.issues.forEach(issue => {
      console.log(`   ❌ ${issue}`);
    });
    console.log('');
    console.log('💡 Immediate Actions Needed:');
    validation.recommendations.forEach(rec => {
      console.log(`   🔧 ${rec}`);
    });
  } else {
    console.log('✅ Configuration appears correct!');
    console.log('   If you\'re still having issues, check browser console for network errors.');
  }
  
  console.log('');
  console.log('📞 Current Environment:');
  console.log(`   Domain: ${window.location.hostname}`);
  console.log(`   Origin: ${window.location.origin}`);
  console.log(`   Protocol: ${window.location.protocol}`);
  console.log(`   In iframe: ${window.self !== window.top ? 'Yes' : 'No'}`);
  console.log(`   Environment type: ${getEnvironmentType()}`);
  console.log(`   User Agent: ${navigator.userAgent.substring(0, 50)}...`);
  
  // Add development-specific guidance
  if (isLovableEnvironment()) {
    console.log('');
    console.log('🔧 Lovable Development Environment Detected:');
    console.log('   • Google OAuth requires a new window/tab (iframes are blocked)');
    console.log('   • Click "Continue with Google" to open auth in new tab');
    console.log('   • For best results, deploy your app and test on custom domain');
    console.log('   • Ensure your deployed URL is added to Google Console origins');
    console.log('');
    console.log('📋 Testing Checklist:');
    console.log('   ✓ Test in Lovable preview (new tab opens)');
    console.log('   ✓ Deploy app and test on production URL');
    console.log('   ✓ Verify Google Console has your production domain');
    console.log('   ✓ Check Supabase Site URL matches your domain');
  }
  
  console.groupEnd();
  
  return { settings, validation };
};