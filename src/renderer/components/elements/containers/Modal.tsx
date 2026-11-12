/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext } from '@noriginmedia/norigin-spatial-navigation-react';
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useNavigationFocusable } from '../../../contexts/useNavigationFocusable';
import { Button } from '../buttons';

function isFocusable(element: HTMLElement): boolean {
  if (
    element.tabIndex < 0 ||
    element.hidden ||
    element.matches(':disabled') ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.closest('[inert]')
  ) {
    return false;
  }

  let ancestor: HTMLElement | null = element;
  while (ancestor) {
    const style = window.getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    ancestor = ancestor.parentElement;
  }

  return true;
}

function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable="true"]',
    ),
  ).filter(isFocusable);
}

export interface ModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  onCancel: () => void;
}

export function Modal({
  isOpen,
  title,
  description,
  children,
  leftActions,
  rightActions,
  closeOnEscape = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  onCancel,
}: ModalProps): React.ReactElement | null {
  const { t } = useTranslation('common');
  const titleId = useId();
  const descriptionId = useId();
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const previousFocusKey = useRef<string | null>(null);
  const inertElements = useRef<Array<{ element: HTMLElement; wasInert: boolean }>>([]);
  const {
    ref: navigationRef,
    focusKey,
    focusSelf,
  } = useNavigationFocusable<HTMLElement>({
    trackChildren: true,
  });
  const setDialogRef = useCallback(
    (element: HTMLElement | null) => {
      dialogRef.current = element;
      navigationRef(element);
    },
    [navigationRef],
  );

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    previousActiveElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousFocusKey.current = getCurrentFocusKey() ?? null;

    inertElements.current = Array.from(document.body.children)
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== backdropRef.current,
      )
      .map((element) => {
        const wasInert = element.hasAttribute('inert');
        element.setAttribute('inert', '');
        return { element, wasInert };
      });

    return () => {
      inertElements.current.forEach(({ element, wasInert }) => {
        if (!wasInert) {
          element.removeAttribute('inert');
        }
      });
      inertElements.current = [];

      const opener = previousActiveElement.current;
      if (opener?.isConnected && !opener.closest('[inert]')) {
        opener.focus({ preventScroll: true });
      }
      if (previousFocusKey.current) {
        setFocus(previousFocusKey.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const explicitTarget = dialog.querySelector<HTMLElement>('[autofocus]');
      const actionTarget = getFocusableElements(actionsRef.current)[0];
      const closeTarget = dialog.querySelector<HTMLElement>('.modal__close');
      const target =
        (explicitTarget && isFocusable(explicitTarget) && explicitTarget) ||
        actionTarget ||
        (closeTarget && isFocusable(closeTarget) && closeTarget) ||
        dialog;

      focusSelf();
      target?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [focusSelf, isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <FocusContext.Provider value={focusKey}>
      <div
        ref={backdropRef}
        className="modal-backdrop"
        data-testid="modal-backdrop"
        onClick={(event) => {
          if (event.target === event.currentTarget && closeOnBackdrop) {
            onCancel();
          }
        }}
      >
        <section
          ref={setDialogRef}
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          data-testid="modal"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && closeOnEscape) {
              event.preventDefault();
              onCancel();
              return;
            }

            if (event.key !== 'Tab') return;

            const focusableElements = getFocusableElements(dialogRef.current);
            if (focusableElements.length === 0) {
              event.preventDefault();
              dialogRef.current?.focus({ preventScroll: true });
              return;
            }

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (!dialogRef.current?.contains(activeElement)) {
              event.preventDefault();
              (event.shiftKey ? last : first).focus({ preventScroll: true });
            } else if (event.shiftKey && activeElement === first) {
              event.preventDefault();
              last.focus({ preventScroll: true });
            } else if (!event.shiftKey && activeElement === last) {
              event.preventDefault();
              first.focus({ preventScroll: true });
            }
          }}
        >
          <header className="modal__header">
            <h2 className="modal__title" id={titleId}>
              {title}
            </h2>
            {showCloseButton && (
              <Button
                className="modal__close"
                variant="secondary"
                testId="modal-close"
                aria-label={t('button.close')}
                onClick={onCancel}
              >
                <span aria-hidden="true">×</span>
              </Button>
            )}
          </header>
          {description && (
            <div className="modal__description" id={descriptionId}>
              {description}
            </div>
          )}
          {children !== undefined && (
            <div className="modal__content" data-testid="modal-content">
              {children}
            </div>
          )}
          {(leftActions !== undefined || rightActions !== undefined) && (
            <div ref={actionsRef} className="modal__actions">
              {leftActions !== undefined && (
                <div className="modal__actions-left" data-testid="modal-actions-left">
                  {leftActions}
                </div>
              )}
              {rightActions !== undefined && (
                <div className="modal__actions-right" data-testid="modal-actions-right">
                  {rightActions}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </FocusContext.Provider>,
    document.body,
  );
}
