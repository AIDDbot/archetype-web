import { createRecordDetail } from "#shared/components/record.prepare.ts";
import type { ReadableDate } from "#shared/values/readable/readable.format.ts";
import type { RecordDetailModel } from "#shared/components/record.type.ts";
import type { Account } from "./users.type.ts";
export function accountDetail(account: Account, format: ReadableDate): RecordDetailModel {
  return createRecordDetail(
    {
      title: account.name,
      sections: [
        {
          title: "Account",
          facts: [
            { label: "Email", value: { kind: "text", text: account.email } },
            { label: "Created", value: { kind: "date", date: account.createdAt } },
          ],
        },
      ],
    },
    format,
  );
}
