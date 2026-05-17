/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';

import AppLayout from './components/AppLayout';
import { NavigationProvider } from './contexts/NavigationContext';
import './styles/index.scss';

export default function App(): React.ReactElement {
  return (
    <NavigationProvider>
      <AppLayout />
    </NavigationProvider>
  );
}
