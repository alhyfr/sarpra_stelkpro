"use client";

import { useEffect, useState } from "react";
import DialogInfo from "@/components/DialogInfo";

/**
 * Menampilkan dialog saat API mengembalikan 403 (termasuk FORBIDDEN_LEVEL).
 * Dipicu dari interceptor di app/utils/Api.js lewat CustomEvent "sip:forbidden".
 */
export default function ApiForbiddenListener() {
  const [dialog, setDialog] = useState({
    show: false,
    title: "Akses Ditolak",
    message: "",
  });

  useEffect(() => {
    const onForbidden = (event) => {
      const detail = event.detail || {};
      setDialog({
        show: true,
        title: detail.title || "Akses Ditolak",
        message:
          detail.message ||
          "Anda tidak memiliki hak untuk melakukan tindakan ini.",
      });
    };
    window.addEventListener("sip:forbidden", onForbidden);
    return () => window.removeEventListener("sip:forbidden", onForbidden);
  }, []);

  return (
    <DialogInfo
      show={dialog.show}
      onClose={() => setDialog((prev) => ({ ...prev, show: false }))}
      title={dialog.title}
      message={dialog.message}
      type="error"
      size="sm"
      autoClose={false}
    />
  );
}
