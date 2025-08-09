
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RawHtmlComposerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function RawHtmlComposer({ 
  value, 
  onChange, 
  placeholder = "Enter HTML content..." 
}: RawHtmlComposerProps) {
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HTML Editor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">HTML Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              rows={12}
              className="w-full resize-none font-mono text-sm"
              placeholder={placeholder}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter raw HTML content. Headers and footers will be added automatically when emails are sent.
            </p>
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
                dangerouslySetInnerHTML={{ __html: value || "" }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
