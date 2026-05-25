import { ChartAreaInteractive } from "@web/components/chart-area-interactive"
import { DataTable } from "@web/components/data-table"
import { SectionCards } from "@web/components/section-cards"

import data from "./data.json"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  )
}
