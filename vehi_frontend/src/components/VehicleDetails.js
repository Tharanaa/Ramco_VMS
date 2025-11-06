/*import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function VehicleDetails() {
  const [vehicles, setVehicles] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Load all vehicle names and numbers
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicledetails")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error loading vehicles", err));
  }, []);

  const handleSearch = () => {
    if (!searchValue) return alert("Select or enter a vehicle");
    axios
      .get(`http://localhost:5000/api/vehicle/${searchValue}`)
      .then((res) => setSelectedVehicle(res.data))
      .catch((err) => {
        console.error(err);
        alert("Vehicle not found");
      });
  };

  const vehicleOptions = vehicles.map((v) => ({
    value: v.Vehicle_No,
    label: `${v.Vehicle_No} - ${v.Vehicle_Name}`,
  }));

  const handleSelect = (option) => {
    if (!option) return;
    axios
      .get(`http://localhost:5000/api/vehicle/${option.value}`)
      .then((res) => setSelectedVehicle(res.data))
      .catch((err) => {
        console.error(err);
        alert("Vehicle not found");
      });
  };

  return (
    <div className="vehicle-page">
      <div className="search-section">
        <h2>🔍 Vehicle Details</h2>
        <div className="search-box">
          <Select
            options={vehicleOptions}
            onChange={handleSelect}
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map((v, i) => (
              <option key={i} value={v.Vehicle_No}>
                {v.Vehicle_No} - {v.Vehicle_Name}
              </option>
            ))}
          </select>
          <button onClick={handleSearch}>OK</button>
        </div>
      </div>

      {selectedVehicle && (
        <div className="vehicle-table">
          <h3>Vehicle Information</h3>
          <table>
            <tbody>
              {Object.entries(selectedVehicle).map(([key, val]) => (
                <tr key={key}>
                  <th>{key.replaceAll("_", " ")}</th>
                  <td>{val ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}*/
/*import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function VehicleDetails() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ✅ Load vehicle data from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicledetails")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error loading vehicles", err));
  }, []);

  // ✅ Dropdown options format for react-select
  const vehicleOptions = vehicles.map((v) => ({
    value: v.Vehicle_No,
    label: `${v.Vehicle_No} - ${v.Vehicle_Name}`,
  }));

  // ✅ Handle dropdown selection
  const handleSelect = (option) => {
    if (!option) return;
    axios
      .get(`http://localhost:5000/api/vehicle/${option.value}`)
      .then((res) => setSelectedVehicle(res.data))
      .catch((err) => {
        console.error(err);
        alert("Vehicle not found");
      });
  };

  return (
    <div className="vehicle-page" style={{ padding: "20px", textAlign: "center" }}>
      <div className="search-section" style={{ marginBottom: "20px" }}>
        <h2>🔍 Vehicle Details</h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
          <div style={{ width: "300px" }}>
            <Select
              options={vehicleOptions}
              onChange={handleSelect}
              isClearable
              isSearchable
              placeholder="Search or select vehicle..."
            />
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="vehicle-table" style={{ marginTop: "30px" }}>
          <h3>Vehicle Information</h3>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "60%",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <tbody>
              {Object.entries(selectedVehicle).map(([key, val]) => (
                <tr key={key}>
                  <th
                    style={{
                      textAlign: "left",
                      background: "#51833fff",
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {key.replaceAll("_", " ")}
                  </th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {val ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function VehicleDetails() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [file, setFile] = useState(null);

  // ✅ Load all vehicles
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicledetails")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error loading vehicles", err));
  }, []);

  const vehicleOptions = vehicles.map((v) => ({
    value: v.Vehicle_No,
    label: `${v.Vehicle_No} - ${v.Vehicle_Name}`,
  }));

  // ✅ Handle dropdown select
  const handleSelect = (option) => {
    if (!option) return;
    axios
      .get(`http://localhost:5000/api/vehicle/${option.value}`)
      .then((res) => setSelectedVehicle(res.data))
      .catch((err) => {
        console.error(err);
        alert("Vehicle not found");
      });
  };

  // ✅ Handle file upload
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedVehicle) return alert("Select a vehicle first!");
    if (!file) return alert("Choose a file to upload!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("vehicleNo", selectedVehicle.Vehicle_No);

    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      // refresh details to show new file path
      handleSelect({ value: selectedVehicle.Vehicle_No });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🚗 Vehicle Details</h2>

      <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
        <div style={{ width: "300px" }}>
          <Select
            options={vehicleOptions}
            onChange={handleSelect}
            isClearable
            placeholder="Search or select vehicle..."
          />
        </div>
      </div>

      {selectedVehicle && (
        <div style={{ marginTop: "30px" }}>
          <h3>Vehicle Information</h3>
          <table
            style={{
              margin: "0 auto",
              borderCollapse: "collapse",
              width: "60%",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <tbody>
              {Object.entries(selectedVehicle).map(([key, val]) => (
                <tr key={key}>
                  <th
                    style={{
                      textAlign: "left",
                      background: "#51833fff",
                      color: "white",
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {key.replaceAll("_", " ")}
                  </th>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {val ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 📎 File Upload Section */}
          <div style={{ marginTop: "30px" }}>
            <h4>📤 Upload Document</h4>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ marginRight: "10px" }}
            />
            <button
              onClick={handleUpload}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Upload
            </button>
          </div>

          {/* 🗑️ Delete Document Section */}
          {selectedVehicle.Document_Path && (
  <div
    style={{
      marginTop: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
    }}
  >
    <h4 style={{ margin: 0 }}>📄 Uploaded Document:</h4>
    <a
      href={`http://localhost:5000${selectedVehicle.Document_Path}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#007bff",
        textDecoration: "none",
        fontWeight: "bold",
      }}
    >
      View / Download File
    </a>

    {/* ❌ Delete button */}
    <button
      onClick={async () => {
        if (window.confirm("Are you sure you want to delete this file?")) {
          try {
            await axios.delete(`http://localhost:5000/api/deleteFile`, {
                params: { vehicleNo: selectedVehicle.Vehicle_No },
              });

            alert("File deleted successfully!");
            handleSelect({ value: selectedVehicle.Vehicle_No }); // refresh
          } catch (err) {
            console.error(err);
            alert("File deletion failed!");
          }
        }
      }}
      style={{
        backgroundColor: "red",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      ×
    </button>
  </div>
)}
        </div>
      )}
    </div>
  );
}




