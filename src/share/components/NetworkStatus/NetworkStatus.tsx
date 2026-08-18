import { useEffect, useRef, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { api } from "store/api";
import useIsMobile from "share/hooks/useIsMobile";

const NetworkStatus = () => {
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [showSaved, setShowSaved] = useState(false);
  const wasSaving = useRef(false);
  const isSaving = useSelector((state: any) =>
    Object.values(state[api.reducerPath]?.mutations || {}).some(
      (mutation: any) => mutation?.status === "pending",
    ),
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (wasSaving.current && !isSaving) {
      setShowSaved(true);
      const timeout = window.setTimeout(() => setShowSaved(false), 2200);
      return () => window.clearTimeout(timeout);
    }
    wasSaving.current = isSaving;
  }, [isSaving]);

  const isOpen = !isOnline || isSaving || showSaved;
  const severity = !isOnline ? "warning" : isSaving ? "info" : "success";
  const label = !isOnline
    ? "Немає мережі — не закривай застосунок до відновлення з’єднання"
    : isSaving
      ? "Зберігається…"
      : "Збережено";

  return (
    <Snackbar
      open={isOpen}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ bottom: isMobile ? "76px !important" : undefined }}
    >
      <Alert severity={severity} variant="filled" aria-live="polite">
        {label}
      </Alert>
    </Snackbar>
  );
};

export default NetworkStatus;
