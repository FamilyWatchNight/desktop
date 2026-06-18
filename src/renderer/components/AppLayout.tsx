/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiClient } from '../api-client';
import { useNavigation } from '../contexts/NavigationContext';
import { PAGE_IDS } from '../pages/PageIds';
import * as testing from '../testing';

import { HomeIcon, SettingsIcon, TasksIcon } from './elements/icons';
import { ExpandableMenuSection, MenuItem } from './elements/navigation';
import pageRegistry from './pageRegistry';
import BackgroundTasksPage from './pages/BackgroundTasksPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import StyleboardPage from './pages/StyleboardPage';

import '../styles/components/AppLayout.scss';

const apiClient = createApiClient();
testing.registerTestPages?.(pageRegistry);

interface TaskPayload {
  id: string;
  type: string;
  label: string;
  status: string;
  current?: number;
  max?: number;
  description?: string;
}

export default function Layout(): React.ReactElement {
  const { t } = useTranslation(['layout', 'common']);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentPage } = useNavigation();
  const [systemExpanded, setSystemExpanded] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskPayload | null>(null);
  const [queue, setQueue] = useState<TaskPayload[]>([]);

  const toggleMenu = (): void => setMenuOpen(!menuOpen);
  const closeMenu = (): void => setMenuOpen(false);

  const { ref: appRef, focusKey: appFocusKey } = useFocusable({
    focusKey: 'APPLICATION_ROOT',
    trackChildren: true,
  });
  const { ref: menuButtonRef, focused: menuButtonFocused } = useFocusable({
    focusKey: 'MAIN_MENU_BUTTON',
  });
  const { ref: menuRef, focusKey: menuFocusKey } = useFocusable({
    focusKey: 'MAIN_MENU',
    focusable: menuOpen,
    trackChildren: true,
  });
  const { ref: contentRef, focusKey: contentFocusKey } = useFocusable({
    focusKey: 'MAIN_CONTENT',
    focusable: !menuOpen,
    trackChildren: true,
  });

  useEffect(() => {
    if (menuOpen) {
      closeMenu();
      setFocus(contentFocusKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    setFocus(contentFocusKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const state = await apiClient.backgroundTasks.getBackgroundTasks();
        setActiveTask((state?.active as TaskPayload) ?? null);
        setQueue((state?.queue as TaskPayload[]) ?? []);
      } catch {
        setActiveTask(null);
        setQueue([]);
      }
    };
    void load();
    const unsubscribe = apiClient.backgroundTasks.onBackgroundTaskUpdate((state) => {
      setActiveTask((state?.active as TaskPayload) ?? null);
      setQueue((state?.queue as TaskPayload[]) ?? []);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const renderPage = (): React.ReactElement => {
    const registeredPage = pageRegistry.getPage(currentPage);
    if (registeredPage) {
      return React.createElement(registeredPage);
    }

    switch (currentPage) {
      case PAGE_IDS.HOME:
        return <HomePage />;
      case PAGE_IDS.SETTINGS:
        return <SettingsPage />;
      case PAGE_IDS.STYLEBOARD:
        return <StyleboardPage />;
      case PAGE_IDS.BACKGROUND_TASKS:
        return <BackgroundTasksPage />;
      default:
        return <HomePage />;
    }
  };

  const testMenuSection = testing.buildTestingMenu?.();

  return (
    <FocusContext.Provider value={appFocusKey}>
      <div ref={appRef} className="app-layout" data-testid="app-layout">
        <header className="app-header" data-testid="app-header">
          <button
            ref={menuButtonRef}
            className={'hamburger-button' + (menuButtonFocused ? ' has-nav-focus' : '')}
            data-testid="menu-toggle-button"
            onClick={toggleMenu}
            aria-label={t('toggleMenu')}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
          <h1 className="app-title" data-testid="app-title">
            {t('app.name', { ns: 'common' })}
          </h1>
        </header>
        {menuOpen && (
          <div className="menu-overlay" data-testid="menu-overlay" onClick={closeMenu}></div>
        )}
        <FocusContext.Provider value={menuFocusKey}>
          <div className={`side-menu ${menuOpen ? 'open' : ''}`} data-testid="side-menu">
            <nav inert={!menuOpen} className="menu-nav">
              <div ref={menuRef} className="menu-content">
                <div className="menu-nav-section">
                  <MenuItem
                    label={t('menu.home')}
                    icon={<HomeIcon width={20} height={20} />}
                    pageId={PAGE_IDS.HOME}
                    testId="menu-home"
                  />
                  <ExpandableMenuSection
                    label={t('menu.system')}
                    isExpanded={systemExpanded}
                    onExpandedChange={setSystemExpanded}
                    testId="menu-system-section"
                  >
                    <MenuItem
                      label={t('menu.backgroundTasks')}
                      icon={<TasksIcon width={20} height={20} />}
                      badge={
                        activeTask || queue.length > 0
                          ? (activeTask ? 1 : 0) + queue.length
                          : undefined
                      }
                      pageId={PAGE_IDS.BACKGROUND_TASKS}
                      testId="menu-background-tasks"
                    />
                    <MenuItem
                      label={t('menu.styleboard')}
                      icon={<TasksIcon width={20} height={20} />}
                      pageId={PAGE_IDS.STYLEBOARD}
                      testId="menu-styleboard"
                    />
                  </ExpandableMenuSection>
                  {testMenuSection}
                </div>
                <div className="menu-footer">
                  <MenuItem
                    label={t('menu.settings')}
                    icon={<SettingsIcon width={20} height={20} />}
                    pageId={PAGE_IDS.SETTINGS}
                    testId="menu-settings"
                  />
                </div>
              </div>
            </nav>
          </div>
        </FocusContext.Provider>
        <FocusContext.Provider value={contentFocusKey}>
          <div ref={contentRef} className="main-content" data-testid="main-content">
            {renderPage()}
          </div>
        </FocusContext.Provider>
      </div>
    </FocusContext.Provider>
  );
}
