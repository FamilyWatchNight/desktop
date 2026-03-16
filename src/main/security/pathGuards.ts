import fs from "fs/promises";
import os from "os";
import path from "path";
import { app } from "electron";

/**
 * Safely joins path segments while preventing path traversal.
 */
export function safeJoin(base: string, ...segments: string[]): string {
  const resolvedBase = path.resolve(base);
  const resolvedPath = path.resolve(resolvedBase, ...segments);

  const relative = path.relative(resolvedBase, resolvedPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path traversal detected");
  }

  return resolvedPath;
}

/**
 * Ensures the resolved real filesystem path does not escape the allowed root.
 */
export async function assertNoSymlinkEscape(
  targetPath: string,
  allowedRoot: string,
): Promise<void> {
  const realTarget = await fs.realpath(targetPath).catch(() => targetPath);
  assertNormalizedAbsolute(realTarget);

  const realRoot = await fs.realpath(allowedRoot).catch(() => allowedRoot);
  assertNormalizedAbsolute(realRoot);

  const relative = path.relative(realRoot, realTarget);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Symlink escape detected: ${targetPath}`);
  }
}

/**
 * Ensures that the provided path is fully normalized and absolute
 * @param targetPath the path to validate
 * @throws if the path is not fully normalized and absolute
 */
function assertNormalizedAbsolute(targetPath: string) {
  const resolved = path.resolve(targetPath);

  if (resolved !== targetPath) {
    throw new Error(
      `Expected fully normalized absolute path but got: ${targetPath}`,
    );
  }
}

/**
 * Throws if the provided path resolves outside of allowed directories.
 *
 * Protects against path traversal and arbitrary file writes.
 */
export function assertPathInsideAllowedDirs(
  unsafePath: string,
  safeRoot?: string,
): string {

  function isInside(root: string, target: string) {
    const relative = path.relative(root, target);

    return !relative.startsWith("..") && !path.isAbsolute(relative);
  }

  if (!unsafePath || typeof unsafePath !== "string") {
    throw new Error("Invalid path");
  }

  const resolvedTarget = path.resolve(unsafePath);

  const allowedRoots: string[] = [];

  if (safeRoot !== undefined) {
    assertNormalizedAbsolute(safeRoot);
    allowedRoots.push(safeRoot);
  } else {
    // App directory for normal runtime
    try {
      const appPath = app?.getAppPath?.() ?? process.cwd();
      allowedRoots.push(path.resolve(appPath));
    } catch {
      allowedRoots.push(path.resolve(process.cwd()));
    }

    // OS temp directory for testing and other operations that may require temp file access
    allowedRoots.push(path.resolve(os.tmpdir()));
  }

  const allowedRoot = allowedRoots.find((root) => {
    return isInside(root, resolvedTarget);
  });

  if (allowedRoot === undefined) {
    throw new Error(`Path is outside allowed directories: ${resolvedTarget}`);
  }
  else {
      assertNoSymlinkEscape(resolvedTarget, allowedRoot);
  }

  return resolvedTarget;
}
