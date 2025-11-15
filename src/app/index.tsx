import React, { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { initDatabase } from "../db";
import GroceryList from "../components/GroceryList";

export default function Page() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        const success = await initDatabase();
        setDbInitialized(success);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setDbInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  if (isLoading) {
    return (
      <View className="flex flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Initializing database...</Text>
      </View>
    );
  }

  if (!dbInitialized) {
    return (
      <View className="flex flex-1 items-center justify-center bg-gray-50">
        <Text className="text-red-600 font-semibold">
          Database initialization failed
        </Text>
        <Text className="text-gray-600 mt-2">Please restart the app</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-1">
      <Header />
      <GroceryList />
    </View>
  );
}

function Header() {
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top, backgroundColor: "#FFFFFF" }}>
      <View className="px-4 h-14 flex items-center flex-row justify-center border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">
          🛒 Grocery List
        </Text>
      </View>
    </View>
  );
}