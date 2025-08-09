
export const emailStyles = {
  // Brand color palette
  nerdOrange: "#F67201",
  classroomCream: "#FBF6E3", 
  bookBrown: "#401612",
  eraserPink: "#F99EB3",
  
  // CSS styles for email templates
  section: "margin-bottom: 20px; padding: 20px; background-color: #FBF6E3; border-radius: 8px;",
  title: "font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif; font-size: 32px; font-weight: bold; color: #401612; margin: 0 0 16px 0; text-align: center;",
  message: "font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 16px; color: #401612; line-height: 1.5; margin: 0 0 16px 0;",
  button: "display: inline-block; background-color: #F67201; color: #401612; font-family: 'PP Neue Machina', 'Space Grotesk', monospace; font-size: 16px; font-weight: 400; padding: 12px 24px; border-radius: 6px; text-decoration: none; border: none; margin: 16px 0;"
};

export const generateEmailTemplate = (content, currentYear) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>sideby</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #FBF6E3; font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif;">
  
  <!-- Main container table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #FBF6E3;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Content wrapper -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #FBF6E3;">
          
          <!-- Orange banner with wavy bottom -->
          <tr>
            <td style="padding: 0; background-color: #F67201; position: relative; height: 250px;">
              <!-- Wavy bottom effect using CSS -->
              <div style="width: 100%; height: 200px; background-color: #F67201; position: relative;">
                <!-- Logo positioned top-right -->
                <div style="position: absolute; top: 20px; right: 20px; z-index: 10;">
                  <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" style="display: block; width: 120px; height: auto;">
                </div>
              </div>
              <!-- Wavy bottom using CSS border-radius -->
              <div style="width: 100%; height: 50px; background-color: #F67201; border-radius: 0 0 50% 50%; transform: scale(2, 1); transform-origin: top;"></div>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 40px 20px; text-align: center; background-color: #FBF6E3;">
              ${content}
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
  <!-- Embedded styles for better email client support -->
  <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Cabin+Condensed:wght@400;700&family=Space+Grotesk:wght@300;400;500;700&display=swap');
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .headline { 
        font-size: 28px !important; 
        margin-bottom: 20px !important;
      }
      .body { 
        font-size: 16px !important; 
        margin-bottom: 24px !important;
      }
      .cta-button { 
        font-size: 24px !important; 
        padding: 14px 28px !important;
      }
      .banner-height { 
        height: 200px !important; 
      }
      .logo-container { 
        top: 15px !important; 
        right: 15px !important;
      }
      .logo { 
        width: 100px !important; 
      }
      .content-padding { 
        padding: 30px 15px !important; 
      }
    }
    
    /* Font fallbacks for better compatibility */
    .headline {
      font-family: 'VC Nudge', 'Cabin Condensed', Arial, sans-serif !important;
    }
    .body {
      font-family: 'Clash Grotesk', 'Bricolage Grotesque', Helvetica, sans-serif !important;
    }
    .cta-button {
      font-family: 'PP Neue Machina', 'Space Grotesk', monospace !important;
    }
  </style>
  
</body>
</html>
`;
