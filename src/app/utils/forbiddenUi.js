/**
 * Sinkronisasi UI 403 antara interceptor Api dan window.alert di catch form.
 * Setelah 403, alert bawaan browser di-skip dan DialogInfo yang dipakai.
 */

const FORBIDDEN_MSG_RE =
  /akses ditolak|hak akses tidak|forbidden_level|tidak memiliki hak|membutuhkan:\s*(super admin|operator)|status code 403/i;

let armedUntil = 0;
let lastDetail = {
  title: "Hak Akses Tidak Cukup",
  message: "Anda tidak memiliki hak untuk melakukan tindakan ini.",
};

export function armForbiddenUi(detail = {}) {
  armedUntil = Date.now() + 4000;
  lastDetail = {
    title: detail.title || "Hak Akses Tidak Cukup",
    message:
      detail.message ||
      "Anda tidak memiliki hak untuk melakukan tindakan ini.",
    code: detail.code,
  };
}

export function isForbiddenUiArmed() {
  return Date.now() < armedUntil;
}

export function getForbiddenDetail() {
  return { ...lastDetail };
}

export function isForbiddenAlertMessage(message) {
  return FORBIDDEN_MSG_RE.test(String(message ?? ""));
}

/** true = jangan panggil alert browser; pakai detail dialog */
export function shouldRedirectAlertToForbiddenDialog(message) {
  return isForbiddenUiArmed() || isForbiddenAlertMessage(message);
}
