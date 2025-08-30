import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, FileText, Clock, Users, Accessibility, Utensils, Shirt, Monitor } from "lucide-react";

interface DetailsTabProps {
  event: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}

export function DetailsTab({ event, onUpdate, isLoading }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Prize Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Prize Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prizeInformation">Prize Details</Label>
            <Textarea
              id="prizeInformation"
              placeholder="Describe the prizes and rewards for participants..."
              value={event.prizeInformation || ''}
              onChange={(e) => onUpdate({ prizeInformation: e.target.value })}
              rows={4}
              data-testid="textarea-prize-information"
            />
            <p className="text-sm text-gray-500 mt-1">
              Detail what winners can expect to receive
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Event Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special instructions for participants..."
              value={event.specialInstructions || ''}
              onChange={(e) => onUpdate({ specialInstructions: e.target.value })}
              rows={3}
              data-testid="textarea-special-instructions"
            />
          </div>
          <div>
            <Label htmlFor="technicalRequirements">Technical Requirements</Label>
            <Textarea
              id="technicalRequirements"
              placeholder="Device requirements, internet speed, software needed..."
              value={event.technicalRequirements || ''}
              onChange={(e) => onUpdate({ technicalRequirements: e.target.value })}
              rows={3}
              data-testid="textarea-technical-requirements"
            />
          </div>
        </CardContent>
      </Card>

      {/* Registration & Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registration & Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
            <Input
              id="registrationDeadline"
              type="datetime-local"
              value={event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : ''}
              onChange={(e) => onUpdate({ registrationDeadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
              data-testid="input-registration-deadline"
            />
          </div>
        </CardContent>
      </Card>

      {/* Participant Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participant Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageRestrictions">Age Restrictions</Label>
              <Input
                id="ageRestrictions"
                placeholder="e.g., 18+ or All ages welcome"
                value={event.ageRestrictions || ''}
                onChange={(e) => onUpdate({ ageRestrictions: e.target.value })}
                data-testid="input-age-restrictions"
              />
            </div>
            <div>
              <Label htmlFor="dressCode">Dress Code</Label>
              <Input
                id="dressCode"
                placeholder="e.g., Business casual, Themed attire"
                value={event.dressCode || ''}
                onChange={(e) => onUpdate({ dressCode: e.target.value })}
                data-testid="input-dress-code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility & Accommodations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility & Accommodations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accessibilityInfo">Accessibility Information</Label>
            <Textarea
              id="accessibilityInfo"
              placeholder="Accessibility features and accommodations available..."
              value={event.accessibilityInfo || ''}
              onChange={(e) => onUpdate({ accessibilityInfo: e.target.value })}
              rows={3}
              data-testid="textarea-accessibility-info"
            />
          </div>
          <div>
            <Label htmlFor="dietaryAccommodations">Dietary Accommodations</Label>
            <Textarea
              id="dietaryAccommodations"
              placeholder="Food allergies, dietary restrictions, special meal options..."
              value={event.dietaryAccommodations || ''}
              onChange={(e) => onUpdate({ dietaryAccommodations: e.target.value })}
              rows={3}
              data-testid="textarea-dietary-accommodations"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}