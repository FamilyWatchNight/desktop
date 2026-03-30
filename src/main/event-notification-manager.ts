/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import * as backgroundTaskManager from './background-task-manager';
import { broadcastIpc, broadcastHttp } from './api-server';

export function initialize(): void {
  backgroundTaskManager.setNotifyFn((state) => {
    broadcastIpc('background-task-update', state);
    broadcastHttp('background-task-update', state);
  });
}