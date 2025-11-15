import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Database instance - will be initialized lazily
let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Get or create the database instance asynchronously
 */
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  // If already initializing, wait for it
  if (dbPromise) {
    return dbPromise;
  }

  // Create new initialization promise
  dbPromise = (async () => {
    try {
      // Use async version for web, sync for native
      if (Platform.OS === "web") {
        db = await SQLite.openDatabaseAsync("grocery.db");
      } else {
        db = SQLite.openDatabaseSync("grocery.db");
      }
      return db;
    } catch (error) {
      console.error("Error opening database:", error);
      dbPromise = null;
      throw error;
    }
  })();

  return dbPromise;
};

/**
 * Initialize the database schema
 */
export const initDatabase = async () => {
  try {
    const database = await getDatabase();

    // Create grocery_items table if it doesn't exist
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        bought INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);

    console.log("Database initialized successfully");

    // Seed sample data if table is empty
    await seedSampleData();

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

/**
 * Seed sample data if the table is empty
 */
export const seedSampleData = async () => {
  try {
    const database = await getDatabase();

    // Check if table is empty
    const result = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM grocery_items"
    );

    if (result && result.count === 0) {
      console.log("Table is empty, seeding sample data...");

      const sampleItems = [
        { name: "Sữa", quantity: 2, category: "Đồ uống" },
        { name: "Trứng", quantity: 10, category: "Thực phẩm tươi sống" },
        { name: "Bánh mì", quantity: 1, category: "Thực phẩm khô" },
      ];

      for (const item of sampleItems) {
        await database.runAsync(
          "INSERT INTO grocery_items (name, quantity, category, bought, created_at) VALUES (?, ?, ?, 0, ?)",
          [item.name, item.quantity, item.category, Date.now()]
        );
      }

      console.log("Sample data seeded successfully");
    } else {
      console.log(`Table already has ${result?.count} items, skipping seed`);
    }
  } catch (error) {
    console.error("Error seeding sample data:", error);
  }
};

/**
 * Get all grocery items
 */
export const getAllItems = async () => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      "SELECT * FROM grocery_items ORDER BY created_at DESC"
    );
    return result;
  } catch (error) {
    console.error("Error getting all items:", error);
    return [];
  }
};

/**
 * Add a new grocery item
 */
export const addItem = async (
  name: string,
  quantity: number,
  category: string
) => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(
      "INSERT INTO grocery_items (name, quantity, category, bought, created_at) VALUES (?, ?, ?, 0, ?)",
      [name, quantity, category, Date.now()]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error adding item:", error);
    return null;
  }
};

/**
 * Update an existing grocery item
 */
export const updateItem = async (
  id: number,
  name: string,
  quantity: number,
  category: string
) => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE grocery_items SET name = ?, quantity = ?, category = ? WHERE id = ?",
      [name, quantity, category, id]
    );
    return true;
  } catch (error) {
    console.error("Error updating item:", error);
    return false;
  }
};

/**
 * Toggle bought status of an item
 */
export const toggleBoughtStatus = async (id: number, bought: number) => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      "UPDATE grocery_items SET bought = ? WHERE id = ?",
      [bought, id]
    );
    return true;
  } catch (error) {
    console.error("Error toggling bought status:", error);
    return false;
  }
};

/**
 * Delete a grocery item
 */
export const deleteItem = async (id: number) => {
  try {
    const database = await getDatabase();
    await database.runAsync("DELETE FROM grocery_items WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
};

/**
 * Delete all bought items
 */
export const deleteAllBoughtItems = async () => {
  try {
    const database = await getDatabase();
    await database.runAsync("DELETE FROM grocery_items WHERE bought = 1");
    return true;
  } catch (error) {
    console.error("Error deleting bought items:", error);
    return false;
  }
};

/**
 * Clear all items from the database (for testing)
 */
export const clearAllItems = async () => {
  try {
    const database = await getDatabase();
    await database.runAsync("DELETE FROM grocery_items");
    return true;
  } catch (error) {
    console.error("Error clearing all items:", error);
    return false;
  }
};
