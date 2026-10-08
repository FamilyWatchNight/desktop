/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3, or (at your option) any later version.
*/

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LoginRosterUser } from '../api-client';
import { createApiClient } from '../api-client';
import { useAuth } from '../contexts/AuthContext';

interface FloatingSelectionState {
  userId: number;
  sourceRect: DOMRect;
  targetRect: DOMRect;
  phase: 'source' | 'measuring' | 'target' | 'complete' | 'returning';
  isClosing: boolean;
  isReturning: boolean;
}

import { Button } from './elements/buttons';
import { Group, Page } from './elements/containers';
import { Message } from './elements/feedback';
import { SecureInput } from './elements/form';

import '../styles/components/LoginOverlay.scss';

const AVATAR_COLORS = [
  '--core-red',
  '--core-orange',
  '--core-gold',
  '--core-yellow',
  '--core-lime',
  '--core-green',
  '--core-teal',
  '--core-cyan',
  '--core-blue',
  '--core-purple',
  '--core-magenta',
  '--core-coral',
] as const;

export interface LoginOverlayProps {
  apiClient?: ReturnType<typeof createApiClient>;
}

export function getAvatarColorVariable(userId: number): string {
  const index = Math.abs(Math.trunc(userId)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getAvatarInitial(username: string): string {
  return username.trim().charAt(0).toUpperCase() || '?';
}

export default function LoginOverlay({ apiClient }: LoginOverlayProps): React.ReactElement {
  const { t } = useTranslation('auth');
  const { login, status: authStatus, error: authError, clearError } = useAuth();
  const [users, setUsers] = useState<LoginRosterUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [floatingSelection, setFloatingSelection] = useState<FloatingSelectionState | null>(null);
  const [password, setPassword] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [rosterError, setRosterError] = useState<unknown>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const client = apiClient ?? createApiClient();

  const loadUsers = async (): Promise<void> => {
    setIsLoadingUsers(true);
    setRosterError(null);
    try {
      setUsers(await client.users.getLoginRoster());
    } catch (error) {
      setRosterError(error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // The client is intentionally fixed for the lifetime of this overlay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedUserId !== null) passwordInputRef.current?.focus();
  }, [selectedUserId]);

  useEffect(() => {
    if (floatingSelection?.phase === 'complete') passwordInputRef.current?.focus();
  }, [floatingSelection?.phase]);

  useEffect(() => {
    if (authError) passwordInputRef.current?.focus();
  }, [authError]);

  useEffect(() => {
    if (isLoadingUsers || users.length !== 1) return;

    const [user] = users;
    if (selectedUserId === user.id) return;

    selectUser(user);
  }, [isLoadingUsers, users, selectedUserId]);

  useEffect(() => {
    if (floatingSelection?.phase !== 'measuring' || !measurementRef.current) return;

    const pageContainerRect = pageContainerRef.current?.getBoundingClientRect();
    const measurementRect = measurementRef.current.getBoundingClientRect();
    if (!pageContainerRect) return;

    const width = Math.min(
      Math.max(pageContainerRect.width * 0.8, 320),
      720,
      Math.max(pageContainerRect.width - 24, 1),
    );
    const targetRect = new DOMRect(
      Math.max(0, (pageContainerRect.width - width) / 2),
      Math.max(0, floatingSelection.sourceRect.top),
      width,
      measurementRect.height,
    );

    setFloatingSelection((currentSelection) =>
      currentSelection?.userId === floatingSelection.userId
        ? { ...currentSelection, targetRect, phase: 'source' }
        : currentSelection,
    );
  }, [floatingSelection?.phase, floatingSelection?.userId, floatingSelection?.sourceRect]);

  useEffect(() => {
    if (floatingSelection?.phase !== 'source') return;

    const frame = requestAnimationFrame(() => {
      setFloatingSelection((currentSelection) =>
        currentSelection?.userId === floatingSelection.userId
          ? { ...currentSelection, phase: 'target' }
          : currentSelection,
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [floatingSelection?.phase, floatingSelection?.userId]);

  const getRelativeRect = (element: HTMLElement): DOMRect => {
    const pageContainerElement = pageContainerRef.current;
    const pageContainerRect = pageContainerElement?.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    if (!pageContainerRect || !pageContainerElement) {
      return elementRect;
    }

    return new DOMRect(
      elementRect.left - pageContainerRect.left,
      elementRect.top - pageContainerRect.top,
      elementRect.width,
      elementRect.height,
    );
  };

  const selectUser = (user: LoginRosterUser): void => {
    clearError();
    setPassword('');
    if (!user.hasPassword) {
      void login(user.username, '').catch(() => undefined);
      return;
    }

    const chip = document.querySelector(`[data-login-user-id="${user.id}"]`) as HTMLElement | null;
    if (chip) {
      const pageContainerElement = pageContainerRef.current;
      const pageContainerRect = pageContainerElement?.getBoundingClientRect();
      const sourceRect = getRelativeRect(chip);
      const containerWidth = pageContainerRect?.width ?? window.innerWidth;
      const width = Math.min(
        Math.max(containerWidth * 0.8, 320),
        720,
        Math.max(containerWidth - 24, 1),
      );
      const targetRect = {
        left: Math.max(0, (containerWidth - width) / 2),
        top: Math.max(0, sourceRect.top),
        width,
        height: sourceRect.height,
      } as DOMRect;

      setFloatingSelection({
        userId: user.id,
        sourceRect,
        targetRect,
        phase: 'measuring',
        isClosing: false,
        isReturning: false,
      });
    }

    setSelectedUserId(user.id);
  };

  const cancelPassword = (): void => {
    const selectedUser = users.find((candidate) => candidate.id === selectedUserId);
    if (selectedUser) {
      const chip = document.querySelector(
        `[data-login-user-id="${selectedUser.id}"]`,
      ) as HTMLElement | null;
      if (chip) {
        const sourceRect = getRelativeRect(chip);

        setFloatingSelection((currentSelection) => ({
          userId: selectedUser.id,
          sourceRect: currentSelection?.sourceRect ?? sourceRect,
          targetRect:
            currentSelection?.targetRect ??
            new DOMRect(
              Math.max(0, sourceRect.left),
              Math.max(0, sourceRect.top),
              sourceRect.width,
              sourceRect.height,
            ),
          phase: 'complete',
          isClosing: false,
          isReturning: true,
        }));
        return;
      }
    }

    setSelectedUserId(null);
    setPassword('');
    clearError();
    setFloatingSelection(null);
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const user = users.find((candidate) => candidate.id === selectedUserId);
    if (!user) return;
    await login(user.username, password).catch(() => undefined);
  };

  const singlePasswordlessUser = !isLoadingUsers && users.length === 1 && !users[0].hasPassword;
  const isSubmitting = authStatus === 'loading' && selectedUserId !== null;
  const floatingUser = floatingSelection
    ? (users.find((user) => user.id === floatingSelection.userId) ?? null)
    : null;
  const isGhosting =
    selectedUserId !== null &&
    floatingSelection !== null &&
    floatingSelection.phase !== 'returning';
  const shouldHideOriginal =
    !!floatingSelection &&
    floatingSelection.userId === selectedUserId &&
    floatingSelection.phase !== 'returning';
  const shouldShowOriginalForm =
    selectedUserId !== null && (!floatingSelection || floatingSelection.userId !== selectedUserId);
  const shouldShowGhostForm =
    floatingSelection !== null &&
    floatingSelection.userId === selectedUserId &&
    (floatingSelection.phase === 'returning' || !floatingSelection.isClosing);
  const formatErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) return '';

    return error.message.replace(
      /^Error invoking remote method '[^']+':\s*(?:[A-Za-z]+Error:\s*)?/,
      '',
    );
  };
  const errorMessage = formatErrorMessage(authError) || formatErrorMessage(rosterError);
  const sourcePosition = floatingSelection?.sourceRect;
  const targetSize = floatingSelection?.targetRect;

  return (
    <div
      className="login-overlay"
      data-testid="login-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <Page
        ref={pageContainerRef}
        className="login-page"
        centered
        title={users.length > 1 ? t('login.title') : undefined}
        data-testid="login-page"
      >
        {users.length > 1 && <p className="login-description">{t('login.description')}</p>}
        {isLoadingUsers ? (
          <div role="status" data-testid="login-loading">
            {t('login.loading')}
          </div>
        ) : singlePasswordlessUser ? null : (
          <div
            ref={gridRef}
            className={`login-user-grid${isGhosting ? ' is-ghosting' : ''}`}
            data-testid="login-user-grid"
          >
            {users.map((user) => {
              const isSelected = selectedUserId === user.id;
              const isInteractive = !isSelected;
              const isSelectedCloneSource = shouldHideOriginal && user.id === selectedUserId;

              return (
                <div
                  className={`login-user-chip${isSelectedCloneSource ? ' is-hidden-selected' : ''}`}
                  data-testid={`login-user-${user.id}`}
                  data-login-user-id={String(user.id)}
                  key={user.id}
                  role={isInteractive ? 'button' : undefined}
                  tabIndex={isInteractive ? 0 : undefined}
                  onClick={() => {
                    if (isInteractive) selectUser(user);
                  }}
                  onKeyDown={(event) => {
                    if (!isInteractive) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectUser(user);
                    }
                  }}
                >
                  <LoginUserChipBody
                    user={user}
                    testId={isSelected ? 'login-selected-chip' : undefined}
                  />
                  {isSelected && shouldShowOriginalForm && (
                    <LoginPasswordForm
                      inputRef={passwordInputRef}
                      password={password}
                      isSubmitting={isSubmitting}
                      onPasswordChange={setPassword}
                      onCancel={cancelPassword}
                      onSubmit={submitPassword}
                      t={t}
                      canChooseAnotherProfile={users.length > 1}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {floatingUser && floatingSelection && floatingSelection.phase === 'measuring' && (
          <div
            ref={measurementRef}
            className="login-user-clone login-user-clone-measurement is-highlighted"
            aria-hidden="true"
            style={{
              left: `${targetSize?.left ?? sourcePosition?.left ?? 0}px`,
              top: `${targetSize?.top ?? sourcePosition?.top ?? 0}px`,
              width: `${targetSize?.width ?? sourcePosition?.width ?? 0}px`,
            }}
          >
            <LoginUserChipBody user={floatingUser} />
            <LoginPasswordForm
              password={password}
              isSubmitting={isSubmitting}
              onPasswordChange={setPassword}
              onCancel={cancelPassword}
              onSubmit={submitPassword}
              t={t}
            />
          </div>
        )}
        {floatingUser && floatingSelection && shouldShowGhostForm && (
          <div
            ref={cloneRef}
            className={`login-user-clone is-highlighted${floatingSelection.isClosing ? ' is-closing' : ' is-opening'}${floatingSelection.phase === 'measuring' ? ' is-measuring' : ''}`}
            data-testid="login-selection-ghost"
            style={{
              left:
                floatingSelection.phase === 'returning'
                  ? `${sourcePosition?.left ?? 0}px`
                  : floatingSelection.phase === 'target' || floatingSelection.phase === 'complete'
                    ? `${targetSize?.left ?? sourcePosition?.left ?? 0}px`
                    : `${sourcePosition?.left ?? 0}px`,
              top:
                floatingSelection.phase === 'returning'
                  ? `${sourcePosition?.top ?? 0}px`
                  : floatingSelection.phase === 'target' || floatingSelection.phase === 'complete'
                    ? `${targetSize?.top ?? sourcePosition?.top ?? 0}px`
                    : `${sourcePosition?.top ?? 0}px`,
              width:
                floatingSelection.phase === 'returning'
                  ? `${sourcePosition?.width ?? 0}px`
                  : floatingSelection.phase === 'target' || floatingSelection.phase === 'complete'
                    ? `${targetSize?.width ?? sourcePosition?.width ?? 0}px`
                    : `${sourcePosition?.width ?? 0}px`,
              height:
                floatingSelection.phase === 'measuring'
                  ? 'auto'
                  : floatingSelection.phase === 'returning'
                    ? `${sourcePosition?.height ?? 0}px`
                    : floatingSelection.phase === 'complete'
                      ? 'auto'
                      : floatingSelection.phase === 'target'
                        ? `${targetSize?.height ?? 0}px`
                        : `${sourcePosition?.height ?? 0}px`,
            }}
            onTransitionEnd={(event) => {
              if (event.target !== event.currentTarget) return;

              if (floatingSelection.phase === 'target') {
                setFloatingSelection((currentSelection) =>
                  currentSelection?.userId === floatingSelection.userId
                    ? { ...currentSelection, phase: 'complete' }
                    : currentSelection,
                );
              } else if (floatingSelection.phase === 'returning') {
                setSelectedUserId(null);
                setFloatingSelection(null);
                setPassword('');
                clearError();
              }
            }}
          >
            <LoginUserChipBody user={floatingUser} />
            {(floatingSelection.phase === 'complete' || floatingSelection.isReturning) && (
              <LoginPasswordForm
                inputRef={passwordInputRef}
                password={password}
                isSubmitting={isSubmitting}
                onPasswordChange={setPassword}
                onCancel={cancelPassword}
                onSubmit={submitPassword}
                t={t}
                errorMessage={errorMessage}
                isReturning={floatingSelection.isReturning}
                canChooseAnotherProfile={users.length > 1}
                onAnimationEnd={(event) => {
                  if (event.target !== event.currentTarget || !floatingSelection.isReturning) {
                    return;
                  }
                  setFloatingSelection((currentSelection) =>
                    currentSelection?.userId === selectedUserId
                      ? {
                          ...currentSelection,
                          phase: 'returning',
                          isClosing: true,
                          isReturning: false,
                        }
                      : currentSelection,
                  );
                }}
              />
            )}
          </div>
        )}
        {rosterError && (
          <Button
            type="button"
            variant="secondary"
            testId="login-retry-button"
            onClick={() => void loadUsers()}
          >
            {t('login.retry')}
          </Button>
        )}
      </Page>
    </div>
  );
}

interface LoginUserChipBodyProps {
  user: LoginRosterUser;
  errorMessage?: string;
  testId?: string;
}

function LoginUserChipBody({
  user,
  errorMessage,
  testId,
}: LoginUserChipBodyProps): React.ReactElement {
  return (
    <div className="login-user-summary" data-testid={testId}>
      <Avatar user={user} />
      <span className="login-display-name">{user.profile?.displayName || user.username}</span>
      {errorMessage && (
        <Message type="error" testId="login-error-message">
          {errorMessage}
        </Message>
      )}
    </div>
  );
}

interface LoginPasswordFormProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  password: string;
  isSubmitting: boolean;
  onPasswordChange: (password: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  t: (key: string) => string;
  testId?: string;
  errorMessage?: string;
  isReturning?: boolean;
  canChooseAnotherProfile?: boolean;
  onAnimationEnd?: () => void;
}

function LoginPasswordForm({
  inputRef,
  password,
  isSubmitting,
  onPasswordChange,
  onCancel,
  onSubmit,
  t,
  testId = 'login-password-form',
  errorMessage = '',
  isReturning = false,
  canChooseAnotherProfile = false,
  onAnimationEnd,
}: LoginPasswordFormProps): React.ReactElement {
  return (
    <form
      className={`login-password-form${isReturning ? ' is-returning' : ''}`}
      onSubmit={onSubmit}
      onAnimationEnd={onAnimationEnd}
      data-testid={testId}
    >
      <SecureInput
        ref={inputRef}
        id="login-password-input"
        name="password"
        label={t('login.password')}
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        autoComplete="current-password"
        testId="login-password-input"
      />
      {errorMessage && (
        <Message type="error" testId="login-error-message">
          {errorMessage}
        </Message>
      )}
      <div className="login-actions">
        <Group flow="row" size="small" testId="button-group-preview">
          {canChooseAnotherProfile && (
            <Button type="button" variant="link" testId="login-cancel-button" onClick={onCancel}>
              {t('login.cancel')}
            </Button>
          )}
          <Button type="submit" testId="login-submit-button" disabled={isSubmitting}>
            {isSubmitting ? t('login.submitting') : t('login.submit')}
          </Button>
        </Group>
      </div>
    </form>
  );
}

function Avatar({ user }: { user: LoginRosterUser }): React.ReactElement {
  return (
    <span
      className="login-avatar"
      style={{ backgroundColor: `var(${getAvatarColorVariable(user.id)})` }}
      aria-hidden="true"
    >
      {getAvatarInitial(user.username)}
    </span>
  );
}
