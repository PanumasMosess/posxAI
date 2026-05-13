"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Map,
  Table2,
} from "lucide-react";
import { TableDataListProps } from "@/lib/type";
import { Data_table_status_table } from "./data-table-status-table";
import { Data_grid_status_table } from "./data-grid-status-table";
import { Data_floor_plan_status_table } from "./data-floor-plan-status-table";

const Table_status_tabs = ({
  columns,
  data,
  userId,
  organizationId,
}: TableDataListProps) => {
  const [view, setView] = useState<
    "table" | "grid" | "floor"
  >("table");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setView("table")
          }
          className={`
            px-4 py-2 rounded-xl
            flex items-center gap-2
            transition-all

            ${
              view === "table"
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800"
            }
          `}
        >
          <Table2 className="w-4 h-4" />
          ตาราง
        </button>

        <button
          onClick={() =>
            setView("grid")
          }
          className={`
            px-4 py-2 rounded-xl
            flex items-center gap-2
            transition-all

            ${
              view === "grid"
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800"
            }
          `}
        >
          <LayoutGrid className="w-4 h-4" />
          Grid
        </button>

        <button
          onClick={() =>
            setView("floor")
          }
          className={`
            px-4 py-2 rounded-xl
            flex items-center gap-2
            transition-all

            ${
              view === "floor"
                ? "bg-orange-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800"
            }
          `}
        >
          <Map className="w-4 h-4" />
          Floor Plan
        </button>
      </div>

      {view === "table" && (
        <Data_table_status_table
          columns={columns}
          data={data}
          userId={userId}
          organizationId={
            organizationId
          }
        />
      )}

      {view === "grid" && (
        <Data_grid_status_table
          tables={data}
        />
      )}

      {view === "floor" && (
        <Data_floor_plan_status_table
          tables={data}
        />
      )}
    </div>
  );
};

export default Table_status_tabs;