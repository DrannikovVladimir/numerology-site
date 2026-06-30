interface TableProps {
  caption: string;
  headers: string[];
  rows: string[][];
}

// Сравнение 3+ элементов или структурированные данные с несколькими параметрами
export default function Table({ caption, headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-2 text-left text-base font-semibold text-slate-900">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-slate-300">
            {headers.map((header, index) => (
              <th key={index} className="px-3 py-2 font-semibold text-slate-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-slate-200">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
