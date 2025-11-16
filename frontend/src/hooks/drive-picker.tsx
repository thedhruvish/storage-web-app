/* eslint-disable no-console */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useGoogleAccessToken,
  useImportFolderByDrive,
} from "@/api/importDataApi";

let googleApiLoaded = false;

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  [key: string]: any;
}

export function useDrivePicker() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [shouldFetchToken, setShouldFetchToken] = useState(false);

  const { directoryId = "" } = useParams({ strict: false });
  const importGoogleDriveFolder = useImportFolderByDrive(directoryId);

  const {
    data: tokenData,
    isSuccess,
    isFetching,
  } = useGoogleAccessToken({
    enabled: shouldFetchToken,
  });

  useEffect(() => {
    if (isSuccess && tokenData?.data?.accessToken) {
      setAccessToken(tokenData.data.accessToken);
    }
  }, [isSuccess, tokenData]);

  const loadGoogleApi = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (googleApiLoaded) return resolve();

      const existing = document.querySelector<HTMLScriptElement>(
        "script[src='https://apis.google.com/js/api.js']"
      );
      if (existing) {
        googleApiLoaded = true;
        return resolve();
      }

      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.onload = () => {
        googleApiLoaded = true;
        resolve();
      };
      document.body.appendChild(script);
    });
  }, []);

  const pickerCallback = useCallback(async (data: any) => {
    const google = window.google;

    if (data.action === google.picker.Action.PICKED) {
      const selected = data.docs || [];

      if (!selected.length) {
        toast.warning("No items selected.");
        return;
      }

      toast.info(`Importing ${selected.length} item(s) from Google Drive...`);

      // Run all imports in parallel
      await Promise.all(
        selected.map(async (item: any) => {
          try {
            await importGoogleDriveFolder.mutateAsync({
              id: item.id,
              mimeType: item.mimeType,
              name: item.name,
            });

            toast.success(
              item.mimeType === "application/vnd.google-apps.folder"
                ? `✅ Folder "${item.name}" imported successfully!`
                : `📄 File "${item.name}" imported successfully!`
            );
          } catch (error: any) {
            console.error(`Import failed for ${item.name}:`, error);
            toast.error(`❌ Failed to import "${item.name}".`);
          }
        })
      );

      toast.success("🎉 All selected items processed!");
    }

    if (data.action === google.picker.Action.CANCEL) {
      console.log("❌ Picker closed without selection.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPicker = useCallback(() => {
    const google = window.google;
    if (!google?.picker || !accessToken) return;

    const picker = new google.picker.PickerBuilder()
      .addView(
        new google.picker.DocsView()
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true)
          .setOwnedByMe(true)
          .setParent("root")
      )
      .setOAuthToken(accessToken)
      .setCallback(pickerCallback)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setSize(window.innerWidth * 0.8, window.innerHeight * 0.8)
      .build();

    picker.setVisible(true);
  }, [accessToken, pickerCallback]);

  const openPicker = useCallback(async () => {
    if (isFetching) return;
    setShouldFetchToken(true);
  }, [isFetching]);

  useEffect(() => {
    if (!accessToken) return;

    const initPicker = async () => {
      await loadGoogleApi();

      window.gapi.load("picker", {
        callback: () => {
          createPicker();
        },
      });
    };

    initPicker();
  }, [accessToken, loadGoogleApi, createPicker]);

  useEffect(() => {
    return () => {
      const iframe = document.querySelector("iframe[src*='picker']");
      if (iframe) iframe.remove();
    };
  }, []);

  return { openPicker };
}
