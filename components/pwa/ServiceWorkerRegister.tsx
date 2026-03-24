"use client";

import { useEffect, useState } from "react";
import { InstallPrompt } from "./install-prompt";
import { UpdatePrompt } from "./update-prompt";
import { WelcomeScreen } from "./welcome-screen";

export function ServiceWorkerRegister() {
  const [isRegistered, setIsRegistered] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProd && typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });
      return;
    }

    if (
      isProd &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      !isRegistered &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost")
    ) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          setIsRegistered(true);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  window.dispatchEvent(new CustomEvent('sw-update'));
                }
              });
            }
          });
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
      }
    }
  }, [isRegistered, isProd]);

  return (
    <>
      <InstallPrompt />
      <UpdatePrompt />
      <WelcomeScreen />
    </>
  );
}
