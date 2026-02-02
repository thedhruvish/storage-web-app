import { Braces, Cloud, Lock, Server, Share2, Trash2 } from "lucide-react";

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger for snappier feel
      delayChildren: 0.2,
    },
  },
} as const;

export const featuresList = [
  {
    icon: Server,
    title: "S3 Compatible",
    desc: "Connect directly to AWS S3, MinIO, or any compatible storage backend.",
  },
  {
    icon: Cloud,
    title: "Import from Drive",
    desc: "Seamlessly migrate and organize files from Google Drive.",
  },
  {
    icon: Braces,
    title: "100% Open Source",
    desc: "Self-host your instance. Full transparency and data sovereignty.",
  },
  {
    icon: Trash2,
    title: "Smart Cleaning",
    desc: "AI-powered detection of duplicates and large forgotten files.",
  },
  {
    icon: Lock,
    title: "Client-Side Encryption",
    desc: "Files are encrypted on your device before they ever leave.",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    desc: "Generate time-limited, password-protected sharing links.",
  },
] as const;
