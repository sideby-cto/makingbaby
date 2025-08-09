
export const emailStyles = {
  container: "font-family: Arial, sans-serif;",
  header: "background-color: #FFFFFF; padding: 24px 0; text-align: center; border-bottom: 1px solid #eee;",
  logo: "display: inline-block;",
  content: "max-width: 600px; margin: 0 auto; padding: 40px 20px;",
  section: "margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;",
  title: "font-weight: bold; color: #171717;",
  message: "margin-top: 5px;",
  button: "background-color: #F87201; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;",
  buttonContainer: "text-align: center; margin: 30px 0;",
  footer: "margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;",
  link: "color: #F87201; text-decoration: none;"
};

export const generateEmailTemplate = (content: string, currentYear: number) => `
  <div style="${emailStyles.container}">
    <div style="${emailStyles.header}">
      <img src="https://my.sideby.ai/lovable-uploads/4fa666a9-c191-4ff7-9213-c43d4c9fc9aa.png" alt="sideby" width="150" style="${emailStyles.logo}">
    </div>
    
    <div style="${emailStyles.content}">
      ${content}

      <p style="${emailStyles.buttonContainer}">
        <a href="https://my.sideby.ai" style="${emailStyles.button}">
          Go to Dashboard
        </a>
      </p>

      <div style="${emailStyles.footer}">
        <p>You received this email because you're a member of the sideby learning community.</p>
        <p><a href="https://my.sideby.ai/settings" style="${emailStyles.link}">Manage notifications</a></p>
        <p style="color: #999;">&copy; ${currentYear} sideby</p>
      </div>
    </div>
  </div>
`;
