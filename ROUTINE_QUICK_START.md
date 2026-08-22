# Routine Enhancement - Implementation Quick Start

## Quick Answers to Your Questions

### 1. **How to Handle Lunch Break?**
Add an `IsLunchBreak` column in Excel (TRUE/FALSE). The system will:
- Visually distinguish it (different color: yellow instead of blue)
- Skip validation checks for lunch slots (no teacher/room required)
- Display 🍽️ emoji for lunch periods

**Excel Format:**
```
Day    | StartTime | EndTime | Subject      | Teacher  | Room | IsLunchBreak | Notes
-------|-----------|---------|--------------|----------|------|--------------|-------
Monday | 12:00     | 01:00   | LUNCH        | -        | -    | TRUE         | Lunch
```

---

### 2. **How to Handle Multi-Hour Classes?**

Use consecutive rows with SAME subject and no gap between EndTime and NextRow's StartTime:

**Excel Format:**
```
Day     | StartTime | EndTime | Subject           | Teacher  | Room
--------|-----------|---------|-------------------|----------|-------
Tuesday | 02:00     | 03:00   | Lab: Advanced OOP | Prof. Z  | LAB1
Tuesday | 03:00     | 04:00   | Lab: Advanced OOP | Prof. Z  | LAB1
```

**Backend automatically detects this as:**
- Single 2-hour slot (02:00-04:00)
- Merges into one cell in timetable
- Shows note: "(2 Hours)" or "(Lab Session)"

---

### 3. **How to Handle Variable Time Formats?**

Backend parser supports multiple formats automatically:

| User Input | System Converts To |
|-----------|------------------|
| `09:30` | 09:30 |
| `9:30` | 09:30 |
| `0930` | 09:30 |
| `09-30` | 09:30 |
| `09:00` | 09:00 ✅ |
| `09.30` | 09:30 |

**Backend Code (Already Provided Above):**
```java
private LocalTime parseTime(String timeStr) {
    timeStr = timeStr.trim()
        .replace("-", ":")
        .replaceAll("[^0-9:]", "");
    // Now parses any format
}
```

---

## Simplified Implementation (Minimum Viable Product)

If you want to start small without the full redesign:

### Option A: Quick Excel Enhancement (Frontend Only)

No database changes needed. Just prevent hardcoded times and allow flexibility:

```jsx
// StudentRoutineView.jsx - Extract times from data instead of hardcoding

// OLD (hardcoded)
const times = ['09:30-10:30', '10:30-11:30', '11:30-12:30', ...];

// NEW (dynamic from data)
const extractTimesFromRoutines = (routines) => {
  const times = new Set();
  routines.forEach(r => {
    const description = r.description || '';
    const timeMatch = description.match(/Time:\s*([^\n]+)/);
    if (timeMatch) {
      times.add(timeMatch[1]);
    }
  });
  return Array.from(times).sort();
};

const times = extractTimesFromRoutines(filteredRoutines);
```

**Benefit:** Works immediately, handles variable timings
**Limitation:** Still doesn't properly handle multi-hour or lunch breaks

---

### Option B: Add Two Simple Fields (Database Change)

Minimal addition to Excel / database:

```java
@Column
private Boolean isLunchBreak; // Mark lunch/break periods

@Column
private LocalTime endTime; // New field - separate from time range
```

**Updated Excel Format:**
```
Day    | Time      | EndTime | Subject | Teacher | IsLunch
-------|-----------|---------|---------|---------|--------
Monday | 12:00     | 01:00   | -       | -       | TRUE
Tuesday| 02:00     | 04:00   | Lab     | Prof. Z | FALSE
```

**Frontend Handling:**
```jsx
const getTimetableCell = (day, startTime) => {
  const routine = filteredRoutines.find(r => 
    r.day === day && r.time === startTime
  );
  
  if (!routine) return null;
  
  // Handle lunch
  if (routine.isLunchBreak) {
    return { subject: '🍽️ LUNCH', color: '#fff3cd' };
  }
  
  // Check if multi-hour
  const durationHours = calculateDuration(routine.time, routine.endTime);
  if (durationHours > 1) {
    return { 
      subject: routine.subject, 
      rowSpan: durationHours,
      notes: `(${durationHours} hours)`
    };
  }
  
  return routine;
};
```

---

## Recommended: Hybrid Approach (Best of Both)

### Phase 1: Enhance Current System (Now)
1. Add `isLunchBreak` and `endTime` columns
2. Update Excel parser to handle time range parsing
3. Update StudentRoutineView to show multi-hour slots with rowSpan

### Phase 2: Full Restructuring (Later if needed)
1. Create RoutineSlot table
2. Migrate old data
3. Deploy new parser service

---

## Code Snippets Ready to Use

### 1. Simple Time Range Parser
```java
public class TimeRangeParser {
    
    public static LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) return null;
        
        // Remove all non-digits and colons
        timeStr = timeStr.replaceAll("[^0-9:]", "");
        
        if (timeStr.length() == 4) { // "0930"
            return LocalTime.of(
                Integer.parseInt(timeStr.substring(0, 2)),
                Integer.parseInt(timeStr.substring(2))
            );
        } else if (timeStr.contains(":")) { // "09:30"
            String[] parts = timeStr.split(":");
            return LocalTime.of(
                Integer.parseInt(parts[0]),
                Integer.parseInt(parts[1])
            );
        }
        throw new IllegalArgumentException("Invalid time: " + timeStr);
    }
    
    public static int getDurationMinutes(String startStr, String endStr) {
        LocalTime start = parseTime(startStr);
        LocalTime end = parseTime(endStr);
        return (int) java.time.temporal.ChronoUnit.MINUTES.between(start, end);
    }
    
    public static int getDurationHours(String startStr, String endStr) {
        return getDurationMinutes(startStr, endStr) / 60;
    }
}
```

### 2. Excel Parser Enhancement
```java
public Map<String, String> parseRoutineRow(Row row, int dayCol, int timeCol, int endTimeCol, 
                                           int subjectCol, int teacherCol, int roomCol) {
    Map<String, String> slot = new HashMap<>();
    
    String day = getCellString(row, dayCol).trim();
    String timeRange = getCellString(row, timeCol).trim();
    String endTime = getCellString(row, endTimeCol).trim();
    String subject = getCellString(row, subjectCol).trim();
    String teacher = getCellString(row, teacherCol).trim();
    String room = getCellString(row, roomCol).trim();
    
    // Validate day
    if (!isValidDay(day)) {
        throw new IllegalArgumentException("Invalid day: " + day);
    }
    
    // Parse times
    LocalTime start = TimeRangeParser.parseTime(timeRange);
    LocalTime end = TimeRangeParser.parseTime(endTime);
    
    if (!start.isBefore(end)) {
        throw new IllegalArgumentException("End time must be after start time");
    }
    
    slot.put("day", day);
    slot.put("startTime", start.toString()); // "09:30"
    slot.put("endTime", end.toString());     // "10:30"
    slot.put("subject", subject);
    slot.put("teacher", teacher);
    slot.put("room", room);
    slot.put("isLunch", subject.equalsIgnoreCase("lunch") ? "true" : "false");
    
    return slot;
}

private boolean isValidDay(String day) {
    return Arrays.asList("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", 
                        "Saturday", "Sunday").stream()
                 .anyMatch(d -> d.equalsIgnoreCase(day));
}

private String getCellString(Row row, int col) {
    Cell cell = row.getCell(col);
    if (cell == null) return "";
    return cell.getCellType() == CellType.STRING ? 
           cell.getStringCellValue() : 
           String.valueOf(cell.getNumericCellValue());
}
```

### 3. Frontend: Multi-Hour Detection
```jsx
// Helper function to detect multi-hour slots
const isStartOfMultiHourSlot = (day, startTime, routines) => {
  const current = routines.find(r => r.day === day && r.startTime === startTime);
  if (!current || current.isLunchBreak) return false;
  
  const next = routines.find(r => 
    r.day === day && 
    r.startTime === current.endTime && 
    r.subject === current.subject
  );
  
  return !!next;
};

// Calculate row span for multi-hour slots
const getRowSpan = (day, startTime, routines, allTimes) => {
  let span = 1;
  let current = routines.find(r => r.day === day && r.startTime === startTime);
  
  while (current) {
    const nextSlot = routines.find(r =>
      r.day === day &&
      r.startTime === current.endTime &&
      r.subject === current.subject
    );
    
    if (!nextSlot) break;
    
    span++;
    current = nextSlot;
  }
  
  return span;
};

// Render with rowSpan
{getTimetableCell(day, time) && !shouldHideDueToRowSpan(day, time) ? (
  <td 
    rowSpan={getRowSpan(day, time, filteredRoutines, times)}
    style={{ backgroundColor: isLunch ? '#fff3cd' : '#e3f2fd' }}
  >
    {/* Cell content */}
  </td>
) : null}
```

---

## Excel Template for Users

**Download as:** `Routine_Template.xlsx`

| Day | StartTime | EndTime | Subject | Teacher | Room | Notes |
|-----|-----------|---------|---------|---------|------|-------|
| Monday | 09:30 | 10:30 | Mathematics | Prof. Kumar | A101 | |
| Monday | 10:30 | 11:30 | Physics | Prof. Singh | A102 | |
| Monday | 12:00 | 01:00 | LUNCH | - | - | Lunch Break |
| Tuesday | 02:00 | 03:00 | Lab: OOP | Prof. Sharma | LAB1 | 2 Hour Class |
| Tuesday | 03:00 | 04:00 | Lab: OOP | Prof. Sharma | LAB1 | (Continued) |

---

## Validation Checklist

✅ **Before Accepting Excel:**
- All times are valid 24-hour format
- Start time < End time
- Days are Mon-Fri (or user-specified)
- No overlapping non-lunch slots for same teacher
- Subject names are non-empty
- Multi-hour classes have matching subject names

✅ **User Instructions:**
1. Save Excel as `.xlsx` (Office 2007+)
2. Use format: `DD/MM/YYYY` or just day name
3. Time format: flexible (09:30, 0930, 09-30 all work)
4. For 2-hour class: create 2 rows with continuous times
5. For lunch: enter "LUNCH" as subject, mark Teacher/Room optional
6. No special characters in subject names

---

## Testing Scenarios

```java
// Test 1: Variable time formats
assert TimeRangeParser.parseTime("09:30").equals(LocalTime.of(9, 30));
assert TimeRangeParser.parseTime("9:30").equals(LocalTime.of(9, 30));
assert TimeRangeParser.parseTime("0930").equals(LocalTime.of(9, 30));

// Test 2: Multi-hour detection
List<Routine> slots = Arrays.asList(
    new Routine("Monday", "02:00", "03:00", "Lab", "Prof X"),
    new Routine("Monday", "03:00", "04:00", "Lab", "Prof X")
);
assert isMultiHourClass(slots) == true;

// Test 3: Lunch handling
Routine lunch = new Routine("Monday", "12:00", "13:00", "LUNCH", null);
assert lunch.isLunchBreak() == true;
```

---

## Deployment Checklist

- [ ] Add `endTime` field to Routine entity
- [ ] Add `isLunchBreak` field to Routine entity  
- [ ] Update Excel parser with TimeRangeParser
- [ ] Update StudentRoutineView with multi-hour detection
- [ ] Add validation for time formats
- [ ] Document Excel template for users
- [ ] Test with sample Excel file
- [ ] Train admins on new format
- [ ] Update README with new Excel columns
