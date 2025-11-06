import React, { useState } from 'react';
import axios from 'axios';

const MailAutomation = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState("");

  const handleAutomationToggle = async () => {
  try {
    if (!isEnabled) {
      // Only send start request if automation is not already enabled
      await axios.post("http://localhost:5000/api/start-mail-automation");
      setStatus("✅ Mail automation started successfully!");
      setIsEnabled(true);
    } else {
      await axios.post("http://localhost:5000/api/stop-mail-automation");
      setStatus("❌ Mail automation stopped.");
      setIsEnabled(false);
    }
  } catch (error) {
    console.error("Error starting mail automation:", error);
    if (error.response?.status === 400) {
      setStatus("⚠️ Mail automation is already running.");
    } else {
      setStatus("⚠️ Failed to update mail automation status.");
    }
  }
};


  return (
    <div style={{
      margin: "40px auto",
      width: "60%",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      padding: "30px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      textAlign: "center"
    }}>
      <h2 style={{ color: "#333" }}>Vehicle Report Mail Automation</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Automatically send vehicle data reports to the GM’s email every 1 hour.
      </p>

      <button
        onClick={handleAutomationToggle}
        style={{
          backgroundColor: isEnabled ? "#e74c3c" : "#2ecc71",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "12px 25px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        {isEnabled ? "Stop Automation" : "Start Automation"}
      </button>

      <p style={{ marginTop: "20px", color: "#444" }}>{status}</p>
    </div>
  );
};

export default MailAutomation;
