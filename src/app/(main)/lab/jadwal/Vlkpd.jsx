'use client'
import { useState, useMemo, useEffect } from "react";
import { Eye } from "lucide-react";
import Modal from "@/components/Modal";
import { toPdfUrl } from "@/helper/pdf";

export default function Vlkpd({ item }) {
    const [open, setOpen] = useState(false);
  const url = useMemo(() => toPdfUrl(item), [item]);
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (open) {
      const prevHtml = html.style.overflow;
      const prevBody = body.style.overflow;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      return () => {
        html.style.overflow = prevHtml;
        body.style.overflow = prevBody;
      };
    }
  }, [open]);
    return (
        <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-blue-600 hover:text-blue-900"
          title="View PDF"
        >
          <Eye className="w-4 h-4" />
        </button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="View PDF"
          width="95vw"
          height="90vh"
          maxWidth="1400px"
          maxHeight="90vh"
          position="center"
          backdropBlur="sm"
          closeOnOverlayClick={false}
          showCloseButton={true}
        >
          <div className="h-[85vh]">
            {url ? (
              <iframe src={url} className="w-full h-full" title="PDF" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Tidak ada URL PDF</p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    )
}