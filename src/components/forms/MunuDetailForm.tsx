import { Dispatch, SetStateAction, useEffect } from "react";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

const MunuDetailForm = ({
  stateSheet,
}: {
  stateSheet: Dispatch<SetStateAction<boolean>>;
}) => {
  const handleDetailCat = () => {
    stateSheet(true);
  };
  return (
    <SheetContent
      className="w-[400px] sm:w-[540px] flex flex-col"
      onInteractOutside={(e) => e.preventDefault()}
    >
      <SheetHeader>
        <SheetTitle className="mb-2">รายละเอียดเมนู</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleDetailCat}>
            <Pencil className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            ยกเลิกเมนู
          </Button>
        </div>
      </div>
      <SheetFooter className="p-6"></SheetFooter>
    </SheetContent>
  );
};

export default MunuDetailForm;
