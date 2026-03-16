import React, { createContext, useCallback, useContext, useState } from "react";
import { Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { Text, Button } from "./ui";

type DialogOptions = {
  title: string;
  message: string;
  type?: "error" | "success" | "info" | "warning";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Global reference for use outside of React components
let globalShowDialog: (options: DialogOptions) => void = () => {};

export const showGlobalDialog = (options: DialogOptions) => {
  globalShowDialog(options);
};

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);

  const showDialog = useCallback((opts: DialogOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
  }, []);

  // Set the global reference
  globalShowDialog = showDialog;

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {visible && options && (
        <CommonDialog
          visible={visible}
          options={options}
          onClose={hideDialog}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

function CommonDialog({
  visible,
  options,
  onClose,
}: {
  visible: boolean;
  options: DialogOptions;
  onClose: () => void;
}) {
  const { colors, spacing } = useTheme();

  const handleConfirm = () => {
    options.onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    options.onCancel?.();
    onClose();
  };

  const isConfirmation = !!options.onCancel || !!options.cancelText;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
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
            style={{ marginBottom: spacing.sm, textAlign: "center" }}
          >
            {options.title}
          </Text>
          <Text
            variant="body"
            color="secondaryText"
            style={{ marginBottom: spacing.xl, textAlign: "center" }}
          >
            {options.message}
          </Text>

          <View style={[styles.buttonContainer, { gap: spacing.md }]}>
            {isConfirmation && (
              <Button
                title={options.cancelText || "Cancel"}
                variant="secondary"
                onPress={handleCancel}
                style={styles.flexButton}
              />
            )}
            <Button
              title={options.confirmText || "OK"}
              variant={options.type === "error" || options.type === "warning" ? "primary" : "primary"}
              onPress={handleConfirm}
              style={styles.flexButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
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
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  flexButton: {
    flex: 1,
  },
});
