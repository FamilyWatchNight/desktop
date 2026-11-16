/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, { useState } from 'react';

import { Button } from '../../../components/elements/buttons';
import { Modal, Page, Section } from '../../../components/elements/containers';
import { DestructiveConfirmation } from '../../../components/elements/feedback';

export default function ModalTestPage(): React.ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [closeOnEscape, setCloseOnEscape] = useState(true);
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);
  const [outcome, setOutcome] = useState('No action yet');

  const openConfirmation = (): void => {
    setOutcome('No action yet');
    setIsConfirmationOpen(true);
  };

  return (
    <Page title="Modal Test" testId="page-modal-test">
      <Section title="Generic Modal">
        <Button testId="modal-open-button" onClick={() => setIsModalOpen(true)}>
          Open modal
        </Button>
        <Modal
          isOpen={isModalOpen}
          title="Sample modal"
          description="A generic modal with independent action areas."
          closeOnEscape={closeOnEscape}
          closeOnBackdrop={closeOnBackdrop}
          onCancel={() => setIsModalOpen(false)}
          leftActions={
            <Button testId="modal-left-action" variant="secondary">
              Help
            </Button>
          }
          rightActions={
            <>
              <Button
                testId="modal-cancel-button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                testId="modal-action-button"
                onClick={() => setOutcome('Modal action selected')}
              >
                Continue
              </Button>
            </>
          }
        >
          {Array.from({ length: 10 }, (_, index) => (
            <p key={index}>Additional modal content {index + 1}.</p>
          ))}
          <p data-testid="modal-content-end">End of modal content.</p>
        </Modal>
      </Section>

      <Section title="Destructive Confirmation">
        <Button testId="confirmation-open-button" onClick={openConfirmation}>
          Open confirmation
        </Button>
        <DestructiveConfirmation
          isOpen={isConfirmationOpen}
          title="Delete role: Demo role?"
          description="Deleting this role removes its permissions and cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => {
            setOutcome('Confirmation action selected');
            setIsConfirmationOpen(false);
          }}
          onCancel={() => {
            setOutcome('Confirmation canceled');
            setIsConfirmationOpen(false);
          }}
        />
      </Section>

      <Section title="Dismissal options">
        <label>
          Close with Escape
          <input
            type="checkbox"
            checked={closeOnEscape}
            onChange={(event) => setCloseOnEscape(event.target.checked)}
            data-testid="modal-escape-enabled"
          />
        </label>
        <label>
          Close with backdrop
          <input
            type="checkbox"
            checked={closeOnBackdrop}
            onChange={(event) => setCloseOnBackdrop(event.target.checked)}
            data-testid="modal-backdrop-enabled"
          />
        </label>
        <div role="status" data-testid="modal-test-outcome">
          {outcome}
        </div>
      </Section>
    </Page>
  );
}
