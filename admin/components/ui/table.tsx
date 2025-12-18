// components/ui/table.tsx
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        {children}
      </table>
    </div>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b hover:bg-gray-50">{children}</tr>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 bg-gray-50 text-left font-semibold">
      {children}
    </th>
  );
}