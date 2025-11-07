# Payment Page

A comprehensive payment and employment portal for Bond program participants.

## Features

### Document Management
- **Good Job Agreement Upload**: Upload and manage signed Good Job Agreement documents
- **Bill.com Guide Upload**: Upload Bill.com setup guides for payment processing
- **Bond FAQs Upload**: Upload Bond program frequently asked questions documents
- **File Validation**: Supports PDF, DOC, DOCX, and TXT files up to 10MB
- **Document Viewing**: View uploaded documents directly in the browser

### Financial Planning
- **Direct Scheduling**: One-click access to schedule financial planning sessions
- **Session Benefits**: Clear overview of what participants can expect from sessions
- **External Integration**: Opens Calendly for seamless scheduling

### Employment Information Portal
- **Secure Updates**: Update employment information with proper authentication
- **Comprehensive Fields**: Company name, position, start date, salary, employment type, and status
- **Data Persistence**: Information is securely stored and retrieved on page load
- **Real-time Updates**: Immediate feedback on successful updates

## Technical Implementation

### Frontend (React)
- **Component**: `Payment.jsx` - Main payment page component
- **Styling**: `Payment.css` - Comprehensive styling with responsive design
- **State Management**: Local state for file uploads and employment information
- **API Integration**: RESTful API calls for document and employment data

### Backend (Node.js/Express)
- **Controller**: `paymentController.js` - Handles all payment-related API endpoints
- **File Upload**: Multer middleware for secure file handling
- **Database**: PostgreSQL tables for document and employment data storage
- **Authentication**: JWT token-based authentication for all endpoints

### Database Schema
- **payment_documents**: Stores uploaded document metadata
- **employment_info**: Stores user employment information
- **Indexes**: Optimized for performance with proper indexing

## API Endpoints

### Document Management
- `POST /api/payment/upload-document` - Upload a document
- `GET /api/payment/documents` - Get user's uploaded documents

### Employment Information
- `PUT /api/payment/employment-info` - Update employment information
- `GET /api/payment/employment-info` - Get employment information

## Setup Instructions

### Database Setup
1. Run the payment schema setup script:
   ```bash
   cd test-pilot-server
   node scripts/setup-payment-tables.js
   ```

### File Storage
- Uploaded files are stored in `test-pilot-server/uploads/payment-documents/`
- Files are served statically via Express at `/uploads/payment-documents/`
- File naming convention: `{userId}_{documentType}_{timestamp}.{extension}`

### Environment Variables
Ensure the following environment variables are set:
- `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` for database connection
- `VITE_API_URL` for frontend API calls

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: 10MB maximum file size
- **User Isolation**: Users can only access their own documents and information
- **Secure File Storage**: Files are stored with generated names to prevent conflicts

## Usage

1. Navigate to `/payment` in the application
2. Upload required documents using the file upload interface
3. Schedule financial planning sessions using the direct link
4. Update employment information in the secure portal
5. View uploaded documents and track completion status

## Responsive Design

The payment page is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

All components adapt to different screen sizes with appropriate layout changes.



