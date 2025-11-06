/*const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const excelJS = require("exceljs");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- SQL SERVER CONFIG ----------------
const config = {
  user: "sa",
  password: "thara@145",
  server: "DESKTOP-L5UI79Q",
  database: "vehiclemaster",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// ---------------- MAIL AUTOMATION ----------------
let mailJob = null;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tharanaas@gmail.com", // your gmail
    pass: "eool bhnw mswa vcrt", // app password
  },
});

// Function to send hourly report email
async function sendReportMail() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT CONVERT(VARCHAR(10), Ddate, 120) AS Ddate,
             vehi_no, vehi_name, driver_name, emp_code, emp_name, start_from, destination
      FROM vehiclemaster
      WHERE Ddate >= DATEADD(HOUR, -1, GETDATE())
      ORDER BY Ddate DESC
    `);

    const rows = result.recordset;
    if (rows.length === 0) return console.log("No new records in the last hour.");

    const workbook = new excelJS.Workbook();
    const sheet = workbook.addWorksheet("Vehicle Report");

    sheet.columns = [
      { header: "Date", key: "Ddate", width: 15 },
      { header: "Vehicle No", key: "vehi_no", width: 15 },
      { header: "Vehicle Name", key: "vehi_name", width: 20 },
      { header: "Driver Name", key: "driver_name", width: 20 },
      { header: "Emp Code", key: "emp_code", width: 15 },
      { header: "Emp Name", key: "emp_name", width: 20 },
      { header: "From", key: "start_from", width: 20 },
      { header: "Destination", key: "destination", width: 20 },
    ];

    rows.forEach(row => sheet.addRow(row));

    const filePath = "./vehicle_report.xlsx";
    await workbook.xlsx.writeFile(filePath);

    await transporter.sendMail({
      from: '"Vehicle Report System" <tharanaas@gmail.com>',
      to: "tharanaa52004@gmail.com",
      subject: "Hourly Vehicle Report",
      text: "Please find attached the latest vehicle data report.",
      attachments: [{ filename: "vehicle_report.xlsx", path: filePath }],
    });

    console.log("Mail sent successfully!");
  } catch (err) {
    console.error("Error sending mail:", err);
  }
}

// Start mail automation
app.post("/api/start-mail-automation", (req, res) => {
  if (mailJob) return res.status(400).json({ message: "Mail automation already running" });

  mailJob = cron.schedule("* * * * *", sendReportMail); // every hour on the hour
  mailJob.start();

  res.status(200).json({ message: "Mail automation started successfully" });
  console.log("Mail automation started.");
});

// Stop mail automation
app.post("/api/stop-mail-automation", (req, res) => {
  if (!mailJob) return res.status(400).json({ message: "No active automation to stop" });

  mailJob.stop();
  mailJob = null;
  res.status(200).json({ message: "Mail automation stopped successfully" });
  console.log("Mail automation stopped.");
});

// ---------------- API ROUTES ----------------

// GET all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT vehi_no, vehi_name, vehi_type FROM vehicle_master"
    );
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Vehicles Error:", err);
    res.status(500).json([]);
  }
});

// GET all drivers
app.get("/api/drivers", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT driver_id, driver_name, designation, driver_type FROM drivers"
    );
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Drivers Error:", err);
    res.status(500).json([]);
  }
});

// GET all employees
app.get("/api/employees", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM RMCL_EMP_MASTER_UNIT_4X");
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Employees Error:", err);
    res.status(500).json([]);
  }
});

// Get all vehicles
app.get("/api/vehi-duty", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT vehi_num, vehi_names, General, second_shift, third_shift, Remark 
      FROM vehicle_duty
      ORDER BY vehi_num
    `);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});


// POST vehicle entry
app.post("/api/vehicle/add", async (req, res) => {
  const {
    Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type,
    start_from, destination, start_km, start_time, end_km, end_time, slipreq, slip_given,emp_code, emp_name,dept_desc,for_whom
  } = req.body;

  const vehi_status = !end_km ? "Live" : "End";

  // Simple validations
  if (!Ddate || !vehi_no || !vehi_name || !driver_id)
    return res.status(400).send("Required fields are missing.");

  try {
    const pool = await sql.connect(config);
    const insertQuery = `
      INSERT INTO vehiclemaster
      (Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type, 
       start_from, destination, start_km, start_time, end_km, end_time, slipreq, slip_given, vehi_status, emp_code, emp_name, dept_desc,for_whom)
      VALUES
      (@Ddate, @vehi_no, @vehi_name, @vehi_type, @driver_id, @driver_name, @designation, @driver_type,
       @start_from, @destination, @start_km, @start_time, @end_km, @end_time, @slipreq, @slip_given,@vehi_status, @emp_code, @emp_name, @dept_desc,@for_whom)
    `;

    await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_no", sql.VarChar(20), vehi_no)
      .input("vehi_name", sql.VarChar(50), vehi_name)
      .input("vehi_type", sql.VarChar(100), vehi_type)
      .input("driver_id", sql.VarChar(20), driver_id)
      .input("driver_name", sql.VarChar(150), driver_name)
      .input("designation", sql.VarChar(100), designation)
      .input("driver_type", sql.VarChar(50), driver_type)
      .input("start_from", sql.VarChar(150), start_from)
      .input("destination", sql.VarChar(150), destination)
      .input("start_km", sql.Int, start_km)
      .input("start_time", sql.VarChar(20), start_time)
      .input("end_km", sql.Int, end_km || null)
      .input("end_time", sql.VarChar(20), end_time || null)
      .input("slipreq", sql.VarChar(10), slipreq)
      .input("slip_given", sql.VarChar(20), slip_given || null)
      .input("vehi_status", sql.VarChar(10), vehi_status)
      .input("emp_code", sql.VarChar(20), emp_code || null)
      .input("emp_name", sql.VarChar(150), emp_name || null)
      .input("dept_desc", sql.VarChar(150), dept_desc || null)
      .input("for_whom", sql.VarChar(150), for_whom || null)
      .query(insertQuery);

    res.status(200).send("Vehicle record added successfully");
  } catch (err) {
    console.error("SQL Insert Error:", err);
    res.status(500).send("Insert Error: " + err.message);
  }
});

// POST fetch report
app.post("/api/reports", async (req, res) => {
  const { filterType, value, month, year } = req.body;

  try {
    let query = `SELECT Ddate, vehi_no, vehi_name, vehi_type, driver_name, designation, driver_type,
                        start_from, destination, emp_code, emp_name 
                 FROM vehiclemaster WHERE 1=1`;

    if (filterType === "date") query += ` AND Ddate = @value`;
    else if (filterType === "month") query += ` AND MONTH(Ddate) = @month AND YEAR(Ddate) = @year`;
    else if (filterType === "year") query += ` AND YEAR(Ddate) = @year`;
    else if (filterType === "driver") query += ` AND driver_id = @value`;
    else if (filterType === "vehicle") query += ` AND vehi_no = @value`;

    const pool = await sql.connect(config);
    const request = pool.request();
    if (filterType === "date" || filterType === "driver" || filterType === "vehicle") request.input("value", sql.VarChar, value);
    if (filterType === "month" || filterType === "year") {
      if (month) request.input("month", sql.Int, month);
      if (year) request.input("year", sql.Int, year);
    }

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Report Fetch Error:", err);
    res.status(500).json([]);
  }
});

// POST export report to Excel
app.post("/api/reports/export", async (req, res) => {
  const { data } = req.body;
  try {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Vehicle Report");

    worksheet.columns = [
      { header: "Date", key: "Ddate", width: 15 },
      { header: "Vehicle No", key: "vehi_no", width: 15 },
      { header: "Vehicle Name", key: "vehi_name", width: 20 },
      { header: "Vehicle Type", key: "vehi_type", width: 15 },
      { header: "Driver Name", key: "driver_name", width: 20 },
      { header: "Designation", key: "designation", width: 15 },
      { header: "Driver Type", key: "driver_type", width: 15 },
      { header: "From", key: "start_from", width: 15 },
      { header: "Destination", key: "destination", width: 15 },
      { header: "Employee Code", key: "emp_code", width: 15 },
      { header: "Employee Name", key: "emp_name", width: 20 },
    ];

    worksheet.addRows(data || []);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Vehicle_Report.xlsx");

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).send("Error exporting Excel");
  }
});

app.post("/api/vehicle-duty", async (req, res) => {
  const { Ddate,vehi_num, vehi_names, General, second_shift, third_shift, Remark } = req.body;
  try {
    const pool = await sql.connect(config);
    const query = `
      insert into vehicles_duty (Ddate,vehi_num, vehi_names, General, second_shift, third_shift, Remark)
      values (@Ddate,@vehi_num, @vehi_names, @General, @second_shift, @third_shift, @Remark)
    `;
    await pool
      .request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_num", sql.VarChar(20), vehi_num)
      .input("vehi_names", sql.VarChar(100), vehi_names)
      .input("General", sql.VarChar(100), General)
      .input("second_shift", sql.VarChar(100), second_shift)
      .input("third_shift", sql.VarChar(100), third_shift)
      .input("Remark", sql.VarChar(100), Remark)
      .query(query);

    res.json({ message: "Inserted successfully" });
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ error: "Failed to update vehicle duty" });
  }
});

app.post("/api/send-duty-mail", async (req, res) => {
  const { Ddate } = req.body;

  if (!Ddate) return res.status(400).json({ error: "Date is required" });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .query(`
        SELECT Ddate, vehi_num, vehi_names, General, second_shift, third_shift, Remark
        FROM vehicles_duty
        WHERE Ddate = @Ddate
      `);

    const records = result.recordset;
    if (records.length === 0)
      return res.status(404).json({ error: "No records found for this date" });

    // Generate HTML table for mail
    let htmlTable = `
      <h3>Vehicle Duty Report - ${Ddate}</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial;">
        <tr style="background-color:#f2f2f2;">
          <th>Date</th>
          <th>Vehicle No</th>
          <th>Vehicle Name</th>
          <th>General</th>
          <th>Second Shift</th>
          <th>Third Shift</th>
          <th>Remark</th>
        </tr>
    `;

    records.forEach(r => {
      htmlTable += `
        <tr>
          <td>${r.Ddate.toISOString().split("T")[0]}</td>
          <td>${r.vehi_num}</td>
          <td>${r.vehi_names}</td>
          <td>${r.General || ""}</td>
          <td>${r.second_shift || ""}</td>
          <td>${r.third_shift || ""}</td>
          <td>${r.Remark || ""}</td>
        </tr>
      `;
    });

    htmlTable += `</table>`;

    // Send mail
    await transporter.sendMail({
      from: '"Vehicle Duty Report" <tharanaas@gmail.com>',
      to: "tharanaa52004@gmail.com", // 🔹 change this to GM's mail
      subject: `Vehicle Duty Report for ${Ddate}`,
      html: htmlTable,
    });

    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error("Error sending duty mail:", err);
    res.status(500).json({ error: "Failed to send mail" });
  }
});


// ---------------- START SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));*/
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const excelJS = require("exceljs");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const multer = require("multer");
const fs = require("fs");
const path = require("path"); 

// ---------------- SQL SERVER CONFIG ----------------
const config = {
  user: "sa",
  password: "thara@145",
  server: "DESKTOP-L5UI79Q",
  database: "vehiclemaster",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// transporter (kept as you had)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tharanaas@gmail.com",
    pass: "eool bhnw mswa vcrt",
  },
});

// ---------------- existing endpoints (vehicles, drivers, etc) ----------------

// GET all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT vehi_no, vehi_name, vehi_type FROM vehicle_master"
    );
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Vehicles Error:", err);
    res.status(500).json([]);
  }
});

// GET all drivers
app.get("/api/drivers", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT driver_id, driver_name, designation, driver_type FROM drivers"
    );
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Drivers Error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM RMCL_EMP_MASTER_UNIT_4X");
    res.json(result.recordset || []);
  } catch (err) {
    console.error("SQL Fetch Employees Error:", err);
    res.status(500).json([]);
  }
});

app.get("/api/vehi-duty", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT vehi_num, vehi_names, General, second_shift, third_shift, Remark ,twelve_sp1, twelve_sp2
      FROM vehicle_duty
      ORDER BY vehi_num
    `);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});
// (other endpoints such as /api/employees etc are unchanged — keep your existing ones)

// ---------------- REPORTS (modified) ----------------

// POST fetch report
// IMPORTANT: We include `id` in SELECT — ensure vehiclemaster has a PK column named `id`.
// If your PK is different, change `id` to the correct column name in both frontend & backend.
app.post("/api/vehicle/add", async (req, res) => {
  const {
    Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type,
    start_from, destination, start_km, start_time, end_km, end_time, slipreq, slip_given, emp_code, emp_name, pos_title,for_whom
  } = req.body;

  const vehi_status = !end_km ? "Live" : "End";

  // Simple validations
  if (!Ddate || !vehi_no || !vehi_name || !driver_id)
    return res.status(400).send("Required fields are missing.");

  try {
    const pool = await sql.connect(config);
    const insertQuery = `
      INSERT INTO vehiclemaster
      (Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type, 
       start_from, destination, start_km, start_time, end_km, end_time, slipreq, slip_given, vehi_status, emp_code, emp_name, pos_title, for_whom)
      VALUES
      (@Ddate, @vehi_no, @vehi_name, @vehi_type, @driver_id, @driver_name, @designation, @driver_type,
       @start_from, @destination, @start_km, @start_time, @end_km, @end_time, @slipreq, @slip_given,@vehi_status, @emp_code, @emp_name, @pos_title, @for_whom)
    `;

    await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_no", sql.VarChar(20), vehi_no)
      .input("vehi_name", sql.VarChar(50), vehi_name)
      .input("vehi_type", sql.VarChar(100), vehi_type)
      .input("driver_id", sql.VarChar(20), driver_id)
      .input("driver_name", sql.VarChar(150), driver_name)
      .input("designation", sql.VarChar(100), designation)
      .input("driver_type", sql.VarChar(50), driver_type)
      .input("start_from", sql.VarChar(150), start_from)
      .input("destination", sql.VarChar(150), destination)
      .input("start_km", sql.Int, start_km)
      .input("start_time", sql.VarChar(20), start_time)
      .input("end_km", sql.Int, end_km || null)
      .input("end_time", sql.VarChar(20), end_time || null)
      .input("slipreq", sql.VarChar(10), slipreq)
      .input("slip_given", sql.VarChar(20), slip_given || null)
      .input("vehi_status", sql.VarChar(10), vehi_status)
      .input("emp_code", sql.VarChar(20), emp_code || null)
      .input("emp_name", sql.VarChar(150), emp_name || null)
      .input("pos_title", sql.VarChar(150), pos_title || null)
      .input("for_whom", sql.VarChar(150), for_whom || null)
      .query(insertQuery);

    res.status(200).send("Vehicle record added successfully");
  } catch (err) {
    console.error("SQL Insert Error:", err);
    res.status(500).send("Insert Error: " + err.message);
  }
});
// mail automation of vehicle
async function sendVehicleReport() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT * FROM vehiclemaster
      WHERE Ddate = CAST(GETDATE() AS DATE)
        AND DATEPART(HOUR, Created_At) = DATEPART(HOUR, GETDATE())
      ORDER BY Ddate DESC
    `);

    if (result.recordset.length === 0) {
      console.log("No new vehicle records in this hour.");
      return;
    }

    let tableRows = result.recordset.map(v => `
      <tr>
        <td>${v.vehi_no}</td>
        <td>${v.vehi_name}</td>
        <td>${v.vehi_type}</td>
        <td>${v.driver_name}</td>
        <td>${v.designation}</td>
        <td>${v.start_from}</td>
        <td>${v.destination}</td>
        <td>${v.start_km}</td>
        <td>${v.start_time}</td>
        <td>${v.end_km || ""}</td>
        <td>${v.end_time || ""}</td>
        <td>${v.vehi_status}</td>
        <td>${v.emp_name || ""}</td>
        <td>${v.for_whom || ""}</td>
      </tr>
    `).join("");

    const html = `
      <h3>🚗 Vehicle Records Added This Hour</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Vehicle No</th>
          <th>Name</th>
          <th>Type</th>
          <th>Driver</th>
          <th>Designation</th>
          <th>Start From</th>
          <th>Destination</th>
          <th>Start KM</th>
          <th>Start Time</th>
          <th>End KM</th>
          <th>End Time</th>
          <th>Status</th>
          <th>Requested By</th>
          <th>For Whom</th>
        </tr>
        ${tableRows}
      </table>
    `;

    const mailOptions = {
      from: "tharanaas@gmail.com",
      to: "tharanaa52004@gmail.com",
      subject: "🕒 Hourly Vehicle Update",
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Hourly vehicle update sent to GM");
  } catch (err) {
    console.error("Error sending hourly vehicle report:", err);
  }
}


// ---------------- CRON JOB (EVERY HOUR) ----------------
cron.schedule("*0 * * * *", () => {
  console.log("Running hourly vehicle report...");
  sendVehicleReport();
});

// ===============================
// 📂 File Upload Configuration
// ===============================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Upload file route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const { vehicleNo } = req.body;
    const filePath = `/uploads/${req.file.filename}`;

    await sql.connect(config);
    await sql.query(`
      UPDATE vehicle_details 
      SET Document_Path = '${filePath}'
      WHERE Vehicle_No = '${vehicleNo}'
    `);

    res.json({ message: "File uploaded successfully!", filePath });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "File upload failed" });
  }
});

// ✅ Serve uploaded files for viewing/downloading
app.use("/uploads", express.static(uploadDir));

// ✅ Delete uploaded file route
app.delete("/api/deleteFile", async (req, res) => {
  try {
    const vehicleNo = req.query.vehicleNo; // ✅ get from query string

    if (!vehicleNo) {
      return res.status(400).json({ error: "Vehicle number required" });
    }

    await sql.connect(config);
    const result = await sql.query(`
      SELECT Document_Path FROM vehicle_details WHERE Vehicle_No = '${vehicleNo}'
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const filePath = result.recordset[0].Document_Path;
    if (!filePath) {
      return res.status(400).json({ error: "No file to delete" });
    }

    // Delete file from folder
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    // Remove file path in DB
    await sql.query(`
      UPDATE vehicle_details 
      SET Document_Path = NULL
      WHERE Vehicle_No = '${vehicleNo}'
    `);

    res.json({ message: "File deleted successfully!" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: "File deletion failed" });
  }
});





// POST fetch report
app.post("/api/reports", async (req, res) => {
  const { filterType, value, month, year } = req.body;

  try {
    let query = `SELECT Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type,
                        start_from, destination, emp_code, emp_name,for_whom
                 FROM vehiclemaster WHERE 1=1`;

    if (filterType === "date") query += ` AND Ddate = @value`;
    else if (filterType === "month") query += ` AND MONTH(Ddate) = @month AND YEAR(Ddate) = @year`;
    else if (filterType === "year") query += ` AND YEAR(Ddate) = @year`;
    else if (filterType === "driver") query += ` AND driver_id = @value`;
    else if (filterType === "vehicle") query += ` AND vehi_no = @value`;

    const pool = await sql.connect(config);
    const request = pool.request();
    if (filterType === "date" || filterType === "driver" || filterType === "vehicle") request.input("value", sql.VarChar, value);
    if (filterType === "month" || filterType === "year") {
      if (month) request.input("month", sql.Int, month);
      if (year) request.input("year", sql.Int, year);
    }

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Report Fetch Error:", err);
    res.status(500).json([]);
  }
});
app.post("/api/reports", async (req, res) => {
  const { filterType, value, month, year, subFilterType, date } = req.body;

  try {
    let query = `SELECT id, CONVERT(VARCHAR(10), Ddate, 120) AS Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type,
                        start_from, destination, emp_code, emp_name, start_km, end_km,for_whom
                 FROM vehiclemaster WHERE 1=1`;

    // primary filters
    if (filterType === "date") query += ` AND Ddate = @value`;
    else if (filterType === "month") query += ` AND MONTH(Ddate) = @month AND YEAR(Ddate) = @year`;
    else if (filterType === "year") query += ` AND YEAR(Ddate) = @year`;
    else if (filterType === "driver") {
      // support optional sub filters similar to frontend
      if (subFilterType === "date" && date) query += ` AND driver_id = @value AND Ddate = @date`;
      else if (subFilterType === "month" && month && year) query += ` AND driver_id = @value AND MONTH(Ddate) = @month AND YEAR(Ddate) = @year`;
      else if (subFilterType === "year" && year) query += ` AND driver_id = @value AND YEAR(Ddate) = @year`;
      else query += ` AND driver_id = @value`;
    }
    else if (filterType === "vehicle") {
      if (subFilterType === "date" && date) query += ` AND vehi_no = @value AND Ddate = @date`;
      else if (subFilterType === "month" && month && year) query += ` AND vehi_no = @value AND MONTH(Ddate) = @month AND YEAR(Ddate) = @year`;
      else if (subFilterType === "year" && year) query += ` AND vehi_no = @value AND YEAR(Ddate) = @year`;
      else query += ` AND vehi_no = @value`;
    }

    // other cases: keep the earlier simple logic for first-level filters
    if (filterType === "driver" || filterType === "vehicle" || filterType === "date") {
      // inputs will be set below
    } else if (filterType === "month" || filterType === "year") {
      // handled above
    }

    query += ` ORDER BY Ddate DESC`;

    const pool = await sql.connect(config);
    const request = pool.request();

    // Bind inputs safely
    if (filterType === "date") request.input("value", sql.Date, value);
    if (filterType === "driver" || filterType === "vehicle") {
      request.input("value", sql.VarChar(50), value || "");
      if (date) request.input("date", sql.Date, date);
      if (month) request.input("month", sql.Int, month);
      if (year) request.input("year", sql.Int, year);
    }
    if (filterType === "month" || filterType === "year") {
      if (month) request.input("month", sql.Int, month);
      if (year) request.input("year", sql.Int, year);
    }

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Report Fetch Error:", err);
    res.status(500).json([]);
  }
});

// POST update a single record field
// body: { id, field, value }
/*app.post("/api/report/update", async (req, res) => {
  const { id, field, value } = req.body;
  if (!id || !field) return res.status(400).json({ success: false, message: "Missing id or field" });

  // whitelist allowed fields (must match columns in DB)
  const allowedFields = {
    Ddate: "date",
    vehi_no: "string",
    vehi_name: "string",
    vehi_type: "string",
    driver_id: "string",
    driver_name: "string",
    designation: "string",
    start_from: "string",
    destination: "string",
    emp_code: "string",
    emp_name: "string",
  };

  if (!allowedFields[field]) return res.status(400).json({ success: false, message: "Field not allowed" });

  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // bind id
    request.input("id", sql.Int, id);

    // bind value according to type
    const type = allowedFields[field];
    if (type === "date") {
      // expect value as 'YYYY-MM-DD' or JS date string
      request.input("value", sql.Date, value);
    } else {
      request.input("value", sql.VarChar(500), value ? String(value) : null);
    }

    // safe update: use whitelist to build column portion
    // NOTE: column name inserted directly because whitelisted above
    const updateQuery = `UPDATE vehiclemaster SET ${field} = @value WHERE id = @id; SELECT id, CONVERT(VARCHAR(10), Ddate, 120) AS Ddate, vehi_no, vehi_name, vehi_type, driver_id, driver_name, designation, driver_type, start_from, destination, emp_code, emp_name, start_km, end_km FROM vehiclemaster WHERE id = @id;`;

    const result = await request.query(updateQuery);

    const updatedRec = (result.recordset && result.recordset[0]) ? result.recordset[0] : null;

    res.json({ success: true, updatedRecord: updatedRec || null });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});*/
/*app.post("/api/report/update", async (req, res) => {
  try {
    const { Ddate, vehi_no, field, newValue } = req.body;
    if (!Ddate || !vehi_no || !field || newValue === undefined)
      return res.status(400).json({ error: "Missing required fields" });

    // fields allowed to update (excluding primary keys)
    const allowed = [
      "vehi_name",
      "vehi_type",
      "driver_id",
      "driver_name",
      "designation",
      "start_from",
      "destination",
      "emp_code",
      "emp_name",
    ];

    if (!allowed.includes(field))
      return res.status(400).json({ error: "Invalid field" });

    const pool = await getPool();

    // detect if the field is a date field
    const dateFields = ["Ddate"];
    const inputType = dateFields.includes(field) ? sql.Date : sql.VarChar;

    const query = `UPDATE vehiclemaster SET ${field} = @newValue WHERE vehi_no = @vehi_no AND Ddate = @Ddate`;

    await pool
      .request()
      .input("newValue", inputType, newValue)
      .input("vehi_no", sql.VarChar, vehi_no)
      .input("Ddate", sql.Date, Ddate)
      .query(query);

    res.json({ success: true, message: "Record updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});*/
app.post("/api/report/update", async (req, res) => {
  try {
    const { Ddate, vehi_no, field, newValue } = req.body;
    if (!Ddate || !vehi_no || !field || newValue === undefined)
      return res.status(400).json({ error: "Missing required fields" });

    const pool = await getPool();

    // Mapping of fields to their dependent fields
    const dependencies = {
      vehi_no: ["vehi_name", "vehi_type"],        // auto-update vehicle info
      driver_id: ["driver_name", "designation", "driver_type"],  // auto-update driver info
      emp_code: ["emp_name"],                      // auto-update employee info
    };

    // detect if field is allowed to update
    const allowed = [
      "vehi_no",
      "driver_id", 
       "start_from", "destination",
      "emp_code", "emp_name", "for_whom"
    ];

    if (!allowed.includes(field))
      return res.status(400).json({ error: "Invalid field" });

    // Start building SET clause
    let setClause = `${field} = @newValue`;
    let inputs = { newValue, vehi_no, Ddate };

    // handle dependent fields
    if (dependencies[field]) {
      for (let depField of dependencies[field]) {
        // fetch the value from corresponding master table
        let depValue;
        if (field === "vehi_no") {
          const vehi = await pool.request()
            .input("vehi_no", sql.VarChar, newValue)
            .query("SELECT vehi_name,vehi_type FROM vehicle_master WHERE vehi_no = @vehi_no");
          if (vehi.recordset.length) {
            if (depField === "vehi_name") depValue = vehi.recordset[0].vehi_name;
            if (depField === "vehi_type") depValue = vehi.recordset[0].vehi_type;
          }
        } else if (field === "driver_id") {
          const driver = await pool.request()
            .input("driver_id", sql.VarChar, newValue)
            .query("SELECT driver_name, designation, driver_type FROM drivers WHERE driver_id = @driver_id"); // updated 👈
          if (driver.recordset.length) {
            if (depField === "driver_name") depValue = driver.recordset[0].driver_name;
            if (depField === "designation") depValue = driver.recordset[0].designation;
            if (depField === "driver_type") depValue = driver.recordset[0].driver_type;
          }
        } else if (field === "emp_code") {
          const emp = await pool.request()
            .input("emp_code", sql.VarChar, newValue)
            .query("SELECT emp_name FROM RMCL_EMP_MASTER_UNIT_4X WHERE emp_code = @emp_code");
          if (emp.recordset.length) {
            depValue = emp.recordset[0].emp_name;
          }
        }
        if (depValue !== undefined) {
          setClause += `, ${depField} = '${depValue}'`;
        }
      }
    }

    const query = `UPDATE vehiclemaster SET ${setClause} WHERE vehi_no = @vehi_no AND Ddate = @Ddate`;

    await pool.request()
      .input("newValue", sql.VarChar, newValue)
      .input("vehi_no", sql.VarChar, vehi_no)
      .input("Ddate", sql.Date, Ddate)
      .query(query);

    res.json({ success: true, message: "Record updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
});



// POST delete a record
// body: { id }
/*app.post("/api/report/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: "Missing id" });

  try {
    const pool = await sql.connect(config);
    await pool.request().input("id", sql.Int, id).query("DELETE FROM vehiclemaster WHERE id = @id");
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});*/
// ✅ Delete record API
let poolPromise;
async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

// ✅ DELETE record API
app.post("/api/report/delete", async (req, res) => {
  try {
    const { Ddate, vehi_no } = req.body;

    if (!Ddate || !vehi_no) {
      return res.status(400).json({ error: "Missing required fields: Ddate or vehi_no" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_no", sql.VarChar, vehi_no)
      .query(`
        DELETE FROM vehiclemaster
        WHERE Ddate = @Ddate AND vehi_no = @vehi_no
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
});


//--------------- Excel export (kept) ----------------
app.post("/api/reports/export", async (req, res) => {
  const { data } = req.body;
  try {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Vehicle Report");

    worksheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Date", key: "Ddate", width: 15 },
      { header: "Vehicle No", key: "vehi_no", width: 15 },
      { header: "Vehicle Name", key: "vehi_name", width: 20 },
      { header: "Vehicle Type", key: "vehi_type", width: 15 },
      { header: "Driver Name", key: "driver_name", width: 20 },
      { header: "Designation", key: "designation", width: 15 },
      { header: "Driver Type", key: "driver_type", width: 15 },
      { header: "From", key: "start_from", width: 15 },
      { header: "Destination", key: "destination", width: 15 },
      { header: "Employee Code", key: "emp_code", width: 15 },
      { header: "Employee Name", key: "emp_name", width: 20 },
    ];

    worksheet.addRows(data || []);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=Vehicle_Report.xlsx");

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error("Excel Export Error:", err);
    res.status(500).send("Error exporting Excel");
  }
});

/*app.post("/api/vehicle-duty", async (req, res) => {
  const { Ddate,vehi_num, vehi_names, General, second_shift, third_shift, Remark } = req.body;
  try {
    const pool = await sql.connect(config);
    const query = `
      insert into vehicles_duty (Ddate,vehi_num, vehi_names, General, second_shift, third_shift, Remark)
      values (@Ddate,@vehi_num, @vehi_names, @General, @second_shift, @third_shift, @Remark)
    `;
    await pool
      .request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_num", sql.VarChar(20), vehi_num)
      .input("vehi_names", sql.VarChar(100), vehi_names)
      .input("General", sql.VarChar(100), General)
      .input("second_shift", sql.VarChar(100), second_shift)
      .input("third_shift", sql.VarChar(100), third_shift)
      .input("Remark", sql.VarChar(100), Remark)
      .query(query);

    res.json({ message: "Inserted successfully" });
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ error: "Failed to update vehicle duty" });
  }
});

app.post("/api/send-duty-mail", async (req, res) => {
  const { Ddate } = req.body;

  if (!Ddate) return res.status(400).json({ error: "Date is required" });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .query(`
        SELECT Ddate, vehi_num, vehi_names, General, second_shift, third_shift, Remark
        FROM vehicles_duty
        WHERE Ddate = @Ddate
      `);

    const records = result.recordset;
    if (records.length === 0)
      return res.status(404).json({ error: "No records found for this date" });

    // Generate HTML table for mail
    let htmlTable = `
      <h3>Vehicle Duty Report - ${Ddate}</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial;">
        <tr style="background-color:#f2f2f2;">
          <th>Date</th>
          <th>Vehicle No</th>
          <th>Vehicle Name</th>
          <th>General</th>
          <th>Second Shift</th>
          <th>Third Shift</th>
          <th>Remark</th>
        </tr>
    `;

    records.forEach(r => {
      htmlTable += `
        <tr>
          <td>${r.Ddate.toISOString().split("T")[0]}</td>
          <td>${r.vehi_num}</td>
          <td>${r.vehi_names}</td>
          <td>${r.General || ""}</td>
          <td>${r.second_shift || ""}</td>
          <td>${r.third_shift || ""}</td>
          <td>${r.Remark || ""}</td>
        </tr>
      `;
    });

    htmlTable += `</table>`;

    // Send mail
    await transporter.sendMail({
      from: '"Vehicle Duty Report" <tharanaas@gmail.com>',
      to: "tharanaa52004@gmail.com", // 🔹 change this to GM's mail
      subject: `Vehicle Duty Report for ${Ddate}`,
      html: htmlTable,
    });

    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error("Error sending duty mail:", err);
    res.status(500).json({ error: "Failed to send mail" });
  }
});*/

// ✅ Insert vehicle duty data
/*app.post("/api/vehicle-duty", async (req, res) => {
  const {
    Ddate,
    vehi_num,
    vehi_names,
    General,
    second_shift,
    third_shift,
    Remark,
    weekly_off,
    on_duty,
    on_leave,
  } = req.body;

  try {
    const pool = await sql.connect(config);
    const query = `
      INSERT INTO vehicles_duty 
      (Ddate, vehi_num, vehi_names, General, second_shift, third_shift, Remark, weekly_off, on_duty, on_leave)
      VALUES 
      (@Ddate, @vehi_num, @vehi_names, @General, @second_shift, @third_shift, @Remark, @weekly_off, @on_duty, @on_leave)
    `;

    await pool
      .request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_num", sql.VarChar(20), vehi_num)
      .input("vehi_names", sql.VarChar(100), vehi_names)
      .input("General", sql.VarChar(100), General)
      .input("second_shift", sql.VarChar(100), second_shift)
      .input("third_shift", sql.VarChar(100), third_shift)
      .input("Remark", sql.VarChar(100), Remark)
      .input("weekly_off", sql.VarChar(100), weekly_off)
      .input("on_duty", sql.VarChar(100), on_duty)
      .input("on_leave", sql.VarChar(100), on_leave)
      .query(query);

    res.json({ message: "Inserted successfully" });
  } catch (err) {
    console.error("Error inserting:", err);
    res.status(500).json({ error: "Failed to insert vehicle duty" });
  }
});


// ✅ Send duty report mail
app.post("/api/send-duty-mail", async (req, res) => {
  const { Ddate } = req.body;

  if (!Ddate) return res.status(400).json({ error: "Date is required" });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .query(`
        SELECT Ddate, vehi_num, vehi_names, General, second_shift, third_shift, Remark, weekly_off, on_duty, on_leave
        FROM vehicles_duty
        WHERE Ddate = @Ddate
      `);

    const records = result.recordset;
    if (records.length === 0)
      return res.status(404).json({ error: "No records found for this date" });

    let htmlTable = `
      <h3>Vehicle Duty Report - ${Ddate}</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial;">
        <tr style="background-color:#f2f2f2;">
          <th>Date</th>
          <th>Vehicle No</th>
          <th>Vehicle Name</th>
          <th>General</th>
          <th>Second Shift</th>
          <th>Third Shift</th>
          <th>Weekly Off</th>
          <th>On Duty</th>
          <th>On Leave</th>
          <th>Remark</th>
        </tr>
    `;

    records.forEach(r => {
      htmlTable += `
        <tr>
          <td>${r.Ddate.toISOString().split("T")[0]}</td>
          <td>${r.vehi_num}</td>
          <td>${r.vehi_names}</td>
          <td>${r.General || ""}</td>
          <td>${r.second_shift || ""}</td>
          <td>${r.third_shift || ""}</td>
          <td>${r.weekly_off || ""}</td>
          <td>${r.on_duty || ""}</td>
          <td>${r.on_leave || ""}</td>
          <td>${r.Remark || ""}</td>
        </tr>
      `;
    });

    htmlTable += `</table>`;

    await transporter.sendMail({
      from: '"Vehicle Duty Report" <tharanaas@gmail.com>',
      to: "tharanaa52004@gmail.com",
      subject: `Vehicle Duty Report for ${Ddate}`,
      html: htmlTable,
    });

    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error("Error sending duty mail:", err);
    res.status(500).json({ error: "Failed to send mail" });
  }
});*/

// ✅ Insert / Update Vehicle Duty
app.post("/api/vehicle-duty", async (req, res) => {
  const {
    Ddate,
    vehi_num,
    vehi_names,
    General,
    second_shift,
    third_shift,
    twelve_sp1,
    twelve_sp2,
    Remark,
    weekly_off,
    on_duty,
    on_leave
    
  } = req.body;

  try {
    const pool = await sql.connect(config);
    const query = `
      INSERT INTO vehicles_duty (
        Ddate, vehi_num, vehi_names, General, second_shift, third_shift, twelve_sp1, twelve_sp2, Remark, weekly_off, on_duty, on_leave
      )
      VALUES (
        @Ddate, @vehi_num, @vehi_names, @General, @second_shift, @third_shift, @twelve_sp1, @twelve_sp2, @Remark, @weekly_off, @on_duty, @on_leave
      )
    `;

    await pool
      .request()
      .input("Ddate", sql.Date, Ddate)
      .input("vehi_num", sql.VarChar(20), vehi_num)
      .input("vehi_names", sql.VarChar(100), vehi_names)
      .input("General", sql.VarChar(100), General)
      .input("second_shift", sql.VarChar(100), second_shift)
      .input("third_shift", sql.VarChar(100), third_shift)
      .input("Remark", sql.VarChar(100), Remark)
      .input("weekly_off", sql.VarChar(500), weekly_off)
      .input("on_duty", sql.VarChar(500), on_duty)
      .input("on_leave", sql.VarChar(500), on_leave)
      .input("twelve_sp1", sql.VarChar(500), twelve_sp1)
      .input("twelve_sp2", sql.VarChar(500), twelve_sp2)
      .query(query);

    res.json({ message: "Inserted successfully" });
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ error: "Failed to update vehicle duty" });
  }
});

// ✅ Send Duty Mail (updated to include the new fields)
app.post("/api/send-duty-mail", async (req, res) => {
  const { Ddate } = req.body;
  if (!Ddate) return res.status(400).json({ error: "Date is required" });

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("Ddate", sql.Date, Ddate)
      .query(`
        SELECT Ddate, vehi_num, vehi_names, General, second_shift, third_shift, Remark, twelve_sp1, twelve_sp2, weekly_off, on_duty, on_leave
        FROM vehicles_duty
        WHERE Ddate = @Ddate
      `);

    const records = result.recordset;
    if (records.length === 0)
      return res.status(404).json({ error: "No records found for this date" });

    let htmlTable = `
      <h3>Vehicle Duty Report - ${Ddate}</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; font-family: Arial;">
        <tr style="background-color:#f2f2f2;">
          <th>Date</th>
          <th>Vehicle No</th>
          <th>Vehicle Name</th>
          <th>General</th>
          <th>Second Shift</th>
          <th>Third Shift</th>
          <th>Remark</th>
          <th>12 SP 1</th>
          <th>12 SP 2</th>
          <th>Weekly Off</th>
          <th>On Duty</th>
          <th>On Leave</th>
        </tr>
    `;

    records.forEach(r => {
      htmlTable += `
        <tr>
          <td>${r.Ddate.toISOString().split("T")[0]}</td>
          <td>${r.vehi_num}</td>
          <td>${r.vehi_names}</td>
          <td>${r.General || ""}</td>
          <td>${r.second_shift || ""}</td>
          <td>${r.third_shift || ""}</td>
          <td>${r.Remark || ""}</td>
          <td>${r.twelve_sp1 || ""}</td>
          <td>${r.twelve_sp2 || ""}</td>
          <td>${r.weekly_off || ""}</td>
          <td>${r.on_duty || ""}</td>
          <td>${r.on_leave || ""}</td>
        </tr>
      `;
    });

    htmlTable += `</table>`;

    await transporter.sendMail({
      from: '"Vehicle Duty Report" <tharanaas@gmail.com>',
      to: "tharanaa52004@gmail.com",
      subject: `Vehicle Duty Report for ${Ddate}`,
      html: htmlTable,
    });

    res.json({ message: "Mail sent successfully!" });
  } catch (err) {
    console.error("Error sending duty mail:", err);
    res.status(500).json({ error: "Failed to send mail" });
  }
});

// ✅ Fetch list of vehicles and vehicle_details page
app.get("/api/vehicledetails", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query(
      "SELECT Vehicle_No, Vehicle_Name FROM vehicle_details"
    );
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching vehicles");
  }
});

// ✅ Fetch details of a specific vehicle
app.get("/api/vehicle/:id", async (req, res) => {
  try {
    await sql.connect(config);
    const { id } = req.params;
    const result = await sql.query(
      `SELECT * FROM vehicle_details 
       WHERE Vehicle_No = '${id}' OR Vehicle_Name = '${id}'`
    );
    if (result.recordset.length === 0)
      return res.status(404).send("Vehicle not found");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching vehicle details");
  }
});

// 🕒 Cron Job — runs daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running certificate expiry reminder check...");
  try {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT *
       FROM vehicle_details 
       WHERE Certificate_Expiry_Date IS NOT NULL`
    );

    const today = new Date();

    for (const row of result.recordset) {
      const expiry = new Date(row.Certificate_Expiry_Date);
      const diffDays = Math.floor(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 90 || diffDays === 30) {
        const mailOptions = {
          from: "tharanaas@gmail.com",
          to: "tharanaa52004@gmail.com",
          subject: `⚠️ Certificate Expiry Reminder for ${row.Vehicle_Name}`,
          html: `
            <h3>Vehicle Certificate Expiry Reminder</h3>
            <p><strong>Vehicle No:</strong> ${row.Vehicle_No}</p>
            <p><strong>Vehicle Name:</strong> ${row.Vehicle_Name}</p>
            <p><strong>Owner:</strong> ${row.Owner_Name ?? "N/A"}</p>
            <p><strong>Certificate Expiry Date:</strong> ${expiry.toDateString()}</p>
            <p>This is an automated reminder sent ${
              diffDays === 90 ? "3 months" : "1 month"
            } before expiry.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent for ${row.Vehicle_Name}`);
      }
    }
  } catch (err) {
    console.error("Error running expiry check:", err);
  }
});
async function sendCertificateReminders() {
  console.log("Running certificate expiry reminder check...");
  try {
    await sql.connect(config);
    const result = await sql.query(
      `SELECT * FROM vehicle_details WHERE Certificate_Expiry_Date IS NOT NULL`
    );

    const today = new Date();

    for (const row of result.recordset) {
      const expiry = new Date(row.Certificate_Expiry_Date);
      const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

      if (diffDays === 90 || diffDays === 30) {
        const mailOptions = {
          from: "tharanaas@gmail.com",
          to: "tharanaa52004@gmail.com",
          subject: `⚠️ Certificate Expiry Reminder for ${row.Vehicle_Name}`,
          html: `
            <h3>Vehicle Certificate Expiry Reminder</h3>
            <p><strong>Vehicle No:</strong> ${row.Vehicle_No}</p>
            <p><strong>Vehicle Name:</strong> ${row.Vehicle_Name}</p>
            <p><strong>Owner:</strong> ${row.Owner_Name ?? "N/A"}</p>
            <p><strong>Certificate Expiry Date:</strong> ${expiry.toDateString()}</p>
            <p>This is an automated reminder sent ${
              diffDays === 90 ? "3 months" : "1 month"
            } before expiry.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Reminder sent for ${row.Vehicle_Name}`);
      }
    }

    return { success: true, message: "Email reminders checked" };
  } catch (err) {
    console.error("Error running expiry check:", err);
    return { success: false, error: err.message };
  }
}
app.get("/api/test-reminders", async (req, res) => {
  const result = await sendCertificateReminders();
  res.json(result);
}); 

// Make sure sendCertificateReminders is defined above
app.post("/api/test-reminders", async (req, res) => {
  try {
    const result = await sendCertificateReminders();
    if (result.success) {
      res.status(200).json({ message: "Reminder check completed" });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/updateKms", async (req, res) => {
  const { vehicleNo, startKm, endKm } = req.body;

  if (!vehicleNo || startKm == null || endKm == null)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    await sql.connect(config);
    const totalKm = endKm - startKm;

    // 🧮 Update total km & date
    await sql.query(`
      UPDATE vehicle_details
      SET Total_Kms = ${totalKm}, 
          Kms_As_on = ${endKm},
          Last_Updated_Date = GETDATE()
      WHERE Vehicle_No = '${vehicleNo}'
    `);

    res.json({ success: true, message: `Updated ${vehicleNo}`, totalKm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating kilometers" });
  }
});

cron.schedule("0 18 * * *", async () => { // runs daily at 6 PM
  console.log("Running daily km update job...");
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT vehi_no, start_km, end_km FROM vehiclemaster WHERE end_km IS NOT NULL");

    for (const row of result.recordset) {
      const totalKm = row.End_Km - row.Start_Km;

      await sql.query(`
        UPDATE vehicle_details
        SET Total_Kms = ${totalKm},
            Kms_As_on = ${row.End_Km},
            Last_Updated_Date = GETDATE()
        WHERE Vehicle_No = '${row.Vehicle_No}'
      `);
    }

    console.log("✅ Daily KM update complete.");
  } catch (err) {
    console.error("❌ Error in daily km update:", err);
  }
});


// driver details page
app.get("/api/drivers", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query("SELECT * FROM drivers");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching drivers");
  }
});

// ✅ Fetch single driver
app.get("/api/driver/:id", async (req, res) => {
  try {
    await sql.connect(config);
    const { id } = req.params;
    const result = await sql.query(
      `SELECT * FROM drivers WHERE driver_id = '${id}'`
    );
    if (result.recordset.length === 0)
      return res.status(404).send("Driver not found");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching driver details");
  }
});

// ✅ Upload document (docType = Document_Path1 / Document_Path2)
app.post("/api/driver/upload", upload.single("file"), async (req, res) => {
  try {
    const { driverId, docType } = req.body;
    if (!req.file) return res.status(400).send("No file uploaded");

    const filePath = `/uploads/drivers/${req.file.filename}`;

    await sql.connect(config);
    await sql.query(
      `UPDATE drivers SET ${docType} = '${filePath}' WHERE driver_id = '${driverId}'`
    );

    res.json({ message: "File uploaded successfully!", path: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// ✅ Delete document
app.delete("/api/driver/deleteFile", async (req, res) => {
  try {
    const { driverId, doc } = req.query;

    await sql.connect(config);
    await sql.query(
      `UPDATE drivers SET ${doc} = NULL WHERE driver_id = '${driverId}'`
    );

    res.json({ message: "File deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("File deletion failed");
  }
});

// keep your other endpoints (mail automation, vehicle add, vehicle duty, etc)
// I omitted re-adding them here to keep the snippet focused on report CRUD.
// If you want, merge them from your original server file (they are safe to keep).

// ---------------- START SERVER ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


