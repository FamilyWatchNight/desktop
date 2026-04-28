/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

/**
 * Normalizes a movie title for consistent searching and display.
 * Performs Unicode normalization and standardizes quotes and dashes.
 *
 * @param title - The original title to normalize
 * @returns The normalized title
 */
export function normalizeTitle(title: string): string {
  return title
    // 1. Normalize accented characters → base letters
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // 2. Normalize quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // 3. Normalize dashes
    .replace(/[–—―]/g, '-');
}