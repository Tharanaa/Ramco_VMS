🚗 Vehicle Management System
<img width="894" height="388" alt="image" src="https://github.com/user-attachments/assets/6edb4f63-18a5-4de6-a1e7-972ca0dff30e" />


📝 Project Overview

The Vehicle Management System (VMS) is a full-stack web application designed to efficiently manage and monitor organizational vehicles.
It provides a centralized platform for tracking vehicles, managing driver details, scheduling vehicle duties, and maintaining related documentation such as insurance, RC books, and permits.
By integrating frontend and backend modules with a powerful database, the system ensures smooth data management, operational transparency, and streamlined workflows for transport administrators and HR departments.

⚙️ Key Features

🚘 Vehicle Management

Add, view, edit, and delete vehicle records.

Store detailed vehicle information such as number, type, fuel, capacity, purchase date, kilometers, and chassis number.

Track vehicle service schedules and last service date.

👨‍✈️ Driver Management

Maintain driver profiles including license details, years of experience, and assigned vehicles.

Search and filter drivers easily based on assignment or shift.

📅 Vehicle Duty / Shifts Module

HR or admin can assign vehicles and drivers for general, second, and third shifts.

Dynamic searchable dropdowns for quick selection of drivers and vehicles.

Daily allocations stored for operational reference.

📄 Document Management

Upload, view, download, and delete important documents (e.g., Insurance, RC Book, Permits).

Files are securely stored and linked to their respective vehicle records.

🧾 Vehicle Form & Reporting

Record vehicle trips and outstation forms directly into the system.

Generate detailed reports on trips, kilometers run, and maintenance history.

Scheduled background jobs (cron tasks) automatically update reports and track service reminders.

📊 Dashboard & Insights

Overview of vehicle usage, driver assignments, and maintenance summaries.

Simplifies administrative monitoring and decision-making.

🧩 Project Workflow

Vehicle Registration

Admin adds a new vehicle with all relevant specifications and documents.

Driver Registration

Driver details are added and linked to vehicles.

Vehicle Duty Assignment

HR allocates drivers to vehicles for specific shifts each day.

Trip Form Entry

Details of each vehicle going out (destination, time, purpose) are recorded in the database.

Automated Reporting

The backend (via cron jobs) periodically updates kilometers traveled and maintenance reminders.

Document Handling

Users can manage (upload/download/delete) vehicle-related documents.

Reports & Analytics

Generate visual or tabular reports on trips, duties, and maintenance logs.

🧠 Technologies Used

Layer	Technology
Frontend  -	React.js
Backend  -	Node.js, Express.js
Database  -	Microsoft SQL Server
File Storage  -	Multer (for file uploads)
Scheduling	-  Node-Cron (for background tasks)
Version Control	Git & GitHub
Other Tools	Postman (API testing), VS Code (development)

5.Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/vehicle-management-system.git
cd vehicle-management-system

2️⃣ Install Dependencies

Backend

cd vehi_backend
npm install


Frontend

cd ../vehi_frontend
npm install

3️⃣ Configure Database

Create a database in SQL Server named VehicleManagement.

Update connection details in your backend .env file:

DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=VehicleManagement
JWT_SECRET=your_secret_key

4️⃣ Run the Application
# Start backend
cd vehi_backend
npm start

# Start frontend
cd ../vehi_frontend
npm start
