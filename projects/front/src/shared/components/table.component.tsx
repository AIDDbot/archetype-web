import type { ReactElement } from "react";
import type { RecordTableModel } from "./record.type.ts";
type TableProps = { model: RecordTableModel };
export function RecordTable(props: TableProps): ReactElement {
  return (
    <div className="overflow-auto">
      <table>
        <caption>{props.model.title}</caption>
        <thead>
          <tr>
            {props.model.columns.map((column) => (
              <th key={column.key} scope="col" style={{ textAlign: column.align }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.model.rows.map((row) => (
            <tr key={row.key}>
              {row.cells.map((cell) => (
                <td key={cell.key} style={{ textAlign: cell.align }}>
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
