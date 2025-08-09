
import { useState, useRef, useEffect } from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export const MultiSelect = ({
  values,
  onChange,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect to focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Handle adding a new item
  const handleAddItem = () => {
    if (inputValue.trim() && !values.includes(inputValue.trim())) {
      onChange([...values, inputValue.trim()]);
      setInputValue("");
    }
  };

  // Handle removing an item
  const handleRemoveItem = (item: string) => {
    onChange(values.filter(i => i !== item));
  };

  // Handle selecting an existing item to toggle its presence
  const handleSelect = (item: string) => {
    if (values.includes(item)) {
      handleRemoveItem(item);
    } else {
      onChange([...values, item]);
    }
  };

  // Create unique options by combining existing values with the current input
  const options = [...new Set([...values, ...(inputValue ? [inputValue] : [])])];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1 py-1">
            {values.length > 0 ? (
              values.map(item => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="m-0.5 pr-0.5 pl-2"
                >
                  {item}
                  <Button
                    variant="ghost"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search or add new..." 
            value={inputValue}
            onValueChange={setInputValue}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          {options.length === 0 && (
            <CommandEmpty>{emptyMessage}</CommandEmpty>
          )}
          <CommandList>
            <CommandGroup>
              {options.map(item => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(item) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
              {inputValue.trim() && !options.includes(inputValue.trim()) && (
                <CommandItem
                  onSelect={handleAddItem}
                  className="text-muted-foreground"
                >
                  Add "{inputValue.trim()}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
