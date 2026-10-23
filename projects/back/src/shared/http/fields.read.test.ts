import { expect, test } from "vite-plus/test";
import { ExpectedError, ruleError } from "#shared/expected.error.ts";
import { readFields } from "./fields.read.ts";

test("reads declared fields and ignores other input", () => {
  expect(readFields({ name: "Ada", extra: true }, { name: String })).toEqual({ name: "Ada" });
  expect(readFields(null, { name: String })).toEqual({ name: "undefined" });
});

const invalid = () => {
  throw ruleError("value", "is required");
};
test("collects one error for each incorrect field", () => {
  expect(() => readFields({}, { first: invalid, second: invalid })).toThrow(
    new ExpectedError({
      kind: "rule",
      message: "Invalid fields",
      fields: { first: "value is required", second: "value is required" },
    }),
  );
});

test("preserves unexpected failures", () => {
  const failure = new Error("programming failure");
  const crash = () => {
    throw failure;
  };
  expect(() => readFields({}, { field: crash })).toThrow(failure);
});
