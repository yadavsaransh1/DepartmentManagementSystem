package com.department.utils;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for parsing time ranges in various formats.
 * Supports: 09:30, 9:30, 0930, 09-30, 09.30
 */
public class TimeRangeParser {

    private static final String[] VALID_DAYS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

    /**
     * Parse a time string in various formats to LocalTime
     * Supports: "09:30", "9:30", "0930", "09-30", "09.30"
     *
     * @param timeStr the time string to parse
     * @return LocalTime or null if invalid
     * @throws IllegalArgumentException if time format is invalid
     */
    public static LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Time string cannot be null or empty");
        }

        timeStr = timeStr.trim();

        // Remove all non-digits and colons, replacing separators with colon
        String normalized = timeStr
                .replaceAll("[^\\d:]", ":");  // Replace - . with :
        
        // Remove duplicate colons
        normalized = normalized.replaceAll(":+", ":");
        
        // Remove leading/trailing colons
        normalized = normalized.replaceAll("^:|:$", "");

        String[] parts;
        if (normalized.contains(":")) {
            parts = normalized.split(":");
        } else {
            // Format like "0930" - 4 digits
            if (normalized.length() == 4) {
                parts = new String[]{normalized.substring(0, 2), normalized.substring(2)};
            } else if (normalized.length() == 3) {
                // Format like "930" - treat as 09:30
                parts = new String[]{normalized.substring(0, 1), normalized.substring(1)};
            } else {
                throw new IllegalArgumentException("Invalid time format: " + timeStr);
            }
        }

        if (parts.length != 2) {
            throw new IllegalArgumentException("Time must have hours and minutes: " + timeStr);
        }

        try {
            int hours = Integer.parseInt(parts[0]);
            int minutes = Integer.parseInt(parts[1]);

            // Smart 12-hour to 24-hour conversion
            // Hours 1-8 are typically PM (afternoon/evening): 1 -> 13, 8 -> 20
            // Hours 9-12 are already valid in 24-hour format: 9 (AM), 12 (noon)
            // Hours 13+ are already in 24-hour format
            if (hours >= 1 && hours <= 8) {
                hours = hours + 12;  // 1 -> 13, 2 -> 14, ..., 8 -> 20
            }
            
            // Validate 24-hour format (0-23)
            if (hours < 0 || hours > 23) {
                throw new IllegalArgumentException("Hours must be between 0 and 23: " + timeStr);
            }
            if (minutes < 0 || minutes > 59) {
                throw new IllegalArgumentException("Minutes must be between 0 and 59: " + timeStr);
            }

            return LocalTime.of(hours, minutes);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid time format: " + timeStr + " - " + e.getMessage());
        }
    }

    /**
     * Parse a time range (startTime to endTime) and validate
     *
     * @param startTimeStr start time in any supported format
     * @param endTimeStr end time in any supported format
     * @return array [startTime, endTime]
     * @throws IllegalArgumentException if times are invalid or end is before start
     */
    public static LocalTime[] parseTimeRange(String startTimeStr, String endTimeStr) {
        LocalTime startTime = parseTime(startTimeStr);
        LocalTime endTime = parseTime(endTimeStr);

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException(
                    "End time (" + endTime + ") must be after start time (" + startTime + ")"
            );
        }

        return new LocalTime[]{startTime, endTime};
    }

    /**
     * Get duration in minutes between start and end time
     *
     * @param startTime LocalTime
     * @param endTime LocalTime
     * @return duration in minutes
     */
    public static int getDurationMinutes(LocalTime startTime, LocalTime endTime) {
        return (int) ChronoUnit.MINUTES.between(startTime, endTime);
    }

    /**
     * Get duration in hours between start and end time
     *
     * @param startTime LocalTime
     * @param endTime LocalTime
     * @return duration in hours (may be decimal, e.g., 1.5)
     */
    public static double getDurationHours(LocalTime startTime, LocalTime endTime) {
        return getDurationMinutes(startTime, endTime) / 60.0;
    }

    /**
     * Get duration in hours as integer (rounded)
     *
     * @param startTime LocalTime
     * @param endTime LocalTime
     * @return duration in hours rounded to nearest integer
     */
    public static int getDurationHoursInt(LocalTime startTime, LocalTime endTime) {
        return Math.round((float) getDurationHours(startTime, endTime));
    }

    /**
     * Validate day of week
     *
     * @param day day name (Monday, Tuesday, etc.)
     * @return true if valid, false otherwise
     */
    public static boolean isValidDay(String day) {
        if (day == null || day.trim().isEmpty()) {
            return false;
        }
        for (String validDay : VALID_DAYS) {
            if (validDay.equalsIgnoreCase(day.trim())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Normalize day name to proper case
     *
     * @param day day name
     * @return properly formatted day name or throws exception
     */
    public static String normalizeDay(String day) {
        if (day == null || day.trim().isEmpty()) {
            throw new IllegalArgumentException("Day cannot be null or empty");
        }
        
        String lowerDay = day.trim().toLowerCase();
        for (String validDay : VALID_DAYS) {
            if (validDay.toLowerCase().equals(lowerDay)) {
                return validDay; // Return proper case
            }
        }
        throw new IllegalArgumentException("Invalid day: " + day + ". Must be Monday-Sunday");
    }

    /**
     * Check if two time ranges overlap
     *
     * @param start1 start of range 1
     * @param end1 end of range 1
     * @param start2 start of range 2
     * @param end2 end of range 2
     * @return true if ranges overlap
     */
    public static boolean timesOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    /**
     * Format LocalTime to HH:mm string
     *
     * @param time LocalTime
     * @return formatted time string
     */
    public static String formatTime(LocalTime time) {
        if (time == null) return "00:00";
        return String.format("%02d:%02d", time.getHour(), time.getMinute());
    }
}
