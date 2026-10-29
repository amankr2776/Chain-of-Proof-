import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { NotificationBanner } from './components/common/NotificationBanner';
import { ArchitecturalGrid } from './components/common/ArchitecturalGrid';
import { Cinematic3DBackground } from './components/common/Cinematic3DBackground';
import { ROLE_CONFIGS } from './data/initialMockData';

import { ErrorBoundary } from './components/common/ErrorBoundary';

import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/views/DashboardView';
import { PassportStudioView } from './components/views/PassportStudioView';
import { DispositionConsoleView } from './components/views/DispositionConsoleView';
import { RecyclingHubView } from './components/views/RecyclingHubView';
import { ReconciliationView } from './components/views/ReconciliationView';
import { ChainExplorerView } from './components/views/ChainExplorerView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

export default function App() {
  const currentRole = useAppStore((state) => state.currentRole);
  const activeNavItem = useAppStore((state) => state.activeNavItem);
  const setActiveNavItem = useAppStore((state) => state.setActiveNavItem);
  const isLandingPage = useAppStore((state) => state.isLandingPage);

  // Strict Role Clearance Guard Effect
  useEffect(() => {
    const config = ROLE_CONFIGS[currentRole];
    if (config && !config.allowedNavItems.includes(activeNavItem)) {
      setActiveNavItem('dashboard');
      useAppStore.setState({
        notificationMessage: {
          title: 'ACCESS DENIED: ROLE CLEARANCE INSUFFICIENT',
          type: 'error',
          text: `Role clearance insufficient for module ${activeNavItem.toUpperCase()}. Redirecting to authorized Dashboard view.`,
        },
      });
    }
  }, [currentRole, activeNavItem, setActiveNavItem]);

  const renderActiveView = () => {
    switch (activeNavItem) {
      case 'dashboard':
        return <DashboardView />;
      case 'passport_studio':
        return <PassportStudioView />;
      case 'disposition_console':
        return <DispositionConsoleView />;
      case 'recycling_hub':
        return <RecyclingHubView />;
      case 'reconciliation':
        return <ReconciliationView />;
      case 'chain_explorer':
        return <ChainExplorerView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {isLandingPage ? (
          <motion.div
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen h-screen overflow-hidden"
          >
            <LandingPage />
          </motion.div>
        ) : (
          <motion.div
            key="app-workspace"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-screen w-screen overflow-hidden bg-[#EAEBEE] text-[#2A1B24] font-sans antialiased relative"
          >
            {/* Viewport Architectural Grid Overlay */}
            <ArchitecturalGrid />

            {/* Deep Aubergine Sidebar */}
            <Sidebar />

            {/* Main Workspace Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
              {/* Top Header */}
              <TopBar />

              {/* Dynamic Main Viewport */}
              <main className="flex-1 overflow-y-auto relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeNavItem}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="min-h-full"
                  >
                    <ErrorBoundary key={activeNavItem}>
                      {renderActiveView()}
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>

            {/* Global Notification Banner */}
            <NotificationBanner />
          </motion.div>
        )}
      </AnimatePresence>
    </QueryClientProvider>
  );
}


