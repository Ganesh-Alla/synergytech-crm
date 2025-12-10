"use client";

import { useEffect, useRef } from "react";
import { initAuthUserStore, useAuthUserStore } from "@/store/authUserStore";
import { initClientsStore } from "@/store/clientsStore";
import { initLeadsStore } from "@/store/leadsStore";
import { initVendorsStore } from "@/store/vendorsStore";
import { initUserStore } from "@/store/userStore";


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

export function LeadsStoreInitializer() {
  const initialized = useRef(false);
  const { hasLoaded: authUsersLoaded } = useAuthUserStore();
  
  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    
    // Wait for authUserStore to be loaded before initializing leadsStore
    if (!authUsersLoaded) {
      // If authUserStore hasn't loaded yet, trigger its initialization
      initAuthUserStore();
      return; // Wait for next render when authUsersLoaded becomes true
    }
    
    initialized.current = true;
    const unsubscribe = initLeadsStore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authUsersLoaded]);
  return null;
}

export function ClientsStoreInitializer() {
  const initialized = useRef(false);
  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    initialized.current = true;
    const unsubscribe = initClientsStore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  return null;
}

export function VendorsStoreInitializer() {
  const initialized = useRef(false);
  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (initialized.current) return;
    initialized.current = true;
    const unsubscribe = initVendorsStore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  return null;
}