/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export async function callApi(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  const res = await fetch(path, {
    ...options,
    headers,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}
