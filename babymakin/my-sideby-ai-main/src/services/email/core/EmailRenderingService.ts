
import { EmailVariable } from "../centralizedEmailService";

export class EmailRenderingService {
  /**
   * Replace variables in text using {{variable_name}} syntax
   */
  replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return variables[variableName] || match;
    });
  }

  /**
   * Prepare variables map from array and add common variables
   */
  prepareVariablesMap(variables: EmailVariable[], recipientName?: string): Record<string, string> {
    const variablesMap: Record<string, string> = {};
    
    variables.forEach(variable => {
      variablesMap[variable.name] = String(variable.value ?? '');
    });

    // Add common variables
    variablesMap.current_year = new Date().getFullYear().toString();
    if (recipientName) {
      variablesMap.recipient_name = recipientName;
    }

    return variablesMap;
  }

  /**
   * Render complete email HTML
   */
  renderEmailContent(templateData: any, variablesMap: Record<string, string>): string {
    const renderedHeader = templateData.header_template?.[0]?.html_content 
      ? this.replaceVariables(templateData.header_template[0].html_content, variablesMap)
      : '';
    const renderedBody = this.replaceVariables(templateData.body_html, variablesMap);
    const renderedFooter = templateData.footer_template?.[0]?.html_content
      ? this.replaceVariables(templateData.footer_template[0].html_content, variablesMap)
      : '';

    return `
      <div style="font-family: Arial, sans-serif;">
        ${renderedHeader}
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          ${renderedBody}
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://my.sideby.ai" style="background-color: #F87201; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          ${renderedFooter}
        </div>
      </div>
    `;
  }
}

export const emailRenderingService = new EmailRenderingService();
