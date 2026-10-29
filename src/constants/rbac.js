/** Selaras dengan server/src/config/rbac.js */
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

export function levelLabel(level) {
  const n = Number(level);
  return LEVEL_LABEL[n] || `Level ${level ?? "-"}`;
}

export function isSuperAdmin(user) {
  return Number(user?.level) === LEVEL.SUPER_ADMIN;
}

export function isStaffOps(user) {
  const n = Number(user?.level);
  return n === LEVEL.SUPER_ADMIN || n === LEVEL.OPERATOR;
}
