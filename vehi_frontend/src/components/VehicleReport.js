/*import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const VehicleReport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filterType, setFilterType] = useState("date");
  const [subFilterType, setSubFilterType] = useState("date");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalKM, setTotalKM] = useState(0);
  const [loading, setLoading] = useState(false);

  const filterOptions = [
    { value: "date", label: "Date" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "vehicle", label: "Vehicle" },
    { value: "driver", label: "Driver" },
  ];

  const subFilterOptions = [
    { value: "date", label: "Date" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  // Fetch vehicles & drivers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, drvRes] = await Promise.all([
          axios.get("http://localhost:5000/api/vehicles"),
          axios.get("http://localhost:5000/api/drivers"),
        ]);
        setVehicles(vehRes.data || []);
        setDrivers(drvRes.data || []);
      } catch (err) {
        console.error("Error fetching vehicles/drivers:", err);
      }
    };
    fetchData();
  }, []);

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      let payload = { filterType };

      if (filterType === "date") payload.value = selectedDate.toISOString().split("T")[0];
      if (filterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
      if (filterType === "year") payload.year = selectedYear;

      if (filterType === "vehicle") {
        payload.value = selectedVehicle;
        payload.subFilterType = subFilterType;
        if (subFilterType === "date") payload.date = selectedDate.toISOString().split("T")[0];
        if (subFilterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
        if (subFilterType === "year") payload.year = selectedYear;
      }

      if (filterType === "driver") {
        payload.value = selectedDriver;
        payload.subFilterType = subFilterType;
        if (subFilterType === "date") payload.date = selectedDate.toISOString().split("T")[0];
        if (subFilterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
        if (subFilterType === "year") payload.year = selectedYear;
      }

      const res = await axios.post("http://localhost:5000/api/reports", payload);
      setReportData(res.data || []);
      calculateTotalKM(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalKM = (data) => {
    let totalKM = 0;
    data.forEach(r => { if (r.end_km && r.start_km) totalKM += (r.end_km - r.start_km); });
    setTotalKM(totalKM);
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/reports/export",
        { data: reportData },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Vehicle_Report.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting Excel:", err);
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = reportData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(reportData.length / recordsPerPage);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📊 Vehicle Report</h2>
      <label>Filter By:</label>
      <Select
        options={filterOptions}
        value={filterOptions.find(o => o.value === filterType)}
        onChange={opt => setFilterType(opt.value)}
      /><br /><br />

   
      {filterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd" />}
      {filterType === "month" && (
        <>
          <select onChange={e => setSelectedMonth(parseInt(e.target.value))} value={selectedMonth}>
            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} placeholder="Year" style={{ marginLeft: "10px", width: "100px" }}/>
        </>
      )}
      {filterType === "year" && <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} placeholder="Year"/>}

      {filterType === "vehicle" && vehicles.length > 0 && (
        <>
          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.vehi_no} value={v.vehi_no}>{v.vehi_no} - {v.vehi_name}</option>)}
          </select><br /><br />
          <label>Filter By:</label>
          <Select options={subFilterOptions} value={subFilterOptions.find(o => o.value === subFilterType)} onChange={opt => setSubFilterType(opt.value)}/><br />
          {subFilterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd"/>}
        </>
      )}

      {filterType === "driver" && drivers.length > 0 && (
        <>
          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>{d.driver_name}</option>)}
          </select><br /><br />
          <label>Filter By:</label>
          <Select options={subFilterOptions} value={subFilterOptions.find(o => o.value === subFilterType)} onChange={opt => setSubFilterType(opt.value)}/><br />
          {subFilterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd"/>}
        </>
      )}

      <br/>
      <button onClick={handleFetchReport} disabled={loading}>{loading ? "Fetching..." : "Fetch Report"}</button>
      <button onClick={handleExportExcel} style={{ marginLeft: "10px" }}>Export to Excel</button>
      <button onClick={() => window.print()} style={{ marginLeft: "10px" }}>Print Report</button><br /><br />

      <table border="1" width="100%" cellPadding="5" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle No</th>
            <th>Vehicle Name</th>
            <th>Vehicle Type</th>
            <th>Driver Name</th>
            <th>Designation</th>
            <th>Driver Type</th>
            <th>From</th>
            <th>Destination</th>
            <th>Employee Code</th>
            <th>Employee Name</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((r, idx) => (
            <tr key={idx}>
              <td>{r.Ddate}</td>
              <td>{r.vehi_no}</td>
              <td>{r.vehi_name}</td>
              <td>{r.vehi_type}</td>
              <td>{r.driver_name}</td>
              <td>{r.designation}</td>
              <td>{r.driver_type}</td>
              <td>{r.start_from}</td>
              <td>{r.destination}</td>
              <td>{r.emp_code}</td>
              <td>{r.emp_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total Records: {reportData.length}</p>
      <p>Total KM: {totalKM}</p>

      <div>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i+1} onClick={() => setCurrentPage(i+1)} disabled={currentPage === i+1}>{i+1}</button>
        ))}
      </div>
    </div>
  );
};

export default VehicleReport;*/
import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

/**
 * VehicleReport with row-level Update/Delete
 * - Click a row -> modal (update/delete)
 * - Update: choose field -> edit -> send to server -> refresh
 * - Delete: confirm -> send to server -> refresh
 *
 * NOTE: expects each record to include `id` from backend
 */

const VehicleReport = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filterType, setFilterType] = useState("date");
  const [subFilterType, setSubFilterType] = useState("date");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalKM, setTotalKM] = useState(0);
  const [loading, setLoading] = useState(false);

  // modal / update state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateField, setUpdateField] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filterOptions = [
    { value: "date", label: "Date" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "vehicle", label: "Vehicle" },
    { value: "driver", label: "Driver" },
  ];

  const subFilterOptions = [
    { value: "date", label: "Date" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  // allowed update fields for UI (must match backend whitelist)
  const allowedFields = [
    { value: "Ddate", label: "Date", type: "date" },
    { value: "vehi_no", label: "Vehicle No", type: "text" },
    { value: "driver_id", label: "Driver No", type: "text" },
    { value: "start_from", label: "From", type: "text" },
    { value: "destination", label: "Destination", type: "text" },
    { value: "emp_code", label: "Employee Code", type: "text" },
    { value: "for_whom", label: "For Whom", type: "text" },
  ];

  // Fetch vehicles & drivers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehRes, drvRes] = await Promise.all([
          axios.get("http://localhost:5000/api/vehicles"),
          axios.get("http://localhost:5000/api/drivers"),
        ]);
        setVehicles(vehRes.data || []);
        setDrivers(drvRes.data || []);
      } catch (err) {
        console.error("Error fetching vehicles/drivers:", err);
      }
    };
    fetchData();
  }, []);

  const handleFetchReport = async () => {
    try {
      setLoading(true);
      let payload = { filterType };

      if (filterType === "date") payload.value = selectedDate.toISOString().split("T")[0];
      if (filterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
      if (filterType === "year") payload.year = selectedYear;

      if (filterType === "vehicle") {
        payload.value = selectedVehicle;
        payload.subFilterType = subFilterType;
        if (subFilterType === "date") payload.date = selectedDate.toISOString().split("T")[0];
        if (subFilterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
        if (subFilterType === "year") payload.year = selectedYear;
      }

      if (filterType === "driver") {
        payload.value = selectedDriver;
        payload.subFilterType = subFilterType;
        if (subFilterType === "date") payload.date = selectedDate.toISOString().split("T")[0];
        if (subFilterType === "month") { payload.month = selectedMonth; payload.year = selectedYear; }
        if (subFilterType === "year") payload.year = selectedYear;
      }

      const res = await axios.post("http://localhost:5000/api/reports", payload);
      setReportData(res.data || []);
      calculateTotalKM(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalKM = (data) => {
    let totalKM = 0;
    data.forEach(r => { if (r.end_km && r.start_km) totalKM += (r.end_km - r.start_km); });
    setTotalKM(totalKM);
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/reports/export",
        { data: reportData },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Vehicle_Report.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error exporting Excel:", err);
    }
  };

  // pagination helpers
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = reportData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(reportData.length / recordsPerPage);

  // row click -> open modal
  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
    setUpdateField("");
    setUpdateValue("");
  };

  // prepare update data when updateField changes
  useEffect(() => {
    if (!updateField) {
      setUpdateValue("");
      return;
    }
    // prefill updateValue with current record's value for that field
    if (selectedRecord && updateField) {
      const cur = selectedRecord[updateField];
      if (cur === null || cur === undefined) setUpdateValue("");
      else {
        // if date -> to Date object
        const f = allowedFields.find(f => f.value === updateField);
        if (f?.type === "date") {
          // attempt parse
          const dt = new Date(cur);
          if (!isNaN(dt)) setUpdateValue(dt);
          else setUpdateValue(cur);
        } else {
          setUpdateValue(cur);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateField, selectedRecord]);

  // perform update
  const submitUpdate = async () => {
  if (!selectedRecord || !updateField) return alert("Choose a field to update and enter a value.");

  let valueToSend = updateValue;

  // handle date fields
  if (allowedFields.find(f => f.value === updateField)?.type === "date") {
    if (!(updateValue instanceof Date)) return alert("Please select a valid date.");
    valueToSend = updateValue.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  try {
    setUpdateLoading(true);
    const res = await axios.post("http://localhost:5000/api/report/update", {
      Ddate: selectedRecord.Ddate,       // <-- required by backend
      vehi_no: selectedRecord.vehi_no,   // <-- required by backend
      field: updateField,
      newValue: valueToSend
    });

    if (res.data && res.data.success) {
      await handleFetchReport();          // refresh table
      setSelectedRecord(null);
      setShowModal(false);
      setUpdateField("");
      setUpdateValue("");
    } else {
      alert("Update failed.");
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("Update failed. See console.");
  } finally {
    setUpdateLoading(false);
  }
};



  // perform delete
  const submitDelete = async () => {
  if (!selectedRecord) return;
  if (!window.confirm("Are you sure you want to delete this record?")) return;

  try {
    setDeleteLoading(true);
    const res = await axios.post("http://localhost:5000/api/report/delete", {
      Ddate: selectedRecord.Ddate,
      vehi_no: selectedRecord.vehi_no,
    });

    if (res.data && res.data.success) {
      alert("✅ Record deleted successfully!");
      await handleFetchReport(); // refresh report
      setShowModal(false);
      setSelectedRecord(null);
    } else {
      alert("❌ Delete failed. Record may not exist.");
    }
  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("Error deleting record. Check console for details.");
  } finally {
    setDeleteLoading(false);
  }
};
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <h2>📊 Vehicle Report</h2>
      <label>Filter By:</label>
      <Select
        options={filterOptions}
        value={filterOptions.find(o => o.value === filterType)}
        onChange={opt => setFilterType(opt.value)}
      /><br /><br />

      {/* Show relevant filters */}
      {filterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd" />}
      {filterType === "month" && (
        <>
          <select onChange={e => setSelectedMonth(parseInt(e.target.value))} value={selectedMonth}>
            {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} placeholder="Year" style={{ marginLeft: "10px", width: "100px" }}/>
        </>
      )}
      {filterType === "year" && <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} placeholder="Year"/>}

      {filterType === "vehicle" && vehicles.length > 0 && (
        <>
          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="">Select Vehicle</option>
            {vehicles.map(v => <option key={v.vehi_no} value={v.vehi_no}>{v.vehi_no} - {v.vehi_name}</option>)}
          </select><br /><br />
          <label>Filter By:</label>
          <Select options={subFilterOptions} value={subFilterOptions.find(o => o.value === subFilterType)} onChange={opt => setSubFilterType(opt.value)}/><br />
          {subFilterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd"/>}
        </>
      )}

      {filterType === "driver" && drivers.length > 0 && (
        <>
          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
            <option value="">Select Driver</option>
            {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>{d.driver_name}</option>)}
          </select><br /><br />
          <label>Filter By:</label>
          <Select options={subFilterOptions} value={subFilterOptions.find(o => o.value === subFilterType)} onChange={opt => setSubFilterType(opt.value)}/><br />
          {subFilterType === "date" && <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="yyyy-MM-dd"/>}
        </>
      )}

      <br/>
      <button onClick={handleFetchReport} disabled={loading}>{loading ? "Fetching..." : "Fetch Report"}</button>
      <button onClick={handleExportExcel} style={{ marginLeft: "10px" }}>Export to Excel</button>
      <button onClick={() => window.print()} style={{ marginLeft: "10px" }}>Print Report</button><br /><br />

      <table border="1" width="100%" cellPadding="5" style={{ borderCollapse: "collapse", cursor: "pointer" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle No</th>
            <th>Vehicle Name</th>
            <th>Vehicle Type</th>
            <th>Driver No</th>
            <th>Driver Name</th>
            <th>Designation</th>
            <th>Driver Type</th>
            <th>From</th>
            <th>Destination</th>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th> For Whom</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((r, idx) => (
            <tr key={r.id || idx} onClick={() => handleRowClick(r)}>
              <td>{r.Ddate}</td>
              <td>{r.vehi_no}</td>
              <td>{r.vehi_name}</td>
              <td>{r.vehi_type}</td>
              <td>{r.driver_id}</td>
              <td>{r.driver_name}</td>
              <td>{r.designation}</td>
              <td>{r.driver_type}</td>
              <td>{r.start_from}</td>
              <td>{r.destination}</td>
              <td>{r.emp_code}</td>
              <td>{r.emp_name}</td>
              <td>{r.for_whom}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>Total Records: {reportData.length}</p>
      <p>Total KM: {totalKM}</p>

      <div>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i+1} onClick={() => setCurrentPage(i+1)} disabled={currentPage === i+1}>{i+1}</button>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedRecord && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999
        }}>
          <div style={{ width: 700, maxWidth: "95%", background: "#fff", padding: 20, borderRadius: 8 }}>
            <h3>Record Details (id: {selectedRecord.id})</h3>
            <div style={{ maxHeight: 240, overflowY: "auto", border: "1px solid #eee", padding: 10, marginBottom: 10 }}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(selectedRecord, null, 2)}</pre>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <button onClick={() => { setUpdateField(""); setUpdateValue(""); }}>Start Update</button>
              <button onClick={() => {
                // toggle delete confirm area
                if (window.confirm("Delete this record?")) submitDelete();
              }} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</button>
              <button onClick={() => { setShowModal(false); setSelectedRecord(null); }}>Close</button>
            </div>

            <hr />

            {/* Update UI */}
            <div>
              <label style={{ display: "block", marginBottom: 6 }}>Choose field to update:</label>
              <select value={updateField} onChange={e => setUpdateField(e.target.value)}>
                <option value="">-- Select field --</option>
                {allowedFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>

              {updateField && (
                <div style={{ marginTop: 10 }}>
                  <label>New value:</label>
                  {allowedFields.find(f => f.value === updateField)?.type === "date" ? (
                    <DatePicker selected={updateValue instanceof Date ? updateValue : new Date(updateValue || selectedRecord[updateField])} onChange={d => setUpdateValue(d)} dateFormat="yyyy-MM-dd" />
                  ) : (
                    <textarea style={{ width: "100%", minHeight: 80 }} value={updateValue} onChange={e => setUpdateValue(e.target.value)} />
                  )}

                  <div style={{ marginTop: 10 }}>
                    <button onClick={submitUpdate} disabled={updateLoading}>{updateLoading ? "Updating..." : "Update"}</button>
                    <button onClick={() => { setUpdateField(""); setUpdateValue(""); }} style={{ marginLeft: 10 }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleReport;


