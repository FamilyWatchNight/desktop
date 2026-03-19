/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type {StoreLike} from "../../../settings-manager";

class MockElectronStore implements StoreLike {
  private store: Record<string, unknown> = {};

    has(key: string): boolean {
        return key in this.store;
    }

    get(key: string, defaultValue?: unknown): unknown {
        return this.store[key] ?? defaultValue;
    }

    set(key: string, value: unknown): void {
        this.store[key] = value;
    }
}

export function createMockElectronStore(initialData?: Record<string, unknown>): StoreLike {
    const mockStore = new MockElectronStore();

    mockStore.set('settings', initialData ?? {});
    
    return mockStore;
}