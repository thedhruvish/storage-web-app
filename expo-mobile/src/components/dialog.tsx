import React, { createContext, useCallback, useContext, useState } from "react";

type DialogOptions = {
  title: string;
  message: string;
  type?: "error" | "success" | "info";
  onConfirm?: () => void;
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Global reference for use outside of React components (like in axios/services)
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

import { useTheme } from "@/hooks/use-theme";
import { Modal, StyleSheet, View } from "react-native";
import { Text, Button } from "./ui";

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

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              padding: spacing.lg,
              borderRadius: spacing.borderRadius,
              borderColor: colors.separator,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            variant="h3"
            style={{ marginBottom: spacing.sm }}
          >
            {options.title}
          </Text>
          <Text
            variant="body"
            color="secondaryText"
            style={{ marginBottom: spacing.lg }}
          >
            {options.message}
          </Text>

          <Button
            title="OK"
            onPress={() => {
              options.onConfirm?.();
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
