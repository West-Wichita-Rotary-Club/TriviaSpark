import React, { Suspense } from "react";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { WebSocketProvider } from "./contexts/WebSocketContext";

// Lazy load pages to prevent loading all components on initial load
const Home = React.lazy(() => import("@/pages/home"));
const NotFound = React.lazy(() => import("@/pages/not-found"));
const Login = React.lazy(() => import("@/pages/login"));
const Register = React.lazy(() => import("@/pages/register"));
const Events = React.lazy(() => import("@/pages/events"));
const EventManage = React.lazy(() => {
  console.log("Attempting to lazy load EventManage...");
  return import("@/pages/event-manage");
});
const EventTriviaManage = React.lazy(() => import("@/pages/event-trivia-manage"));
const Dashboard = React.lazy(() => import("@/pages/dashboard"));
const EventHost = React.lazy(() => import("@/pages/event-host"));
const EventJoin = React.lazy(() => import("@/pages/event-join"));
const Profile = React.lazy(() => import("@/pages/profile"));
const Admin = React.lazy(() => import("@/pages/Admin"));
const ApiDocs = React.lazy(() => import("@/pages/api-docs"));
const PresenterView = React.lazy(() => import("@/pages/presenter"));
const Insights = React.lazy(() => import("@/pages/insights"));
const DatabaseAnalyzer = React.lazy(() => import("@/pages/database-analyzer"));

// Lazy load layout components only when needed
const Header = React.lazy(() => import("@/components/layout/header"));
const Footer = React.lazy(() => import("@/components/layout/footer"));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-wine-600">Loading...</div>
  </div>
);

function App() {
  // Use Vite's BASE_URL to derive router base; '/' -> '' else trim trailing slash
  const baseUrl = import.meta.env.BASE_URL || '/';
  const basePath = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');

  return (
    <Router base={basePath}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Suspense fallback={<Loading />}>
                  <Switch>
                    {/* Home page */}
                    <Route path="/" component={Home} />

                    {/* Some hosts may request /index.html explicitly; treat as home */}
                    <Route path="/index.html">
                      {() => (import.meta.env.BASE_URL !== '/' ? <PresenterView /> : <Home />)}
                    </Route>
                    
                    {/* Demo routes - require event ID */}
                    <Route path="/demo/:id" component={PresenterView} />
                    <Route path="/demo">
                      {() => {
                        React.useEffect(() => {
                          window.location.replace("/");
                        }, []);
                        
                        return (
                          <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
                            <div className="text-wine-600">Redirecting to home...</div>
                          </div>
                        );
                      }}
                    </Route>
                    
                    {/* Auth routes */}
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    
                    {/* Dashboard and events */}
                    <Route path="/dashboard">
                      <>
                        <Header />
                        <Dashboard />
                        <Footer />
                      </>
                    </Route>
                    <Route path="/events" component={() => <Dashboard />} />
                    
                    {/* Database Analyzer */}
                    <Route path="/database-analyzer">
                      <>
                        <Header />
                        <DatabaseAnalyzer />
                        <Footer />
                      </>
                    </Route>
                    
                    {/* Event management route */}
                    <Route path="/events/:id/manage">
                      {(params) => {
                        console.log("EventManage route matched with params:", params);
                        return (
                          <>
                            <Header />
                            <EventManage eventId={params?.id} />
                            <Footer />
                          </>
                        );
                      }}
                    </Route>

                    {/* Full Trivia Management route */}
                    <Route path="/events/:id/manage/trivia">
                      {(params) => (
                        <>
                          {console.log('[Route Match] /events/:id/manage/trivia matched with', params)}
                          <Header />
                          <EventTriviaManage eventId={params?.id} />
                          <Footer />
                        </>
                      )}
                    </Route>
                    
                    {/* Specific Question Editing route */}
                    <Route path="/events/:id/manage/trivia/:questionId">
                      {(params) => (
                        <>
                          {console.log('[Route Match] /events/:id/manage/trivia/:questionId matched with', params)}
                          <Header />
                          <EventTriviaManage eventId={params?.id} questionId={params?.questionId} />
                          <Footer />
                        </>
                      )}
                    </Route>
                    
                    {/* Alternate trailing slash variant (some servers/users may hit this) */}
                    <Route path="/events/:id/manage/trivia/">
                      {(params) => (
                        <>
                          {console.log('[Route Match] /events/:id/manage/trivia/ matched with', params)}
                          <Header />
                          <EventTriviaManage eventId={params?.id} />
                          <Footer />
                        </>
                      )}
                    </Route>
                    
                    {/* Event hosting route */}
                    <Route path="/event/:id">
                      {(params) => (
                        <>
                          <Header />
                          <EventHost />
                          <Footer />
                        </>
                      )}
                    </Route>
                    
                    {/* Redirect /events/:id to /event/:id */}
                    <Route path="/events/:id">
                      {(params) => {
                        React.useEffect(() => {
                          if (params?.id) {
                            window.location.replace(`/event/${params.id}`);
                          }
                        }, [params?.id]);
                        
                        return (
                          <div className="min-h-screen bg-gradient-to-br from-wine-50 to-champagne-50 flex items-center justify-center">
                            <div className="text-wine-600">Redirecting to event view...</div>
                          </div>
                        );
                      }}
                    </Route>
                    
                    {/* Presenter route */}
                    <Route path="/presenter/:id">
                      {(params) => (
                        <>
                          <Header />
                          <PresenterView />
                          <Footer />
                        </>
                      )}
                    </Route>
                    
                    {/* Other routes */}
                    <Route path="/join/:qrCode">
                      {(params) => <EventJoin />}
                    </Route>
                    <Route path="/insights">
                      <>
                        <Header />
                        <Insights />
                        <Footer />
                      </>
                    </Route>
                    <Route path="/profile">
                      <>
                        <Header />
                        <Profile />
                        <Footer />
                      </>
                    </Route>
                    <Route path="/admin">
                      <>
                        <Header />
                        <Admin />
                        <Footer />
                      </>
                    </Route>
                    <Route path="/api-docs" component={ApiDocs} />
                    
                    {/* 404 route */}
                    <Route path="*" component={NotFound} />
                  </Switch>
                </Suspense>
              </main>
            </div>
          </TooltipProvider>
        </WebSocketProvider>
      </QueryClientProvider>
      <Toaster />
    </Router>
  );
}

export default App;
