import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { addItem, updateItem } from "../db";

interface GroceryItem {
  id: number;
  name: string;
  quantity: number;
  category: string;
  bought: number;
  created_at: number;
}

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  editItem?: GroceryItem | null;
}

export default function AddItemModal({
  visible,
  onClose,
  onItemAdded,
  editItem = null,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setQuantity(editItem.quantity.toString());
      setCategory(editItem.category || "");
    } else {
      resetForm();
    }
  }, [editItem, visible]);

  // Reset form
  const resetForm = () => {
    setName("");
    setQuantity("1");
    setCategory("");
    setNameError("");
    setIsSubmitting(false);
  };

  // Validate form
  const validateForm = () => {
    // Reset error
    setNameError("");

    // Check if name is empty
    if (!name.trim()) {
      setNameError("Tên món không được để trống!");
      Alert.alert("Lỗi", "Vui lòng nhập tên món cần mua!");
      return false;
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const quantityNum = parseInt(quantity) || 1;

      if (editItem) {
        // Update existing item
        const success = await updateItem(
          editItem.id,
          name.trim(),
          quantityNum,
          category.trim()
        );

        if (success) {
          console.log("Item updated successfully:", editItem.id);
          Alert.alert("Thành công", "Đã cập nhật món!");
          resetForm();
          onItemAdded(); // Trigger list refresh
          onClose();
        } else {
          Alert.alert("Lỗi", "Không thể cập nhật món. Vui lòng thử lại!");
        }
      } else {
        // Add new item
        const result = await addItem(name.trim(), quantityNum, category.trim());

        if (result) {
          console.log("Item added successfully with ID:", result);
          Alert.alert("Thành công", "Đã thêm món vào danh sách!");
          resetForm();
          onItemAdded(); // Trigger list refresh
          onClose();
        } else {
          Alert.alert("Lỗi", "Không thể thêm món. Vui lòng thử lại!");
        }
      }
    } catch (error) {
      console.error("Error saving item:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm món!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editItem ? "Sửa Món" : "Thêm Món Mới"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editItem
                  ? "Cập nhật thông tin món"
                  : "Nhập thông tin món cần mua"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Tên món <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, nameError ? styles.inputError : null]}
                  placeholder="Ví dụ: Sữa, Trứng, Bánh mì..."
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (nameError) setNameError("");
                  }}
                  autoFocus
                />
                {nameError ? (
                  <Text style={styles.errorText}>{nameError}</Text>
                ) : null}
              </View>

              {/* Quantity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số lượng</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>

              {/* Category Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Danh mục</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: Đồ uống, Thực phẩm..."
                  value={category}
                  onChangeText={setCategory}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4F46E5",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
