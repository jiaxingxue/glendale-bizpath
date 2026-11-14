'use client'

import { useId } from 'react'
import { useI18n } from '@/lib/i18n'

type Row = { key: string; cells: React.ReactNode[] }
type DataTableProps = { title: string; hint?: string; columns: string[]; rows: Row[] }

export function DataTable({ title, hint, columns, rows }: DataTableProps) {
  const { t } = useI18n()
  const titleId = useId()
  const lastIndex = columns.length - 1

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h2 id={titleId} className="text-lg">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-secondary px-4 py-6 text-center text-sm text-muted-foreground">{t('staff.empty_table')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                {columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={`py-2 font-medium ${index === lastIndex && columns.length > 1 ? 'text-end' : 'pe-4 text-start'}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  {row.cells.map((cell, index) => (
                    <td
                      key={index}
                      className={`py-2.5 align-top leading-relaxed ${index === lastIndex && columns.length > 1 ? 'text-end tabular-nums' : 'pe-4'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
