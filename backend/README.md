# Calendar Backend API

A Node.js/Express backend API for the Calendar App.

## Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Calendar Data
- `GET /api/calendar` - Get all calendar data
- `GET /api/calendar/:date` - Get calendar data for a specific date
- `POST /api/calendar` - Create a new calendar item
- `PUT /api/calendar/:id` - Update a calendar item
- `DELETE /api/calendar/:id` - Delete a calendar item

## Database Setup

This backend now uses MySQL instead of in-memory storage. Make sure you have MySQL installed and running.

### 1. Create Database and Table
```sql
CREATE DATABASE calendarapp;
USE calendarapp;

CREATE TABLE assessement (
    ID int AUTO_INCREMENT PRIMARY KEY,
    name varchar(50),
    description varchar(500),
    submit_date date
);
```

### 2. Database Configuration
Update the database connection settings in `config/database.js`:

```javascript
const dbConfig = {
  host: 'localhost',           // Your MySQL host
  user: 'root',               // Your MySQL username
  password: 'your_password',  // Your MySQL password
  database: 'calendarapp',    // Database name
  port: 3306,                 // MySQL port
  // ... other settings
};
```

## Data Structure

The API now works with the `assessement` table structure:

```javascript
{
  ID: 1,
  name: "Math Test",
  description: "Algebra and Geometry test",
  submit_date: "2024-01-25"
}
```

## Testing the API

You can test the endpoints using curl or any API testing tool:

```bash
# Health check
curl http://localhost:3000/api/health

# Get all calendar data
curl http://localhost:3000/api/calendar

# Create a new assessment
curl -X POST http://localhost:3000/api/calendar \
  -H "Content-Type: application/json" \
  -d '{"name":"Math Test","description":"Algebra test","submit_date":"2024-01-25"}'

# Get assessments for a specific date
curl http://localhost:3000/api/calendar/2024-01-25
```

## Frontend Features

The frontend now includes:
- **Visual Indicators**: Days with assessments show colored borders and dots
- **Future Assessments**: Future dates with assessments have green styling
- **Past Assessments**: Past dates with assessments have red styling
- **Clickable Days**: Tap on any day with assessments to see details
- **Assessment Details**: Shows name, description, and submit date in an alert

## Sample Data

To test the API, you can insert some sample data using the provided `sample_data.sql` file:

```bash
# Run the sample data script
mysql -u root -p calendarapp < sample_data.sql
``` 