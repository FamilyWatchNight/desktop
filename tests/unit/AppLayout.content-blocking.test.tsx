/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import Layout from '../../src/renderer/components/AppLayout';

jest.mock('@noriginmedia/norigin-spatial-navigation-core', () => ({
  setFocus: jest.fn(),
}));

jest.mock('@noriginmedia/norigin-spatial-navigation-react', () => {
  const actualReact = jest.requireActual('react') as typeof React;
  return {
    FocusContext: actualReact.createContext('test-focus-context'),
    useFocusable: () => ({
      ref: actualReact.createRef(),
      focusKey: 'test-focus-key',
    }),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../src/renderer/api-client', () => ({
  createApiClient: () => ({
    users: { hasUsers: async () => true },
    backgroundTasks: {
      getBackgroundTasks: async () => ({ active: null, queue: [] }),
      onBackgroundTaskUpdate: () => () => undefined,
    },
  }),
}));

jest.mock('../../src/renderer/contexts/AuthContext', () => ({
  useAuth: () => ({
    status: 'authenticated',
    session: { permissions: [] },
    logout: jest.fn(),
  }),
}));

jest.mock('../../src/renderer/contexts/NavigationContext', () => ({
  useNavigation: () => ({
    currentPage: 'home',
    navigateTo: jest.fn(),
    navigationMode: 'mouse',
  }),
}));

jest.mock('../../src/renderer/contexts/useNavigationFocusable', () => {
  const actualReact = jest.requireActual('react') as typeof React;
  return {
    useNavigationFocusable: () => ({
      ref: actualReact.createRef(),
      focused: false,
      domRef: actualReact.createRef(),
    }),
  };
});

jest.mock('../../src/renderer/testing', () => ({}));
jest.mock('../../src/renderer/components/pageRegistry', () => ({
  __esModule: true,
  default: { getPage: () => null },
}));

jest.mock('../../src/renderer/components/elements/icons', () => ({
  HomeIcon: () => null,
  ProfileIcon: () => null,
  SettingsIcon: () => null,
  TasksIcon: () => null,
}));

jest.mock('../../src/renderer/components/elements/navigation', () => {
  const actualReact = jest.requireActual('react') as typeof React;
  return {
    ExpandableMenuSection: ({ children }: { children?: React.ReactNode }) =>
      actualReact.createElement(actualReact.Fragment, null, children),
    MenuItem: () => null,
  };
});

jest.mock('../../src/renderer/components/FirstAdminUserOverlay', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/LoginOverlay', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/pages/BackgroundTasksPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/pages/HomePage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/pages/ProfilePage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/pages/SettingsPage', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../../src/renderer/components/pages/StyleboardPage', () => ({
  __esModule: true,
  default: () => null,
}));

test('makes main content inert when the AppLayout menu blocks content', async () => {
  render(<Layout />);

  const mainContent = screen.getByTestId('main-content');
  await waitFor(() => expect(mainContent).not.toHaveAttribute('inert'));

  fireEvent.click(screen.getByTestId('menu-toggle-button'));

  await waitFor(() => expect(mainContent).toHaveAttribute('inert'));
});
