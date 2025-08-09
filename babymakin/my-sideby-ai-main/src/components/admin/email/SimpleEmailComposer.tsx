
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState, useEffect } from "react";

interface SimpleEmailComposerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function SimpleEmailComposer({ 
  value, 
  onChange, 
  placeholder = "Type your message..." 
}: SimpleEmailComposerProps) {
  const [body, setBody] = useState("");
  const [ctaText, setCtaText] = useState("Click here");
  const [ctaUrl, setCtaUrl] = useState("https://example.com");

  // Initialize state from value prop
  useEffect(() => {
    if (value && !body && ctaText === "Click here" && ctaUrl === "https://example.com") {
      // Try to extract body and button info from existing HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      
      const paragraphs = tempDiv.querySelectorAll('p');
      const link = tempDiv.querySelector('a');
      
      if (paragraphs.length > 0) {
        const bodyText = Array.from(paragraphs)
          .filter(p => !p.querySelector('a'))
          .map(p => p.textContent)
          .join('\n');
        setBody(bodyText);
      }
      
      if (link) {
        setCtaText(link.textContent || "Click here");
        setCtaUrl(link.getAttribute('href') || "https://example.com");
      }
    }
  }, [value, body, ctaText, ctaUrl]);

  // Generate complete HTML content
  const generateEmailHtml = (emailBody: string, buttonText: string, buttonUrl: string) => {
    const escape = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    return `
    <div style="font-family: sans-serif; line-height: 1.4;">
      <p>${escape(emailBody).replace(/\n/g, "<br/>")}</p>
      <p>
        <a href="${buttonUrl}"
           style="
             display: inline-block;
             padding: 10px 20px;
             background-color: #007bff;
             color: white;
             text-decoration: none;
             border-radius: 4px;
           ">
          ${escape(buttonText)}
        </a>
      </p>
    </div>
  `.trim();
  };

  // Handle body changes and generate complete HTML
  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    const completeHtml = generateEmailHtml(newBody, ctaText, ctaUrl);
    if (onChange) {
      onChange(completeHtml);
    }
  };

  // Handle button text changes and generate complete HTML
  const handleCtaTextChange = (newCtaText: string) => {
    setCtaText(newCtaText);
    const completeHtml = generateEmailHtml(body, newCtaText, ctaUrl);
    if (onChange) {
      onChange(completeHtml);
    }
  };

  // Handle button URL changes and generate complete HTML
  const handleCtaUrlChange = (newCtaUrl: string) => {
    setCtaUrl(newCtaUrl);
    const completeHtml = generateEmailHtml(body, ctaText, newCtaUrl);
    if (onChange) {
      onChange(completeHtml);
    }
  };

  // Generate preview HTML
  const emailHtml = generateEmailHtml(body, ctaText, ctaUrl);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composition Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-body" className="text-sm font-medium mb-2 block">
                Email body:
              </Label>
              <Textarea
                id="email-body"
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                rows={8}
                className="w-full resize-none"
                placeholder={placeholder}
              />
            </div>

            <div>
              <Label htmlFor="button-text" className="text-sm font-medium mb-2 block">
                Button text:
              </Label>
              <Input
                id="button-text"
                value={ctaText}
                onChange={(e) => handleCtaTextChange(e.target.value)}
                className="w-full"
                placeholder="e.g. Visit Dashboard"
              />
            </div>

            <div>
              <Label htmlFor="button-url" className="text-sm font-medium mb-2 block">
                Button URL:
              </Label>
              <Input
                id="button-url"
                value={ctaUrl}
                onChange={(e) => handleCtaUrlChange(e.target.value)}
                className="w-full"
                placeholder="e.g. https://my.sideby.ai/dashboard"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg p-4 bg-white min-h-[200px]">
              <div
                className="font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: emailHtml }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
