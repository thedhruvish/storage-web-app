import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionHeaderProps {
  title: string;
  description?: string;
  infoTooltip?: string;
}

export function SectionHeader({
  title,
  description,
  infoTooltip,
}: SectionHeaderProps) {
  return (
    <div className='flex flex-col gap-1 mb-4'>
      <div className='flex items-center gap-2'>
        <h3 className='text-lg font-medium leading-none tracking-tight'>
          {title}
        </h3>
        {infoTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors' />
              </TooltipTrigger>
              <TooltipContent>
                <p>{infoTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {description && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}
    </div>
  );
}
