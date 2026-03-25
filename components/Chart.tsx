'use client'

import { chartData } from '@/lib/mockData'

export default function Chart() {
  const maxValue = Math.max(...chartData.map((d) => d.leads))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Leads por Mês</h3>
          <p className="text-sm text-slate-500 mt-0.5">Comparativo de leads e conversões</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-xs text-slate-600">Leads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-xs text-slate-600">Conversões</span>
          </div>
        </div>
      </div>

      {/* Y-axis labels + bars */}
      <div className="flex gap-2">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-40 text-right pr-2 shrink-0">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map(
            (v) => (
              <span key={v} className="text-xs text-slate-400 leading-none">
                {v}
              </span>
            )
          )}
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end gap-1.5 h-40 border-b border-l border-slate-100 relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-slate-100" />
            ))}
          </div>

          {chartData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end z-10">
              <div className="w-full flex items-end gap-0.5 h-full">
                <div
                  title={`Leads: ${item.leads}`}
                  className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-700 hover:bg-blue-600 cursor-default"
                  style={{ height: `${(item.leads / maxValue) * 100}%` }}
                />
                <div
                  title={`Conversões: ${item.conversoes}`}
                  className="flex-1 bg-emerald-500 rounded-t-sm transition-all duration-700 hover:bg-emerald-600 cursor-default"
                  style={{ height: `${(item.conversoes / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1.5 mt-1 pl-10">
        {chartData.map((item, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-xs text-slate-500">{item.mes}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
