# ADHD Dashboard - Frontend

Beautiful, Apple-inspired web interface for the ADHD Dashboard.

## Features

- ✅ **Frictionless Brain Dumps** - Capture thoughts instantly with AI categorization
- ✅ **Energy-Based Task Management** - Tasks adapt to your current energy level
- ✅ **Survival Mode** - Shows only top 3 tasks for overwhelming days
- ✅ **Quick Wins** - Highlights tasks under 5 minutes for dopamine hits
- ✅ **Apple-Quality Design** - Clean, minimal, accessible
- ✅ **Mobile-Responsive** - Works great on all devices
- ✅ **Dark Mode Support** - Easy on the eyes
- ✅ **Accessibility First** - Screen reader optimized, keyboard navigation

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Radix UI** - Accessible components
- **Framer Motion** - Smooth animations

## Getting Started

### Prerequisites

- Node.js 18+
- Running backend API (see `/backend`)

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   └── dashboard/    # Main dashboard
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities
│   │   ├── api.ts       # API client
│   │   └── utils.ts     # Helper functions
│   └── store/           # Global state
│       └── useStore.ts  # Zustand store
├── public/              # Static assets
└── tailwind.config.ts   # Tailwind configuration
```

## Key Components

### Brain Dump Input
Frictionless thought capture with AI suggestions:
```tsx
<BrainDumpInput />
```

### Energy Selector
Quick energy level selection:
```tsx
<EnergySelector currentLevel={energy} onChange={setEnergy} />
```

### Task Card
Displays a single task with completion action:
```tsx
<TaskCard task={task} onComplete={handleComplete} />
```

## Styling

The design system uses Apple-inspired colors and components:

- **Colors**: iOS-style blues, greens, oranges
- **Typography**: San Francisco font stack (system fonts)
- **Spacing**: Generous whitespace for reduced cognitive load
- **Borders**: Rounded corners (12-24px)
- **Shadows**: Subtle iOS-style shadows

## Accessibility

- ✅ WCAG 2.1 AAA compliant
- ✅ Screen reader optimized
- ✅ Keyboard navigation
- ✅ Reduced motion support
- ✅ High contrast mode
- ✅ Focus indicators

## API Integration

The frontend communicates with the backend via the API client (`src/lib/api.ts`):

```typescript
import { api } from '@/lib/api';

// Create brain dump
const { brainDump } = await api.createBrainDump(content);

// Get daily dashboard
const data = await api.getDailyDashboard(energyLevel, survivalMode);

// Complete task
await api.completeTask(taskId);
```

## State Management

Global state is managed with Zustand:

```typescript
import { useStore } from '@/store/useStore';

const { user, currentEnergy, setCurrentEnergy } = useStore();
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

Auto-deploys on every push to main.

### Other Platforms

Works on any platform that supports Next.js:
- Railway
- Render
- Netlify
- AWS Amplify

## Performance

- Target: <1.5 second page load
- Optimistic UI updates
- Code splitting
- Image optimization
- API response caching

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Development

### Code Style

```bash
npm run lint       # Run ESLint
npm run type-check # Run TypeScript check
```

### Hot Reload

Development server supports hot module replacement. Changes appear instantly.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](../LICENSE)
