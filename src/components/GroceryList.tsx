import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getAllItems } from "../db";

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  bought: number;
  created_at: number;
}

export default function GroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load items from database
  const loadItems = async () => {
    try {
      const data = await getAllItems();
      setItems(data as GroceryItem[]);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  // Render each grocery item
  const renderItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.bought === 1 && styles.itemCardBought]}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text
            style={[
              styles.itemName,
              item.bought === 1 && styles.itemTextBought,
            ]}
          >
            {item.name}
          </Text>
          {item.bought === 1 && (
            <View style={styles.boughtBadge}>
              <Text style={styles.boughtBadgeText}>✓ Đã mua</Text>
            </View>
          )}
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số lượng:</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>

          {item.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Danh mục:</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.itemIndicator,
          item.bought === 1 ? styles.indicatorBought : styles.indicatorPending,
        ]}
      />
    </TouchableOpacity>
  );

  // Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Danh sách trống</Text>
      <Text style={styles.emptySubtitle}>Thêm món cần mua nhé!</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Sách Đi Chợ</Text>
        <Text style={styles.headerSubtitle}>
          {items.length} món {items.length === 1 ? "" : ""}
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemCardBought: {
    backgroundColor: "#F3F4F6",
    opacity: 0.8,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  itemTextBought: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  boughtBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  boughtBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  itemIndicator: {
    width: 4,
    borderRadius: 2,
    marginLeft: 12,
  },
  indicatorPending: {
    backgroundColor: "#3B82F6",
  },
  indicatorBought: {
    backgroundColor: "#10B981",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
