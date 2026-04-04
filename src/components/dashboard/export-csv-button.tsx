'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportCsvButtonProps {
  data: Record<string, unknown>[]
  filename: string
}

export function ExportCsvButton({ data, filename }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        const str = val == null ? '' : String(val)
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
      <Download className="w-4 h-4" /> Export CSV
    </Button>
  )
}
