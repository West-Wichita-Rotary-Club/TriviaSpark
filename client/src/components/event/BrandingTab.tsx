import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, Palette, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandingTabProps {
  event: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}

export function BrandingTab({ event, onUpdate, isLoading }: BrandingTabProps) {
  const { toast } = useToast();
  const [generatingCopy, setGeneratingCopy] = useState(false);

  const handleGenerateAICopy = async (type: 'promotional' | 'welcome' | 'thankyou' | 'rules') => {
    setGeneratingCopy(true);
    try {
      const response = await fetch(`/api/events/${event.id}/generate-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate copy');
      }

      const data = await response.json();
      
      // Update the appropriate field based on type
      const field = type === 'promotional' ? 'eventCopy' : 
                   type === 'welcome' ? 'welcomeMessage' :
                   type === 'thankyou' ? 'thankYouMessage' : 'eventRules';
      
      onUpdate({ [field]: data.copy });
      
      toast({
        title: "AI Copy Generated",
        description: `Generated ${type} content successfully!`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI copy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingCopy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Visual Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logoUrl">Event Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                value={event.logoUrl || ''}
                onChange={(e) => onUpdate({ logoUrl: e.target.value })}
                data-testid="input-logo-url"
              />
              <p className="text-sm text-gray-500 mt-1">Upload your event logo for branding</p>
            </div>
            <div>
              <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
              <Input
                id="backgroundImageUrl"
                placeholder="https://example.com/background.jpg"
                value={event.backgroundImageUrl || ''}
                onChange={(e) => onUpdate({ backgroundImageUrl: e.target.value })}
                data-testid="input-background-url"
              />
              <p className="text-sm text-gray-500 mt-1">Background image for event screens</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={event.primaryColor || '#7C2D12'}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="w-16 h-10 border rounded cursor-pointer"
                  data-testid="input-primary-color"
                />
                <Input
                  placeholder="#7C2D12"
                  value={event.primaryColor || '#7C2D12'}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={event.secondaryColor || '#FEF3C7'}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  className="w-16 h-10 border rounded cursor-pointer"
                  data-testid="input-secondary-color"
                />
                <Input
                  placeholder="#FEF3C7"
                  value={event.secondaryColor || '#FEF3C7'}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                placeholder="Inter"
                value={event.fontFamily || 'Inter'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                data-testid="input-font-family"
              />
            </div>
          </div>
          
          {/* Theme Preview */}
          <div className="p-4 border rounded-lg" style={{
            backgroundColor: event.secondaryColor || '#FEF3C7',
            fontFamily: event.fontFamily || 'Inter'
          }}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: event.primaryColor || '#7C2D12' }}>
                {event.title || 'Your Event Title'}
              </h3>
              <Badge style={{
                backgroundColor: event.primaryColor || '#7C2D12',
                color: 'white'
              }}>
                Theme Preview
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Generated Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Copy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="eventCopy">Promotional Event Copy</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAICopy('promotional')}
                disabled={generatingCopy}
                data-testid="button-generate-promotional"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {generatingCopy ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            <Textarea
              id="eventCopy"
              placeholder="AI will generate engaging promotional copy for your event..."
              value={event.eventCopy || ''}
              onChange={(e) => onUpdate({ eventCopy: e.target.value })}
              rows={4}
              data-testid="textarea-event-copy"
            />
          </div>

          {/* Welcome Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAICopy('welcome')}
                disabled={generatingCopy}
                data-testid="button-generate-welcome"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate
              </Button>
            </div>
            <Textarea
              id="welcomeMessage"
              placeholder="Welcome message shown to participants when they join..."
              value={event.welcomeMessage || ''}
              onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
              rows={3}
              data-testid="textarea-welcome-message"
            />
          </div>

          {/* Thank You Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="thankYouMessage">Thank You Message</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAICopy('thankyou')}
                disabled={generatingCopy}
                data-testid="button-generate-thankyou"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate
              </Button>
            </div>
            <Textarea
              id="thankYouMessage"
              placeholder="Thank you message shown after event completion..."
              value={event.thankYouMessage || ''}
              onChange={(e) => onUpdate({ thankYouMessage: e.target.value })}
              rows={3}
              data-testid="textarea-thank-you-message"
            />
          </div>

          {/* Event Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="eventRules">Event Rules</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAICopy('rules')}
                disabled={generatingCopy}
                data-testid="button-generate-rules"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate
              </Button>
            </div>
            <Textarea
              id="eventRules"
              placeholder="Clear rules and guidelines for participants..."
              value={event.eventRules || ''}
              onChange={(e) => onUpdate({ eventRules: e.target.value })}
              rows={4}
              data-testid="textarea-event-rules"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}