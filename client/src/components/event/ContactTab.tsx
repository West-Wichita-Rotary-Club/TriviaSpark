import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Globe, Share2, Building2, AlertCircle } from "lucide-react";

interface ContactTabProps {
  event: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}

export function ContactTab({ event, onUpdate, isLoading }: ContactTabProps) {
  const parseJsonField = (value: unknown): Record<string, any> => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    if (typeof value === 'object') return (value as Record<string, any>) ?? {};
    return {};
  };

  const handleSocialLinksChange = (platform: string, url: string) => {
    const currentLinks = parseJsonField(event.socialLinks);
    const updatedLinks = { ...currentLinks, [platform]: url };
    onUpdate({ socialLinks: JSON.stringify(updatedLinks) });
  };

  const handleSponsorChange = (field: string, value: string) => {
    const currentSponsors = parseJsonField(event.sponsorInformation);
    const updatedSponsors = { ...currentSponsors, [field]: value };
    onUpdate({ sponsorInformation: JSON.stringify(updatedSponsors) });
  };

  const socialLinks = parseJsonField(event.socialLinks);
  const sponsorInfo = parseJsonField(event.sponsorInformation);

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={event.contactEmail || ''}
                onChange={(e) => onUpdate({ contactEmail: e.target.value })}
                data-testid="input-contact-email"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={event.contactPhone || ''}
                onChange={(e) => onUpdate({ contactPhone: e.target.value })}
                data-testid="input-contact-phone"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://yourorganization.com"
              value={event.websiteUrl || ''}
              onChange={(e) => onUpdate({ websiteUrl: e.target.value })}
              data-testid="input-website-url"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourpage"
                value={socialLinks.facebook || ''}
                onChange={(e) => handleSocialLinksChange('facebook', e.target.value)}
                data-testid="input-facebook"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/yourhandle"
                value={socialLinks.twitter || ''}
                onChange={(e) => handleSocialLinksChange('twitter', e.target.value)}
                data-testid="input-twitter"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourhandle"
                value={socialLinks.instagram || ''}
                onChange={(e) => handleSocialLinksChange('instagram', e.target.value)}
                data-testid="input-instagram"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/company/yourorg"
                value={socialLinks.linkedin || ''}
                onChange={(e) => handleSocialLinksChange('linkedin', e.target.value)}
                data-testid="input-linkedin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Sponsor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sponsorName">Main Sponsor Name</Label>
              <Input
                id="sponsorName"
                placeholder="Sponsor Company Name"
                value={sponsorInfo.name || ''}
                onChange={(e) => handleSponsorChange('name', e.target.value)}
                data-testid="input-sponsor-name"
              />
            </div>
            <div>
              <Label htmlFor="sponsorLogoUrl">Sponsor Logo URL</Label>
              <Input
                id="sponsorLogoUrl"
                placeholder="https://sponsor.com/logo.png"
                value={sponsorInfo.logoUrl || ''}
                onChange={(e) => handleSponsorChange('logoUrl', e.target.value)}
                data-testid="input-sponsor-logo"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="sponsorWebsite">Sponsor Website</Label>
            <Input
              id="sponsorWebsite"
              type="url"
              placeholder="https://sponsor.com"
              value={sponsorInfo.website || ''}
              onChange={(e) => handleSponsorChange('website', e.target.value)}
              data-testid="input-sponsor-website"
            />
          </div>
          <div>
            <Label htmlFor="sponsorDescription">Sponsor Description</Label>
            <Textarea
              id="sponsorDescription"
              placeholder="Brief description of the sponsor and their involvement..."
              value={sponsorInfo.description || ''}
              onChange={(e) => handleSponsorChange('description', e.target.value)}
              rows={3}
              data-testid="textarea-sponsor-description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Policies & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              placeholder="Explain your event cancellation policy..."
              value={event.cancellationPolicy || ''}
              onChange={(e) => onUpdate({ cancellationPolicy: e.target.value })}
              rows={3}
              data-testid="textarea-cancellation-policy"
            />
          </div>
          <div>
            <Label htmlFor="refundPolicy">Refund Policy</Label>
            <Textarea
              id="refundPolicy"
              placeholder="Explain your refund policy for participants..."
              value={event.refundPolicy || ''}
              onChange={(e) => onUpdate({ refundPolicy: e.target.value })}
              rows={3}
              data-testid="textarea-refund-policy"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}