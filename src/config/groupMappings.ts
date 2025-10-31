
/**
 * Map user groups to safe, hard-coded table names
 * This prevents SQL injection via user-controlled group names
 */
export const GROUP_TO_FORM_NAME: Record<string, string> = {
  "halls-gap": "Halls Gap LCG",
  jallukar: "Jallukar LCG",
  // Add other groups here
};

export const DEFAULT_GROUP = "halls-gap";

/**
 * Safely get form name for a user's group
 */
export function getFormNameForGroup(userGroup?: string): string {
  const groupKey = (userGroup || DEFAULT_GROUP).toLowerCase();
  return GROUP_TO_FORM_NAME[groupKey] || GROUP_TO_FORM_NAME[DEFAULT_GROUP];
}
