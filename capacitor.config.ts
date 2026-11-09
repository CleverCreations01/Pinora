import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pinvora.studio",
  appName: "PINVORA",
  webDir: "dist",
  bundledWebRuntime: false,
  android: {
    backgroundColor: "#ffffff",
    allowMixedContent: false
  }
};

export default config;
