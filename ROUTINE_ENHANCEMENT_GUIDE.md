# Routine Logic Enhancement Guide

## Current Architecture
Currently the system:
- Stores routine data in Excel with: Day, Time, Subject, Teacher, Room
- Frontend has hardcoded time slots: 09:30-10:30, 10:30-11:30, etc.
- Doesn't support lunch breaks, variable durations, or flexible time formats

## Real-World Scenarios to Handle

### 1. **Lunch Break**
Students need free time during lunch (typically 12:30-01:30 or 01:00-02:00)

### 2. **Continuous/Multi-Hour Classes**
Same subject for 2+ consecutive hours (e.g., Lab sessions: 02:00-04:00)

### 3. **Variable Time Formats**
Times may not follow 30-minute boundaries (e.g., 09:00-10:00, 09:15-10:15)

---

## Solution Architecture

### Phase 1: Excel Format Enhancement

#### Old Excel Format (Current)
```
| Day      | Time           | Subject | Teacher | Room |
|----------|----------------|---------|---------|------|
| Monday   | 09:30-10:30    | Math    | Prof. X | A101 |
| Monday   | 10:30-11:30    | Physics | Prof. Y | A102 |
```

#### New Excel Format (Enhanced)
```
| Day      | StartTime | EndTime | Subject        | Teacher | Room | IsLunchBreak | Notes      |
|----------|-----------|---------|----------------|---------|------|--------------|------------|
| Monday   | 09:30     | 10:30   | Math           | Prof. X | A101 | FALSE        |            |
| Monday   | 10:30     | 11:30   | Physics        | Prof. Y | A102 | FALSE        |            |
| Monday   | 12:00     | 01:00   | LUNCH          | -       | -    | TRUE         | Lunch      |
| Tuesday  | 02:00     | 04:00   | Lab: Coding    | Prof. Z | LAB1 | FALSE        | 2 Hours    |
```

### Phase 2: Data Model Updates

#### Backend Enhancement - Create `RoutineSlot` Entity

```java
@Entity
@Table(name = "routine_slots")
public class RoutineSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "routine_id")
    private Routine routine; // Links to main routine file

    @Column(nullable = false)
    private String dayOfWeek; // Monday, Tuesday, etc.

    @Column(nullable = false)
    private LocalTime startTime; // 09:30

    @Column(nullable = false)
    private LocalTime endTime; // 10:30

    @Column(nullable = false)
    private String subject; // Math, Physics, etc.

    @Column
    private String teacher; // Teacher email or name

    @Column
    private String room; // Room number

    @Column(nullable = false, columnDefinition = "TINYINT DEFAULT 0")
    private Boolean isLunchBreak = false; // TRUE for lunch/breaks

    @Column
    private String notes; // "2 Hours", "Lab Session", etc.

    @Column
    private String program; // BCA, MCA, M.Tech (for filtering)

    @Column
    private Integer semester; // 1-8 (for filtering)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters/Setters...
}
```

#### Create Repository
```java
@Repository
public interface RoutineSlotRepository extends JpaRepository<RoutineSlot, Long> {
    List<RoutineSlot> findByProgram(String program);
    
    List<RoutineSlot> findByProgramAndSemester(String program, Integer semester);
    
    List<RoutineSlot> findByProgramAndSemesterOrderByStartTime(String program, Integer semester);
    
    List<RoutineSlot> findByDayOfWeekOrderByStartTime(String dayOfWeek);
    
    // Find continuous/multi-hour slots
    @Query("SELECT rs FROM RoutineSlot rs WHERE rs.program = :program " +
           "AND rs.semester = :semester AND rs.dayOfWeek = :day " +
           "ORDER BY rs.startTime ASC")
    List<RoutineSlot> findDayRoutineSlots(@Param("program") String program, 
                                          @Param("semester") Integer semester,
                                          @Param("day") String day);
}
```

---

### Phase 3: Backend Service Enhancement

#### Enhanced Routine Parser Service

```java
@Service
public class RoutineParserService {
    
    @Autowired
    private RoutineSlotRepository slotRepository;
    
    @Autowired
    private RoutineRepository routineRepository;

    /**
     * Parse Excel and create RoutineSlot entries
     * Handles variable durations, lunch breaks, continuous hours
     */
    public List<RoutineSlot> parseRoutineExcel(MultipartFile file, Long routineId) throws IOException {
        List<RoutineSlot> slots = new ArrayList<>();
        
        try (Workbook workbook = getWorkbook(file)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Get header row to identify columns
            Row headerRow = sheet.getRow(0);
            Map<String, Integer> columnIndex = mapHeaders(headerRow);
            
            // Validate required columns exist
            validateRequiredColumns(columnIndex);
            
            Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
            
            // Parse data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    RoutineSlot slot = parseRow(row, columnIndex, routine);
                    if (slot != null) {
                        slots.add(slot);
                    }
                } catch (Exception e) {
                    System.err.println("Warning: Error parsing row " + (i + 1) + ": " + e.getMessage());
                    // Continue parsing other rows
                }
            }
            
            // Save all slots
            slotRepository.saveAll(slots);
        }
        
        return slots;
    }

    private Map<String, Integer> mapHeaders(Row headerRow) {
        Map<String, Integer> columnIndex = new HashMap<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            String header = headerRow.getCell(i).getStringCellValue().trim().toLowerCase();
            columnIndex.put(header, i);
        }
        return columnIndex;
    }

    private void validateRequiredColumns(Map<String, Integer> columnIndex) {
        String[] required = {"day", "starttime", "endtime", "subject"};
        for (String col : required) {
            if (!columnIndex.containsKey(col)) {
                throw new IllegalArgumentException("Missing required column: " + col);
            }
        }
    }

    private RoutineSlot parseRow(Row row, Map<String, Integer> columnIndex, Routine routine) {
        RoutineSlot slot = new RoutineSlot();
        
        // Parse Day
        String day = getCellValue(row, columnIndex.get("day"));
        validateDay(day);
        slot.setDayOfWeek(day);
        
        // Parse Times
        String startTimeStr = getCellValue(row, columnIndex.get("starttime"));
        String endTimeStr = getCellValue(row, columnIndex.get("endtime"));
        
        slot.setStartTime(parseTime(startTimeStr)); // "09:30" -> LocalTime
        slot.setEndTime(parseTime(endTimeStr));     // "10:30" -> LocalTime
        
        // Validate time logic
        if (!slot.getStartTime().isBefore(slot.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        
        // Parse Subject
        String subject = getCellValue(row, columnIndex.get("subject"));
        if (subject.equalsIgnoreCase("LUNCH") || subject.equalsIgnoreCase("BREAK")) {
            slot.setIsLunchBreak(true);
            slot.setSubject("LUNCH BREAK");
        } else {
            slot.setSubject(subject);
        }
        
        // Parse optional fields
        if (columnIndex.containsKey("teacher")) {
            slot.setTeacher(getCellValue(row, columnIndex.get("teacher")));
        }
        if (columnIndex.containsKey("room")) {
            slot.setRoom(getCellValue(row, columnIndex.get("room")));
        }
        if (columnIndex.containsKey("notes")) {
            slot.setNotes(getCellValue(row, columnIndex.get("notes")));
        }
        if (columnIndex.containsKey("program")) {
            slot.setProgram(getCellValue(row, columnIndex.get("program")));
        }
        if (columnIndex.containsKey("semester")) {
            String semStr = getCellValue(row, columnIndex.get("semester"));
            try {
                slot.setSemester(Integer.parseInt(semStr));
            } catch (NumberFormatException ignored) {}
        }
        
        slot.setRoutine(routine);
        return slot;
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Time cannot be empty");
        }
        
        // Support formats: "09:30", "9:30", "0930", "09-30"
        timeStr = timeStr.trim()
            .replace("-", ":")
            .replaceAll("[^0-9:]", "");
        
        String[] parts = timeStr.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid time format: " + timeStr);
        }
        
        try {
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            
            if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                throw new IllegalArgumentException("Invalid time values");
            }
            
            return LocalTime.of(hour, minute);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid time format: " + timeStr, e);
        }
    }

    private void validateDay(String day) {
        String[] validDays = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        boolean valid = Arrays.stream(validDays)
            .anyMatch(d -> d.equalsIgnoreCase(day));
        
        if (!valid) {
            throw new IllegalArgumentException("Invalid day: " + day + ". Must be Monday-Sunday");
        }
    }

    private String getCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null) return "";
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            default: return "";
        }
    }

    private Workbook getWorkbook(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName.endsWith(".xlsx")) {
            return new XSSFWorkbook(file.getInputStream());
        } else if (fileName.endsWith(".xls")) {
            return new HSSFWorkbook(file.getInputStream());
        }
        throw new IllegalArgumentException("Unsupported file format");
    }
    
    /**
     * Check if a time slot is part of a multi-hour continuous class
     */
    public List<RoutineSlot> getMultiHourSlots(String program, Integer semester, String day) {
        List<RoutineSlot> slots = slotRepository
            .findDayRoutineSlots(program, semester, day);
        
        List<RoutineSlot> multiHour = new ArrayList<>();
        for (int i = 0; i < slots.size() - 1; i++) {
            RoutineSlot current = slots.get(i);
            RoutineSlot next = slots.get(i + 1);
            
            // If end time of current = start time of next AND same subject
            if (current.getEndTime().equals(next.getStartTime()) &&
                current.getSubject().equals(next.getSubject())) {
                multiHour.add(current);
            }
        }
        return multiHour;
    }

    /**
     * Get dynamic time slots for a student based on actual routine data
     */
    public List<LocalTime> extractTimeSlots(String program, Integer semester) {
        List<RoutineSlot> allSlots = slotRepository
            .findByProgramAndSemesterOrderByStartTime(program, semester);
        
        Set<LocalTime> uniqueTimes = new TreeSet<>();
        for (RoutineSlot slot : allSlots) {
            uniqueTimes.add(slot.getStartTime());
            uniqueTimes.add(slot.getEndTime());
        }
        return new ArrayList<>(uniqueTimes);
    }
}
```

---

### Phase 4: Frontend Enhancement

#### Update StudentRoutineView.jsx

```jsx
// Replace hardcoded times with dynamic extraction
const [uniqueTimes, setUniqueTimes] = useState([]);
const [multiHourSlots, setMultiHourSlots] = useState(new Set());

// Fetch dynamic times based on actual routine data
useEffect(() => {
  if (studentData?.program && studentData?.semester) {
    fetchDynamicTimeSlots();
    fetchMultiHourSlots();
  }
}, [studentData]);

const fetchDynamicTimeSlots = async () => {
  try {
    const response = await api.get(
      `/routines/times/${studentData.program}/${studentData.semester}`
    );
    setUniqueTimes(response.data); // ["09:30", "10:30", "12:00", "02:00", "04:00"]
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
};

const fetchMultiHourSlots = async () => {
  try {
    const response = await api.get(
      `/routines/multi-hour/${studentData.program}/${studentData.semester}`
    );
    setMultiHourSlots(new Set(response.data)); // Set of slot IDs that span multiple hours
  } catch (error) {
    console.error('Error fetching multi-hour slots:', error);
  }
};

// Enhanced Cell Rendering
const getTimetableCell = (day, startTime) => {
  const routine = filteredRoutines.find(r => {
    return r.dayOfWeek === day && r.startTime === startTime;
  });

  if (!routine) return null;

  // Check if this is part of a multi-hour slot
  const isMultiHour = multiHourSlots.has(routine.id);
  const durationMinutes = calculateDuration(routine.startTime, routine.endTime);
  const rowSpan = Math.ceil(durationMinutes / 60); // Approximate rows to span

  const backgroundColor = routine.isLunchBreak ? '#fff3cd' : '#e3f2fd';
  const borderColor = routine.isLunchBreak ? '#cc9900' : '#1976d2';

  return { 
    teacher: routine.teacher, 
    subject: routine.subject, 
    room: routine.room,
    isLunchBreak: routine.isLunchBreak,
    notes: routine.notes,
    isMultiHour,
    rowSpan,
    backgroundColor,
    borderColor
  };
};

// Render timetable with dynamic handling
{filteredRoutines.length === 0 ? (
  <p>No routines available</p>
) : (
  <table>
    <thead>
      <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
        <th style={{ minWidth: '100px' }}>Day</th>
        {uniqueTimes.map(time => (
          <th key={time} style={{ minWidth: '150px' }}>
            {formatTimeRange(time, getNextTime(time, uniqueTimes))}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {days.map(day => (
        <tr key={day}>
          <td style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
            {day}
          </td>
          {uniqueTimes.map((time, idx) => {
            const cell = getTimetableCell(day, time);
            
            if (!cell) {
              return (
                <td key={`${day}-${time}`} style={{ textAlign: 'center' }}>
                  <span style={{ color: '#ccc' }}>—</span>
                </td>
              );
            }

            // Hide cell if it's part of multi-hour and not the first hour
            if (cell.isMultiHour && idx > 0 && 
                getTimetableCell(day, uniqueTimes[idx - 1])?.subject === cell.subject) {
              return null; // Don't render - will be covered by rowSpan
            }

            return (
              <td 
                key={`${day}-${time}`}
                rowSpan={cell.rowSpan}
                style={{
                  backgroundColor: cell.backgroundColor,
                  border: `2px solid ${cell.borderColor}`,
                  padding: '10px',
                  textAlign: 'center',
                  fontStyle: cell.isLunchBreak ? 'italic' : 'normal'
                }}
              >
                {cell.isLunchBreak ? (
                  <div>🍽️ {cell.subject}</div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 'bold', color: cell.borderColor }}>
                      {cell.subject}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      👨‍🏫 {cell.teacher}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      🚪 {cell.room}
                    </div>
                    {cell.notes && (
                      <div style={{ fontSize: '10px', marginTop: '4px', fontStyle: 'italic', color: '#666' }}>
                        ({cell.notes})
                      </div>
                    )}
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
)}

// Utility Functions
const calculateDuration = (startTime, endTime) => {
  // Convert "09:30" to minutes, then calculate difference
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
};

const formatTimeRange = (startTime, endTime) => {
  return `${startTime} - ${endTime || ''}`;
};

const getNextTime = (currentTime, times) => {
  const idx = times.indexOf(currentTime);
  return idx < times.length - 1 ? times[idx + 1] : '';
};
```

---

## Implementation Steps

### Step 1: Database Migration
```sql
ALTER TABLE routines ADD COLUMN enhanced_format BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS routine_slots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    routine_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    teacher VARCHAR(255),
    room VARCHAR(100),
    is_lunch_break TINYINT DEFAULT 0,
    notes VARCHAR(500),
    program VARCHAR(50),
    semester INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
);

CREATE INDEX idx_routine_slots_program_semester ON routine_slots(program, semester);
CREATE INDEX idx_routine_slots_day ON routine_slots(day_of_week);
```

### Step 2: Add Backend Endpoints
```java
@RestController
@RequestMapping("/api/routines")
public class RoutineSlotController {
    
    @GetMapping("/times/{program}/{semester}")
    public List<String> getTimeSlots(@PathVariable String program, 
                                     @PathVariable Integer semester) {
        return routineParserService.extractTimeSlots(program, semester)
            .stream()
            .map(LocalTime::toString) // "09:30"
            .collect(Collectors.toList());
    }
    
    @GetMapping("/multi-hour/{program}/{semester}")
    public List<Long> getMultiHourSlots(@PathVariable String program,
                                        @PathVariable Integer semester) {
        return routineParserService.getMultiHourSlots(program, semester, null)
            .stream()
            .map(RoutineSlot::getId)
            .collect(Collectors.toList());
    }
}
```

### Step 3: Sample Excel Template
Download and share with users:
- Column Headers: Day, StartTime, EndTime, Subject, Teacher, Room, IsLunchBreak, Notes
- Validation: Auto-validate time formats and days

---

## Benefits

✅ **Flexible Timing** - Supports 09:00-10:00, 09:15-10:45, etc.
✅ **Multi-Hour Classes** - Automatically groups continuous hours
✅ **Lunch Breaks** - Visual distinction for break periods
✅ **Better Validation** - Catches errors during upload
✅ **Dynamic Display** - Times adjust based on actual data
✅ **Backward Compatible** - Can still parse old format with conversion logic

---

## Migration Path (No Breaking Changes)

1. Add new `RoutineSlot` table (non-breaking)
2. Deploy parser service
3. Add backward-compatible endpoints
4. Let users gradually switch to new format
5. Add conversion utility for old format → new format
