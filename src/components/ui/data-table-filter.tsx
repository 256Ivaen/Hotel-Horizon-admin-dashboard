import React from "react";
import { ChevronDown, Check, Filter as FilterIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface DataTableFilterProps {
  label: string;
  options: FilterOption[];
  selectedValues: string | string[];
  onChange: (newValues: string[]) => void;
  isMultiSelect?: boolean;
  className?: string;
}

const DataTableFilter: React.FC<DataTableFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  isMultiSelect = false,
  className,
}) => {
  const currentValues = Array.isArray(selectedValues)
    ? selectedValues
    : selectedValues
    ? [selectedValues]
    : [];
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    let newValues: string[] = [];

    if (isMultiSelect) {
      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
    } else {
      newValues = currentValues.includes(value) ? [] : [value];
      setOpen(false);
    }

    onChange(newValues);
  };

  const getButtonText = () => {
    if (currentValues.length === 0) {
      return label;
    }

    if (currentValues.length === 1) {
      return options.find((o) => o.value === currentValues[0])?.label || label;
    }

    return `${label} (${currentValues.length} selected)`;
  };

  const isAllSelected = currentValues.length === options.length;
  const isNoneSelected = currentValues.length === 0;

  const handleClear = () => {
    onChange([]);
    if (!isMultiSelect) {
      setOpen(false);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-dashed transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            currentValues.length > 0 &&
              "bg-gray-100 dark:bg-gray-800 border-solid",
            className
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Filter by ${label}. Current selection: ${getButtonText()}`}
        >
          <FilterIcon
            className="mr-2 h-3.5 w-3.5 text-gray-500"
            aria-hidden="true"
          />
          <span className="font-medium text-sm">{getButtonText()}</span>
          <ChevronDown
            className="ml-2 h-3 w-3 opacity-70"
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" align="start">
        <Command>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = currentValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 text-gray-500" />
                    )}
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>

          {(isMultiSelect || currentValues.length > 0) && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-1">
                {isMultiSelect && (
                  <button
                    onClick={handleSelectAll}
                    className="w-1/2 h-7 text-xs text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    {isAllSelected ? "Deselect All" : "Select All"}
                  </button>
                )}
                <button
                  onClick={handleClear}
                  disabled={isNoneSelected}
                  className={cn(
                    "h-7 text-xs text-red-500 hover:bg-red-500/10 transition-colors rounded",
                    isMultiSelect ? "w-1/2" : "w-full"
                  )}
                >
                  Clear Filter
                </button>
              </div>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { DataTableFilter };
