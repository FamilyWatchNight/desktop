/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { useState } from 'react';

import commonLocale from '../../assets/locales/en/common.json';
import { DestructiveConfirmation } from '../../src/renderer/components/elements/feedback/DestructiveConfirmation';

i18n.addResourceBundle('en', 'common', commonLocale, true, true);

describe('DestructiveConfirmation', () => {
  test('focuses Cancel and closes after confirming without reporting cancellation', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    function Harness(): React.ReactElement {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <DestructiveConfirmation
          isOpen={isOpen}
          title="Delete role: Kids"
          description="Users assigned to this role will lose its permissions."
          confirmLabel="Delete"
          onConfirm={() => {
            onConfirm();
            setIsOpen(false);
          }}
          onCancel={() => {
            onCancel();
            setIsOpen(false);
          }}
        />
      );
    }

    render(<Harness />);

    const dialog = screen.getByRole('dialog', { name: 'Delete role: Kids' });
    const actionButtons = screen
      .getAllByRole('button')
      .filter((button) => button.textContent?.trim() !== '×');
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Delete' });

    expect(actionButtons.map((button) => button.textContent?.trim())).toEqual(['Cancel', 'Delete']);
    expect(cancelButton).toHaveClass('btn-secondary');
    expect(confirmButton).toHaveClass('btn-danger');
    await waitFor(() => expect(cancelButton).toHaveFocus());

    fireEvent.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('closes when canceled', async () => {
    function Harness(): React.ReactElement {
      const [isOpen, setIsOpen] = useState(true);

      return (
        <DestructiveConfirmation
          isOpen={isOpen}
          title="Delete role: Kids"
          description="Users assigned to this role will lose its permissions."
          confirmLabel="Delete"
          onConfirm={jest.fn()}
          onCancel={() => setIsOpen(false)}
        />
      );
    }

    render(<Harness />);
    const dialog = screen.getByRole('dialog', { name: 'Delete role: Kids' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });
});
