
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { GoalOrientedTestConfig } from '@/types/chaos-testing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Zap, Target, Settings } from 'lucide-react';

interface ChaosTestingConfigProps {
  config: GoalOrientedTestConfig;
  onConfigChange: (config: GoalOrientedTestConfig) => void;
  disabled?: boolean;
}

export const ChaosTestingConfig = ({ config, onConfigChange, disabled = false }: ChaosTestingConfigProps) => {
  const updateConfig = (updates: Partial<GoalOrientedTestConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Configure the chaos testing parameters to suit your testing needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Test Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="60"
                value={config.duration}
                onChange={(e) => updateConfig({ duration: parseInt(e.target.value) || 1 })}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                How long the test should run (1-60 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionsPerMinute">Actions Per Minute</Label>
              <Input
                id="actionsPerMinute"
                type="number"
                min="1"
                max="60"
                value={config.actionsPerMinute}
                onChange={(e) => updateConfig({ actionsPerMinute: parseInt(e.target.value) || 1 })}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                How many actions to perform each minute (1-60)
              </p>
            </div>
          </div>

          {/* Exploration Strategy */}
          <div className="space-y-2">
            <Label htmlFor="explorationStrategy">Exploration Strategy</Label>
            <Select
              value={config.explorationStrategy}
              onValueChange={(value: any) => updateConfig({ explorationStrategy: value })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focused">Focused - Deep dive into specific areas</SelectItem>
                <SelectItem value="breadth-first">Breadth-First - Cover more ground systematically</SelectItem>
                <SelectItem value="vulnerability-hunting">Vulnerability Hunting - Focus on security</SelectItem>
                <SelectItem value="user-journey">User Journey - Follow typical user paths</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How the test should navigate and explore your application
            </p>
          </div>

          {/* Max Depth */}
          <div className="space-y-2">
            <Label htmlFor="maxDepth">Maximum Navigation Depth</Label>
            <div className="px-3">
              <Slider
                value={[config.maxDepth]}
                onValueChange={([value]) => updateConfig({ maxDepth: value })}
                max={10}
                min={1}
                step={1}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Shallow (1)</span>
                <span>Current: {config.maxDepth}</span>
                <span>Deep (10)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              How many levels deep to navigate from each starting point
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Data Generation
          </CardTitle>
          <CardDescription>
            Control how test data is generated and used during testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableRandomData">Random Data Generation</Label>
              <p className="text-xs text-muted-foreground">
                Fill forms with realistic random data
              </p>
            </div>
            <Switch
              id="enableRandomData"
              checked={config.enableRandomData}
              onCheckedChange={(checked) => updateConfig({ enableRandomData: checked })}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smartFormFilling">Smart Form Filling</Label>
              <p className="text-xs text-muted-foreground">
                Use AI to understand form context and fill appropriately
              </p>
            </div>
            <Switch
              id="smartFormFilling"
              checked={config.smartFormFilling}
              onCheckedChange={(checked) => updateConfig({ smartFormFilling: checked })}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="routeLearning">Route Learning</Label>
              <p className="text-xs text-muted-foreground">
                Remember successful navigation paths for future tests
              </p>
            </div>
            <Switch
              id="routeLearning"
              checked={config.routeLearning}
              onCheckedChange={(checked) => updateConfig({ routeLearning: checked })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Testing
          </CardTitle>
          <CardDescription>
            Enable advanced security vulnerability testing (use with caution)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Security tests should only be enabled on development or test environments. 
              Never run these on production systems.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableSqlInjection">SQL Injection Testing</Label>
              <p className="text-xs text-muted-foreground">
                Test for SQL injection vulnerabilities in forms
              </p>
            </div>
            <Switch
              id="enableSqlInjection"
              checked={config.enableSqlInjection}
              onCheckedChange={(checked) => updateConfig({ enableSqlInjection: checked })}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableXssTests">XSS Testing</Label>
              <p className="text-xs text-muted-foreground">
                Test for cross-site scripting vulnerabilities
              </p>
            </div>
            <Switch
              id="enableXssTests"
              checked={config.enableXssTests}
              onCheckedChange={(checked) => updateConfig({ enableXssTests: checked })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune the testing behavior and focus areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interest Weighting */}
          {config.interestWeighting && (
            <div className="space-y-4">
              <Label>Element Interest Weighting</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formsWeight" className="text-sm">Forms ({config.interestWeighting.forms})</Label>
                  <Slider
                    value={[config.interestWeighting.forms]}
                    onValueChange={([value]) => updateConfig({ 
                      interestWeighting: { ...config.interestWeighting!, forms: value }
                    })}
                    max={10}
                    min={0}
                    step={1}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buttonsWeight" className="text-sm">Buttons ({config.interestWeighting.buttons})</Label>
                  <Slider
                    value={[config.interestWeighting.buttons]}
                    onValueChange={([value]) => updateConfig({ 
                      interestWeighting: { ...config.interestWeighting!, buttons: value }
                    })}
                    max={10}
                    min={0}
                    step={1}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linksWeight" className="text-sm">Links ({config.interestWeighting.links})</Label>
                  <Slider
                    value={[config.interestWeighting.links]}
                    onValueChange={([value]) => updateConfig({ 
                      interestWeighting: { ...config.interestWeighting!, links: value }
                    })}
                    max={10}
                    min={0}
                    step={1}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="errorsWeight" className="text-sm">Error Areas ({config.interestWeighting.errors})</Label>
                  <Slider
                    value={[config.interestWeighting.errors]}
                    onValueChange={([value]) => updateConfig({ 
                      interestWeighting: { ...config.interestWeighting!, errors: value }
                    })}
                    max={10}
                    min={0}
                    step={1}
                    disabled={disabled}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher values mean the test will focus more on these element types
              </p>
            </div>
          )}

          {/* Focus Radius */}
          {config.focusRadius !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="focusRadius">Focus Radius ({config.focusRadius}%)</Label>
              <Slider
                value={[config.focusRadius]}
                onValueChange={([value]) => updateConfig({ focusRadius: value })}
                max={100}
                min={0}
                step={5}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                How far from the starting point to explore (0% = very focused, 100% = explore everywhere)
              </p>
            </div>
          )}

          {/* Memory Depth */}
          {config.memoryDepth !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="memoryDepth">Memory Depth</Label>
              <Input
                id="memoryDepth"
                type="number"
                min="1"
                max="100"
                value={config.memoryDepth}
                onChange={(e) => updateConfig({ memoryDepth: parseInt(e.target.value) || 1 })}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                How many successful action sequences to remember and potentially repeat
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
