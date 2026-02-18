/**
 * mock-db.ts — Drizzle ORM mock for Catalyst API tests.
 *
 * Uses an in-memory store so tests can seed data and track state changes
 * across sequential HTTP requests within a scenario.
 *
 * Strategy:
 *   - db.query.<table>.findFirst() returns the value from a per-table
 *     resolver function (configurable per test), falling back to the
 *     first item in the in-memory store for that table.
 *   - db.select().from(table)... returns all items in the store for
 *     that table. For count projections, returns [{ count: N }].
 *   - db.insert(table).values(v).returning() adds to the store.
 *   - db.update(table).set(data).where(...).returning() merges data
 *     into matching store entries. By default updates ALL entries in
 *     the table; use setUpdateFilter() to scope updates to a specific id.
 *
 * The vi.mock() call is hoisted so every `import { db } from "../db/index.js"`
 * throughout the route tree receives this mock.
 */
import { vi } from "vitest";
import * as realSchema from "../../db/schema.js";

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------
export interface InMemoryStore {
  users: Record<string, any>;
  nudges: Record<string, any>;
  pulseSurveys: Record<string, any>;
  pulseResponses: Record<string, any>;
  teamMembers: Record<string, any>;
  cascadeEvents: Record<string, any>;
  mirrorMoments: Record<string, any>;
  [key: string]: Record<string, any>;
}

let store: InMemoryStore = createEmptyStore();

export function createEmptyStore(): InMemoryStore {
  return {
    users: {},
    nudges: {},
    pulseSurveys: {},
    pulseResponses: {},
    teamMembers: {},
    cascadeEvents: {},
    mirrorMoments: {},
  };
}

export function resetStore() {
  store = createEmptyStore();
  findFirstResolvers = {};
  selectFilterResolvers = {};
  updateFilterResolvers = {};
}

export function getStore(): InMemoryStore {
  return store;
}

export function seedStore(tableName: keyof InMemoryStore, id: string, data: any) {
  store[tableName][id] = { id, ...data };
}

// ---------------------------------------------------------------------------
// Per-table custom resolvers — tests set these to control query behavior
// ---------------------------------------------------------------------------

// findFirst resolvers: (opts) => row | undefined
// Key format: "tableName" or "tableName:callIndex" for sequential calls
let findFirstResolvers: Record<string, (opts?: any) => any> = {};

/**
 * Register a custom findFirst resolver for a table.
 * The resolver receives the options object ({ where, orderBy }) and should
 * return the row (or undefined).
 */
export function setFindFirstResolver(
  tableName: string,
  resolver: (opts?: any) => any
) {
  findFirstResolvers[tableName] = resolver;
}

// Select filter resolvers: for db.select().from(table).where(...)
let selectFilterResolvers: Record<string, (rows: any[]) => any[]> = {};

export function setSelectFilter(
  tableName: string,
  filter: (rows: any[]) => any[]
) {
  selectFilterResolvers[tableName] = filter;
}

// Update filter resolvers: determines which store rows get updated
let updateFilterResolvers: Record<string, (id: string) => boolean> = {};

export function setUpdateFilter(
  tableName: string,
  filter: (id: string) => boolean
) {
  updateFilterResolvers[tableName] = filter;
}

// ---------------------------------------------------------------------------
// Table name resolver
// ---------------------------------------------------------------------------
function tableNameOf(tableRef: any): string {
  if (tableRef === realSchema.users) return "users";
  if (tableRef === realSchema.nudges) return "nudges";
  if (tableRef === realSchema.pulseSurveys) return "pulseSurveys";
  if (tableRef === realSchema.pulseResponses) return "pulseResponses";
  if (tableRef === realSchema.teamMembers) return "teamMembers";
  if (tableRef === realSchema.cascadeEvents) return "cascadeEvents";
  if (tableRef === realSchema.mirrorMoments) return "mirrorMoments";
  return "unknown";
}

// ---------------------------------------------------------------------------
// db.select()
// ---------------------------------------------------------------------------
function createSelectChain(projection?: any) {
  let _tableName = "";

  const chain: any = {
    from(tableRef: any) {
      _tableName = tableNameOf(tableRef);
      return chain;
    },
    where(_filter: any) {
      return chain;
    },
    orderBy(..._args: any[]) {
      return chain;
    },
    limit(_n: number) {
      return chain;
    },
    then(resolve: (v: any) => void, reject?: (e: any) => void) {
      try {
        let rows = Object.values(store[_tableName] || {});

        // Apply custom select filter if registered
        if (selectFilterResolvers[_tableName]) {
          rows = selectFilterResolvers[_tableName](rows);
        }

        // Count projection
        if (
          projection &&
          typeof projection === "object" &&
          "count" in projection
        ) {
          resolve([{ count: rows.length }]);
        } else {
          resolve(rows);
        }
      } catch (e) {
        reject?.(e);
      }
    },
  };
  return chain;
}

// ---------------------------------------------------------------------------
// db.insert()
// ---------------------------------------------------------------------------
function createInsertChain(tableRef: any) {
  const tableName = tableNameOf(tableRef);
  let _values: any = null;

  const chain: any = {
    values(vals: any) {
      _values = vals;
      return chain;
    },
    returning() {
      return chain;
    },
    onConflictDoNothing() {
      return chain;
    },
    then(resolve: (v: any) => void, reject?: (e: any) => void) {
      try {
        const id = _values?.id || crypto.randomUUID();
        const row = {
          id,
          createdAt: new Date(),
          ..._values,
        };
        store[tableName][id] = row;
        resolve([row]);
      } catch (e) {
        reject?.(e);
      }
    },
  };
  return chain;
}

// ---------------------------------------------------------------------------
// db.update()
// ---------------------------------------------------------------------------
function createUpdateChain(tableRef: any) {
  const tableName = tableNameOf(tableRef);
  let _setData: any = null;

  const chain: any = {
    set(data: any) {
      _setData = data;
      return chain;
    },
    where(_filter: any) {
      return chain;
    },
    returning() {
      return chain;
    },
    then(resolve: (v: any) => void, reject?: (e: any) => void) {
      try {
        const ids = Object.keys(store[tableName]);
        const results: any[] = [];
        const filterFn = updateFilterResolvers[tableName];

        for (const id of ids) {
          if (filterFn && !filterFn(id)) continue;
          const updated = { ...store[tableName][id], ..._setData };
          store[tableName][id] = updated;
          results.push(updated);
        }

        if (results.length === 0) {
          // If nothing matched but there's data, create a new entry
          const row = { id: crypto.randomUUID(), ..._setData };
          store[tableName][row.id] = row;
          results.push(row);
        }

        resolve(results);
      } catch (e) {
        reject?.(e);
      }
    },
  };
  return chain;
}

// ---------------------------------------------------------------------------
// db.delete()
// ---------------------------------------------------------------------------
function createDeleteChain(tableRef: any) {
  const tableName = tableNameOf(tableRef);

  const chain: any = {
    where(_filter: any) {
      return chain;
    },
    returning() {
      return chain;
    },
    then(resolve: (v: any) => void) {
      const ids = Object.keys(store[tableName]);
      const removed = ids.map((id) => store[tableName][id]);
      store[tableName] = {};
      resolve(removed);
    },
  };
  return chain;
}

// ---------------------------------------------------------------------------
// db.query proxy
// ---------------------------------------------------------------------------
function createQueryProxy() {
  return new Proxy(
    {},
    {
      get(_target, tableName: string) {
        return {
          findFirst(opts?: any) {
            // Use custom resolver if registered
            if (findFirstResolvers[tableName]) {
              return Promise.resolve(findFirstResolvers[tableName](opts));
            }
            // Default: return first item in store
            const rows = Object.values(store[tableName] || {});
            return Promise.resolve(rows[0] ?? undefined);
          },
          findMany(opts?: any) {
            const rows = Object.values(store[tableName] || {});
            return Promise.resolve(rows);
          },
        };
      },
    }
  );
}

// ---------------------------------------------------------------------------
// The mock db object
// ---------------------------------------------------------------------------
export const mockDb = {
  query: createQueryProxy(),

  select(projection?: any) {
    return createSelectChain(projection);
  },

  insert(tableRef: any) {
    return createInsertChain(tableRef);
  },

  update(tableRef: any) {
    return createUpdateChain(tableRef);
  },

  delete(tableRef: any) {
    return createDeleteChain(tableRef);
  },
};

// ---------------------------------------------------------------------------
// vi.mock() — hoisted by Vitest
// ---------------------------------------------------------------------------
vi.mock("../../db/index.js", () => ({
  db: mockDb,
  schema: realSchema,
}));
