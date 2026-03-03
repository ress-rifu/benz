"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface MultiSearchableSelectOption {
    value: string
    label: string
}

interface MultiSearchableSelectProps {
    options: MultiSearchableSelectOption[]
    values: string[]
    onValuesChange: (values: string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    className?: string
    triggerClassName?: string
}

export function MultiSearchableSelect({
    options,
    values,
    onValuesChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    className,
    triggerClassName,
}: MultiSearchableSelectProps) {
    const [open, setOpen] = React.useState(false)

    const selectedOptions = options.filter((option) => values.includes(option.value))

    const toggleValue = (value: string) => {
        if (values.includes(value)) {
            onValuesChange(values.filter((v) => v !== value))
        } else {
            onValuesChange([...values, value])
        }
    }

    const removeValue = (value: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onValuesChange(values.filter((v) => v !== value))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal h-auto min-h-10",
                        !selectedOptions.length && "text-muted-foreground",
                        triggerClassName
                    )}
                >
                    <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.value}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 h-5 gap-1"
                                >
                                    {option.label}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={(e) => removeValue(option.value, e)}
                                    />
                                </Badge>
                            ))
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-[--radix-popover-trigger-width] p-0", className)}>
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => toggleValue(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            values.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
