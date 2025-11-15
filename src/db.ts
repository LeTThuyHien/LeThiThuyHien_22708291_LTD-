import * as SQLite from "expo-sqlite";

// Open or create the database
const db = SQLite.openDatabaseSync("grocery.db");

/**
 * Initialize the database schema
 */
export const initDatabase = async () => {
  try {
    // Create grocery_items table if it doesn't exist
    await db.execAsync(`
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
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

/**
 * Get all grocery items
 */
export const getAllItems = async () => {
  try {
    const result = await db.getAllAsync(
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
    const result = await db.runAsync(
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
    await db.runAsync(
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
    await db.runAsync("UPDATE grocery_items SET bought = ? WHERE id = ?", [
      bought,
      id,
    ]);
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
    await db.runAsync("DELETE FROM grocery_items WHERE id = ?", [id]);
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
    await db.runAsync("DELETE FROM grocery_items WHERE bought = 1");
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
    await db.runAsync("DELETE FROM grocery_items");
    return true;
  } catch (error) {
    console.error("Error clearing all items:", error);
    return false;
  }
};

export default db;
