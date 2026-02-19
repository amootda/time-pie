"use client"

import { ko } from "date-fns/locale";
import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            locale={ko}
            showOutsideDays={showOutsideDays}
            className={className}
            classNames={{
                today: `border-primary text-primary font-bold`,
                selected: `bg-primary text-white rounded-full`,
                root: `${defaultClassNames.root} p-3`,
                chevron: `${defaultClassNames.chevron} fill-primary`,
                day: `${defaultClassNames.day} rounded-full transition-colors cursor-pointer`,
                outside: `text-muted-foreground opacity-40`,
                disabled: `text-muted-foreground opacity-40`,
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar };
