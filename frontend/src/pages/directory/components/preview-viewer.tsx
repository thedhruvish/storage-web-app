import type { ComponentProps } from "react";
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import "@iamjariwala/react-doc-viewer/dist/index.css";

type PreviewViewerProps = ComponentProps<typeof DocViewer>;

export default function PreviewViewer(props: PreviewViewerProps) {
  return <DocViewer {...props} pluginRenderers={DocViewerRenderers} />;
}
