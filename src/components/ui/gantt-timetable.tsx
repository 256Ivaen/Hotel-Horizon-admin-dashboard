/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { EyeIcon, TrashIcon, PencilIcon, ChevronLeft, ChevronRight, Calendar, CalendarDays, List, LayoutGrid, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import type { FC, MouseEvent } from 'react';
import Drawer from '@/components/ui/drawer';

// Types
export interface TimetableEntry {
  id: string | number;
  course_id?: string | number;
  instructor_id?: string | number;
  course?: {
    id?: string | number;
    name?: string;
    code?: string;
    credits?: number;
    description?: string;
  };
  instructor?: {
    id?: string | number;
    name?: string;
    email?: string;
  };
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: string;
}

export interface GanttTimetableProps {
  entries?: TimetableEntry[];
  onEntryClick?: (entry: TimetableEntry) => void;
  onEntryDelete?: (id: string | number) => void;
  onEntryCreate?: (entry: Partial<TimetableEntry>) => void;
  onEntryUpdate?: (id: string | number, entry: Partial<TimetableEntry>) => void;
  courses?: Array<{ id: string | number; name: string; code?: string }>;
  className?: string;
  userRole?: 'admin' | 'instructor' | 'student';
  isDarkMode?: boolean;
}

// Constants
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<string, string> = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

const dayShortLabels: Record<string, string> = {
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
};

const dayColors: Record<string, string> = {
  sunday: '#EF4444',
  monday: '#3B82F6',
  tuesday: '#10B981',
  wednesday: '#8B5CF6',
  thursday: '#F59E0B',
  friday: '#EC4899',
  saturday: '#06B6D4',
};

const START_HOUR = 7;
const END_HOUR = 19;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 60;

// Helper functions
const formatHour = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour} ${ampm}`;
};

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const parseTimeToDecimal = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours + minutes / 60;
};

const getDuration = (startTime: string, endTime: string) => {
  const start = parseTimeToDecimal(startTime);
  const end = parseTimeToDecimal(endTime);
  const durationHours = end - start;
  const hours = Math.floor(durationHours);
  const minutes = Math.round((durationHours - hours) * 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const jsIndexToDay = (index: number): string => {
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[index];
};

const getNext7Days = (): { dayName: string; date: Date }[] => {
  const days: { dayName: string; date: Date }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ dayName: jsIndexToDay(d.getDay()), date: d });
  }
  return days;
};

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

type ViewMode = 'week' | 'day' | 'month' | 'list';

// ─── VIEW DRAWER CONTENT ─────────────────────────────────────
const ViewDrawerContent: FC<{
  entry: TimetableEntry;
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string | number) => void;
  onClose: () => void;
  canEdit: boolean;
}> = ({ entry, onEdit, onDelete, onClose, canEdit }) => {
  const color = dayColors[entry.day_of_week];

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Color header bar */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Course Name */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-900">
            {entry.course?.name || 'No Course'}
          </p>
          {entry.course?.code && (
            <p className="text-xs text-gray-500 mt-0.5">{entry.course.code}</p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <span>{dayLabels[entry.day_of_week]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock size={13} className="text-gray-400 shrink-0" />
            <span>
              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
              <span className="text-gray-400 ml-1">({getDuration(entry.start_time, entry.end_time)})</span>
            </span>
          </div>
          {entry.instructor?.name && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User size={13} className="text-gray-400 shrink-0" />
              <span>{entry.instructor.name}</span>
            </div>
          )}
          {entry.room_number && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={13} className="text-gray-400 shrink-0" />
              <span>{entry.room_number}</span>
            </div>
          )}
          {entry.course?.credits !== undefined && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <BookOpen size={13} className="text-gray-400 shrink-0" />
              <span>{entry.course.credits} credits</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => onEdit(entry)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <PencilIcon size={12} />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(entry.id);
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <TrashIcon size={12} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── WEEK VIEW ───────────────────────────────────────────────
const WeekView: FC<{
  days: { dayName: string; date: Date }[];
  entries: TimetableEntry[];
  onEntryClick: (entry: TimetableEntry, e: MouseEvent) => void;
  onEntryDelete: (id: string | number) => void;
  canEdit: boolean;
}> = ({ days, entries, onEntryClick, onEntryDelete, canEdit }) => {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = currentHour >= START_HOUR && currentHour < END_HOUR;
  const nowOffset = (currentHour - START_HOUR) * HOUR_HEIGHT;
  const todayColIndex = days.findIndex(d => isToday(d.date));

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="sticky top-0 z-10 grid bg-white border-b border-gray-200" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
          <div className="border-r border-gray-100" />
          {days.map((day, i) => (
            <div
              key={i}
              className={cn(
                "py-3 px-2 text-center border-r border-gray-100 last:border-r-0",
                isToday(day.date) && "bg-primary/5"
              )}
            >
              <p className={cn(
                "text-xs font-medium",
                isToday(day.date) ? "text-primary" : "text-gray-500"
              )}>
                {dayShortLabels[day.dayName]}
              </p>
              <p className={cn(
                "text-lg font-semibold mt-0.5",
                isToday(day.date) ? "text-primary" : "text-gray-800"
              )}>
                {day.date.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full grid border-b border-gray-100"
              style={{
                top: (hour - START_HOUR) * HOUR_HEIGHT,
                height: HOUR_HEIGHT,
                gridTemplateColumns: '64px repeat(7, 1fr)',
              }}
            >
              <div className="flex items-start justify-end pr-2 pt-1 border-r border-gray-100">
                <span className="text-xs text-gray-400 font-medium -mt-2">
                  {formatHour(hour)}
                </span>
              </div>
              {days.map((_, i) => (
                <div key={i} className="border-r border-gray-50 last:border-r-0" />
              ))}
            </div>
          ))}

          {/* Entries */}
          {days.map((day, colIndex) => {
            const dayEntries = entries.filter(e => e.day_of_week === day.dayName);
            return dayEntries.map((entry) => {
              const startDecimal = parseTimeToDecimal(entry.start_time);
              const endDecimal = parseTimeToDecimal(entry.end_time);
              const top = (startDecimal - START_HOUR) * HOUR_HEIGHT;
              const height = (endDecimal - startDecimal) * HOUR_HEIGHT;
              const color = dayColors[entry.day_of_week];

              return (
                <ContextMenu key={entry.id}>
                  <ContextMenuTrigger asChild>
                    <button
                      onClick={(e) => onEntryClick(entry, e)}
                      className="absolute rounded-lg p-1.5 text-left transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer overflow-hidden"
                      style={{
                        top: top + 1,
                        height: height - 2,
                        left: `calc(64px + (100% - 64px) / 7 * ${colIndex} + 2px)`,
                        width: `calc((100% - 64px) / 7 - 4px)`,
                        backgroundColor: color,
                      }}
                    >
                      <div className="flex flex-col h-full text-white overflow-hidden">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {entry.course?.name}
                        </p>
                        {height > 40 && (
                          <p className="text-xs opacity-85 mt-0.5 truncate">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </p>
                        )}
                        {height > 60 && entry.room_number && (
                          <p className="text-xs opacity-75 mt-auto truncate">
                            {entry.room_number}
                          </p>
                        )}
                      </div>
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem className="flex items-center gap-2 text-xs" onClick={(e) => onEntryClick(entry, e as any)}>
                      <EyeIcon size={14} className="text-muted-foreground" />
                      View details
                    </ContextMenuItem>
                    {canEdit && (
                      <ContextMenuItem className="flex items-center gap-2 text-xs text-destructive" onClick={() => onEntryDelete(entry.id)}>
                        <TrashIcon size={14} />
                        Delete schedule
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              );
            });
          })}

          {/* Current time line */}
          {showNowLine && todayColIndex >= 0 && (
            <div
              className="absolute pointer-events-none z-10"
              style={{ top: nowOffset, left: 64, right: 0 }}
            >
              <div className="relative flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 h-[2px] bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── DAY VIEW ────────────────────────────────────────────────
const DayView: FC<{
  days: { dayName: string; date: Date }[];
  entries: TimetableEntry[];
  onEntryClick: (entry: TimetableEntry, e: MouseEvent) => void;
  onEntryDelete: (id: string | number) => void;
  canEdit: boolean;
}> = ({ days, entries, onEntryClick, onEntryDelete, canEdit }) => {
  const [dayIndex, setDayIndex] = useState(0);
  const currentDay = days[dayIndex];
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);
  const dayEntries = entries.filter(e => e.day_of_week === currentDay.dayName);

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const showNowLine = isToday(currentDay.date) && currentHour >= START_HOUR && currentHour < END_HOUR;
  const nowOffset = (currentHour - START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
          disabled={dayIndex === 0}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div className="text-center">
          <p className={cn("text-xs font-semibold", isToday(currentDay.date) ? "text-primary" : "text-gray-800")}>
            {dayLabels[currentDay.dayName]}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setDayIndex(Math.min(days.length - 1, dayIndex + 1))}
          disabled={dayIndex === days.length - 1}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex border-b border-gray-100"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            >
              <div className="w-16 flex items-start justify-end pr-3 pt-1 shrink-0">
                <span className="text-xs text-gray-400 font-medium -mt-2">
                  {formatHour(hour)}
                </span>
              </div>
              <div className="flex-1 border-l border-gray-100" />
            </div>
          ))}

          {/* Entries */}
          {dayEntries.map((entry) => {
            const startDecimal = parseTimeToDecimal(entry.start_time);
            const endDecimal = parseTimeToDecimal(entry.end_time);
            const top = (startDecimal - START_HOUR) * HOUR_HEIGHT;
            const height = (endDecimal - startDecimal) * HOUR_HEIGHT;
            const color = dayColors[entry.day_of_week];

            return (
              <ContextMenu key={entry.id}>
                <ContextMenuTrigger asChild>
                  <button
                    onClick={(e) => onEntryClick(entry, e)}
                    className="absolute rounded-lg p-2.5 text-left transition-all hover:shadow-md cursor-pointer overflow-hidden"
                    style={{
                      top: top + 1,
                      height: height - 2,
                      left: 68,
                      right: 8,
                      backgroundColor: color,
                    }}
                  >
                    <div className="flex flex-col h-full text-white">
                      <p className="text-xs font-semibold truncate">{entry.course?.name}</p>
                      <p className="text-xs opacity-85 mt-0.5">
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </p>
                      {height > 60 && (
                        <div className="mt-auto flex items-center gap-2 text-xs opacity-75">
                          {entry.instructor?.name && <span>{entry.instructor.name}</span>}
                          {entry.room_number && <span>{entry.room_number}</span>}
                        </div>
                      )}
                    </div>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem className="flex items-center gap-2 text-xs" onClick={(e) => onEntryClick(entry, e as any)}>
                    <EyeIcon size={14} className="text-muted-foreground" />
                    View details
                  </ContextMenuItem>
                  {canEdit && (
                    <ContextMenuItem className="flex items-center gap-2 text-xs text-destructive" onClick={() => onEntryDelete(entry.id)}>
                      <TrashIcon size={14} />
                      Delete schedule
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}

          {/* Now line */}
          {showNowLine && (
            <div
              className="absolute pointer-events-none z-10"
              style={{ top: nowOffset, left: 64, right: 0 }}
            >
              <div className="relative flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 h-[2px] bg-red-500" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {dayEntries.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-400">No classes scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── LIST VIEW ───────────────────────────────────────────────
const ListView: FC<{
  days: { dayName: string; date: Date }[];
  entries: TimetableEntry[];
  onEntryClick: (entry: TimetableEntry, e: MouseEvent) => void;
  onEntryDelete: (id: string | number) => void;
  canEdit: boolean;
}> = ({ days, entries, onEntryClick, onEntryDelete, canEdit }) => {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {days.map((day) => {
        const dayEntries = entries
          .filter(e => e.day_of_week === day.dayName)
          .sort((a, b) => parseTimeToDecimal(a.start_time) - parseTimeToDecimal(b.start_time));

        return (
          <div key={day.dayName}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: dayColors[day.dayName] }}
              />
              <h3 className={cn(
                "text-xs font-semibold",
                isToday(day.date) ? "text-primary" : "text-gray-800"
              )}>
                {dayLabels[day.dayName]}
              </h3>
              <span className="text-xs text-gray-400">{formatDateShort(day.date)}</span>
              {isToday(day.date) && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Today
                </span>
              )}
            </div>

            {dayEntries.length === 0 ? (
              <p className="text-xs text-gray-400 pl-5 py-2">No classes</p>
            ) : (
              <div className="space-y-2 pl-5">
                {dayEntries.map((entry) => (
                  <ContextMenu key={entry.id}>
                    <ContextMenuTrigger asChild>
                      <button
                        onClick={(e) => onEntryClick(entry, e)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left bg-white"
                      >
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: dayColors[entry.day_of_week] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {entry.course?.name || 'No Course'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            <span className="mx-1.5 text-gray-300">|</span>
                            {getDuration(entry.start_time, entry.end_time)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {entry.room_number && (
                            <p className="text-xs text-gray-500">{entry.room_number}</p>
                          )}
                          {entry.instructor?.name && (
                            <p className="text-xs text-gray-400 mt-0.5">{entry.instructor.name}</p>
                          )}
                        </div>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem className="flex items-center gap-2 text-xs" onClick={(e) => onEntryClick(entry, e as any)}>
                        <EyeIcon size={14} className="text-muted-foreground" />
                        View details
                      </ContextMenuItem>
                      {canEdit && (
                        <ContextMenuItem className="flex items-center gap-2 text-xs text-destructive" onClick={() => onEntryDelete(entry.id)}>
                          <TrashIcon size={14} />
                          Delete schedule
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── MONTH VIEW ──────────────────────────────────────────────
const MonthView: FC<{
  entries: TimetableEntry[];
  onEntryClick: (entry: TimetableEntry, e: MouseEvent) => void;
  onEntryDelete: (id: string | number) => void;
  canEdit: boolean;
}> = ({ entries, onEntryClick, onEntryDelete, canEdit }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date();
  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const getEntriesForDate = (day: number) => {
    const date = new Date(year, month, day);
    const dayName = jsIndexToDay(date.getDay());
    return entries
      .filter(e => e.day_of_week === dayName)
      .sort((a, b) => parseTimeToDecimal(a.start_time) - parseTimeToDecimal(b.start_time));
  };

  const isTodayDate = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <p className="text-xs font-semibold text-gray-800">{monthName}</p>
        <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          {weekDayHeaders.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(90px,1fr)]">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="border-b border-r border-gray-100 bg-gray-50/30" />;
            }

            const dayEntries = getEntriesForDate(day);
            const todayHighlight = isTodayDate(day);

            return (
              <div
                key={day}
                className={cn(
                  "border-b border-r border-gray-100 p-1 overflow-hidden",
                  todayHighlight && "bg-primary/5"
                )}
              >
                <div className="flex justify-end mb-0.5">
                  <span className={cn(
                    "text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium",
                    todayHighlight ? "bg-primary text-white" : "text-gray-600"
                  )}>
                    {day}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {dayEntries.slice(0, 3).map((entry) => (
                    <ContextMenu key={entry.id}>
                      <ContextMenuTrigger asChild>
                        <button
                          onClick={(e) => onEntryClick(entry, e)}
                          className="w-full text-left rounded px-1 py-0.5 text-xs font-medium text-white truncate transition-opacity hover:opacity-80"
                          style={{ backgroundColor: dayColors[entry.day_of_week] }}
                        >
                          {formatTime(entry.start_time).replace(' ', '')} {entry.course?.name}
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem className="flex items-center gap-2 text-xs" onClick={(e) => onEntryClick(entry, e as any)}>
                          <EyeIcon size={14} className="text-muted-foreground" />
                          View details
                        </ContextMenuItem>
                        {canEdit && (
                          <ContextMenuItem className="flex items-center gap-2 text-xs text-destructive" onClick={() => onEntryDelete(entry.id)}>
                            <TrashIcon size={14} />
                            Delete schedule
                          </ContextMenuItem>
                        )}
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                  {dayEntries.length > 3 && (
                    <p className="text-xs text-gray-400 pl-1">+{dayEntries.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export const GanttTimetable: FC<GanttTimetableProps> = ({
  entries = [],
  onEntryClick,
  onEntryDelete,
  onEntryCreate,
  onEntryUpdate,
  courses = [],
  className,
  userRole = 'student',
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<TimetableEntry | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry>>({});

  const canEdit = userRole === 'instructor' || userRole === 'admin';
  const days = useMemo(() => getNext7Days(), []);

  const handleViewEntry = useCallback((entry: TimetableEntry, e: MouseEvent) => {
    e.stopPropagation();
    setViewEntry(entry);
    setIsViewDrawerOpen(true);
    onEntryClick?.(entry);
  }, [onEntryClick]);

  const handleEditEntry = useCallback((entry: TimetableEntry) => {
    setIsViewDrawerOpen(false);
    setViewEntry(null);
    setSelectedEntry(entry);
    setIsCreating(false);
    setIsDrawerOpen(true);
  }, []);

  const handleDeleteEntry = useCallback((id: string | number) => {
    onEntryDelete?.(id);
  }, [onEntryDelete]);

  const handleCreateClick = () => {
    setIsViewDrawerOpen(false);
    setViewEntry(null);
    setSelectedEntry(null);
    setIsCreating(true);
    setNewEntry({
      course_id: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      room_number: '',
    });
    setIsDrawerOpen(true);
  };

  const handleSaveEntry = () => {
    if (isCreating) {
      onEntryCreate?.(newEntry);
    } else if (selectedEntry) {
      onEntryUpdate?.(selectedEntry.id, selectedEntry);
    }
    setIsDrawerOpen(false);
    setSelectedEntry(null);
    setIsCreating(false);
  };

  const handleDeleteFromDrawer = () => {
    if (selectedEntry) {
      onEntryDelete?.(selectedEntry.id);
    }
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  };

  const viewButtons: { mode: ViewMode; label: string; icon: typeof Calendar }[] = [
    { mode: 'week', label: 'Week', icon: LayoutGrid },
    { mode: 'day', label: 'Day', icon: Calendar },
    { mode: 'month', label: 'Month', icon: CalendarDays },
    { mode: 'list', label: 'List', icon: List },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-1">
          {viewButtons.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === mode
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {canEdit && (
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-md text-xs font-medium transition-colors"
          >
            + New Schedule
          </button>
        )}
      </div>

      {/* View content */}
      {viewMode === 'week' && (
        <WeekView
          days={days}
          entries={entries}
          onEntryClick={handleViewEntry}
          onEntryDelete={handleDeleteEntry}
          canEdit={canEdit}
        />
      )}
      {viewMode === 'day' && (
        <DayView
          days={days}
          entries={entries}
          onEntryClick={handleViewEntry}
          onEntryDelete={handleDeleteEntry}
          canEdit={canEdit}
        />
      )}
      {viewMode === 'month' && (
        <MonthView
          entries={entries}
          onEntryClick={handleViewEntry}
          onEntryDelete={handleDeleteEntry}
          canEdit={canEdit}
        />
      )}
      {viewMode === 'list' && (
        <ListView
          days={days}
          entries={entries}
          onEntryClick={handleViewEntry}
          onEntryDelete={handleDeleteEntry}
          canEdit={canEdit}
        />
      )}

      {/* View Drawer */}
      <Drawer
        isOpen={isViewDrawerOpen}
        onClose={() => {
          setIsViewDrawerOpen(false);
          setViewEntry(null);
        }}
        position="right"
        size="md"
        title="Schedule Details"
      >
        {viewEntry && (
          <ViewDrawerContent
            entry={viewEntry}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            onClose={() => {
              setIsViewDrawerOpen(false);
              setViewEntry(null);
            }}
            canEdit={canEdit}
          />
        )}
      </Drawer>

      {/* Drawer for Create/Edit */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEntry(null);
          setIsCreating(false);
        }}
        position="right"
        size="lg"
        title={isCreating ? "Add New Schedule" : "Edit Schedule"}
      >
        <EntryForm
          entry={isCreating ? newEntry : selectedEntry}
          isCreating={isCreating}
          courses={courses}
          canEdit={canEdit}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedEntry(null);
            setIsCreating(false);
          }}
          onSave={handleSaveEntry}
          onDelete={handleDeleteFromDrawer}
          onChange={(updates) => {
            if (isCreating) {
              setNewEntry((prev) => ({ ...prev, ...updates }));
            } else {
              setSelectedEntry((prev) => (prev ? { ...prev, ...updates } : null));
            }
          }}
        />
      </Drawer>
    </div>
  );
};

// ─── ENTRY FORM ──────────────────────────────────────────────
const EntryForm: FC<{
  entry: Partial<TimetableEntry> | null;
  isCreating: boolean;
  courses: Array<{ id: string | number; name: string; code?: string }>;
  canEdit: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (updates: Partial<TimetableEntry>) => void;
}> = ({ entry, isCreating, courses, canEdit, onClose, onSave, onDelete, onChange }) => {
  if (!entry) return null;

  const inputClass = "mt-1 w-full rounded-md border bg-white border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="h-full overflow-y-auto p-4 bg-white">
      <div className="space-y-4">
        {/* View Mode (read-only for students) */}
        {!isCreating && !canEdit && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="h-3 w-3 mt-0.5 rounded-full shrink-0"
                style={{ backgroundColor: dayColors[(entry as TimetableEntry).day_of_week] }}
              />
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {(entry as TimetableEntry).course?.name || "N/A"}
                </p>
                {(entry as TimetableEntry).course?.code && (
                  <p className="text-xs text-gray-500">
                    {(entry as TimetableEntry).course?.code}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex gap-2">
                <span className="text-gray-500">Day:</span>
                <span className="text-gray-700">
                  {dayLabels[(entry as TimetableEntry).day_of_week]}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">Time:</span>
                <span className="text-gray-700">
                  {formatTime(entry.start_time || "")} - {formatTime(entry.end_time || "")}
                </span>
              </div>
              {(entry as TimetableEntry).instructor?.name && (
                <div className="flex gap-2">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="text-gray-700">
                    {(entry as TimetableEntry).instructor?.name}
                  </span>
                </div>
              )}
              {entry.room_number && (
                <div className="flex gap-2">
                  <span className="text-gray-500">Room:</span>
                  <span className="text-gray-700">{entry.room_number}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {(isCreating || canEdit) && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Course *</label>
              <select
                value={entry.course_id?.toString() || ""}
                onChange={(e) => onChange({ course_id: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} {course.code && `(${course.code})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">Day *</label>
              <select
                value={entry.day_of_week || ""}
                onChange={(e) => onChange({ day_of_week: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {dayLabels[day]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Start * (7AM-7PM)</label>
                <input
                  type="time"
                  value={entry.start_time || ""}
                  min="07:00"
                  max="19:00"
                  onChange={(e) => onChange({ start_time: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">End * (7AM-7PM)</label>
                <input
                  type="time"
                  value={entry.end_time || ""}
                  min="07:00"
                  max="19:00"
                  onChange={(e) => onChange({ end_time: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700">Room</label>
              <input
                type="text"
                value={entry.room_number || ""}
                onChange={(e) => onChange({ room_number: e.target.value })}
                placeholder="e.g., Room 101"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
          {!isCreating && canEdit && (
            <button
              onClick={onDelete}
              className="mr-auto px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {canEdit ? "Cancel" : "Close"}
          </button>
          {(isCreating || canEdit) && (
            <button
              onClick={onSave}
              className="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
            >
              {isCreating ? "Create" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttTimetable;
