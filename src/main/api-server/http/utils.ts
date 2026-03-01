/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Request, Response } from 'express';

/**
 * Wraps a response payload in a consistent success/error envelope.
 */
export function envelope(res: Response, data: unknown = null, error?: string): void {
  if (error) {
    res.json({ success: false, error });
  } else {
    res.json({ success: true, data });
  }
}

/**
 * Helper that wraps a handler in try/catch and automatically envelopes the
 * returned value. The handler can optionally use the response object directly
 * to short-circuit.
 */
export function route(
  handler: (req: Request, res: Response) => unknown
): (req: Request, res: Response) => void {
  return (req: Request, res: Response) => {
    try {
      const result = handler(req, res);
      // if handler already sent a response (using envelope directly), skip
      if (!res.headersSent) {
        envelope(res, result);
      }
    } catch (err) {
      envelope(res, null, (err as Error).message);
    }
  };
}
