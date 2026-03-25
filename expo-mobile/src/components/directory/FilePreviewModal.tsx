import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import type { FileItem } from "./types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";

interface FilePreviewModalProps {
  visible: boolean;
  file: FileItem | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export const FilePreviewModal = ({
  visible,
  file,
  onClose,
}: FilePreviewModalProps) => {
  const insets = useSafeAreaInsets();
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const Token = await handleToken.getToken(AUTH_TOKEN_NAME);
      if (Token) {
        setHeaders({
          Token,
          "X-Platform": "mobile",
        });
      }
    };
    if (visible) {
      fetchToken();
      setIsLoading(true);
    }
  }, [visible]);

  if (!file) return null;

  // Prefer the real URL if available (fetched by handlePreview in hook)
  const imageSource = {
    uri:
      file.previewUrl ||
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/document/${file._id}`,
    headers: headers,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: "rgba(0,0,0,0.9)" }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text
              variant="body"
              style={{ color: "#fff", fontWeight: "600" }}
              numberOfLines={1}
            >
              {file.name}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={300}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </View>

        {/* Footer info (optional) */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Text variant="caption" style={{ color: "#ccc" }}>
            {file.fileType?.toUpperCase() || "IMAGE"}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
});
