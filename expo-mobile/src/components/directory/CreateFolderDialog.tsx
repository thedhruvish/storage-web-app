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

interface CreateFolderDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const CreateFolderDialog = ({
  visible,
  onClose,
  onConfirm,
}: CreateFolderDialogProps) => {
  const { colors, spacing } = useTheme();
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName("New Folder");
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelection(0, 10);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

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
                Create Folder
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
                  title="Create"
                  variant="primary"
                  onPress={handleConfirm}
                  style={styles.flexButton}
                  disabled={!name.trim()}
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
