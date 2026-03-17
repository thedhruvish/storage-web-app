import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Text, Button } from "../ui";

interface RenameDialogProps {
  visible: boolean;
  initialValue: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  title?: string;
}

export const RenameDialog = ({
  visible,
  initialValue,
  onClose,
  onConfirm,
  title = "Rename",
}: RenameDialogProps) => {
  const { colors, spacing } = useTheme();
  const [name, setName] = useState(initialValue);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName(initialValue);
      // Small timeout to ensure autoFocus has finished and ref is ready
      const timer = setTimeout(() => {
        if (inputRef.current) {
          const lastDotIndex = initialValue.lastIndexOf(".");
          // If there's a dot and it's not the first character, select up to the dot
          // Otherwise select everything (for folders or files without extensions)
          const selectionEnd = lastDotIndex > 0 ? lastDotIndex : initialValue.length;
          inputRef.current.setSelection(0, selectionEnd);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.container,
                {
                  backgroundColor: colors.background,
                  padding: spacing.lg,
                  borderRadius: 24,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Text
                variant="h3"
                weight="bold"
                style={{
                  marginBottom: spacing.md,
                  textAlign: "center",
                  color: colors.text,
                }}
              >
                {title}
              </Text>

              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.secondaryBackground,
                    color: colors.text,
                    borderRadius: 12,
                    padding: spacing.md,
                    marginBottom: spacing.xl,
                  },
                ]}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <View style={[styles.buttonContainer, { gap: spacing.md }]}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={onClose}
                  style={styles.flexButton}
                />
                <Button
                  title="Rename"
                  variant="primary"
                  onPress={handleConfirm}
                  style={styles.flexButton}
                  disabled={!name.trim() || name === initialValue}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  input: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  flexButton: {
    flex: 1,
  },
});
