# TriviaSpark Demo - GitHub Pages Deployment

This repository includes a static demo version of TriviaSpark that can be deployed to GitHub Pages.

## 🚀 Live Demo

The demo is automatically deployed to GitHub Pages at: `https://west-wichita-rotary-club.github.io/TriviaSpark/`

## 📁 Project Structure

- **`/docs`** - Static build output for GitHub Pages
- **`client/src/pages/presenter.tsx`** - Unified presenter component with demo mode support
- **`client/src/data/demoData.ts`** - Static demo data (event, questions, fun facts)
- **`.github/workflows/deploy.yml`** - GitHub Actions workflow for automatic deployment

## 🛠️ Building the Static Site

To build the static demo site locally:

```bash
npm run build:static
```

This command:

1. Sets environment variables for production and static build
2. Builds the React app with Vite
3. Outputs static files to the `/docs` directory
4. Configures the correct base path for GitHub Pages (/TriviaSpark/)

## 🔧 GitHub Pages Configuration

### Automatic Deployment

The repository is configured with a GitHub Actions workflow that:

- Triggers on pushes to the `main` branch
- Builds the static site
- Deploys to GitHub Pages automatically

### Manual GitHub Pages Setup

If setting up manually:

1. Go to repository Settings > Pages
2. Set Source to "Deploy from a branch"
3. Select Branch: `main` and Folder: `/docs`
4. Click Save

## 📱 Demo Features

The static demo includes:

- **Standalone Experience**: No backend dependencies
- **Static Data**: Embedded questions and fun facts
- **Full Presenter Interface**: Complete trivia presentation flow
- **Mobile Responsive**: Works on all device sizes
- **No Authentication**: Ready to share without login requirements

## 🎯 Demo Content

The demo features a wine country trivia event with:

- 5 trivia questions about wine, geography, and local facts
- Interactive timer system
- Answer explanations
- Fun facts about the Pacific Northwest and Rotary Club

## 🔗 Direct Access Routes

- **Main Demo**: `/demo` - Default demo experience

## 🚀 TriviaSpark Platform

This demo showcases the TriviaSpark platform capabilities:

- Real-time trivia hosting
- Team management
- Interactive presentations
- Event analytics and insights
- Custom branding options

For the full platform experience with user accounts, real-time features, and event management, visit the main TriviaSpark application.
