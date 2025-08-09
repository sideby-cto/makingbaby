import React from "react";
import { UpduoConversationButton } from "@/components/dashboard/scheduling/components/UpduoConversationButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpduoUIConfig } from "@/types/upduo";

/**
 * Example component demonstrating different Upduo UI configurations
 * This shows how to control which parts of the Upduo interface are displayed
 */
export const UpduoConfigExamples: React.FC = () => {
  // Example 1: Minimal interface for focused conversations
  const minimalConfig: UpduoUIConfig = {
    hideNavigation: true,
    hideHeader: true,
    hideSidebar: true
  };

  // Example 2: Hide only navigation elements
  const cleanConfig: UpduoUIConfig = {
    hideNavigation: true,
    hideHeader: false,
    hideSidebar: true
  };

  // Example 3: Standard configuration (some elements hidden)
  const standardConfig: UpduoUIConfig = {
    hideNavigation: true,
    hideHeader: false,
    hideSidebar: true
  };

  // Example 4: Full interface (nothing hidden)
  const fullConfig: UpduoUIConfig = {
    hideNavigation: false,
    hideHeader: false,
    hideSidebar: false
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Upduo UI Configuration Examples</h1>
        <p className="text-muted-foreground">
          Different ways to control which parts of the Upduo interface are displayed
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Minimal Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Minimal Interface
              <Badge variant="secondary">Recommended for conversations</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Hides all navigation, header, sidebar, and footer elements for maximum focus
            </p>
          </CardHeader>
          <CardContent>
            <UpduoConversationButton
              partnerName="Sarah Johnson"
              mode="embedded"
              uiConfig={minimalConfig}
              className="mb-4"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Navigation: Hidden</p>
              <p>• Header: Hidden</p>
              <p>• Sidebar: Hidden</p>
              <p>• Note: CSS injection removed for cross-origin security</p>
            </div>
          </CardContent>
        </Card>

        {/* Clean Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Clean Interface
              <Badge variant="outline">Balanced</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Keeps header and footer but removes navigation and sidebar
            </p>
          </CardHeader>
          <CardContent>
            <UpduoConversationButton
              partnerName="Mike Chen"
              mode="embedded"
              uiConfig={cleanConfig}
              className="mb-4"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Navigation: Hidden</p>
              <p>• Header: Visible</p>
              <p>• Sidebar: Hidden</p>
            </div>
          </CardContent>
        </Card>

        {/* Standard Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Standard Interface
              <Badge variant="default">Default</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Default configuration with navigation and footer hidden
            </p>
          </CardHeader>
          <CardContent>
            <UpduoConversationButton
              partnerName="Alex Rivera"
              mode="embedded"
              uiConfig={standardConfig}
              className="mb-4"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Navigation: Hidden</p>
              <p>• Header: Visible</p>
              <p>• Sidebar: Hidden</p>
            </div>
          </CardContent>
        </Card>

        {/* Full Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Full Interface
              <Badge variant="destructive">All visible</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Shows the complete Upduo interface with all elements
            </p>
          </CardHeader>
          <CardContent>
            <UpduoConversationButton
              partnerName="Jordan Smith"
              mode="embedded"
              uiConfig={fullConfig}
              className="mb-4"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Navigation: Visible</p>
              <p>• Header: Visible</p>
              <p>• Sidebar: Visible</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Current Implementation:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>URL Parameters:</strong> Attempts to use Upduo's built-in URL parameters (if supported)</li>
              <li><strong>Cross-Origin Security:</strong> CSS injection removed due to browser security restrictions</li>
              <li><strong>Simplified Interface:</strong> Focus on core Upduo functionality without UI modifications</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Available Options:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><code>hideNavigation</code>: Reserved for future URL parameter support</li>
              <li><code>hideHeader</code>: Reserved for future URL parameter support</li>
              <li><code>hideSidebar</code>: Reserved for future URL parameter support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};