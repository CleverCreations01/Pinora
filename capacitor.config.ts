import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pinvora.studio",
  appName: "PINVORA",
  webDir: "dist",
  bundledWebRuntime: false,
  // Load the stable production site so web updates appear without reinstalling the APK.
  server: {
    url: "https://pinora-six.vercel.app",
    cleartext: false
  },
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false
  }
};

export default config;
