import{c as d,j as e}from"./index-CBK1NrN0.js";import{C as a,a as t,b as n,c as r}from"./card-B41-nYR3.js";import{B as s}from"./badge-DTFPvJD2.js";import{S as i}from"./separator-CuioNaKi.js";import{T as h,a as p,b as c,c as l,F as j}from"./tabs-g_CR1qCi.js";import g from"./header-H3xKAbp_.js";import u from"./footer-DcqJoHuu.js";import{S as m}from"./shield-HEah61dz.js";import{U as x}from"./users-B40IdAz5.js";import"./index-Buva8c6y.js";import"./Combination-qV88ypVh.js";import"./button-D3Wh1zJr.js";import"./avatar-ClrOyyae.js";import"./chevron-right-B8lNV2u4.js";import"./circle-keAvYtYt.js";import"./useQuery-ChBtYIvF.js";import"./useMutation-D36UegRK.js";import"./brain-BxYzVyfP.js";import"./log-out-SQfVP-Zg.js";/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]],N=d("code",v);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["rect",{width:"20",height:"8",x:"2",y:"2",rx:"2",ry:"2",key:"ngkwjq"}],["rect",{width:"20",height:"8",x:"2",y:"14",rx:"2",ry:"2",key:"iecqi9"}],["line",{x1:"6",x2:"6.01",y1:"6",y2:"6",key:"16zg32"}],["line",{x1:"6",x2:"6.01",y1:"18",y2:"18",key:"nzw8ys"}]],y=d("server",b);/**
 * @license lucide-react v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],o=d("zap",f),M=()=>e.jsxs("div",{className:"min-h-screen flex flex-col",children:[e.jsx(g,{}),e.jsx("main",{className:"flex-1",children:e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-4xl font-bold text-gray-900 mb-4","data-testid":"text-api-docs-title",children:"TriviaSpark API Documentation"}),e.jsx("p",{className:"text-xl text-gray-600 mb-6","data-testid":"text-api-docs-subtitle",children:"Complete reference for integrating with the TriviaSpark platform"}),e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs(s,{variant:"outline",className:"trivia-badge",children:[e.jsx(y,{className:"mr-1 h-3 w-3"}),"REST API"]}),e.jsxs(s,{variant:"outline",className:"trivia-badge",children:[e.jsx(o,{className:"mr-1 h-3 w-3"}),"WebSocket"]}),e.jsxs(s,{variant:"outline",className:"trivia-badge",children:[e.jsx(m,{className:"mr-1 h-3 w-3"}),"Session Auth"]})]})]}),e.jsxs(h,{defaultValue:"overview",className:"space-y-6",children:[e.jsxs(p,{className:"grid w-full grid-cols-6",children:[e.jsx(c,{value:"overview",children:"Overview"}),e.jsx(c,{value:"auth",children:"Authentication"}),e.jsx(c,{value:"events",children:"Events"}),e.jsx(c,{value:"questions",children:"Questions"}),e.jsx(c,{value:"participants",children:"Participants"}),e.jsx(c,{value:"realtime",children:"Real-time"})]}),e.jsxs(l,{value:"overview",className:"space-y-6",children:[e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(j,{className:"mr-2 h-5 w-5"}),"API Overview"]})}),e.jsxs(r,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Base URL"}),e.jsx("code",{className:"bg-gray-100 px-3 py-1 rounded",children:"https://your-domain.com/api"})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Authentication"}),e.jsx("p",{className:"text-gray-600",children:"Session-based authentication using HTTP-only cookies. Login required for most endpoints."})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Response Format"}),e.jsx("p",{className:"text-gray-600",children:"All responses are in JSON format with appropriate HTTP status codes."})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Error Handling"}),e.jsxs("p",{className:"text-gray-600",children:["Errors return JSON with an ",e.jsx("code",{children:"error"})," field and appropriate HTTP status codes."]})]})]})]}),e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsx(n,{children:"HTTP Status Codes"})}),e.jsx(r,{children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-green-700 mb-2",children:"Success Codes"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsxs("li",{children:[e.jsx("code",{children:"200"})," - OK"]}),e.jsxs("li",{children:[e.jsx("code",{children:"201"})," - Created"]}),e.jsxs("li",{children:[e.jsx("code",{children:"204"})," - No Content"]}),e.jsxs("li",{children:[e.jsx("code",{children:"304"})," - Not Modified"]})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-red-700 mb-2",children:"Error Codes"}),e.jsxs("ul",{className:"space-y-1 text-sm",children:[e.jsxs("li",{children:[e.jsx("code",{children:"400"})," - Bad Request"]}),e.jsxs("li",{children:[e.jsx("code",{children:"401"})," - Unauthorized"]}),e.jsxs("li",{children:[e.jsx("code",{children:"403"})," - Forbidden"]}),e.jsxs("li",{children:[e.jsx("code",{children:"404"})," - Not Found"]}),e.jsxs("li",{children:[e.jsx("code",{children:"500"})," - Internal Server Error"]})]})]})]})})]})]}),e.jsx(l,{value:"auth",className:"space-y-6",children:e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(m,{className:"mr-2 h-5 w-5"}),"Authentication Endpoints"]})}),e.jsxs(r,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/auth/login"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Authenticate user and create session"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "username": "string",
  "password": "string"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}`})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/auth/logout"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Destroy user session"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "success": true
}`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/auth/me"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get current authenticated user information"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-yellow-100 text-yellow-800",children:"PUT"}),e.jsx("code",{className:"text-sm",children:"/api/auth/profile"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Update user profile information"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "fullName": "string",
  "email": "string",
  "username": "string"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}`})]})]})]})]})]})}),e.jsx(l,{value:"events",className:"space-y-6",children:e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(x,{className:"mr-2 h-5 w-5"}),"Event Management Endpoints"]})}),e.jsxs(r,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get all events for authenticated user"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`[
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
]`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Create a new event manually"}),e.jsx("div",{className:"space-y-2",children:e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "title": "string",
  "description": "string",
  "eventType": "wine_dinner | corporate | party | education | fundraiser",
  "maxParticipants": "number",
  "difficulty": "easy | medium | hard",
  "eventDate": "2024-01-01T00:00:00.000Z",
  "eventTime": "string",
  "location": "string"
}`})]})})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events/generate"}),e.jsx(s,{variant:"secondary",className:"bg-purple-100 text-purple-800",children:"AI"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Generate complete event with AI-powered content"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "eventType": "wine_dinner | corporate | party | education | fundraiser",
  "participants": "number",
  "difficulty": "easy | medium | hard",
  "context": "string (optional)"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "event": { /* Event object */ },
  "questions": [ /* Array of generated questions */ ]
}`})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get specific event details"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-yellow-100 text-yellow-800",children:"PUT"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Update event information"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/start"}),e.jsx(s,{variant:"secondary",className:"bg-blue-100 text-blue-800",children:"Enhanced"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Start an event and lock team switching"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Notes:"}),e.jsxs("ul",{className:"text-sm text-gray-600 list-disc list-inside space-y-1",children:[e.jsx("li",{children:'Changes event status to "active"'}),e.jsx("li",{children:"Locks team switching for all participants"}),e.jsx("li",{children:"Participants can no longer change teams after this point"})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-orange-100 text-orange-800",children:"PATCH"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/status"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Update event status"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "status": "draft | active | completed | cancelled"
}`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/participants"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get all participants for an event"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events/join/:qrCode"}),e.jsx(s,{variant:"secondary",className:"bg-blue-100 text-blue-800",children:"Enhanced"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Join an event using QR code with team management"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "name": "string",
  "teamAction": "none | join | create",
  "teamIdentifier": "string (team name or table number)"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
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
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Notes:"}),e.jsxs("ul",{className:"text-sm text-gray-600 list-disc list-inside space-y-1",children:[e.jsx("li",{children:"Uses cookie-based participant recognition"}),e.jsx("li",{children:"Team switching allowed before event starts"}),e.jsx("li",{children:"Supports individual or team-based participation"}),e.jsx("li",{children:"Teams limited to 6 members by default"})]})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/teams"}),e.jsx(s,{variant:"secondary",className:"bg-green-100 text-green-800",children:"New"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get all teams for an event (host only)"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`[
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
]`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/teams"}),e.jsx(s,{variant:"secondary",className:"bg-green-100 text-green-800",children:"New"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Create a new team for an event"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "name": "string",
  "tableNumber": "number (optional)"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "id": "string",
  "eventId": "string",
  "name": "string",
  "tableNumber": "number",
  "maxMembers": "number",
  "createdAt": "2024-01-01T00:00:00.000Z"
}`})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events/:qrCode/teams-public"}),e.jsx(s,{variant:"secondary",className:"bg-green-100 text-green-800",children:"New"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get available teams for participants (public endpoint)"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`[
  {
    "id": "string",
    "name": "string",
    "tableNumber": "number",
    "maxMembers": "number",
    "participantCount": "number"
  }
]`})]})]})]})]})}),e.jsx(l,{value:"questions",className:"space-y-6",children:e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(N,{className:"mr-2 h-5 w-5"}),"Question Management Endpoints"]})}),e.jsxs(r,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/questions"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get all questions for an event"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`[
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
]`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/questions/generate"}),e.jsx(s,{variant:"secondary",className:"bg-purple-100 text-purple-800",children:"AI"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Generate questions for an existing event"}),e.jsx("div",{className:"space-y-2",children:e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "eventId": "string",
  "count": "number",
  "difficulty": "easy | medium | hard",
  "topics": ["string"] (optional)
}`})]})})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-yellow-100 text-yellow-800",children:"PUT"}),e.jsx("code",{className:"text-sm",children:"/api/questions/:id"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Update a specific question"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": "string",
  "explanation": "string",
  "timeLimit": "number",
  "points": "number"
}`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-red-100 text-red-800",children:"DELETE"}),e.jsx("code",{className:"text-sm",children:"/api/questions/:id"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Delete a specific question"})]})]})]})}),e.jsx(l,{value:"participants",className:"space-y-6",children:e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(x,{className:"mr-2 h-5 w-5"}),"Participant & Response Endpoints"]})}),e.jsxs(r,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/responses"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Submit an answer to a question"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "participantId": "string",
  "questionId": "string",
  "answer": "string",
  "responseTime": "number (optional)",
  "timeRemaining": "number (optional)"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "id": "string",
  "participantId": "string",
  "questionId": "string",
  "answer": "string",
  "isCorrect": "boolean",
  "points": "number",
  "responseTime": "number",
  "timeRemaining": "number",
  "submittedAt": "2024-01-01T00:00:00.000Z"
}`})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-yellow-100 text-yellow-800",children:"PUT"}),e.jsx("code",{className:"text-sm",children:"/api/participants/:id/team"}),e.jsx(s,{variant:"secondary",className:"bg-green-100 text-green-800",children:"New"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Switch a participant to a different team"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "teamId": "string (null to leave team)"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Authentication:"}),e.jsx("p",{className:"text-sm text-gray-600",children:"Uses participant token from cookie"})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "id": "string",
  "name": "string",
  "teamId": "string",
  "eventId": "string",
  "canSwitchTeam": "boolean",
  "lastActiveAt": "2024-01-01T00:00:00.000Z"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Restrictions:"}),e.jsxs("ul",{className:"text-sm text-gray-600 list-disc list-inside space-y-1",children:[e.jsx("li",{children:"Only works if canSwitchTeam is true"}),e.jsx("li",{children:"Team must have available capacity"}),e.jsx("li",{children:"Participant must own the token"})]})]})]})]}),e.jsx(i,{}),e.jsxs("div",{className:"bg-blue-50 p-4 rounded-lg",children:[e.jsx("h4",{className:"font-semibold text-blue-900 mb-3",children:"Additional MVP Endpoints (To Be Implemented)"}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("code",{children:"GET /api/events/:id/leaderboard"})," - Real-time event leaderboard with team scores"]}),e.jsxs("div",{children:[e.jsx("code",{children:"GET /api/participants/:id/responses"})," - Get participant's responses"]}),e.jsxs("div",{children:[e.jsx("code",{children:"PUT /api/participants/:id"})," - Update participant information"]}),e.jsxs("div",{children:[e.jsx("code",{children:"DELETE /api/participants/:id"})," - Remove participant from event"]}),e.jsxs("div",{children:[e.jsx("code",{children:"GET /api/events/:id/analytics"})," - Event performance analytics"]}),e.jsxs("div",{children:[e.jsx("code",{children:"PUT /api/teams/:id"})," - Update team information"]}),e.jsxs("div",{children:[e.jsx("code",{children:"DELETE /api/teams/:id"})," - Delete empty team"]})]})]})]})]})}),e.jsxs(l,{value:"realtime",className:"space-y-6",children:[e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsxs(n,{className:"flex items-center",children:[e.jsx(o,{className:"mr-2 h-5 w-5"}),"Real-time Features"]})}),e.jsxs(r,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"WebSocket Connection"}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Connect to real-time events using WebSocket"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Connection URL:"}),e.jsx("code",{className:"bg-gray-100 px-3 py-1 rounded",children:"ws://localhost:5000/ws"})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"WebSocket Events"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Participant Joined"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "participant_joined",
  "eventId": "string",
  "participant": {
    "id": "string",
    "name": "string",
    "teamName": "string"
  }
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Question Started"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "question_started",
  "eventId": "string",
  "question": {
    "id": "string",
    "question": "string",
    "options": ["string"],
    "timeLimit": "number"
  }
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response Submitted"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "response_submitted",
  "eventId": "string",
  "participantId": "string",
  "questionId": "string"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Leaderboard Updated"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
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
}`})]})]})]}),e.jsx(i,{}),e.jsxs("div",{className:"bg-purple-50 p-4 rounded-lg",children:[e.jsx("h4",{className:"font-semibold text-purple-900 mb-3",children:"Real-time Team Events"}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Team Member Joined"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "team_member_joined",
  "eventId": "string",
  "teamId": "string",
  "participant": {
    "id": "string",
    "name": "string"
  }
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Team Switched"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "team_switched",
  "eventId": "string",
  "participantId": "string",
  "oldTeamId": "string",
  "newTeamId": "string"
}`})]}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Team Scoring Update"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "team_score_updated",
  "eventId": "string",
  "teamId": "string",
  "totalPoints": "number",
  "rank": "number"
}`})]})]})]}),e.jsxs("div",{className:"bg-purple-50 p-4 rounded-lg mt-4",children:[e.jsx("h4",{className:"font-semibold text-purple-900 mb-3",children:"Additional Real-time Features (To Be Implemented)"}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("div",{children:[e.jsx("strong",{children:"Live Chat:"})," In-event participant messaging"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Question Timer:"})," Synchronized countdown for all participants"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Host Controls:"})," Real-time event management from host dashboard"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Team Collaboration:"})," Real-time team discussion during questions"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Live Polls:"})," Interactive polling between questions"]}),e.jsxs("div",{children:[e.jsx("strong",{children:"Screen Sharing:"})," Host can share content during event"]})]})]})]})]}),e.jsxs(a,{className:"trivia-card",children:[e.jsx(t,{children:e.jsx(n,{children:"Dashboard & Analytics"})}),e.jsxs(r,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-blue-100 text-blue-800",children:"GET"}),e.jsx("code",{className:"text-sm",children:"/api/dashboard/stats"}),e.jsx(s,{variant:"secondary",className:"bg-purple-100 text-purple-800",children:"AI"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Get dashboard statistics with AI insights"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Response:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
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
}`})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center space-x-2 mb-2",children:[e.jsx(s,{className:"bg-green-100 text-green-800",children:"POST"}),e.jsx("code",{className:"text-sm",children:"/api/events/:id/generate-copy"}),e.jsx(s,{variant:"secondary",className:"bg-purple-100 text-purple-800",children:"AI"})]}),e.jsx("p",{className:"text-gray-600 mb-3",children:"Generate promotional or thank you copy for events"}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-medium",children:"Request Body:"}),e.jsx("pre",{className:"bg-gray-100 p-3 rounded text-sm overflow-x-auto",children:`{
  "type": "promotional | thank_you"
}`})]})]})]})]})]})]})]})}),e.jsx(u,{})]});export{M as default};
