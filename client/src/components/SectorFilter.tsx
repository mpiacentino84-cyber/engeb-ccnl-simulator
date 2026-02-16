import { Button } from "@/components/ui/button";
import { SECTOR_CATEGORIES } from "@/lib/ccnlData";
import { cn } from "@/lib/utils";

interface SectorFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SectorFilter({
  selectedCategory,
  onCategoryChange,
}: SectorFilterProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Filtra per Settore</h3>
      <div className="grid grid-cols-2 gap-2">
        {SECTOR_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={cn(
              "justify-start text-xs h-auto py-2 px-3 transition-all",
              selectedCategory === category.id
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "hover:bg-gray-100"
            )}
          >
            <span className="mr-2">{category.icon}</span>
            <span className="text-left">{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
