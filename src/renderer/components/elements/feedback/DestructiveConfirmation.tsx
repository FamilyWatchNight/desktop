/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../buttons';
import { Modal } from '../containers';

export interface DestructiveConfirmationProps {
  isOpen: boolean;
  title: React.ReactNode;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DestructiveConfirmation({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: DestructiveConfirmationProps): React.ReactElement | null {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      onCancel={onCancel}
      rightActions={
        <>
          <Button
            testId="destructive-confirmation-cancel"
            variant="secondary"
            onClick={onCancel}
            autoFocus
          >
            {t('button.cancel')}
          </Button>
          <Button testId="destructive-confirmation-confirm" variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
