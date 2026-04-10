/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { app, Menu, Tray } from "electron";
import { registerIpcHandlers } from "./api-server/ipc";
import { createAppWindow } from "./window-manager";
import path from "path";
import express from "express";
import * as server from "./server";
import * as db from "./database";
import type { TestHooks } from "./testing/TestHooksImpl";
import { getTestHooks } from "./testing/TestHooksImpl";
import i18n from "./i18n";
import { settingsService } from "./api-server/ipc/instances";
import { initialize as initializeEventNotificationManager } from "./event-notification-manager";
import { createSystemContext } from './auth/context-manager';

let tray: Tray | null = null;
const webServer = express();
const t = i18n.t.bind(i18n);

if (process.env.NODE_ENV === "development") {
  require("electron-reloader")(module, {
    watchRenderer: false,
  });
}

function createTray(): void {
  const iconPath = path.join(
    app.getAppPath(),
    "assets",
    "images",
    "icon.png",
  );
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: t("menu.open-app"),
      click: () => {
        // use createAppWindow which focuses if already open
        createAppWindow();
      },
    },
    { type: "separator" },
    {
      label: t("menu.quit"),
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip(t("app.name", { ns: "common" }));
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    createAppWindow();
  });

  tray.on("double-click", () => {
    createAppWindow();
  });
}

app.on("ready", () => {
  const isDevMode = !app.isPackaged;
  const locale = process.env.NODE_ENV=="test" ? "test" : ( isDevMode ? "dev" : app.getLocale() );

  console.log(`App is ready. Locale: ${locale}, isDev: ${isDevMode}, NODE_ENV: ${process.env.NODE_ENV}`);

  i18n.changeLanguage(locale).then(() => {
    db.initDatabase();
    settingsService.initialize();
    createTray();
    registerIpcHandlers();

    const systemAuthContext = createSystemContext();

    try {
      const port = (settingsService.get("webPort", systemAuthContext) as number) || 3000;
      server.startServer(webServer, port);
      initializeEventNotificationManager();
    } catch (error) {
      console.error(
        "Failed to load settings, using default port:",
        (error as Error).message,
      );
      server.startServer(webServer, 3000);
      initializeEventNotificationManager();
    }
  });
});

app.on("window-all-closed", () => {});

if (process.env.NODE_ENV === "test") {
  // If NODE_ENV is set to 'test', register the hooks used for integration testing.
  // Node that build:main populates the testing directory with no-op implementations,
  // and build:main:for-integration-testing populates it with the active implementations,
  // so this code only runs when the testing-active scripts have been used.

  const appWithTestHooks = app as typeof app & {
    testHooks?: TestHooks;
  };

  appWithTestHooks.testHooks = getTestHooks();

  // TODO: Consider replacing the ipcMain handlers below with direct calls to the testHooks methods.

  // test:get-db-status is registered by registerIpcHandlers when NODE_ENV === 'test'

  (
    global as unknown as {
      __testCallbacks: {
        createTaskContext: () => import("./tasks/BackgroundTask").TaskContext;
      };
    }
  ).__testCallbacks = {
    createTaskContext: () => ({
      abortSignal: null as unknown as AbortSignal,
      reportProgress: () => {},
      isCancelled: () => false,
    }),
  };
}

app.on("before-quit", () => {
  db.closeDatabase();
});
