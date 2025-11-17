import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useGoogleAccessToken,
  useImportFolderByDrive,
} from "@/api/importDataApi";

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  [key: string]: any;
}
interface GooglePickerElement extends HTMLElement {
  visible: boolean;
}

interface PickerEventDetail {
  docs: PickedFile[];
}

export function useDrivePicker() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [shouldFetchToken, setShouldFetchToken] = useState(false);
  const [pickerOpened, setPickerOpened] = useState(false);
  const { directoryId = "" } = useParams({ strict: false });
  const importGoogleDriveFolder = useImportFolderByDrive(directoryId);

  const [pickerEl, setPickerEl] = useState<GooglePickerElement | null>(null);
  const handledRef = useRef(false);

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

  const openPicker = useCallback(async () => {
    if (isFetching) return;
    await import("@googleworkspace/drive-picker-element");
    setPickerOpened(true);
    setShouldFetchToken(true);
  }, [isFetching]);

  useEffect(() => {
    if (!pickerOpened || !pickerEl) return;
    const el = pickerEl;

    const onPicked = async (e: Event) => {
      if (handledRef.current) return;
      handledRef.current = true;

      const detail = (e as CustomEvent<PickerEventDetail>)?.detail;
      const docs: PickedFile[] = detail?.docs || [];

      if (!docs.length) {
        toast.warning("No items selected.");
        return;
      } else {
        await Promise.all(
          docs.map(async (item: PickedFile) => {
            try {
              await importGoogleDriveFolder.mutateAsync({
                id: item.id,
                mimeType: item.mimeType,
                name: item.name,
              });

              toast.success(
                item.mimeType === "application/vnd.google-apps.folder"
                  ? `Folder "${item.name}" imported successfully!`
                  : `File "${item.name}" imported successfully!`
              );
            } catch {
              toast.error(`Failed to import "${item.name}".`);
            }
          })
        );
      }
      setPickerOpened(false);

      handledRef.current = false;
    };

    const onCanceled = () => {
      setPickerOpened(false);
    };

    el.addEventListener("picker:picked", onPicked);
    el.addEventListener("picker-picked", onPicked);
    el.addEventListener("picker:canceled", onCanceled);
    el.addEventListener("picker-canceled", onCanceled);

    Promise.resolve().then(() => {
      if (el) el.visible = true;
    });

    return () => {
      el.removeEventListener("picker:picked", onPicked);
      el.removeEventListener("picker-picked", onPicked);
      el.removeEventListener("picker:canceled", onCanceled);
      el.removeEventListener("picker-canceled", onCanceled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpened, pickerEl]);

  return {
    openPicker,
    pickerOpened,
    pickerRef: setPickerEl as Dispatch<SetStateAction<HTMLElement | null>>,
    accessToken,
  };
}
