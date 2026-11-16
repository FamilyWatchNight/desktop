/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';

import { Modal } from '../../src/renderer/components/elements/containers/Modal';

describe('Modal', () => {
  test('exposes its visible title and description as dialog semantics', () => {
    render(
      <Modal
        isOpen
        title="Edit profile"
        description="Changes are saved to this profile."
        onCancel={jest.fn()}
      >
        <p>Profile fields</p>
        <button type="button">Save</button>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const descriptionId = dialog.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      'Changes are saved to this profile.',
    );
    expect(dialog).toHaveTextContent('Profile fields');
  });

  test('does not associate a description when none is provided', () => {
    render(<Modal isOpen title="Edit profile" onCancel={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Edit profile' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  test('requests cancellation when Escape is pressed', () => {
    const onCancel = jest.fn();
    render(
      <Modal isOpen title="Edit profile" onCancel={onCancel}>
        <button type="button">Save</button>
      </Modal>,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('requests cancellation when the backdrop is clicked', () => {
    const onCancel = jest.fn();
    render(<Modal isOpen title="Edit profile" onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('modal-backdrop'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('allows callers to hide the close button when another action can close the dialog', () => {
    render(
      <Modal
        isOpen
        title="Edit profile"
        showCloseButton={false}
        onCancel={jest.fn()}
        rightActions={<button type="button">Cancel</button>}
      />,
    );

    expect(screen.queryByTestId('modal-close')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('focuses the first action control when the dialog opens', async () => {
    render(
      <Modal
        isOpen
        title="Edit profile"
        onCancel={jest.fn()}
        rightActions={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </>
        }
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
  });

  test('uses an explicitly focused action when one is marked autofocus', async () => {
    render(
      <Modal
        isOpen
        title="Delete role"
        onCancel={jest.fn()}
        rightActions={
          <>
            <button type="button">Cancel</button>
            <button type="button" autoFocus>
              Delete
            </button>
          </>
        }
      />,
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus());
  });

  test('keeps Tab navigation inside the dialog', async () => {
    render(
      <Modal
        isOpen
        title="Edit profile"
        onCancel={jest.fn()}
        rightActions={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </>
        }
      />,
    );

    const closeButton = screen.getByTestId('modal-close');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    closeButton.focus();
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true });

    expect(saveButton).toHaveFocus();

    fireEvent.keyDown(saveButton, { key: 'Tab' });

    expect(closeButton).toHaveFocus();
  });

  test('focuses the close control when the action area has no focusable control', async () => {
    render(<Modal isOpen title="Details" onCancel={jest.fn()} />);

    await waitFor(() => expect(screen.getByTestId('modal-close')).toHaveFocus());
  });

  test('uses the dialog itself as a focus fallback when the close button is hidden', async () => {
    render(<Modal isOpen title="Details" showCloseButton={false} onCancel={jest.fn()} />);

    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  });

  test('returns focus to the opener after the dialog closes', async () => {
    function Harness(): React.ReactElement {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open details
          </button>
          {isOpen && (
            <Modal
              isOpen
              title="Details"
              onCancel={() => setIsOpen(false)}
              rightActions={<button type="button">Done</button>}
            />
          )}
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open details' });
    opener.focus();
    fireEvent.click(opener);
    await screen.findByRole('dialog', { name: 'Details' });
    fireEvent.click(screen.getByTestId('modal-close'));

    await waitFor(() => expect(opener).toHaveFocus());
  });

  test('configures Escape and backdrop dismissal independently', () => {
    const onCancel = jest.fn();
    const { rerender } = render(
      <Modal isOpen title="Details" closeOnEscape={false} closeOnBackdrop onCancel={onCancel} />,
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    onCancel.mockClear();
    rerender(
      <Modal isOpen title="Details" closeOnEscape closeOnBackdrop={false} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('makes the background inert while the dialog is open', () => {
    const { container } = render(<Modal isOpen title="Details" onCancel={jest.fn()} />);

    expect(container).toHaveAttribute('inert');
  });
});
