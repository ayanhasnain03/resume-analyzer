"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Tag = {
  id: string;
  label: string;
};

type TagsSelectorProps = {
  tags: Tag[];
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  placeholder?: string;
  createText?: string;
  maxDisplay?: number;
  className?: string;
};

export function TagsSelector({
  tags,
  value = [],
  onChange,
  placeholder = "Select skills...",
  createText = "Create",
  maxDisplay = 5,
  className,
}: TagsSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedIds = React.useMemo(
    () => new Set(value.map((tag) => tag.id)),
    [value]
  );

  const filteredTags = React.useMemo(() => {
    if (!search.trim()) {
      return tags.filter((tag) => !selectedIds.has(tag.id)).slice(0, 10);
    }

    const searchLower = search.toLowerCase();
    return tags.filter(
      (tag) =>
        !selectedIds.has(tag.id) &&
        tag.label.toLowerCase().includes(searchLower)
    );
  }, [tags, search, selectedIds]);

  const canCreate = React.useMemo(() => {
    if (!search.trim()) return false;
    const searchLower = search.trim().toLowerCase();
    return (
      searchLower.length >= 2 &&
      !tags.some(
        (tag) =>
          tag.label.toLowerCase() === searchLower || tag.id === searchLower
      ) &&
      !selectedIds.has(searchLower)
    );
  }, [search, tags, selectedIds]);

  const handleSelect = (tag: Tag) => {
    if (selectedIds.has(tag.id)) {
      onChange?.(value.filter((t) => t.id !== tag.id));
    } else {
      onChange?.([...value, tag]);
    }
    setSearch("");
  };

  const handleCreate = React.useCallback(() => {
    if (!canCreate) return;
    const newTag: Tag = {
      id: search.trim().toLowerCase().replace(/\s+/g, "-"),
      label: search.trim(),
    };
    onChange?.([...value, newTag]);
    setSearch("");
    setOpen(false);
  }, [canCreate, search, value, onChange]);

  const handleRemove = (tagId: string) => {
    onChange?.(value.filter((t) => t.id !== tagId));
  };

  const displayedTags = value.slice(0, maxDisplay);
  const remainingCount = value.length - maxDisplay;

  // Handle Enter key to create new tag
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (open && canCreate && e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        handleCreate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, canCreate, handleCreate]);

  return (
    <div className={cn("w-full space-y-3", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-11 py-2.5 px-3",
              "hover:bg-accent/50 transition-colors",
              open && "ring-2 ring-ring ring-offset-2"
            )}
          >
            <div className="flex flex-wrap gap-1.5 flex-1 items-center min-h-[1.5rem]">
              {value.length === 0 ? (
                <span className="text-muted-foreground text-sm">
                  {placeholder}
                </span>
              ) : (
                <>
                  {displayedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="mr-0 mb-0 px-2.5 py-1 text-xs font-medium gap-1.5 pointer-events-none"
                    >
                      <span>{tag.label}</span>
                    </Badge>
                  ))}
                  {remainingCount > 0 && (
                    <Badge
                      variant="outline"
                      className="mr-0 mb-0 px-2.5 py-1 text-xs font-medium pointer-events-none"
                    >
                      +{remainingCount} more
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create skills..."
              value={search}
              onValueChange={setSearch}
              className="h-11"
            />
            <CommandList className="max-h-[300px]">
              {filteredTags.length === 0 && !canCreate && (
                <CommandEmpty>
                  <div className="py-8 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-1">
                      No skills found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type at least 2 characters to create a new skill
                    </p>
                  </div>
                </CommandEmpty>
              )}

              {canCreate && (
                <CommandGroup heading="Create New Skill">
                  <CommandItem
                    onSelect={handleCreate}
                    className="bg-accent/50 hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {createText} &quot;{search.trim()}&quot;
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Press Ctrl+Enter or click to create
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}

              {filteredTags.length > 0 && (
                <>
                  {canCreate && <CommandSeparator />}
                  <CommandGroup heading="Available Skills">
                    {filteredTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.label}
                        onSelect={() => handleSelect(tag)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 transition-opacity",
                            selectedIds.has(tag.id)
                              ? "opacity-100 text-primary"
                              : "opacity-0"
                          )}
                        />
                        <span className="flex-1">{tag.label}</span>
                        {selectedIds.has(tag.id) && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0"
                          >
                            Selected
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {filteredTags.length > 10 && !search.trim() && (
                <>
                  <CommandSeparator />
                  <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                    Showing first 10 skills. Type to search for more...
                  </div>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md border border-border/50">
          <div className="flex items-center gap-1.5 w-full mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Selected Skills ({value.length}):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-3 py-1.5 text-xs font-medium gap-2 group/badge"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  className="ml-0.5 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRemove(tag.id);
                    }
                  }}
                  onClick={() => handleRemove(tag.id)}
                  aria-label={`Remove ${tag.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
