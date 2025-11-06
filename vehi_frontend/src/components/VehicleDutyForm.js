/*import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './VehicleDutyForm.css';

const VehicleDutyForm = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    Ddate: new Date(),
    vehi_num: "",
    vehi_names: "",
    General: "",
    second_shift: "",
    third_shift: "",
    Remark: "",
  });

  // ✅ Fetch vehicles
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehi-duty")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  // ✅ Handle vehicle dropdown
  const handleVehicleChange = (option) => {
    setSelectedVehicle(option);
    const vehicle = vehicles.find((v) => v.vehi_num === option.value);
    if (vehicle) {
      setForm({
        ...form,
        vehi_num: vehicle.vehi_num,
        vehi_names: vehicle.vehi_names,
        General: vehicle.General || "",
      });
    }
  };

  // ✅ Handle text input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Submit form data
  const handleSubmit = async () => {
    if (!form.vehi_num) return alert("Please select a vehicle first!");

    const payload = { ...form, Ddate: form.Ddate.toISOString().split("T")[0] };

    try {
      const res = await axios.post("http://localhost:5000/api/vehicle-duty", payload);
      alert("✅ " + res.data.message);
      setRecords([...records, payload]);
      setForm({
        Ddate: new Date(),
        vehi_num: "",
        vehi_names: "",
        General: "",
        second_shift: "",
        third_shift: "",
        Remark: "",
      });
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Failed to save data");
    }
  };

  // ✅ Send Mail
  const handleSendMail = async () => {
    const dateStr = form.Ddate.toISOString().split("T")[0];
    try {
      const res = await axios.post("http://localhost:5000/api/send-duty-mail", {
        Ddate: dateStr,
      });
      alert("📧 " + res.data.message);
    } catch (err) {
      console.error("Error sending mail:", err);
      alert("❌ Failed to send mail. Check server logs.");
    }
  };

  // ✅ Dropdown options
  const options =
    vehicles?.length > 0
      ? vehicles.map((v) => ({
          value: v.vehi_num,
          label: `${v.vehi_num} - ${v.vehi_names}`,
        }))
      : [];
  
  const customFilter = (option, inputValue) => {
    const text = inputValue.toLowerCase();
    return (
      option.data.value.toLowerCase().includes(text) ||
      option.data.label.toLowerCase().includes(text)
    );
  };

 
return (
  <div className="page-container">
    <div className="vehicle-duty-card">
      <h2>🚗 Vehicle Assigning Form</h2>

      <label>Date:</label>
      <DatePicker
        selected={form.Ddate}
        onChange={(date) => setForm({ ...form, Ddate: date })}
        dateFormat="yyyy-MM-dd"
      />

      <label>Vehicle:</label>
      <Select
        options={options}
        onChange={handleVehicleChange}
        value={selectedVehicle}
        placeholder="Search Vehicle by No or Name..."
        isSearchable
        filterOption={customFilter}
      />

      <label>Vehicle Name:</label>
      <input
        type="text"
        name="vehi_names"
        value={form.vehi_names}
        onChange={handleInputChange}
      />

      <label>General shift drivers:</label>
      <input
        type="text"
        name="General"
        value={form.General}
        onChange={handleInputChange}
      />

      <label>Second Shift drivers:</label>
      <input
        type="text"
        name="second_shift"
        value={form.second_shift}
        onChange={handleInputChange}
      />

      <label>Third Shift drivers:</label>
      <input
        type="text"
        name="third_shift"
        value={form.third_shift}
        onChange={handleInputChange}
      />

      <label>Remark:</label>
      <input
        type="text"
        name="Remark"
        value={form.Remark}
        onChange={handleInputChange}
      />

      <div className="vehicle-duty-buttons">
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleSendMail}>Send Mail</button>
      </div>
    </div>
  </div>
);
};

export default VehicleDutyForm;*/
/*import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./VehicleDutyForm.css";

const VehicleDutyForm = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    Ddate: new Date(),
    vehi_num: "",
    vehi_names: "",
    General: "",
    second_shift: "",
    third_shift: "",
    weekly_off: "",
    on_duty: "",
    on_leave: "",
    Remark: "",
  });

  // ✅ Fetch vehicle list
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehi-duty")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  // ✅ Handle vehicle selection
  const handleVehicleChange = (option) => {
    setSelectedVehicle(option);
    const vehicle = vehicles.find((v) => v.vehi_num === option.value);
    if (vehicle) {
      setForm({
        ...form,
        vehi_num: vehicle.vehi_num,
        vehi_names: vehicle.vehi_names,
        General: vehicle.General || "",
      });
    }
  };

  // ✅ Handle input text
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Handle dropdown changes
  const handleSelectChange = (name, option) => {
    setForm({ ...form, [name]: option ? option.value : "" });
  };

  // ✅ Submit form
  const handleSubmit = async () => {
    if (!form.vehi_num) return alert("Please select a vehicle first!");

    const payload = { ...form, Ddate: form.Ddate.toISOString().split("T")[0] };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/vehicle-duty",
        payload
      );
      alert("✅ " + res.data.message);
      setRecords([...records, payload]);
      setForm({
        Ddate: new Date(),
        vehi_num: "",
        vehi_names: "",
        General: "",
        second_shift: "",
        third_shift: "",
        weekly_off: "",
        on_duty: "",
        on_leave: "",
        Remark: "",
      });
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Failed to save data");
    }
  };

  // ✅ Send mail
  const handleSendMail = async () => {
    const dateStr = form.Ddate.toISOString().split("T")[0];
    try {
      const res = await axios.post("http://localhost:5000/api/send-duty-mail", {
        Ddate: dateStr,
      });
      alert("📧 " + res.data.message);
    } catch (err) {
      console.error("Error sending mail:", err);
      alert("❌ Failed to send mail");
    }
  };

  // ✅ Dropdown options
  const vehicleOptions =
    vehicles?.length > 0
      ? vehicles.map((v) => ({
          value: v.vehi_num,
          label: `${v.vehi_num} - ${v.vehi_names}`,
        }))
      : [];

  // ✅ Extract driver list from General (simulate)
  const driverOptions = vehicles.map((v) => ({
    value: v.General,
    label: v.General,
  }));

  const customFilter = (option, inputValue) => {
    const text = inputValue.toLowerCase();
    return (
      option.data.value?.toLowerCase().includes(text) ||
      option.data.label?.toLowerCase().includes(text)
    );
  };

  return (
    <div className="page-container">
      <div className="vehicle-duty-card">
        <h2>🚗 Vehicle Assigning Form</h2>

        <label>Date:</label>
        <DatePicker
          selected={form.Ddate}
          onChange={(date) => setForm({ ...form, Ddate: date })}
          dateFormat="yyyy-MM-dd"
        />

        <label>Vehicle:</label>
        <Select
          options={vehicleOptions}
          onChange={handleVehicleChange}
          value={selectedVehicle}
          placeholder="Search Vehicle by No or Name..."
          isSearchable
          filterOption={customFilter}
        />

        <label>Vehicle Name:</label>
        <input
          type="text"
          name="vehi_names"
          value={form.vehi_names}
          onChange={handleInputChange}
        />

        <label>General shift drivers:</label>
        <input
          type="text"
          name="General"
          value={form.General}
          onChange={handleInputChange}
        />

        <label>Second Shift drivers:</label>
        <input
          type="text"
          name="second_shift"
          value={form.second_shift}
          onChange={handleInputChange}
        />

        <label>Third Shift drivers:</label>
        <input
          type="text"
          name="third_shift"
          value={form.third_shift}
          onChange={handleInputChange}
        />

        <label>Weekly Off:</label>
        <Select
          options={driverOptions}
          onChange={(option) => handleSelectChange("weekly_off", option)}
          value={
            form.weekly_off
              ? { value: form.weekly_off, label: form.weekly_off }
              : null
          }
          placeholder="Search or select driver..."
          isSearchable
          filterOption={customFilter}
        />

        <label>On Duty:</label>
        <Select
          options={driverOptions}
          onChange={(option) => handleSelectChange("on_duty", option)}
          value={
            form.on_duty ? { value: form.on_duty, label: form.on_duty } : null
          }
          placeholder="Search or select driver..."
          isSearchable
          filterOption={customFilter}
        />

        <label>On Leave:</label>
        <Select
          options={driverOptions}
          onChange={(option) => handleSelectChange("on_leave", option)}
          value={
            form.on_leave ? { value: form.on_leave, label: form.on_leave } : null
          }
          placeholder="Search or select driver..."
          isSearchable
          filterOption={customFilter}
        />

        <label>Remark:</label>
        <input
          type="text"
          name="Remark"
          value={form.Remark}
          onChange={handleInputChange}
        />

        <div className="vehicle-duty-buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={handleSendMail}>Send Mail</button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDutyForm;*/
import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './VehicleDutyForm.css';

const VehicleDutyForm = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState([]);
  const [records, setRecords] = useState([]);
  const [generalNames, setGeneralNames] = useState([]); // For driver name options
  const [driverOptions, setDriverOptions] = useState([]);

  const [form, setForm] = useState({
    Ddate: new Date(),
    vehi_num: "",
    vehi_names: "",
    General: "",
    second_shift: "",
    third_shift: "",
    twelve_sp1: [],
    twelve_sp2: [],
    Remark: "",
    weekly_off: [],
    on_duty: [],
    on_leave: []
  });

  // ✅ Fetch vehicles
  /*useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehi-duty")
      .then((res) => {
        setVehicles(res.data);
        // Prepare general driver options from all vehicles' General fields
        const names = [];
        res.data.forEach(v => {
          if (v.General) {
            const parts = v.General.split(",").map(name => name.trim());
            parts.forEach(p => {
              if (p && !names.includes(p)) names.push(p);
            });
          }
        });
        setGeneralNames(names.map(n => ({ value: n, label: n })));
      })
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);*/
  useEffect(() => {
  axios
    .get("http://localhost:5000/api/vehi-duty")
    .then((res) => {
      setVehicles(res.data);

      // ✅ Collect unique driver names from all 3 columns
      const names = new Set();
      res.data.forEach(v => {
        ["General", "second_shift", "third_shift"].forEach(col => {
          if (v[col]) {
            v[col].split(",").map(n => n.trim()).forEach(name => {
              if (name) names.add(name);
            });
          }
        });
      });

      // Convert to react-select format
      setDriverOptions([...names].map(n => ({ value: n, label: n })));

      // Prepare General shift names for Weekly Off/Duty/Leave dropdowns
      const allNames = [...names].map(n => ({ value: n, label: n }));
      setGeneralNames(allNames);
    })
    .catch((err) => console.error("Error fetching vehicles:", err));
}, []);


  
  const handleVehicleChange = (option) => {
  setSelectedVehicle(option);

  // If user cleared the selection
  if (!option) {
    setForm({
      ...form,
      vehi_num: "",
      vehi_names: "",
      General: "",
    });
    return; // exit early
  }

  // Otherwise, proceed as normal
  const vehicle = vehicles.find((v) => v.vehi_num === option.value);
  if (vehicle) {
    setForm({
      ...form,
      vehi_num: vehicle.vehi_num,
      vehi_names: vehicle.vehi_names,
      General: vehicle.General || "",
    });
  }
};


  // ✅ Handle text input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Handle multi-select changes
  const handleMultiSelectChange = (field, selectedOptions) => {
    setForm({
      ...form,
      [field]: selectedOptions ? selectedOptions.map(opt => opt.value) : []
    });
  };

  // ✅ Submit form data
  const handleSubmit = async () => {
    if (!form.vehi_num) return alert("Please select a vehicle first!");

    const payload = {
      ...form,
      Ddate: form.Ddate.toISOString().split("T")[0],
      weekly_off: form.weekly_off.join(", "),
      on_duty: form.on_duty.join(", "),
      on_leave: form.on_leave.join(", "),
      twelve_sp1: form.twelve_sp1.join(", "),
      twelve_sp2: form.twelve_sp2.join(", ")
    };

    try {
      const res = await axios.post("http://localhost:5000/api/vehicle-duty", payload);
      alert("✅ " + res.data.message);
      setRecords([...records, payload]);
      setForm({
        Ddate: new Date(),
        vehi_num: "",
        vehi_names: "",
        General: "",
        second_shift: "",
        third_shift: "",
        twelve_sp1: [],
        twelve_sp2: [],
        Remark: "",
        weekly_off: [],
        on_duty: [],
        on_leave: []
      });
      setSelectedVehicle(null);
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Failed to save data");
    }
  };

  // ✅ Send Mail
  const handleSendMail = async () => {
    const dateStr = form.Ddate.toISOString().split("T")[0];
    try {
      const res = await axios.post("http://localhost:5000/api/send-duty-mail", {
        Ddate: dateStr,
      });
      alert("📧 " + res.data.message);
    } catch (err) {
      console.error("Error sending mail:", err);
      alert("❌ Failed to send mail. Check server logs.");
    }
  };

  // ✅ Dropdown options
  const options =
    vehicles?.length > 0
      ? vehicles.map((v) => ({
          value: v.vehi_num,
          label: `${v.vehi_num} - ${v.vehi_names}`,
        }))
      : [];

  const customFilter = (option, inputValue) => {
    const text = inputValue.toLowerCase();
    return (
      option.data.value.toLowerCase().includes(text) ||
      option.data.label.toLowerCase().includes(text)
    );
  };

  return (
    <div className="page-container">
      <div className="vehicle-duty-card">
        <h2>🚗 Vehicle Assigning Form</h2>

        <label>Date:</label>
        <DatePicker
          selected={form.Ddate}
          onChange={(date) => setForm({ ...form, Ddate: date })}
          dateFormat="yyyy-MM-dd"
        />

        <label>Vehicle:</label>
        <Select
          options={options}
          onChange={handleVehicleChange}
          value={selectedVehicle}
          placeholder="Search Vehicle by No or Name..."
          isSearchable
          filterOption={customFilter}
          isClearable
        />

        <label>Vehicle Name:</label>
        <input
          type="text"
          name="vehi_names"
          value={form.vehi_names}
          onChange={handleInputChange}
        />

        {/* <label>General shift drivers:</label>
        <input
          type="text"
          name="General"
          value={form.General}
          onChange={handleInputChange}
        />

        <label>Second Shift drivers:</label>
        <input
          type="text"
          name="second_shift"
          value={form.second_shift}
          onChange={handleInputChange}
        />

        <label>Third Shift drivers:</label>
        <input
          type="text"
          name="third_shift"
          value={form.third_shift}
          onChange={handleInputChange}
        />*/}
        <label>General Shift Driver:</label>
        <Select
          options={driverOptions}
          value={form.General ? { value: form.General, label: form.General } : null}
          onChange={(selected) =>
            setForm({ ...form, General: selected ? selected.value : "" })
          }
          placeholder="Select General shift driver..."
          isSearchable
          isClearable
        />

        <label>Second Shift Driver:</label>
        <Select
          options={driverOptions}
          value={form.second_shift ? { value: form.second_shift, label: form.second_shift } : null}
          onChange={(selected) =>
            setForm({ ...form, second_shift: selected ? selected.value : "" })
          }
          placeholder="Select Second shift driver..."
          isSearchable
          isClearable
        />

        <label>Third Shift Driver:</label>
        <Select
          options={driverOptions}
          value={form.third_shift ? { value: form.third_shift, label: form.third_shift } : null}
          onChange={(selected) =>
            setForm({ ...form, third_shift: selected ? selected.value : "" })
          }
          placeholder="Select Third shift driver..."
          isSearchable
          isClearable
        />

        <label>7am-7pm shift drivers</label>
        <Select
          options={driverOptions}
          isMulti
          value={form.twelve_sp1.map(v => ({ value: v, label: v }))}
          onChange={selected => handleMultiSelectChange("twelve_sp1", selected)}
          placeholder="Select 12th SP1 staff..."
          isSearchable
        />

        <label>7pm-7am shift drivers</label>
        <Select
          options={driverOptions}
          isMulti
          value={form.twelve_sp2.map(v => ({ value: v, label: v }))}
          onChange={selected => handleMultiSelectChange("twelve_sp2", selected)}
          placeholder="Select 12th SP2 staff..."
          isSearchable
        />

        <label>Remark:</label>
        <input
          type="text"
          name="Remark"
          value={form.Remark}
          onChange={handleInputChange}
        />

        <hr style={{ margin: "20px 0" }} />

        <h3>👥 Daily Staff Status</h3>

        <label>Weekly Off:</label>
        <Select
          isMulti
          options={generalNames}
          value={form.weekly_off.map(v => ({ value: v, label: v }))}
          onChange={(selected) => handleMultiSelectChange("weekly_off", selected)}
          placeholder="Select Weekly Off staff..."
          isSearchable
        />

        <label>On Duty:</label>
        <Select
          isMulti
          options={generalNames}
          value={form.on_duty.map(v => ({ value: v, label: v }))}
          onChange={(selected) => handleMultiSelectChange("on_duty", selected)}
          placeholder="Select On Duty staff..."
          isSearchable
        />

        <label>On Leave:</label>
        <Select
          isMulti
          options={generalNames}
          value={form.on_leave.map(v => ({ value: v, label: v }))}
          onChange={(selected) => handleMultiSelectChange("on_leave", selected)}
          placeholder="Select On Leave staff..."
          isSearchable
        />

        <div className="vehicle-duty-buttons">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={handleSendMail}>Send Mail</button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDutyForm;



