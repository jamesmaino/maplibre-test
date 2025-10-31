/**
 * Applies template variables to a query string.
 * Replaces all occurrences of `{{key}}` with the corresponding value from the `vars` object.
 */
export function applyTemplate(
  query: string,
  vars: Record<string, string>
): string {
  let templatedQuery = query;
  for (const key in vars) {
    const regex = new RegExp(`{{${key}}}`, "g");
    templatedQuery = templatedQuery.replace(regex, vars[key]);
  }
  return templatedQuery;
}