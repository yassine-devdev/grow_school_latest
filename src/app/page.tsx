'use client';

import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import GlobalHeader from '@/components/layout/GlobalHeader';
import MainNavigationSidebar from '@/components/layout/MainNavigationSidebar';
import ContextualSidebar from '@/components/layout/ContextualSidebar';
import BottomDock from '@/components/layout/BottomDock';
import { APP_MODULES, OVERLAY_APPS } from '@/constants';
import CartOverlay from '@/components/overlays/CartOverlay';
import { CriticalErrorBoundary, PageErrorBoundary, ComponentErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';
import AsyncErrorBoundary from '@/components/error-boundaries/AsyncErrorBoundary';
import ConflictResolver from '@/components/conflict-resolution/ConflictResolver';

export default function Home() {
  const { activeModule, activeOverlay, closeOverlay, minimizeOverlay, isCartOpen } = useAppContext();

  const ActiveModuleComponent = APP_MODULES.find(m => m.id === activeModule)?.component || (() => null);
  const ActiveOverlayComponent = OVERLAY_APPS.find(o => o.id === activeOverlay)?.component || null;

  return (
    <CriticalErrorBoundary>
      <AsyncErrorBoundary>
        <div className="h-screen w-screen main-background text-gray-200 font-sans overflow-hidden flex flex-col">

          {/* Conflict Resolution UI */}
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <ConflictResolver autoResolve={true} showStats={false} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <PageErrorBoundary>
              <GlobalHeader />
            </PageErrorBoundary>

            {/* This main row contains both sidebars and the content, sitting between header and footer */}
            <main className="flex-1 flex overflow-hidden">
              <ComponentErrorBoundary>
                <ContextualSidebar />
              </ComponentErrorBoundary>

              {/* Main Content Area */}
              <div className="flex-1 p-4 overflow-hidden">
                <PageErrorBoundary>
                  <ActiveModuleComponent />
                </PageErrorBoundary>
              </div>

              <ComponentErrorBoundary>
                <MainNavigationSidebar />
              </ComponentErrorBoundary>
            </main>

            <ComponentErrorBoundary>
              <BottomDock />
            </ComponentErrorBoundary>
          </div>

          {/* Render overlay if active */}
          {ActiveOverlayComponent && activeOverlay && (
            <PageErrorBoundary>
              <ActiveOverlayComponent
                onClose={() => closeOverlay(activeOverlay)}
                onMinimize={() => minimizeOverlay(activeOverlay)}
              />
            </PageErrorBoundary>
          )}
          {isCartOpen && (
            <ComponentErrorBoundary>
              <CartOverlay />
            </ComponentErrorBoundary>
          )}
        </div>
      </AsyncErrorBoundary>
    </CriticalErrorBoundary>
  );
}
