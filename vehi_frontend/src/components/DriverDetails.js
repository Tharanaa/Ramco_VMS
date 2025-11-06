import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

export default function DriverDetails() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [files, setFiles] = useState({ doc1: null, doc2: null });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/drivers")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const driverOptions = drivers.map((d) => ({
    value: d.driver_id,
    label: `${d.driver_id} - ${d.driver_name}`,
  }));

  const handleSelect = (option) => {
    if (!option) return;
    axios
      .get(`http://localhost:5000/api/driver/${option.value}`)
      .then((res) => setSelectedDriver(res.data))
      .catch((err) => {
        console.error(err);
        alert("Driver not found");
      });
  };

  const handleUpload = async (docType) => {
    if (!selectedDriver) return alert("Select a driver first!");
    const file =
      docType === "Document_Path1" ? files.doc1 : files.doc2;
    if (!file) return alert("Choose a file to upload!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("driverId", selectedDriver.driver_id);
    formData.append("docType", docType);

    try {
      await axios.post("http://localhost:5000/api/driver/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      handleSelect({ value: selectedDriver.driver_id }); // refresh data
      setFiles({ doc1: null, doc2: null });
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>🧑‍✈️ Driver Details</h2>

      <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
        <div style={{ width: "300px" }}>
          <Select
            options={driverOptions}
            onChange={handleSelect}
            isClearable
            placeholder="Search or select driver..."
          />
        </div>
      </div>

      {selectedDriver && (
        <div style={{ marginTop: "30px" }}>
          <h3>Driver Information</h3>
          <table style={{ margin: "0 auto", borderCollapse: "collapse", width: "60%" }}>
            <tbody>
              {Object.entries(selectedDriver).map(([key, val]) => (
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

          {/* Upload Section for Document 1 */}
          <div style={{ marginTop: "30px" }}>
            <h4>📤 Upload Driver License</h4>
            <input
              type="file"
              onChange={(e) => setFiles({ ...files, doc1: e.target.files[0] })}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ marginRight: "10px" }}
            />
            <button
              onClick={() => handleUpload("Document_Path1")}
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

          {/* Upload Section for Document 2 */}
          <div style={{ marginTop: "20px" }}>
            <h4>📤 Upload Disciplinary action notice</h4>
            <input
              type="file"
              onChange={(e) => setFiles({ ...files, doc2: e.target.files[0] })}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ marginRight: "10px" }}
            />
            <button
              onClick={() => handleUpload("Document_Path2")}
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

          {/* View/Delete Section */}
          {selectedDriver.Document_Path1 && (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <h4 style={{ margin: 0 }}>📄 Document 1:</h4>
              <a
                href={`http://localhost:5000${selectedDriver.Document_Path1}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View / Download
              </a>
              <button
                onClick={async () => {
                  if (window.confirm("Delete Document 1?")) {
                    await axios.delete("http://localhost:5000/api/driver/deleteFile", {
                      params: {
                        driverId: selectedDriver.driver_id,
                        doc: "Document_Path1",
                      },
                    });
                    handleSelect({ value: selectedDriver.driver_id });
                  }
                }}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                }}
              >
                ×
              </button>
            </div>
          )}

          {selectedDriver.Document_Path2 && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <h4 style={{ margin: 0 }}>📄 Document 2:</h4>
              <a
                href={`http://localhost:5000${selectedDriver.Document_Path2}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View / Download
              </a>
              <button
                onClick={async () => {
                  if (window.confirm("Delete Document 2?")) {
                    await axios.delete("http://localhost:5000/api/driver/deleteFile", {
                      params: {
                        driverId: selectedDriver.driver_id,
                        doc: "Document_Path2",
                      },
                    });
                    handleSelect({ value: selectedDriver.driver_id });
                  }
                }}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
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
