// Type declarations for the experimental node:sqlite built-in module
declare module 'node:sqlite' {
  export interface StatementResultingChanges {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export interface StatementSync {
    all(...params: unknown[]): Record<string, unknown>[];
    get(...params: unknown[]): Record<string, unknown> | undefined;
    run(...params: unknown[]): StatementResultingChanges;
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
  }
}
