/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { Given, When, Then } from '@cucumber/cucumber';

export interface StepOptions {
  preInit?: boolean;
  timeout?: number;
}

type StepDefinitionBody = (this: any, ...args: any[]) => Promise<unknown> | unknown;

export interface RegisteredStep {
  id: symbol;
  pattern: string | RegExp;
  fn: StepDefinitionBody;
  options: StepOptions;
}

const registeredSteps: RegisteredStep[] = [];

function createStepRegistryEntry(pattern: string | RegExp, fn: StepDefinitionBody, options: StepOptions): RegisteredStep {
  const entry: RegisteredStep = {
    id: Symbol(pattern.toString()),
    pattern,
    fn,
    options,
  };
  registeredSteps.push(entry);
  return entry;
}

function isStepMatch(pattern: string | RegExp, stepText: string): { args: unknown[] } | null {
  if (typeof pattern === 'string') {
    return pattern === stepText ? { args: [] } : null;
  }

  const match = pattern.exec(stepText);
  if (!match) {
    return null;
  }

  return { args: match.slice(1) };
}

export function findRegisteredStep(stepText: string): { step: RegisteredStep; args: unknown[] } | null {
  for (const step of registeredSteps) {
    const match = isStepMatch(step.pattern, stepText);
    if (match) {
      return { step, args: match.args };
    }
  }

  return null;
}

export function getRegisteredSteps(): RegisteredStep[] {
  return registeredSteps;
}

function wrapStep(stepFn: StepDefinitionBody, stepId: symbol, options: StepOptions): StepDefinitionBody {
  const argCount = Math.max(stepFn.length, 1);
  const argNames = Array.from({ length: argCount }, (_, index) => `arg${index}`).join(', ');

  const wrapperFactory = new Function('stepFn', 'stepId', 'options', `
    return async function(${argNames}) {
      const self = this;
      const args = Array.prototype.slice.call(arguments);
      if (options.preInit && typeof self.hasExecutedPreInitStep === 'function') {
        if (self.hasExecutedPreInitStep(stepId)) {
          return;
        }
      }
      return stepFn.apply(self, args);
    };
  `);

  return wrapperFactory(stepFn, stepId, options) as StepDefinitionBody;
}

export function defineGiven(pattern: string | RegExp, options: StepOptions, fn: StepDefinitionBody): void;
export function defineGiven(pattern: string | RegExp, fn: StepDefinitionBody): void;
export function defineGiven(pattern: string | RegExp, optionsOrFn: StepOptions | StepDefinitionBody, fn?: StepDefinitionBody): void {
  const options = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
  const stepFn = typeof optionsOrFn === 'function' ? optionsOrFn : fn!;

  const entry = createStepRegistryEntry(pattern, stepFn, options);
  Given(pattern, wrapStep(stepFn, entry.id, options));
}

export function defineWhen(pattern: string | RegExp, options: StepOptions, fn: StepDefinitionBody): void;
export function defineWhen(pattern: string | RegExp, fn: StepDefinitionBody): void;
export function defineWhen(pattern: string | RegExp, optionsOrFn: StepOptions | StepDefinitionBody, fn?: StepDefinitionBody): void {
  const options = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
  const stepFn = typeof optionsOrFn === 'function' ? optionsOrFn : fn!;

  const entry = createStepRegistryEntry(pattern, stepFn, options);
  When(pattern, wrapStep(stepFn, entry.id, options));
}

export function defineThen(pattern: string | RegExp, options: StepOptions, fn: StepDefinitionBody): void;
export function defineThen(pattern: string | RegExp, fn: StepDefinitionBody): void;
export function defineThen(pattern: string | RegExp, optionsOrFn: StepOptions | StepDefinitionBody, fn?: StepDefinitionBody): void {
  const options = typeof optionsOrFn === 'function' ? {} : optionsOrFn;
  const stepFn = typeof optionsOrFn === 'function' ? optionsOrFn : fn!;

  const entry = createStepRegistryEntry(pattern, stepFn, options);
  Then(pattern, wrapStep(stepFn, entry.id, options));
}