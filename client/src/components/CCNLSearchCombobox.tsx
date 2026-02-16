import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";

interface CCNL {
  id: number;
  externalId: string;
  name: string;
  sector: string;
  isENGEB: number;
}

interface CCNLSearchComboboxProps {
  value?: string;
  onSelect: (ccnl: CCNL | null) => void;
  placeholder?: string;
  label?: string;
}

export function CCNLSearchCombobox({
  value,
  onSelect,
  placeholder = "Cerca CCNL...",
  label,
}: CCNLSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search CCNLs
  const { data: searchResults, isLoading } = trpc.ccnl.search.useQuery(
    { query: debouncedQuery, limit: 20 },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const selectedCCNL = searchResults?.find((c) => c.externalId === value);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCCNL ? (
              <span className="truncate">{selectedCCNL.name}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Cerca per nome, settore, codice..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus:ring-0"
              />
            </div>
            <CommandList>
              {searchQuery.length < 2 ? (
                <CommandEmpty>
                  Digita almeno 2 caratteri per cercare...
                </CommandEmpty>
              ) : isLoading ? (
                <CommandEmpty>Ricerca in corso...</CommandEmpty>
              ) : !searchResults || searchResults.length === 0 ? (
                <CommandEmpty>Nessun CCNL trovato.</CommandEmpty>
              ) : (
                <CommandGroup heading={`${searchResults.length} risultati`}>
                  {searchResults.map((ccnl) => (
                    <CommandItem
                      key={ccnl.id}
                      value={ccnl.externalId}
                      onSelect={() => {
                        onSelect(ccnl);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === ccnl.externalId
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{ccnl.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {ccnl.sector}
                          {ccnl.isENGEB === 1 && (
                            <span className="ml-2 text-blue-600">• ENGEB</span>
                          )}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
