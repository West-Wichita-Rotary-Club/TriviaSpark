# TriviaSpark Package Upgrade Plan

## Overview

This document outlines a comprehensive plan for upgrading npm packages and removing unused dependencies in the TriviaSpark project.

## Current Package Analysis (August 29, 2025)

### Package Update Summary

- **Total packages to update**: 70
- **Major version updates**: 13 packages
- **Minor/patch updates**: 57 packages

## 🚨 Critical Major Version Updates

These packages have breaking changes that require careful review:

### 1. React Ecosystem (React 18 → 19)

```json
"react": "^18.3.1" → "^19.1.1"
"react-dom": "^18.3.1" → "^19.1.1"
"@types/react": "^18.3.11" → "^19.1.12"
"@types/react-dom": "^18.3.1" → "^19.1.9"
```

**Risk**: HIGH - Breaking changes in React 19
**Action**: Test thoroughly, check for deprecated features

### 2. Express.js (v4 → v5)

```json
"express": "^4.21.2" → "^5.1.0"
"@types/express": "4.17.21" → "5.0.3"
```

**Risk**: HIGH - Major Express.js rewrite
**Action**: Review middleware compatibility, API changes

### 3. Node.js Types (Node 20 → 24)

```json
"@types/node": "20.16.11" → "24.3.0"
```

**Risk**: MEDIUM - May require Node.js runtime upgrade
**Action**: Verify Node.js compatibility

### 4. UI Component Libraries

```json
"date-fns": "^3.6.0" → "^4.1.0"
"vite": "^5.4.19" → "^7.1.3"
"tailwindcss": "^4.1.12" → "^4.1.12"
"zod": "^3.24.2" → "^4.1.5"
```

**Risk**: MEDIUM - API changes possible
**Action**: Check component implementations

### 5. Uppy (v4 → v5)

```json
"@uppy/aws-s3": "^4.3.2" → "^5.0.0"
"@uppy/core": "^4.5.3" → "^5.0.1"
"@uppy/dashboard": "^4.4.3" → "^5.0.1"
"@uppy/drag-drop": "^4.2.2" → "^5.0.1"
"@uppy/react": "^4.5.2" → "^5.0.2"
```

**Risk**: HIGH if file uploads are used
**Note**: Currently marked as unused - consider removal

## 📦 Unused Package Analysis

### Definitely Unused (Safe to Remove)

These packages are not imported anywhere in the codebase:

#### File Upload (Uppy)

```json
"@uppy/aws-s3": "^4.3.2",
"@uppy/core": "^4.5.3",
"@uppy/dashboard": "^4.4.3",
"@uppy/drag-drop": "^4.2.2",
"@uppy/file-input": "^4.2.2",
"@uppy/progress-bar": "^4.3.2",
"@uppy/react": "^4.5.2"
```

**Estimated savings**: ~2MB bundle size

#### Google Cloud/Storage

```json
"@google-cloud/storage": "^7.17.0",
"google-auth-library": "^10.2.1"
```

**Note**: May be needed for production file uploads

#### Authentication (Passport.js)

```json
"passport": "^0.7.0",
"passport-local": "^1.0.0",
"@types/passport": "^1.0.16",
"@types/passport-local": "^1.0.38"
```

**Note**: Not currently implemented, but may be planned

#### Session Management

```json
"express-session": "^1.18.1",
"connect-pg-simple": "^10.0.0",
"memorystore": "^1.6.7",
"@types/express-session": "^1.18.0"
```

**Note**: Session storage not currently used

### Potentially Unused (Investigate)

```json
"@jridgewell/trace-mapping": "^0.3.25",  // Build tool dependency
"framer-motion": "^11.13.1",             // Animation library
"next-themes": "^0.4.6",                 // Theme switching
"react-icons": "^5.4.0",                 // Icon library
"tw-animate-css": "^1.2.5",              // Animation utilities
"zod-validation-error": "^3.4.0",        // Error formatting
"nanoid": "^5.1.5"                       // ID generation
```

### DevDependencies (Replit-specific)

```json
"@replit/vite-plugin-cartographer": "^0.3.0",
"@replit/vite-plugin-runtime-error-modal": "^0.0.3"
```

**Action**: Remove if not deploying to Replit

## 📋 Upgrade Strategy

### Phase 1: Safe Updates (Low Risk)

Update packages with minor/patch versions only:

```bash
# Radix UI components (all minor updates)
npm update @radix-ui/react-*

# Development tools
npm update @tailwindcss/typography autoprefixer postcss
npm update drizzle-kit tsx esbuild
npm update lucide-react @hookform/resolvers
```

### Phase 2: Medium Risk Updates

```bash
# TanStack Query
npm update @tanstack/react-query

# Framer Motion (if keeping)
npm update framer-motion

# Node types (check Node.js version first)
npm update @types/node
```

### Phase 3: High Risk Updates (Test Thoroughly)

```bash
# React 19 upgrade
npm install react@^19.1.1 react-dom@^19.1.1 @types/react@^19.1.12 @types/react-dom@^19.1.9

# Express 5 upgrade
npm install express@^5.1.0 @types/express@^5.0.3

# Vite 7 upgrade
npm install vite@^7.1.3

# Zod v4 upgrade
npm install zod@^4.1.5
```

## 🗑️ Package Removal Plan

### Step 1: Remove Unused File Upload Dependencies

```bash
npm uninstall @uppy/aws-s3 @uppy/core @uppy/dashboard @uppy/drag-drop @uppy/file-input @uppy/progress-bar @uppy/react
```

### Step 2: Remove Unused Cloud Storage (if confirmed)

```bash
npm uninstall @google-cloud/storage google-auth-library
```

### Step 3: Remove Unused Authentication (if not planned)

```bash
npm uninstall passport passport-local @types/passport @types/passport-local
```

### Step 4: Remove Unused Session Management

```bash
npm uninstall express-session connect-pg-simple memorystore @types/express-session
```

### Step 5: Remove Development Dependencies

```bash
npm uninstall @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal
```

## 🧪 Testing Strategy

### Before Upgrading

1. **Create backup branch**: `git checkout -b package-updates-backup`
2. **Run current tests**: `npm run check && npm run build`
3. **Document current functionality**

### During Upgrade

1. **Update packages in phases** (not all at once)
2. **Test after each phase**
3. **Check for TypeScript errors**: `npm run check`
4. **Verify build**: `npm run build`
5. **Test application**: `npm run dev`

### After Upgrade

1. **Full application testing**
2. **Check all routes and features**
3. **Verify WebSocket functionality**
4. **Test database operations**
5. **Performance testing**

## 📊 Expected Benefits

### Bundle Size Reduction

- **Estimated savings**: 3-5MB by removing unused packages
- **Build time improvement**: Faster installation and builds

### Security Benefits

- **Updated dependencies**: Patches for known vulnerabilities
- **Reduced attack surface**: Fewer unused packages

### Performance Improvements

- **React 19**: Better performance and new features
- **Vite 7**: Improved build performance
- **Updated Radix UI**: Better accessibility and performance

## ⚠️ Risks and Mitigation

### High-Risk Updates

1. **React 19**: Breaking changes in concurrent features
2. **Express 5**: Middleware API changes
3. **Vite 7**: Build configuration changes

### Mitigation Strategies

1. **Gradual rollout**: Update in phases
2. **Thorough testing**: Manual and automated testing
3. **Rollback plan**: Keep backup branch
4. **Documentation**: Update any changed APIs

## 📅 Implementation Timeline

### Week 1: Preparation

- [ ] Create backup branch
- [ ] Remove unused packages
- [ ] Test current functionality

### Week 2: Safe Updates

- [ ] Update Radix UI components
- [ ] Update development tools
- [ ] Update minor dependencies

### Week 3: Medium Risk Updates

- [ ] Update TanStack Query
- [ ] Update utility libraries
- [ ] Test functionality

### Week 4: High Risk Updates

- [ ] Update React to v19
- [ ] Update Express to v5
- [ ] Update Vite to v7
- [ ] Comprehensive testing

## 🔍 Package Investigation Results

### Currently Used Packages (Keep)

- **React ecosystem**: Core functionality
- **Radix UI**: Component library
- **TanStack Query**: Data fetching
- **Drizzle ORM**: Database operations
- **Wouter**: Routing
- **Tailwind CSS**: Styling
- **OpenAI**: AI integration
- **WebSocket**: Real-time features

### Unused Packages (Remove)

- **Uppy suite**: File upload components
- **Passport.js**: Authentication middleware
- **Session management**: Express session handling
- **Replit plugins**: Development environment specific

### Investigation Needed

- **Framer Motion**: Check if animations are used
- **React Icons**: Verify icon usage vs Lucide
- **Nanoid**: Check if ID generation is needed

## 📝 Commands Summary

### Immediate Actions (Low Risk)

```bash
# Remove unused packages
npm uninstall @uppy/aws-s3 @uppy/core @uppy/dashboard @uppy/drag-drop @uppy/file-input @uppy/progress-bar @uppy/react @google-cloud/storage google-auth-library passport passport-local @types/passport @types/passport-local express-session connect-pg-simple memorystore @types/express-session @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal

# Update safe packages
ncu -u --target minor
npm install
```

### High-Risk Updates (Test Thoroughly)

```bash
# Major version updates (do separately)
npm install react@^19.1.1 react-dom@^19.1.1 @types/react@^19.1.12 @types/react-dom@^19.1.9
npm install express@^5.1.0 @types/express@^5.0.3
npm install vite@^7.1.3
npm install zod@^4.1.5
```

This plan provides a structured approach to modernizing the TriviaSpark dependencies while minimizing risk and maximizing benefits.
