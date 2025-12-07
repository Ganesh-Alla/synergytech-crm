'use client'

import React, { type FC, useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { DateInput } from './date-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CalendarIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateRangePickerProps {
  /** Click handler for applying the updates from DateRangePicker. */
  onUpdate?: (values: { range: DateRange, rangeCompare?: DateRange }) => void
  /** Initial value for start date */
  initialDateFrom?: Date | string
  /** Initial value for end date */
  initialDateTo?: Date | string
  /** Initial value for start date for compare */
  initialCompareFrom?: Date | string
  /** Initial value for end date for compare */
  initialCompareTo?: Date | string
  /** Option for locale */
  locale?: string
  /** Option for showing compare feature */
  showCompare?: boolean
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    // Split the date string to get year, month, and day parts
    const parts = dateInput.split('-').map((part) => parseInt(part, 10))
    // Create a new Date object using the local timezone
    // Note: Month is 0-indexed, so subtract 1 from the month part
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date
  } else {
    // If dateInput is already a Date object, return it directly
    return dateInput
  }
}

interface DateRange {
  from: Date
  to: Date | undefined
}

interface Preset {
  name: string
  label: string
}

// Define presets
const PRESETS: Preset[] = [
  { name: 'today', label: 'Today' },
  { name: 'yesterday', label: 'Yesterday' },
  { name: 'last7', label: 'Last 7 days' },
  { name: 'last14', label: 'Last 14 days' },
  { name: 'last30', label: 'Last 30 days' },
  { name: 'thisWeek', label: 'This Week' },
  { name: 'lastWeek', label: 'Last Week' },
  { name: 'thisMonth', label: 'This Month' },
  { name: 'lastMonth', label: 'Last Month' }
]

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialDateFrom,
  initialDateTo,
  initialCompareFrom,
  initialCompareTo,
  onUpdate,
  locale = 'en-US',
  showCompare = true
}): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  const [range, setRange] = useState<DateRange | undefined>(
    initialDateFrom
      ? {
          from: getDateAdjustedForTimezone(initialDateFrom),
          to: initialDateTo
            ? getDateAdjustedForTimezone(initialDateTo)
            : getDateAdjustedForTimezone(initialDateFrom)
        }
      : undefined
  )
  const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
    initialCompareFrom
      ? {
          from: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
          to: initialCompareTo
            ? new Date(new Date(initialCompareTo).setHours(0, 0, 0, 0))
            : new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0))
        }
      : undefined
  )

  // Refs to store the values of range and rangeCompare when the date picker is opened
  const openedRangeRef = useRef<DateRange | undefined>(undefined)
  const openedRangeCompareRef = useRef<DateRange | undefined>(undefined)
  const initializedRangeRef = useRef<DateRange | undefined>(undefined)
  const prevIsOpenRef = useRef<boolean>(false)

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 960 : false
  )

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmallScreen(window.innerWidth < 960)
    }

    window.addEventListener('resize', handleResize)

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getPresetRange = (presetName: string): DateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName)
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
    const from = new Date()
    const to = new Date()
    const first = from.getDate() - from.getDay()

    switch (preset.name) {
      case 'today':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        from.setDate(from.getDate() - 1)
        from.setHours(0, 0, 0, 0)
        to.setDate(to.getDate() - 1)
        to.setHours(23, 59, 59, 999)
        break
      case 'last7':
        from.setDate(from.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last14':
        from.setDate(from.getDate() - 13)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last30':
        from.setDate(from.getDate() - 29)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisWeek':
        from.setDate(first)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastWeek':
        from.setDate(from.getDate() - 7 - from.getDay())
        to.setDate(to.getDate() - to.getDay() - 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
    }

    return { from, to }
  }

  const setPreset = (preset: string): void => {
    const range = getPresetRange(preset)
    setRange(range)
    if (rangeCompare) {
      const rangeCompare = {
        from: new Date(
          range.from.getFullYear() - 1,
          range.from.getMonth(),
          range.from.getDate()
        ),
        to: range.to
          ? new Date(
            range.to.getFullYear() - 1,
            range.to.getMonth(),
            range.to.getDate()
          )
          : undefined
      }
      setRangeCompare(rangeCompare)
    }
  }

  const checkPreset = (): void => {
    if (!range) {
      setSelectedPreset(undefined)
      return
    }

    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name)

      const normalizedRangeFrom = new Date(range.from);
      normalizedRangeFrom.setHours(0, 0, 0, 0);
      const normalizedPresetFrom = new Date(
        presetRange.from.setHours(0, 0, 0, 0)
      )

      const normalizedRangeTo = new Date(range.to ?? 0);
      normalizedRangeTo.setHours(0, 0, 0, 0);
      const normalizedPresetTo = new Date(
        presetRange.to?.setHours(0, 0, 0, 0) ?? 0
      )

      if (
        normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
        normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
      ) {
        setSelectedPreset(preset.name)
        return
      }
    }

    setSelectedPreset(undefined)
  }

  const resetValues = (): void => {
    setRange(
      initialDateFrom
        ? {
            from:
              typeof initialDateFrom === 'string'
                ? getDateAdjustedForTimezone(initialDateFrom)
                : initialDateFrom,
            to: initialDateTo
              ? typeof initialDateTo === 'string'
                ? getDateAdjustedForTimezone(initialDateTo)
                : initialDateTo
              : typeof initialDateFrom === 'string'
                ? getDateAdjustedForTimezone(initialDateFrom)
                : initialDateFrom
          }
        : undefined
    )
    setRangeCompare(
      initialCompareFrom
        ? {
            from:
              typeof initialCompareFrom === 'string'
                ? getDateAdjustedForTimezone(initialCompareFrom)
                : initialCompareFrom,
            to: initialCompareTo
              ? typeof initialCompareTo === 'string'
                ? getDateAdjustedForTimezone(initialCompareTo)
                : initialCompareTo
              : typeof initialCompareFrom === 'string'
                ? getDateAdjustedForTimezone(initialCompareFrom)
                : initialCompareFrom
          }
        : undefined
    )
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: checkPreset depends on range, which is in dependencies
  useEffect(() => {
    checkPreset()
  }, [range])

  const PresetButton = ({
    preset,
    label,
    isSelected
  }: {
    preset: string
    label: string
    isSelected: boolean
  }): React.JSX.Element => (
    <Button
      className={cn(isSelected && 'pointer-events-none')}
      variant="ghost"
      onClick={() => {
        setPreset(preset)
      }}
    >
      <>
        <span className={cn('pr-2 opacity-0', isSelected && 'opacity-70')}>
          <CheckIcon width={18} height={18} />
        </span>
        {label}
      </>
    </Button>
  )

  // Helper function to check if two date ranges are equal
  const areRangesEqual = (a?: DateRange, b?: DateRange): boolean => {
    if (!a || !b) return a === b // If either is undefined, return true if both are undefined
    return (
      a.from.getTime() === b.from.getTime() &&
      (!a.to || !b.to || a.to.getTime() === b.to.getTime())
    )
  }

  // Sync range with initialDateFrom/initialDateTo when they change (e.g., when reset filters is clicked)
  useEffect(() => {
    if (!isOpen) {
      // Only update when dialog is closed to avoid interfering with user selection
      if (initialDateFrom) {
        setRange({
          from: getDateAdjustedForTimezone(initialDateFrom),
          to: initialDateTo
            ? getDateAdjustedForTimezone(initialDateTo)
            : getDateAdjustedForTimezone(initialDateFrom)
        })
      } else {
        setRange(undefined)
      }
    }
  }, [initialDateFrom, initialDateTo, isOpen])

  useEffect(() => {
    // Only run when isOpen changes from false to true (dialog opening)
    if (isOpen && !prevIsOpenRef.current) {
      // Initialize range to today if undefined when dialog opens
      if (!range) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const initialRange = { from: today, to: today }
        setRange(initialRange)
        openedRangeRef.current = undefined // Store undefined to track that it was originally undefined
        initializedRangeRef.current = initialRange // Store the initialized range for comparison
      } else {
        openedRangeRef.current = range
        initializedRangeRef.current = undefined
      }
      openedRangeCompareRef.current = rangeCompare
    } else if (!isOpen && prevIsOpenRef.current) {
      // Reset when dialog closes
      initializedRangeRef.current = undefined
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, range, rangeCompare])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          resetValues()
        }
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button size={'lg'} variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <div className="text-right">
            <div className="py-1">
              {range ? (
                <div>{`${formatDate(range.from, locale)}${
                  range.to != null ? ' - ' + formatDate(range.to, locale) : ''
                }`}</div>
              ) : (
                <div className="text-muted-foreground">Select date range</div>
              )}
            </div>
            {rangeCompare != null && (
              <div className="opacity-60 text-xs -mt-1">
                <>
                  vs. {formatDate(rangeCompare.from, locale)}
                  {rangeCompare.to != null
                    ? ` - ${formatDate(rangeCompare.to, locale)}`
                    : ''}
                </>
              </div>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full h-full md:max-h-[600px] md:max-w-[700px] lg:max-w-[800px]">
      <DialogTitle className="sr-only">Select Date Range</DialogTitle>
        <DialogDescription className="sr-only">
          Choose a date range to filter traces by creation date
        </DialogDescription>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {showCompare && (
              <div className="flex items-center space-x-2">
                <Switch
                  defaultChecked={Boolean(rangeCompare)}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      // Ensure range is defined before using it
                      const currentRange = range || (() => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const newRange = { from: today, to: today }
                        setRange(newRange)
                        return newRange
                      })()
                      
                      if (!currentRange.to) {
                        setRange({
                          from: currentRange.from,
                          to: currentRange.from
                        })
                      }
                      setRangeCompare({
                        from: new Date(
                          currentRange.from.getFullYear(),
                          currentRange.from.getMonth(),
                          currentRange.from.getDate() - 365
                        ),
                        to: currentRange.to
                          ? new Date(
                            currentRange.to.getFullYear() - 1,
                            currentRange.to.getMonth(),
                            currentRange.to.getDate()
                          )
                          : new Date(
                            currentRange.from.getFullYear() - 1,
                            currentRange.from.getMonth(),
                            currentRange.from.getDate()
                          )
                      })
                    } else {
                      setRangeCompare(undefined)
                    }
                  }}
                  id="compare-mode"
                />
                <Label htmlFor="compare-mode">Compare</Label>
              </div>
            )}
            <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <DateInput
                      value={range?.from}
                      onChange={(date) => {
                        if (!range) {
                          setRange({ from: date, to: date })
                          return
                        }
                        const toDate =
                          range.to == null || date > range.to ? date : range.to
                        setRange({
                          ...range,
                          from: date,
                          to: toDate
                        })
                      }}
                    />
                    <div className="py-1">-</div>
                    <DateInput
                      value={range?.to}
                      onChange={(date) => {
                        if (!range) {
                          setRange({ from: date, to: date })
                          return
                        }
                        const fromDate = date < range.from ? date : range.from
                        setRange({
                          ...range,
                          from: fromDate,
                          to: date
                        })
                      }}
                    />
                  </div>
                  {rangeCompare != null && (
                    <div className="flex gap-2">
                      <DateInput
                        value={rangeCompare?.from}
                        onChange={(date) => {
                          if (rangeCompare) {
                            const compareToDate =
                              rangeCompare.to == null || date > rangeCompare.to
                                ? date
                                : rangeCompare.to
                            setRangeCompare((prevRangeCompare) => ({
                              ...prevRangeCompare,
                              from: date,
                              to: compareToDate
                            }))
                          } else {
                            setRangeCompare({
                              from: date,
                              to: new Date()
                            })
                          }
                        }}
                      />
                      <div className="py-1">-</div>
                      <DateInput
                        value={rangeCompare?.to}
                        onChange={(date) => {
                          if (rangeCompare?.from) {
                            const compareFromDate =
                              date < rangeCompare.from
                                ? date
                                : rangeCompare.from
                            setRangeCompare({
                              ...rangeCompare,
                              from: compareFromDate,
                              to: date
                            })
                          }
                        }}
                      />
                    </div>
                  )}
            </div>
          </div>
          {isSmallScreen && (
            <Select defaultValue={selectedPreset} onValueChange={(value) => { setPreset(value) }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select preset..." />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="flex-1">
              <Calendar
                mode="range"
                onSelect={(value: { from?: Date, to?: Date } | undefined) => {
                  if (value?.from != null) {
                    setRange({ from: value.from, to: value?.to })
                  } else if (value === undefined) {
                    // User cleared the selection
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    setRange({ from: today, to: today })
                  }
                }}
                selected={range ?? undefined}
                numberOfMonths={isSmallScreen ? 1 : 2}
                defaultMonth={
                  new Date(
                    new Date().setMonth(
                      new Date().getMonth() - (isSmallScreen ? 0 : 1)
                    )
                  )
                }
              />
            </div>
            {!isSmallScreen && (
              <div className="flex flex-col gap-1 min-w-[200px]">
                <div className="text-sm font-medium mb-2">Presets</div>
                {PRESETS.map((preset) => (
                  <PresetButton
                    key={preset.name}
                    preset={preset.name}
                    label={preset.label}
                    isSelected={selectedPreset === preset.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            onClick={() => {
              setIsOpen(false)
              resetValues()
            }}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false)
              if (range) {
                // If range was originally undefined and we initialized it, check if user changed it
                if (openedRangeRef.current === undefined && initializedRangeRef.current) {
                  // If range is still the same as initialized, don't call onUpdate (keep it undefined)
                  if (areRangesEqual(range, initializedRangeRef.current)) {
                    return // User didn't change from the default, so don't update
                  }
                }
                
                const hasRangeChanged = openedRangeRef.current 
                  ? !areRangesEqual(range, openedRangeRef.current)
                  : true // If originally undefined, any selection is a change
                const hasCompareChanged = !areRangesEqual(rangeCompare, openedRangeCompareRef.current)
                
                if (hasRangeChanged || hasCompareChanged) {
                  onUpdate?.({ range, rangeCompare })
                }
              }
            }}
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
