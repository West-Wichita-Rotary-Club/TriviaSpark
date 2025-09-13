import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Server, Zap, Users, Shield, FileText } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const ApiDocs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-api-docs-title">
              TriviaSpark API Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-api-docs-subtitle">
              Complete reference for integrating with the TriviaSpark platform
            </p>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="trivia-badge">
                <Server className="mr-1 h-3 w-3" />
                REST API
              </Badge>
              <Badge variant="outline" className="trivia-badge">
                <Zap className="mr-1 h-3 w-3" />
                WebSocket
              </Badge>
              <Badge variant="outline" className="trivia-badge">
                <Shield className="mr-1 h-3 w-3" />
                Session Auth
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="realtime">Real-time</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    API Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="bg-gray-100 px-3 py-1 rounded">https://your-domain.com/api</code>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Authentication</h3>
                    <p className="text-muted-foreground">Session-based authentication using HTTP-only cookies. Login required for most endpoints.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Response Format</h3>
                    <p className="text-gray-600">All responses are in JSON format with appropriate HTTP status codes.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Error Handling</h3>
                    <p className="text-gray-600">Errors return JSON with an <code>error</code> field and appropriate HTTP status codes.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Status Codes */}
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle>HTTP Status Codes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Success Codes</h4>
                      <ul className="space-y-1 text-sm">
                        <li><code>200</code> - OK</li>
                        <li><code>201</code> - Created</li>
                        <li><code>204</code> - No Content</li>
                        <li><code>304</code> - Not Modified</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Error Codes</h4>
                      <ul className="space-y-1 text-sm">
                        <li><code>400</code> - Bad Request</li>
                        <li><code>401</code> - Unauthorized</li>
                        <li><code>403</code> - Forbidden</li>
                        <li><code>404</code> - Not Found</li>
                        <li><code>500</code> - Internal Server Error</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="auth" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Authentication Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Login */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/auth/login</code>
                    </div>
                    <p className="text-gray-600 mb-3">Authenticate user and create session</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "username": "string",
  "password": "string"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Logout */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/auth/logout</code>
                    </div>
                    <p className="text-gray-600 mb-3">Destroy user session</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "success": true
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Get Current User */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/auth/me</code>
                    </div>
                    <p className="text-gray-600 mb-3">Get current authenticated user information</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Update Profile */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                      <code className="text-sm">/api/auth/profile</code>
                    </div>
                    <p className="text-gray-600 mb-3">Update user profile information</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "fullName": "string",
  "email": "string",
  "username": "string"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Event Management Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Get Events */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events</code>
                    </div>
                    <p className="text-gray-600 mb-3">Get all events for authenticated user</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "eventType": "wine_dinner | corporate | party | education | fundraiser",
    "status": "draft | active | completed | cancelled",
    "hostId": "string",
    "maxParticipants": "number",
    "difficulty": "easy | medium | hard",
    "eventDate": "2024-01-01T00:00:00.000Z",
    "eventTime": "string",
    "location": "string",
    "qrCode": "string"
  }
]`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Create Event */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events</code>
                    </div>
                    <p className="text-gray-600 mb-3">Create a new event manually</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "title": "string",
  "description": "string",
  "eventType": "wine_dinner | corporate | party | education | fundraiser",
  "maxParticipants": "number",
  "difficulty": "easy | medium | hard",
  "eventDate": "2024-01-01T00:00:00.000Z",
  "eventTime": "string",
  "location": "string"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Generate Event with AI */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events/generate</code>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">AI</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Generate complete event with AI-powered content</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "eventType": "wine_dinner | corporate | party | education | fundraiser",
  "participants": "number",
  "difficulty": "easy | medium | hard",
  "context": "string (optional)"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "event": { /* Event object */ },
  "questions": [ /* Array of generated questions */ ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Get Single Event */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events/:id</code>
                    </div>
                    <p className="text-gray-600 mb-3">Get specific event details</p>
                  </div>

                  <Separator />

                  {/* Update Event */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                      <code className="text-sm">/api/events/:id</code>
                    </div>
                    <p className="text-gray-600 mb-3">Update event information</p>
                  </div>

                  <Separator />

                  {/* Start Event */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events/:id/start</code>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Enhanced</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Start an event and lock team switching</p>
                    <div>
                      <h5 className="font-medium">Notes:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        <li>Changes event status to "active"</li>
                        <li>Locks team switching for all participants</li>
                        <li>Participants can no longer change teams after this point</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  {/* Update Event Status */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-orange-100 text-orange-800">PATCH</Badge>
                      <code className="text-sm">/api/events/:id/status</code>
                    </div>
                    <p className="text-gray-600 mb-3">Update event status</p>
                    <div>
                      <h5 className="font-medium">Request Body:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "status": "draft | active | completed | cancelled"
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Get Event Participants */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events/:id/participants</code>
                    </div>
                    <p className="text-gray-600 mb-3">Get all participants for an event</p>
                  </div>

                  <Separator />

                  {/* Join Event */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events/join/:qrCode</code>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Enhanced</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Join an event using QR code with team management</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "name": "string",
  "teamAction": "none | join | create",
  "teamIdentifier": "string (team name or table number)"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "participant": {
    "id": "string",
    "name": "string",
    "teamId": "string",
    "eventId": "string",
    "isActive": "boolean",
    "canSwitchTeam": "boolean",
    "participantToken": "string"
  },
  "event": {
    "id": "string",
    "title": "string",
    "description": "string",
    "status": "string"
  },
  "returning": "boolean"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Notes:</h5>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          <li>Uses cookie-based participant recognition</li>
                          <li>Team switching allowed before event starts</li>
                          <li>Supports individual or team-based participation</li>
                          <li>Teams limited to 6 members by default</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />

                  {/* Get Event Teams */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events/:id/teams</code>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Get all teams for an event (host only)</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "id": "string",
    "eventId": "string",
    "name": "string",
    "tableNumber": "number",
    "maxMembers": "number",
    "participantCount": "number",
    "participants": [
      {
        "id": "string",
        "name": "string",
        "joinedAt": "2024-01-01T00:00:00.000Z",
        "canSwitchTeam": "boolean"
      }
    ]
  }
]`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Create Team */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events/:id/teams</code>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Create a new team for an event</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "name": "string",
  "tableNumber": "number (optional)"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "string",
  "eventId": "string",
  "name": "string",
  "tableNumber": "number",
  "maxMembers": "number",
  "createdAt": "2024-01-01T00:00:00.000Z"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Get Teams Public */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events/:qrCode/teams-public</code>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Get available teams for participants (public endpoint)</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "id": "string",
    "name": "string",
    "tableNumber": "number",
    "maxMembers": "number",
    "participantCount": "number"
  }
]`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Question Management Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Get Event Questions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/events/:id/questions</code>
                    </div>
                    <p className="text-gray-600 mb-3">Get all questions for an event</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {
    "id": "string",
    "eventId": "string",
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": "string",
    "explanation": "string",
    "orderIndex": "number",
    "timeLimit": "number",
    "points": "number"
  }
]`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Generate Questions with AI */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/questions/generate</code>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">AI</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Generate questions for an existing event</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "eventId": "string",
  "count": "number",
  "difficulty": "easy | medium | hard",
  "topics": ["string"] (optional)
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Update Question */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                      <code className="text-sm">/api/questions/:id</code>
                    </div>
                    <p className="text-gray-600 mb-3">Update a specific question</p>
                    <div>
                      <h5 className="font-medium">Request Body:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string",
  "explanation": "string",
  "timeLimit": "number",
  "points": "number"
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  {/* Delete Question */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-red-100 text-red-800">DELETE</Badge>
                      <code className="text-sm">/api/questions/:id</code>
                    </div>
                    <p className="text-gray-600 mb-3">Delete a specific question</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Participant & Response Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Submit Response */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/responses</code>
                    </div>
                    <p className="text-gray-600 mb-3">Submit an answer to a question</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "participantId": "string",
  "questionId": "string",
  "answer": "string",
  "responseTime": "number (optional)",
  "timeRemaining": "number (optional)"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "string",
  "participantId": "string",
  "questionId": "string",
  "answer": "string",
  "isCorrect": "boolean",
  "points": "number",
  "responseTime": "number",
  "timeRemaining": "number",
  "submittedAt": "2024-01-01T00:00:00.000Z"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Switch Participant Team */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800">PUT</Badge>
                      <code className="text-sm">/api/participants/:id/team</code>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Switch a participant to a different team</p>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-medium">Request Body:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "teamId": "string (null to leave team)"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Authentication:</h5>
                        <p className="text-sm text-gray-600">Uses participant token from cookie</p>
                      </div>
                      <div>
                        <h5 className="font-medium">Response:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "id": "string",
  "name": "string",
  "teamId": "string",
  "eventId": "string",
  "canSwitchTeam": "boolean",
  "lastActiveAt": "2024-01-01T00:00:00.000Z"
}`}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-medium">Restrictions:</h5>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          <li>Only works if canSwitchTeam is true</li>
                          <li>Team must have available capacity</li>
                          <li>Participant must own the token</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional MVP Endpoints Needed */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Additional MVP Endpoints (To Be Implemented)</h4>
                    <div className="space-y-2 text-sm">
                      <div><code>GET /api/events/:id/leaderboard</code> - Real-time event leaderboard with team scores</div>
                      <div><code>GET /api/participants/:id/responses</code> - Get participant's responses</div>
                      <div><code>PUT /api/participants/:id</code> - Update participant information</div>
                      <div><code>DELETE /api/participants/:id</code> - Remove participant from event</div>
                      <div><code>GET /api/events/:id/analytics</code> - Event performance analytics</div>
                      <div><code>PUT /api/teams/:id</code> - Update team information</div>
                      <div><code>DELETE /api/teams/:id</code> - Delete empty team</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Real-time Tab */}
            <TabsContent value="realtime" className="space-y-6">
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Real-time Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* WebSocket Connection */}
                  <div>
                    <h3 className="font-semibold mb-3">WebSocket Connection</h3>
                    <p className="text-gray-600 mb-3">Connect to real-time events using WebSocket</p>
                    <div>
                      <h5 className="font-medium">Connection URL:</h5>
                      <code className="bg-gray-100 px-3 py-1 rounded">ws://localhost:5000/ws</code>
                    </div>
                  </div>

                  <Separator />

                  {/* WebSocket Events */}
                  <div>
                    <h3 className="font-semibold mb-3">WebSocket Events</h3>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium">Participant Joined</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "participant_joined",
  "eventId": "string",
  "participant": {
    "id": "string",
    "name": "string",
    "teamName": "string"
  }
}`}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium">Question Started</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "question_started",
  "eventId": "string",
  "question": {
    "id": "string",
    "question": "string",
    "options": ["string"],
    "timeLimit": "number"
  }
}`}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium">Response Submitted</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "response_submitted",
  "eventId": "string",
  "participantId": "string",
  "questionId": "string"
}`}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium">Leaderboard Updated</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "leaderboard_updated",
  "eventId": "string",
  "leaderboard": [
    {
      "participantId": "string",
      "name": "string",
      "teamName": "string",
      "totalPoints": "number",
      "rank": "number"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Real-time Features */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">Real-time Team Events</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium">Team Member Joined</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "team_member_joined",
  "eventId": "string",
  "teamId": "string",
  "participant": {
    "id": "string",
    "name": "string"
  }
}`}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium">Team Switched</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "team_switched",
  "eventId": "string",
  "participantId": "string",
  "oldTeamId": "string",
  "newTeamId": "string"
}`}
                        </pre>
                      </div>

                      <div>
                        <h5 className="font-medium">Team Scoring Update</h5>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "team_score_updated",
  "eventId": "string",
  "teamId": "string",
  "totalPoints": "number",
  "rank": "number"
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold text-purple-900 mb-3">Additional Real-time Features (To Be Implemented)</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Live Chat:</strong> In-event participant messaging</div>
                      <div><strong>Question Timer:</strong> Synchronized countdown for all participants</div>
                      <div><strong>Host Controls:</strong> Real-time event management from host dashboard</div>
                      <div><strong>Team Collaboration:</strong> Real-time team discussion during questions</div>
                      <div><strong>Live Polls:</strong> Interactive polling between questions</div>
                      <div><strong>Screen Sharing:</strong> Host can share content during event</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dashboard & Analytics */}
              <Card className="trivia-card">
                <CardHeader>
                  <CardTitle>Dashboard & Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                      <code className="text-sm">/api/dashboard/stats</code>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">AI</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Get dashboard statistics with AI insights</p>
                    <div>
                      <h5 className="font-medium">Response:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "totalEvents": "number",
  "totalParticipants": "number",
  "avgEventDuration": "number",
  "topEventType": "string",
  "insights": [
    {
      "type": "performance | engagement | recommendation",
      "title": "string",
      "description": "string",
      "impact": "high | medium | low"
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">POST</Badge>
                      <code className="text-sm">/api/events/:id/generate-copy</code>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">AI</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">Generate promotional or thank you copy for events</p>
                    <div>
                      <h5 className="font-medium">Request Body:</h5>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`{
  "type": "promotional | thank_you"
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;