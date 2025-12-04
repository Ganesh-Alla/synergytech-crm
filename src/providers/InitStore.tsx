"use client";

import { useEffect, useRef } from "react";
import { initUserStore } from "@/store/userStore";
import { initAuthUserStore } from "@/store/authUserStore";


export function StoreInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    initialized.current = true;

    // Initialize the user store and set up auth listeners
    const unsubscribe = initUserStore();

    // Cleanup function for React strict mode
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return null;
}

export function AuthUserStoreInitializer() {
  const initialized = useRef(false);
  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    initialized.current = true;
    const unsubscribe = initAuthUserStore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  return null;
}