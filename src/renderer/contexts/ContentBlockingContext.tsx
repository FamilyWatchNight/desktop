/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

interface ContentBlockingRequestContextValue {
  updateRequest: (requestId: string, blocksContent: boolean) => void;
  removeRequest: (requestId: string) => void;
}

const ContentBlockingRequestContext = createContext<ContentBlockingRequestContextValue | null>(
  null,
);
const ContentBlockingStateContext = createContext(false);

export function ContentBlockingProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [requests, setRequests] = useState<ReadonlySet<string>>(() => new Set());

  const updateRequest = useCallback((requestId: string, blocksContent: boolean): void => {
    setRequests((current) => {
      if (current.has(requestId) === blocksContent) return current;
      const next = new Set(current);
      if (blocksContent) {
        next.add(requestId);
      } else {
        next.delete(requestId);
      }
      return next;
    });
  }, []);

  const removeRequest = useCallback((requestId: string): void => {
    setRequests((current) => {
      if (!current.has(requestId)) return current;
      const next = new Set(current);
      next.delete(requestId);
      return next;
    });
  }, []);

  const requestContext = useMemo(
    () => ({ updateRequest, removeRequest }),
    [removeRequest, updateRequest],
  );

  return (
    <ContentBlockingStateContext.Provider value={requests.size > 0}>
      <ContentBlockingRequestContext.Provider value={requestContext}>
        {children}
      </ContentBlockingRequestContext.Provider>
    </ContentBlockingStateContext.Provider>
  );
}

export function useContentBlockingRequest(blocksContent: boolean): void {
  const context = useContext(ContentBlockingRequestContext);
  const requestId = useId();

  useEffect(() => {
    if (!context) return undefined;
    context.updateRequest(requestId, blocksContent);
    return () => context.removeRequest(requestId);
  }, [blocksContent, context, requestId]);
}

export function useContentBlockingState(): boolean {
  return useContext(ContentBlockingStateContext);
}
