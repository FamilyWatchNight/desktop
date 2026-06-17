import React from 'react';

export interface GroupContextValue {
  name?: string;
  type?: 'radio' | 'checkbox' | string;
  registerRadioId?: (id: string) => void;
  unregisterRadioId?: (id: string) => void;
  registerCheckboxId?: (id: string) => void;
  unregisterCheckboxId?: (id: string) => void;
}

export const GroupContext = React.createContext<GroupContextValue | null>(null);
