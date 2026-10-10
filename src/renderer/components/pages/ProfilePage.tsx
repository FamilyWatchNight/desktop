/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License,
version 3.
*/

import React, { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createApiClient } from '../../api-client';
import type { CurrentProfileImage, UserDetails } from '../../api-client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../elements/buttons';
import { Group, Page, Section } from '../elements/containers';
import { SecureInput, TextInput } from '../elements/form';

import '../../styles/components/ProfilePage.scss';

const apiClient = createApiClient();
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

type Notice = { type: 'success' | 'error'; message: string };

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function createProfileImageUrl(image: CurrentProfileImage, invalidImageMessage: string): string {
  if (!image || typeof image !== 'object') {
    throw new Error(invalidImageMessage);
  }

  const maxBase64Length = Math.ceil(MAX_PROFILE_IMAGE_BYTES / 3) * 4;
  const isAllowedType = image.mimeType === 'image/png' || image.mimeType === 'image/jpeg';
  const isValidBase64 =
    typeof image.data === 'string' &&
    image.data.length > 0 &&
    image.data.length <= maxBase64Length &&
    image.data.length % 4 === 0 &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(image.data);

  if (!isAllowedType || !isValidBase64) {
    throw new Error(invalidImageMessage);
  }

  let binary: string;
  try {
    binary = atob(image.data);
  } catch {
    throw new Error(invalidImageMessage);
  }

  if (binary.length > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error(invalidImageMessage);
  }

  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes.buffer], { type: image.mimeType }));
}

export default function ProfilePage(): React.ReactElement {
  const { t } = useTranslation('profile');
  const { status: authStatus, session } = useAuth();
  const canUpdateProfile =
    authStatus === 'authenticated' && session?.permissions.includes('can-update-profile') === true;
  const [details, setDetails] = useState<UserDetails | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [savedDisplayName, setSavedDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImageUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setSelectedImageUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  useEffect(
    () => () => {
      if (savedImageUrl) URL.revokeObjectURL(savedImageUrl);
    },
    [savedImageUrl],
  );

  useEffect(() => {
    let active = true;

    if (!canUpdateProfile) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    const loadProfile = async (): Promise<void> => {
      try {
        const profileDetails = await apiClient.users.getCurrentDetails();
        if (!profileDetails) {
          throw new Error(t('errors.loadError'));
        }
        const profileImage = await apiClient.users.getCurrentProfileImage();
        if (!active) return;

        const initialDisplayName = profileDetails.profile?.displayName ?? '';
        setDetails(profileDetails);
        setDisplayName(initialDisplayName);
        setSavedDisplayName(initialDisplayName);
        setSavedImageUrl(
          profileImage
            ? createProfileImageUrl(profileImage, t('errors.imageTypeError'))
            : null,
        );
      } catch (error) {
        if (active) setNotice({ type: 'error', message: getErrorMessage(error) });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadProfile();
    return () => {
      active = false;
    };
  }, [canUpdateProfile, t]);

  const saveDisplayName = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    try {
      const updatedDisplayName = displayName.trim() || null;
      await apiClient.users.updateCurrentProfile({ displayName: updatedDisplayName });
      const normalizedName = updatedDisplayName ?? '';
      setDisplayName(normalizedName);
      setSavedDisplayName(normalizedName);
      setDetails((current) =>
        current
          ? {
              ...current,
              profile: {
                ...(current.profile ?? { displayName: null, profileImagePath: null }),
                displayName: updatedDisplayName,
              },
            }
          : current,
      );
      setNotice({ type: 'success', message: t('messages.displayNameSaved') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      setNotice({ type: 'error', message: t('errors.passwordMismatch') });
      return;
    }
    if (!password) {
      setNotice({ type: 'error', message: t('errors.passwordRequired') });
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      await apiClient.users.changeCurrentPassword(password);
      setDetails((current) =>
        current
          ? { ...current, account: { ...current.account, hasPassword: true } }
          : current,
      );
      setPassword('');
      setPasswordConfirmation('');
      setNotice({ type: 'success', message: t('messages.passwordSaved') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const removePassword = async (): Promise<void> => {
    if (!window.confirm(t('messages.confirmPasswordRemoval'))) return;

    setIsSaving(true);
    setNotice(null);
    try {
      await apiClient.users.removeCurrentPassword();
      setDetails((current) =>
        current
          ? { ...current, account: { ...current.account, hasPassword: false } }
          : current,
      );
      setNotice({ type: 'success', message: t('messages.passwordRemoved') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const selectImage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const image = event.target.files?.[0];
    if (!image) return;
    setNotice(null);
    if (!['image/png', 'image/jpeg'].includes(image.type)) {
      event.target.value = '';
      setSelectedImage(null);
      setNotice({ type: 'error', message: t('errors.imageTypeError') });
      return;
    }
    if (image.size > MAX_PROFILE_IMAGE_BYTES) {
      event.target.value = '';
      setSelectedImage(null);
      setNotice({
        type: 'error',
        message: t('errors.imageSizeError', { maxSize: 5 }),
      });
      return;
    }
    setSelectedImage(image);
  };

  const saveImage = async (): Promise<void> => {
    if (!selectedImage) return;

    setIsSaving(true);
    setNotice(null);
    try {
      const profileImagePath = await apiClient.users.saveCurrentProfileImage(
        new Uint8Array(await selectedImage.arrayBuffer()),
        selectedImage.type,
      );
      const savedImage = await apiClient.users.getCurrentProfileImage();
      setSavedImageUrl(
        savedImage ? createProfileImageUrl(savedImage, t('errors.imageTypeError')) : null,
      );
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setDetails((current) =>
        current
          ? {
              ...current,
              profile: {
                ...(current.profile ?? { displayName: null, profileImagePath: null }),
                profileImagePath,
              },
            }
          : current,
      );
      setNotice({ type: 'success', message: t('messages.imageSaved') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const removeImage = async (): Promise<void> => {
    if (!window.confirm(t('messages.confirmImageRemoval'))) return;

    setIsSaving(true);
    setNotice(null);
    try {
      await apiClient.users.deleteCurrentProfileImage();
      setSavedImageUrl(null);
      setSelectedImage(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setDetails((current) =>
        current?.profile
          ? { ...current, profile: { ...current.profile, profileImagePath: null } }
          : current,
      );
      setNotice({ type: 'success', message: t('messages.imageRemoved') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!canUpdateProfile) {
    return (
      <Page centered title={t('labels.title')} testId="page-profile">
        <p className="profile-message" data-testid="profile-access-denied">
          {t('errors.permissionDenied')}
        </p>
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page centered title={t('labels.title')} testId="page-profile">
        <p className="profile-message" role="status" data-testid="profile-loading">
          {t('messages.loading')}
        </p>
      </Page>
    );
  }

  const imageUrl = selectedImageUrl ?? savedImageUrl;
  const nameChanged = (displayName.trim() || '') !== savedDisplayName;

  return (
    <Page centered title={t('labels.title')} testId="page-profile">
      <p className="profile-username" data-testid="profile-username">
        {details?.account.username}
      </p>
      {notice && (
        <div
          className={`message ${notice.type}`}
          role={notice.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          data-testid="profile-status-message"
        >
          {notice.message}
        </div>
      )}

      <Section title={t('labels.displayNameSection')} testId="profile-display-name-section">
        <form className="profile-form" onSubmit={(event) => void saveDisplayName(event)}>
          <TextInput
            id="profile-display-name-input"
            name="displayName"
            label={t('labels.displayName')}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            disabled={isSaving}
            testId="profile-display-name-input"
          />
          <Group flow="row" flexWrap="wrap">
            <Button
              type="submit"
              testId="profile-display-name-save-button"
              disabled={isSaving || !nameChanged}
            >
              {t('labels.saveDisplayName')}
            </Button>
            <Button
              variant="secondary"
              testId="profile-display-name-reset-button"
              disabled={isSaving || !nameChanged}
              onClick={() => setDisplayName(savedDisplayName)}
            >
              {t('labels.reset')}
            </Button>
          </Group>
        </form>
      </Section>

      <Section title={t('labels.passwordSection')} testId="profile-password-section">
        <p className="profile-hint">
          {details?.account.hasPassword
            ? t('messages.passwordExists')
            : t('messages.passwordMissing')}
        </p>
        <form className="profile-form" onSubmit={(event) => void changePassword(event)}>
          <SecureInput
            id="profile-password-input"
            name="password"
            label={t('labels.newPassword')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            disabled={isSaving}
            testId="profile-password-input"
          />
          <SecureInput
            id="profile-password-confirmation-input"
            name="passwordConfirmation"
            label={t('labels.confirmPassword')}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
            disabled={isSaving}
            testId="profile-password-confirmation-input"
          />
          <Group flow="row" flexWrap="wrap">
            <Button
              type="submit"
              testId="profile-password-save-button"
              disabled={isSaving || !password}
            >
              {t('labels.savePassword')}
            </Button>
            {details?.account.hasPassword && (
              <Button
                variant="danger"
                testId="profile-password-remove-button"
                disabled={isSaving}
                onClick={() => void removePassword()}
              >
                {t('labels.removePassword')}
              </Button>
            )}
          </Group>
        </form>
      </Section>

      <Section title={t('labels.imageSection')} testId="profile-image-section">
        <div className="profile-image-row">
          {imageUrl ? (
            <img
              className="profile-image-preview"
              src={imageUrl}
              alt={t('labels.imageAlt')}
              data-testid="profile-image-preview"
            />
          ) : (
            <div className="profile-image-placeholder" data-testid="profile-image-placeholder">
              {t('messages.noImage')}
            </div>
          )}
          <div className="profile-image-controls">
            <label className="profile-file-label" htmlFor="profile-image-input">
              {t('labels.chooseImage')}
            </label>
            <input
              ref={imageInputRef}
              id="profile-image-input"
              type="file"
              accept="image/png,image/jpeg"
              onChange={selectImage}
              disabled={isSaving}
              data-testid="profile-image-input"
            />
            <p className="profile-hint">{t('messages.imageLimits', { maxSize: 5 })}</p>
            {selectedImage && (
              <p className="profile-hint" data-testid="profile-image-selected-name">
                {selectedImage.name}
              </p>
            )}
            <Group flow="row" flexWrap="wrap">
              <Button
                testId="profile-image-save-button"
                disabled={isSaving || !selectedImage}
                onClick={() => void saveImage()}
              >
                {t('labels.saveImage')}
              </Button>
              <Button
                variant="secondary"
                testId="profile-image-reset-button"
                disabled={isSaving || !selectedImage}
                onClick={() => {
                  setSelectedImage(null);
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }}
              >
                {t('labels.discardImage')}
              </Button>
              {details?.profile?.profileImagePath && (
                <Button
                  variant="danger"
                  testId="profile-image-remove-button"
                  disabled={isSaving}
                  onClick={() => void removeImage()}
                >
                  {t('labels.removeImage')}
                </Button>
              )}
            </Group>
          </div>
        </div>
      </Section>
    </Page>
  );
}
