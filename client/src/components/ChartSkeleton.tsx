import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ChartSkeletonProps {
  title: string;
  description: string;
  height?: number;
}

export function ChartSkeleton({ title, description, height = 400 }: ChartSkeletonProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
          style={{ height: `${height}px` }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Caricamento grafico in corso...</p>
          <p className="text-xs text-gray-400 mt-1">Elaborazione dati statistici</p>
        </div>
      </CardContent>
    </Card>
  );
}
