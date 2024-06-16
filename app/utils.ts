import { ValueError } from "./errors";

export function getRequiredStringFromFormData(
  formData: FormData,
  key: string,
  requiredMessage?: string,
) {
  const value = formData.get(key);
  if (!value) throw new ValueError(requiredMessage ?? `${key} is required`);
  if (typeof value !== "string") throw new ValueError(`${key} must be a string`);
  return value;
}
