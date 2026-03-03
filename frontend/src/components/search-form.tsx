import { useState } from "react";
import { useSearchStore } from "@/store/search-store";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInput } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

export function SearchForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    query,
    extensions,
    size,
    isStarred,
    setSearch,
    setExtensions,
    setSize,
    setIsStarred,
    resetFilters,
  } = useSearchStore();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <form
      className={`flex items-center gap-2 ${className}`}
      {...props}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className='relative flex-1 max-w-md w-full'>
        <Label htmlFor='search' className='sr-only'>
          Search
        </Label>
        <SidebarInput
          id='search'
          placeholder='Search files...'
          className='h-8 pl-7 pr-4 w-full'
          value={query}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className='pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none' />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8 relative'
            type='button'
          >
            <SlidersHorizontal className='h-4 w-4' />
            {(extensions || size || isStarred) && (
              <div className='absolute top-1 right-1 h-2 w-2 rounded-full bg-primary' />
            )}
            <span className='sr-only'>Toggle filters</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='end'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium leading-none'>Filters</h4>
              <p className='text-sm text-muted-foreground'>
                Refine your search results.
              </p>
            </div>
            <div className='grid gap-3'>
              <div className='grid gap-1.5'>
                <Label htmlFor='extensions'>Extensions</Label>
                <Input
                  id='extensions'
                  placeholder='e.g. pdf, png, docx'
                  value={extensions}
                  onChange={(e) => setExtensions(e.target.value)}
                  className='h-8'
                />
              </div>
              <div className='grid gap-1.5'>
                <Label htmlFor='size'>Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Any Size' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='any'>Any Size</SelectItem>
                    <SelectItem value='less_1'>Less than 1 MB</SelectItem>
                    <SelectItem value='less_10'>Less than 10 MB</SelectItem>
                    <SelectItem value='less_100'>Less than 100 MB</SelectItem>
                    <SelectItem value='greater_100'>
                      Larger than 100 MB
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='starred-only' className='cursor-pointer'>
                  Starred Only
                </Label>
                <Switch
                  id='starred-only'
                  checked={isStarred}
                  onCheckedChange={setIsStarred}
                />
              </div>
            </div>
            {(extensions || size !== "" || isStarred) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  resetFilters();
                  setIsOpen(false);
                }}
                className='w-full text-xs'
              >
                Clear Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </form>
  );
}
