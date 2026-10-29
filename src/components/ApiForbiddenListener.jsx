"use client";

import { useEffect, useRef, useState } from "react";
import DialogInfo from "@/components/DialogInfo";
import {
  getForbiddenDetail,
  shouldRedirectAlertToForbiddenDialog,
} from "@/app/utils/forbiddenUi";

/**
 * Dialog 403 (RBAC). Event "sip:forbidden" dari Api interceptor.
 * window.alert setelah 403 dialihkan ke dialog ini (bukan alert browser),
 * agar tidak muncul dulu lalu DialogInfo baru kelihatan setelah form ditutup.
 */
export default function ApiForbiddenListener() {
  const [dialog, setDialog] = useState({
    show: false,
    title: "Akses Ditolak",
    message: "",
  });
  const lastShown = useRef({ message: "", at: 0 });

  const showForbidden = (title, message) => {
    const text = String(message || "").trim();
    if (!text) return;
    const now = Date.now();
    if (
      lastShown.current.message === text &&
      now - lastShown.current.at < 1200
    ) {
      return;
    }
    lastShown.current = { message: text, at: now };
    setDialog({
      show: true,
      title: title || "Hak Akses Tidak Cukup",
      message: text,
    });
  };

  useEffect(() => {
    const onForbidden = (event) => {
      const detail = event.detail || getForbiddenDetail();
      showForbidden(
        detail.title || "Hak Akses Tidak Cukup",
        detail.message ||
          "Anda tidak memiliki hak untuk melakukan tindakan ini."
      );
    };

    const originalAlert = window.alert.bind(window);
    window.alert = (message) => {
      if (shouldRedirectAlertToForbiddenDialog(message)) {
        const detail = getForbiddenDetail();
        showForbidden(
          detail.title,
          detail.message || String(message ?? "")
        );
        return;
      }
      originalAlert(String(message ?? ""));
    };

    window.addEventListener("sip:forbidden", onForbidden);
    return () => {
      window.removeEventListener("sip:forbidden", onForbidden);
      window.alert = originalAlert;
    };
  }, []);

  return (
    <DialogInfo
      show={dialog.show}
      onClose={() => setDialog((prev) => ({ ...prev, show: false }))}
      title={dialog.title}
      message={dialog.message}
      type="warning"
      size="sm"
      autoClose={false}
      confirmLabel="Mengerti"
      overlayClassName="z-[10050]"
    />
  );
}
