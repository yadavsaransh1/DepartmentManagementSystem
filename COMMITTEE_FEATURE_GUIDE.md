# Committee Management Feature - Implementation Guide

## Overview
A complete committee management system with admin creation/management and teacher participation features, including chat and document upload capabilities.

## Components Created

### Backend (Java/Spring Boot)

#### Entities & Models
1. **Committee.java** - Main committee entity with relationships
2. **CommitteeMember.java** - Junction table for committee members with roles
3. **CommitteeMessage.java** - Chat messages for committees
4. **CommitteeDocument.java** - Document uploads for committees
5. **CommitteePower.java** - Predefined permissions/powers

#### Repositories
- CommitteeRepository
- CommitteeMemberRepository
- CommitteeMessageRepository
- CommitteeDocumentRepository
- CommitteePowerRepository

#### DTOs
- CommitteeDTO
- CommitteeMemberDTO
- CommitteeMessageDTO
- CommitteeDocumentDTO

#### Services & Controllers
- **CommitteeService.java** - Business logic
- **CommitteeController.java** - REST API endpoints

#### Database
- **migration_committee_feature.sql** - Complete schema migration

### Frontend (React)

1. **AdminCommittee.jsx** - Admin dashboard for managing committees
   - Create new committees
   - Add/Remove members
   - Assign roles (Chairman, Convenor, Member)
   - Allocate administrative powers
   - View committee details

2. **TeacherCommittee.jsx** - Teacher dashboard for committee participation
   - View committees they're part of
   - Chat with committee members
   - Upload/Download documents
   - View committee members and their roles

## Integration Steps

### Step 1: Database Migration
1. Run the migration SQL:
```bash
mysql -u root -pyadavji university_db < database/migration_committee_feature.sql
```

### Step 2: Backend Integration

1. **Verify repositories are in `/backend/src/main/java/com/department/repository/`**
2. **Verify DTOs are in `/backend/src/main/java/com/department/dto/`**
3. **Verify entities are in `/backend/src/main/java/com/department/model/`**
4. **Verify service is in `/backend/src/main/java/com/department/service/`**
5. **Verify controller is in `/backend/src/main/java/com/department/controller/`**

2. **Rebuild Backend:**
```bash
cd backend
mvn clean package -DskipTests
```

3. **Start Backend:**
```bash
java -jar target/department-management-1.0.0.jar --server.address=10.52.9.128
```

### Step 3: Frontend Integration

1. **Add Committee imports to your main dashboard routing file**
   
   In your main dashboard component (likely in `App.jsx` or `AdminDashboard.jsx`):

```javascript
import { AdminCommittee } from './pages/AdminCommittee';
import { TeacherCommittee } from './pages/TeacherCommittee';
```

2. **For Admin Dashboard Navigation:**
   Add a "Committee" tab between "Alumni" and "Project":
   
```javascript
{activeTab === 'committee' && <AdminCommittee />}
```

3. **For Teacher Dashboard Navigation:**
   Add a "Committee" tab below "Teaching Routine":
   
```javascript
{activeTab === 'committee' && <TeacherCommittee />}
```

4. **Add Navigation Buttons:**
   
   Admin:
   ```javascript
   <button onClick={() => setActiveTab('committee')}>🏛️ Committee</button>
   ```
   
   Teacher:
   ```javascript
   <button onClick={() => setActiveTab('committee')}>🏛️ Committee</button>
   ```

## Features Implemented

### For Admin Dashboard

✅ **Committee Management:**
- Create new committees with name and description
- View all committees in grid layout
- Edit committee details
- Delete committees

✅ **Member Management:**
- Add teachers to committees from a checklist
- Assign roles: Member, Chairman, Convenor (customizable)
- Allocate administrative powers to members
- Remove members from committee
- Update member roles dynamically

✅ **Available Powers:**
- MANAGE_MEMBERS - Can add/remove members
- MANAGE_DOCUMENTS - Can upload/delete documents
- MANAGE_MESSAGES - Can delete messages
- MANAGE_ROLES - Can assign roles to members
- DELETE_COMMITTEE - Can delete the committee
- VIEW_ANALYTICS - Can view committee analytics
- APPROVE_DOCUMENTS - Can approve uploaded documents

### For Teacher Dashboard

✅ **Committee Discovery:**
- View all committees they're member of
- See member count for each committee
- Quick access to committee details

✅ **Committee Details:**
- View all committee members
- See each member's role and assigned powers
- View creation date and description

✅ **Chat System (Real-time):**
- Send messages to committee
- View message history (auto-refreshes every 5 seconds)
- See sender name and timestamp
- Messages differentiated by sender

✅ **Document Management:**
- Upload documents with title and type
- Add descriptions to documents
- View uploaded documents with uploader info
- Download documents
- Delete own documents
- Document types: Report, Meeting Minutes, Agenda, Guidelines, Other

✅ **Members Tab:**
- View all committee members
- See each member's role and assigned powers

## API Endpoints

### Committee Management
- `POST /committees` - Create committee (ADMIN)
- `GET /committees` - Get all committees (ADMIN)
- `GET /committees/{id}` - Get committee details
- `PUT /committees/{id}` - Update committee (ADMIN)
- `DELETE /committees/{id}` - Delete committee (ADMIN)

### Member Management
- `POST /committees/{committeeId}/members` - Add member (ADMIN)
- `GET /committees/{committeeId}/members` - Get members
- `PUT /committees/{committeeId}/members/{email}/role` - Update role (ADMIN)
- `PUT /committees/{committeeId}/members/{email}/powers` - Update powers (ADMIN)
- `DELETE /committees/{committeeId}/members/{email}` - Remove member (ADMIN)

### Teacher Operations
- `GET /committees/my-committees` - Get user's committees (TEACHER)

### Messaging
- `POST /committees/{committeeId}/messages` - Send message
- `GET /committees/{committeeId}/messages` - Get messages
- `DELETE /committees/messages/{messageId}` - Delete message

### Documents
- `POST /committees/{committeeId}/documents/upload` - Upload document
- `GET /committees/{committeeId}/documents` - Get documents
- `DELETE /committees/documents/{documentId}` - Delete document

### Configuration
- `GET /committees/powers` - Get available powers (ADMIN)

## Usage Examples

### Creating a Committee (Admin)
1. Click "➕ Create New Committee" button
2. Enter committee name (e.g., "Academic Committee")
3. Add description
4. Select teachers from the checklist
5. Click "✓ Create Committee"
6. View committee details and manage members

### Joining Committee (Teacher)
1. Go to "🏛️ Committee" tab
2. See list of committees you're part of
3. Click on a committee name
4. View members, chat, and documents

### Uploading Document (Teacher)
1. Select a committee
2. Click "⬆️ Upload Document" button
3. Enter document title
4. Select document type
5. Add optional description
6. Choose file to upload
7. Click "⬆️ Upload"

### Chatting in Committee (Teacher)
1. Select a committee
2. Click "💬 Messages" tab
3. Type message in input field
4. Click "Send"
5. Messages auto-refresh every 5 seconds

## File Uploads

Documents are stored in:
```
uploads/committees/{committeeId}/{uuid}_{filename}
```

Files maintain their original extensions for proper MIME type detection on download.

## Database Schema Overview

```
committees
├── id (PK)
├── name (UNIQUE)
├── description
├── created_by_email (FK: users)
├── created_at
└── updated_at

committee_members
├── id (PK)
├── committee_id (FK: committees)
├── teacher_email (FK: users)
├── role
├── powers (JSON)
├── joined_date
└── updated_at

committee_messages
├── id (PK)
├── committee_id (FK: committees)
├── sender_email (FK: users)
├── message_text
└── created_at

committee_documents
├── id (PK)
├── committee_id (FK: committees)
├── document_name
├── file_path
├── document_type
├── uploaded_by_email (FK: users)
├── description
├── file_size
└── uploaded_at

committee_powers
├── id (PK)
├── power_name (UNIQUE)
└── description
```

## Real-Life Alignment

This system is inspired by real-world committee structures:
- **Hierarchy**: Chairman > Convenor > Member roles
- **Responsibilities**: Powers system allows fine-grained control
- **Documentation**: Meeting minutes, agendas, reports
- **Communication**: Built-in chat for coordination
- **Transparency**: All members can view others and their permissions

## Future Enhancements (Optional)

1. Email notifications when added to committee
2. Committee approval/rejection workflow
3. Document approval flow
4. Committee meeting scheduling
5. Committee analytics and reports
6. Committee archive/history
7. Nested sub-committees
8. External member invitations
9. Committee voting system
10. Document versioning

## Troubleshooting

### Issue: 404 errors on committee endpoints
- Ensure backend is compiled and running
- Check CommitteeController is in correct package
- Verify repositories are registered

### Issue: Documents not uploading
- Check `uploads/committees/` directory permissions
- Ensure file upload directory exists
- Check file size limits

### Issue: Messages not appearing
- Clear browser cache
- Check network requests in browser DevTools
- Verify backend is returning messages

### Issue: Members not loading
- Run database migration
- Check UserRepository is working
- Verify teacher records exist in database

## Support

For issues or questions, refer to:
1. Check backend logs for errors
2. Open browser DevTools for frontend errors
3. Verify all database migrations ran successfully
4. Ensure backend is running on correct address/port
