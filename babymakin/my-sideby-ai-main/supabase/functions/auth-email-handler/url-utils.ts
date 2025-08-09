interface LinkConstructionResult {
  siteUrl: string;
  actionLink: string;
  passwordResetLink: string;
}

export function constructLinks(type: string, req: Request, data: any): LinkConstructionResult {
  // Use environment variable for site URL if set
  let envSiteUrl = '';
  try {
    // Deno.env.get for Supabase Edge Functions
    // @ts-ignore
    envSiteUrl = typeof Deno !== 'undefined' && Deno.env ? Deno.env.get('SITE_URL') : process.env.SITE_URL || '';
  } catch  {}
  // If SITE_URL is set, always use it
  let siteUrl = envSiteUrl || '';
  if (!siteUrl) {
    // Fallback to previous logic if env not set
    const validDomains = [
      'sideby.ai',
      'my.sideby.ai',
      'app.sideby.ai',
      'staging.sideby.ai',
      'localhost',
      'localhost:3000',
      'localhost:5173'
    ];
    let origin = '';
    const referrer = req.headers.get("referer") || "";
    const host = req.headers.get("host") || "";
    try {
      if (referrer) {
        const referrerUrl = new URL(referrer);
        origin = referrerUrl.origin;
        const referrerDomain = referrerUrl.hostname;
        if (!validDomains.some((domain)=>referrerDomain.includes(domain))) {
          origin = '';
        }
      }
      if (!origin && host) {
        const protocol = host.includes('localhost') ? 'http://' : 'https://';
        origin = `${protocol}${host}`;
      }
      if (!origin) {
        origin = "https://my.sideby.ai";
      }
    } catch  {
      origin = "https://my.sideby.ai";
    }
    siteUrl = origin;
    // Staging/production override
    const isStaging = host.includes('staging') || referrer.includes('staging');
    const isProduction = host.includes('my.sideby') || referrer.includes('my.sideby');
    if (isStaging && !siteUrl.includes('staging')) {
      siteUrl = "https://staging.sideby.ai";
    } else if (isProduction && !siteUrl.includes('my.sideby')) {
      siteUrl = "https://my.sideby.ai";
    }
  }
  if (!siteUrl) siteUrl = "https://my.sideby.ai";
  
  // Extract token from different possible sources in Supabase auth webhook
  // Supabase sends tokens in different fields depending on the event type
  let token = "";
  
  console.log("Extracting token for type:", type);
  console.log("Available data fields:", Object.keys(data || {}));
  
  if (data) {
    // Try different token field names that Supabase might use
    token = data.token || 
            data.confirmation_token || 
            data.recovery_token || 
            data.email_change_token ||
            data.email_change_token_new ||
            data.email_change_token_current ||
            data.invite_token ||
            "";
            
    console.log("Extracted token:", token ? `${token.substring(0, 10)}...` : "none found");
  }
  
  let actionLink = `${siteUrl}`;
  let passwordResetLink = `${siteUrl}`;
  
  if (type === "recovery") {
    // For password reset links, use both hash and query params for better compatibility
    // Use hash fragment for password reset links to preserve Supabase token format
    passwordResetLink = `${siteUrl}/reset-password#access_token=${token}&type=recovery`;
    // Also provide the token as a query parameter as a fallback
    actionLink = `${passwordResetLink}`;
    console.log(`Generated password reset link: ${passwordResetLink}`);
  } else if (type === "signup" || type === "confirmation") {
    actionLink = `${siteUrl}/auth/callback?token=${token}&type=${type}`;
    console.log(`Generated signup confirmation link: ${actionLink}`);
  } else if (type === "invite") {
    actionLink = `${siteUrl}/auth/callback?token=${token}&type=invite`;
    console.log(`Generated invite link: ${actionLink}`);
  } else if (type === "magiclink") {
    actionLink = `${siteUrl}/auth/callback?token=${token}&type=magiclink`;
    console.log(`Generated magic link: ${actionLink}`);
  }
  return {
    siteUrl,
    actionLink,
    passwordResetLink
  };
}
