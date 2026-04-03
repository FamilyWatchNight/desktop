/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { CustomWorld } from '../../technical/infrastructure/world';
import { AuthenticatedUser } from '../../../../src/main/services/UserService';
import { Role } from '../../../../src/main/db/models/Roles';
import { UserRole } from '../../../../src/main/db/models/UserRoles';

/**
 * Internal System Persona - represents trusted backend operations
 * for testing business logic without transport concerns.
 */
export class InternalSystemPersona {
  constructor(private world: CustomWorld) {}

  //
  // App operations
  //
  async isAppReady(): Promise<boolean> {
    return (await this.world.app.evaluate(async (electron) => {
      const app = electron.app as { isReady(): boolean };
      return app.isReady();
    })) as boolean;
  }

  //
  // Background task operations
  //
  async enqueueTask(taskType: string, args?: Record<string, unknown>) {
    return await this.world.backgroundTasksApi.enqueue(taskType, args);
  }

  async getTaskState() {
    return await this.world.backgroundTasksApi.getState();
  }

  async cancelActiveTask() {
    return await this.world.backgroundTasksApi.cancelActive();
  }

  async removeQueuedTask(taskId: string) {
    return await this.world.backgroundTasksApi.removeQueued(taskId);
  }

  // Test Tasks
  async setupTestTaskType() {
    return await this.world.backgroundTasksApi.setupTestTaskType();
  }

  async setTaskProgress(current: number, max: number, description: string) {
    return await this.world.backgroundTasksApi.setTaskProgress(current, max, description);
  }

  async setTaskDescription(description: string) {
    return await this.world.backgroundTasksApi.setTaskDescription(description);
  }

  async setTaskCurrent(current: number) {
    return await this.world.backgroundTasksApi.setTaskCurrent(current);
  }

  async setTaskMax(max: number) {
    return await this.world.backgroundTasksApi.setTaskMax(max);
  }

  async completeTask() {
    return await this.world.backgroundTasksApi.completeTask();
  }


  //
  // Database operations
  //
  async initDatabase(): Promise<void> {
    return await this.world.dbApi.initMockDatabase();
  }

  async loadStubTmdbData(dataSource: string): Promise<void> {
    return await this.world.dataApi.loadStubTmdbData(dataSource);
  }

  async loadStubWatchmodeData(dataSource: string): Promise<void> {
    return await this.world.dataApi.loadStubWatchmodeData(dataSource);
  }

  async closeDatabase(): Promise<void> {
    return await this.world.dbApi.closeDatabase();
  }

  async getDatabaseStatus() {
    return await this.world.dbApi.getStatus();
  }

  //
  // Event operations
  //
  async clearRecordedEvents() {
    return await this.world.eventNotificationsApi.clearRecordedEvents();
  }

  async getRecordedEvents() {
    return await this.world.eventNotificationsApi.getRecordedEvents();
  }

  async findEventByType(type: string) {
    return await this.world.eventNotificationsApi.findEventByType(type);
  }

  async filterEventsByType(type: string) {
    return await this.world.eventNotificationsApi.filterEventsByType(type);
  }

  async setupEventRecording() {
    return await this.world.eventNotificationsApi.setupEventRecording();
  }

  //
  // Movie operations
  //
  async getAllMovies() {
    return await this.world.moviesApi.getAllMovies();
  }

  async getMovieByTmdbId(tmdbId: string) {
    return await this.world.moviesApi.getMovieByTmdbId(tmdbId);
  }

  async getMovieByWatchmodeId(watchmodeId: string) {
    return await this.world.moviesApi.getMovieByWatchmodeId(watchmodeId);
  }

  async searchMoviesByTitle(searchTerm: string) {
    return await this.world.moviesApi.searchByTitle(searchTerm);
  }

  async getMovieCount() {
    return await this.world.moviesApi.getMovieCount();
  }

  //
  // Role operations
  //
  async createRole(name: string, permissionStubs: string[]): Promise<Role> {
    return await this.world.rolesApi.createRole(name, permissionStubs);
  }

  async getRoleById(id: number): Promise<Role | null> {
    return await this.world.rolesApi.getRoleById(id);
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    return await this.world.rolesApi.assignRoleToUser(userId, roleId);
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await this.world.rolesApi.getUserRoles(userId);
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    return await this.world.rolesApi.getUserPermissions(userId);
  }

  //
  // Settings operations
  //
  async initializeSettings(testSettings?: Record<string, unknown>) {
    return await this.world.settingsApi.initializeMockSettings(testSettings);
  }

  async getSetting(key: string) {
    return await this.world.settingsApi.getSetting(key);
  }

  async setSetting(key: string, value: unknown) {
    return await this.world.settingsApi.setSetting(key, value);
  }

  async loadSettings() {
    return await this.world.settingsApi.loadSettings();
  }

  async saveSettings(settings: Record<string, unknown>) {
    return await this.world.settingsApi.saveSettings(settings);
  }

  //
  // User operations
  //
  async createUser(data: { username: string; email?: string; password?: string }): Promise<AuthenticatedUser> {
    return await this.world.usersApi.createUser(data);
  }

  async authenticateUser(username: string, password: string): Promise<AuthenticatedUser | null> {
    return await this.world.usersApi.authenticateUser(username, password);
  }

  async getUserById(id: number): Promise<AuthenticatedUser | null> {
    return await this.world.usersApi.getUserById(id);
  }

  async updateUserProfile(id: number, profileData: { displayName?: string | null; profileImagePath?: string | null }): Promise<void> {
    return await this.world.usersApi.updateUserProfile(id, profileData);
  }

}