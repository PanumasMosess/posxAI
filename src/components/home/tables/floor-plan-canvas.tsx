"use client";

import { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { StatusTable, TableGridProps } from "@/lib/type";
import { updateTableLayout } from "@/lib/actions/actionSettings";
import Table_card_status from "./table-card-status";
import Table_editor_dialog from "./table-editor-dialog";

const getDefaultSize = (shape?: string) => {
  switch (shape) {
    case "bar": return { width: 15, height: 10 };
    case "rectangle": return { width: 12, height: 12 };
    case "vip": return { width: 15, height: 15 };
    case "sofa": return { width: 14, height: 14 };
    default: return { width: 10, height: 10 };
  }
};

const Floor_plan_canvas = ({ tables, editMode }: TableGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [tableItems, setTableItems] = useState(tables);
  const [selectedTable, setSelectedTable] = useState<StatusTable | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isDraggingRef = useRef(false);
  const pointerStartTime = useRef(0); // ใช้จับเวลาการกด

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTableItems(tables);
  }, [tables]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full aspect-video max-h-[75vh] min-h-[350px] overflow-hidden rounded-[32px] border border-[#ddd4c7] bg-[radial-gradient(circle_at_top,#f7f3ec,#ebe6dc)] shadow-inner touch-none"
      >
        {containerSize.width > 0 && tableItems.map((table) => {
          const defaultSize = getDefaultSize(table.shape);
          const safeX = (table.posX > 100) ? 0 : (table.posX || 0);
          const safeY = (table.posY > 100) ? 0 : (table.posY || 0);
          const safeW = (table.width > 100) ? defaultSize.width : (table.width || defaultSize.width);
          const safeH = (table.height > 100) ? defaultSize.height : (table.height || defaultSize.height);

          const currentWidth = (safeW / 100) * containerSize.width;
          const currentHeight = (safeH / 100) * containerSize.height;
          const currentX = (safeX / 100) * containerSize.width;
          const currentY = (safeY / 100) * containerSize.height;

          return (
            <Rnd
              key={`${table.id}-${table.shape}-${table.rotation}-${table.seatCount}`}
              size={{ width: currentWidth, height: currentHeight }}
              position={{ x: currentX, y: currentY }}
              bounds="parent"
              dragGrid={[1, 1]} // ปรับให้ลื่นขึ้นสำหรับมือถือ
              disableDragging={!editMode}
              enableResizing={editMode}
              // ใช้ pointerEvents เพื่อดักจับการจิ้ม
              onDragStart={() => {
                isDraggingRef.current = true;
                pointerStartTime.current = Date.now();
              }}
              onDragStop={(e, d) => {
                const posXPercent = (d.x / containerSize.width) * 100;
                const posYPercent = (d.y / containerSize.height) * 100;

                updateTableLayout(table.id, {
                  posX: posXPercent,
                  posY: posYPercent,
                  width: safeW,
                  height: safeH,
                });

                setTableItems((prev) =>
                  prev.map((item) =>
                    item.id === table.id ? { ...item, posX: posXPercent, posY: posYPercent } : item
                  )
                );

                // หน่วงเวลาเล็กน้อยเพื่อให้ onClick ไม่เด้งซ้อน
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 100);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const wPercent = (parseInt(ref.style.width) / containerSize.width) * 100;
                const hPercent = (parseInt(ref.style.height) / containerSize.height) * 100;
                const xPercent = (position.x / containerSize.width) * 100;
                const yPercent = (position.y / containerSize.height) * 100;

                updateTableLayout(table.id, {
                  posX: xPercent,
                  posY: yPercent,
                  width: wPercent,
                  height: hPercent,
                });

                setTableItems((prev) =>
                  prev.map((item) =>
                    item.id === table.id
                      ? { ...item, posX: xPercent, posY: yPercent, width: wPercent, height: hPercent }
                      : item
                  )
                );
              }}
            >
              <div
                className="w-full h-full active:scale-95 transition-transform"
                // ใช้ onPointerDown แทนการคลิกเพื่อความไวในมือถือ
                onPointerDown={() => {
                  pointerStartTime.current = Date.now();
                }}
                onPointerUp={(e) => {
                  const duration = Date.now() - pointerStartTime.current;

                  // ถ้าลาก (Drag) หรือ กดค้างนานเกินไป ไม่ต้องเปิด Dialog
                  if (isDraggingRef.current || duration > 250) return;

                  if (editMode) {
                    setSelectedTable(table);
                    setDialogOpen(true);
                  } else {
                    // สร้างตัวแปรไว้ด้านบนเพื่อให้สะอาดตา
                    const origin = window.location.origin;
                    const url = `${origin}/orders_?table=${table.id}&organizationId=${table.organizationId}`;
                    // เรียกใช้งาน
                    window.open(url, "_blank", "width=390,height=844");
                  }
                }}
              >
                <Table_card_status
                  table={table}
                  containerWidth={containerSize.width}
                />
              </div>
            </Rnd>
          );
        })}
      </div>

      <Table_editor_dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        table={selectedTable}
        onSaved={(updatedTable: StatusTable) => {
          setTableItems((prev) =>
            prev.map((item) => (item.id === updatedTable.id ? updatedTable : item))
          );
          setDialogOpen(false);
        }}
      />
    </>
  );
};

export default Floor_plan_canvas;