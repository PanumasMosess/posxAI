"use client";

import { Dispatch, SetStateAction, useState, KeyboardEvent } from "react";
import { CommandEmpty, CommandInput, CommandList } from "../ui/command";
import { getSearchQueryFromJson } from "@/lib/ai/geminiAI";

const StockPageSearch = ({
  stateSheet,
  initialItems,
}: {
  stateSheet: Dispatch<SetStateAction<boolean>>;
  initialItems: any[];
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [response, setResponse] = useState("");

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);

    const result = await getSearchQueryFromJson(initialItems, inputValue);

    if (result.success && result.answer) {
      setResponse(result.answer);
    } else {
      setResponse("ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหา");
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setResponse("");
      handleSearch();
    }
  };

  return (
    <>
      <CommandInput
        placeholder="เช่น 'หาของที่เป็นเนื้อไก่' หรือ 'ราคาไม่เกิน 100'"
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={handleKeyDown}
      />
      <CommandList>
        {isLoading && (
          <div className="p-4 text-sm text-center">posx ai is thinking...</div>
        )}

        {!isLoading && !response && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {!isLoading && response && (
          <div className="p-0">
            <pre>
              <div className="whitespace-pre-wrap text-sm text-foreground p-4 text-left w-full">
                {response}
              </div>
            </pre>
          </div>
        )}
      </CommandList>
    </>
  );
};

export default StockPageSearch;
