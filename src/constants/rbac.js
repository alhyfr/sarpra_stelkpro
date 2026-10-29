/** Selaras dengan server/src/config/rbac.js dan tabel roles.role_id */
export const LEVEL = {
  SUPER_ADMIN: 1,
  OPERATOR: 2,
  USER: 3,
};

export const LEVEL_LABEL = {
  [LEVEL.SUPER_ADMIN]: "Super Admin",
  [LEVEL.OPERATOR]: "Operator",
  [LEVEL.USER]: "User",
};

/** Opsi select form user — value = role_id / users.level */
export const LEVEL_OPTIONS = [
  {
    value: String(LEVEL.SUPER_ADMIN),
    label: "Super Admin",
  },
  {
    value: String(LEVEL.OPERATOR),
    label: "Operator",
  },
  {
    value: String(LEVEL.USER),
    label: "User",
  },
];

export const STATUS_OPTIONS = [
  { value: "on", label: "Aktif" },
  { value: "off", label: "Nonaktif" },
];

export function levelLabel(level) {
  const n = Number(level);
  return LEVEL_LABEL[n] || `Level ${level ?? "-"}`;
}

/**
 * Opsi select level: selalu tampilkan 1–3 dari RBAC.
 * Baris ekstra di tabel roles (role_id > 3) ikut ditampilkan jika ada.
 */
export function roleSelectOptions(roles = []) {
  const byId = new Map(
    LEVEL_OPTIONS.map((opt) => [Number(opt.value), { ...opt }])
  );

  if (Array.isArray(roles)) {
    for (const role of roles) {
      const id = Number(role.role_id ?? role.id);
      if (!Number.isFinite(id)) continue;
      byId.set(id, {
        value: String(id),
        label: LEVEL_LABEL[id] || role.codename || `Level ${id}`,
      });
    }
  }

  return Array.from(byId.values()).sort(
    (a, b) => Number(a.value) - Number(b.value)
  );
}

export function positionSelectOptions(positions = []) {
  return (positions || []).map((position) => ({
    value: String(position.pos_id ?? position.id),
    label: position.codename || `Posisi ${position.pos_id}`,
  }));
}

export function isSuperAdmin(user) {
  return Number(user?.level) === LEVEL.SUPER_ADMIN;
}

export function isStaffOps(user) {
  const n = Number(user?.level);
  return n === LEVEL.SUPER_ADMIN || n === LEVEL.OPERATOR;
}
