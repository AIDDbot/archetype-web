import { isMissing } from "#shared/values/values.check.ts";

export type Readable = { locale: string };

export type ReadableDate = Readable & { style: Intl.DateTimeFormatOptions; iso?: boolean };

export const dateTimeStyle: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const missing = "—";

export function readableText(value: string | number | null | undefined): string {
  const isAbsent = isMissing(value) || value === "";
  return isAbsent ? missing : String(value);
}

const pad = (part: number): string => String(part).padStart(2, "0");

export function isoDateTime(value: Date): string {
  const date = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  return `${date} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function localDate(value: Date, format: ReadableDate): string {
  const isIso = format.iso === true;
  return isIso
    ? isoDateTime(value)
    : new Intl.DateTimeFormat(format.locale, format.style).format(value);
}

export function readableDate(value: Date | null | undefined, format: ReadableDate): string {
  const isAbsent = isMissing(value);
  return isAbsent ? missing : localDate(value, format);
}

export function readableNumber(value: number | null | undefined, format: Readable): string {
  const isAbsent = isMissing(value);
  return isAbsent ? missing : new Intl.NumberFormat(format.locale).format(value);
}

export function readableDuration(seconds: number | null | undefined, format: Readable): string {
  const isAbsent = isMissing(seconds);
  const unit: Intl.NumberFormatOptions = { style: "unit", unit: "second", unitDisplay: "long" };
  return isAbsent ? missing : new Intl.NumberFormat(format.locale, unit).format(seconds);
}
