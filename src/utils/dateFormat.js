export const DATE_INPUT_MASK = "DD/MM/YYYY";
export const DATE_MASK_SLOT_INDEXES = [0, 1, 3, 4, 6, 7, 8, 9];

/** Format raw digits into DD/MM/YYYY as the user types. */
export function formatDateInputDigits(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Extract digit string from ISO date for masked input state. */
export function isoToDateDigits(iso) {
  return isoToDisplay(iso).replace(/\D/g, "");
}

/** Build masked display — typed digits replace D/M/Y placeholders in place. */
export function digitsToMaskedDate(digits) {
  const chars = DATE_INPUT_MASK.split("");
  const normalized = String(digits).replace(/\D/g, "").slice(0, 8);

  for (let i = 0; i < normalized.length; i++) {
    chars[DATE_MASK_SLOT_INDEXES[i]] = normalized[i];
  }

  return chars.join("");
}

/** Convert 8 raw digits to ISO (YYYY-MM-DD), or null if invalid/incomplete. */
export function digitsToIso(digits) {
  const normalized = String(digits).replace(/\D/g, "").slice(0, 8);
  if (normalized.length !== 8) return null;
  return displayToIso(digitsToMaskedDate(normalized));
}

/** Convert ISO date (YYYY-MM-DD) to DD/MM/YYYY for display. */
export function isoToDisplay(iso) {
  if (!iso) return "";
  const datePart = String(iso).slice(0, 10);
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Format upload timestamp for history tables (DD/MM/YYYY, HH:mm). */
export function formatUploadedAt(isoDateTime) {
  if (!isoDateTime) return "";
  return new Date(isoDateTime).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Parse DD/MM/YYYY to ISO (YYYY-MM-DD). Returns null if invalid. */
export function displayToIso(display) {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const parsed = new Date(`${iso}T00:00:00`);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return iso;
}
