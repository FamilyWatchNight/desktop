/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

-- Migration: Create Movies table
CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  watchmode_id TEXT,
  tmdb_id TEXT,
  original_title TEXT,
  normalized_title TEXT,
  year TEXT,
  popularity REAL,
  has_video INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_watchmode_id ON movies(watchmode_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);