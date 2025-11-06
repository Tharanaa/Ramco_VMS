
import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const VehicleForm = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [employees, setEmployees] = useState([]);
  //const [employee_Options, setEmployeeOptions] = useState([]);
  const [records, setRecords] = useState([]);

  const [form, setForm] = useState({
    Ddate: new Date(),
    vehi_no: "",
    vehi_name: "",
    vehi_type: "",
    driver_id: "",
    driver_name: "",
    designation: "",
    driver_type: "",
    start_from: "R R Nagar",
    destination: "",
    start_km: "",
    start_time: "",
    end_km: "",
    end_time: "",
    slipreq: "No",
    slip_given: "",
    vehi_status: "Live",
    emp_code: "",
    emp_name: "",
    pos_title:"",
    for_whom:"",
  });

  // ---------------- FETCH INITIAL DATA ----------------
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/vehicles")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/drivers")
      .then((res) => setDrivers(res.data))
      .catch((err) => console.error(err));

    axios
      .get("http://localhost:5000/api/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
      /*axios.get("http://localhost:5000/api/employees")
    .then((res) => {
      setEmployees(res.data);

      const formattedOptions = res.data.map((emp) => ({
        value: emp.emp_code,
        label: `${emp.emp_code} - ${emp.emp_name} - ${emp.pos_title || ""}`,
        emp_name: emp.emp_name,
        pos_title: emp.pos_title,
      }));
      
      setEmployees(formattedOptions);
    })
    .catch((err) => console.error("Error fetching employees:", err));*/
     
}, []);

  // ---------------- AUTO UPDATE VEHICLE STATUS ----------------
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      vehi_status: !prev.end_km || prev.end_km === "" ? "Live" : "End",
    }));
  }, [form.end_km]);

  // ---------------- HANDLE VEHICLE SELECTION ----------------
  const handleVehicleSelect = (selectedOption) => {
    if (selectedOption) {
      const selected = vehicles.find(
        (v) => v.vehi_no === selectedOption.value
      );
      setForm({
        ...form,
        vehi_no: selected.vehi_no,
        vehi_name: selected.vehi_name,
        vehi_type: selected.vehi_type,
      });
    } else {
      setForm({ ...form, vehi_no: "", vehi_name: "", vehi_type: "" });
    }
  };

  // ---------------- HANDLE DRIVER SELECTION ----------------
  const handleDriverSelect = (selectedOption) => {
    if (selectedOption) {
      const selected = drivers.find(
        (d) => d.driver_id === selectedOption.value
      );
      setForm({
        ...form,
        driver_id: selected.driver_id,
        driver_name: selected.driver_name,
        designation: selected.designation,
        driver_type: selected.driver_type,
      });
    } else {
      setForm({
        ...form,
        driver_id: "",
        driver_name: "",
        designation: "",
        driver_type: "",
      });
    }
  };

  // ---------------- HANDLE EMPLOYEE SELECTION ----------------
  
  const handleEmployeeSelect = (selectedOption) => {
    if (selectedOption) {
      // find the selected employee object from the list
      const selectedEmp = employees.find(
        (emp) => emp.emp_code === selectedOption.value
      );

      setForm({
        ...form,
        emp_code: selectedEmp.emp_code,
        emp_name: selectedEmp.emp_name,
        pos_title: selectedEmp.pos_title || "", // ✅ auto-fill pos_title
      });
    } else {
      // clear fields when deselected
      setForm({
        ...form,
        emp_code: "",
        emp_name: "",
        pos_title: "",
      });
    }
  };
/*const handleEmployeeSelect = (selectedOption) => {
  if (selectedOption) {
    setForm({
      ...form,
      emp_code: selectedOption.value,
      emp_name: selectedOption.emp_name,
      pos_title: selectedOption.pos_title || "",
    });
  } else {
    setForm({
      ...form,
      emp_code: "",
      emp_name: "",
      pos_title: "",
    });
  }
};*/

/*const customFilter = (option, inputValue) => {
  if (!option || !option.data) return false;

  const searchText = (inputValue || "").toLowerCase();

  const code = (option.data.value || "").toLowerCase();
  const name = (option.data.emp_name || "").toLowerCase();
  const title = (option.data.pos_title || "").toLowerCase();

  return (
    code.includes(searchText) ||
    name.includes(searchText) ||
    title.includes(searchText)
  );
};*/




  // ---------------- FRONTEND VALIDATION ----------------
  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    const kmRegex = /^[0-9]+$/;

    if (!form.Ddate || !form.vehi_no || !form.vehi_name || !form.driver_id) {
      alert("❌ Please fill all required fields (Date, Vehicle, Driver)");
      return false;
    }

    if (!form.start_from || !form.destination) {
      alert("❌ Start From and Destination cannot be empty.");
      return false;
    }

    if (!nameRegex.test(form.start_from) || !nameRegex.test(form.destination)) {
      alert("❌ Start From and Destination must contain only letters.");
      return false;
    }

    if (!form.start_km || !kmRegex.test(form.start_km)) {
      alert("❌ Start KM must be numeric.");
      return false;
    }

    if (form.end_km && !kmRegex.test(form.end_km)) {
      alert("❌ End KM must be numeric if provided.");
      return false;
    }

    if (form.end_km && parseInt(form.end_km) < parseInt(form.start_km)) {
      alert("❌ End KM must be greater than Start KM.");
      return false;
    }

    if (!form.start_time || !timeRegex.test(form.start_time)) {
      alert("❌ Start Time must be in HH:MM AM/PM format.");
      return false;
    }

    if (form.end_time && !timeRegex.test(form.end_time)) {
      alert("❌ End Time must be in HH:MM AM/PM format.");
      return false;
    }

    return true;
  };

  // ---------------- SUBMIT FORM ----------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = { ...form, Ddate: form.Ddate.toISOString().split("T")[0] };

    axios
      .post("http://localhost:5000/api/vehicle/add", payload)
      .then((res) => {
        alert("✅ " + res.data);
        setRecords([...records, { ...payload }]);
        setForm({
          Ddate: new Date(),
          vehi_no: "",
          vehi_name: "",
          vehi_type: "",
          driver_id: "",
          driver_name: "",
          designation: "",
          driver_type: "",
          start_from: "R R Nagar",
          destination: "",
          start_km: "",
          start_time: "",
          end_km: "",
          end_time: "",
          slipreq: "No",
          slip_given: "",
          vehi_status: "Live",
          emp_code: "",
          emp_name: "",
          pos_title:"",
          for_whom:"",
        });
      })
      .catch((err) => {
        alert("❌ Failed to insert: " + (err.response?.data || err.message));
        console.error(err);
      });
  };

  // ---------------- OPTIONS FOR SELECT FIELDS ----------------
  const vehicleOptions = vehicles.map((v) => ({
    value: v.vehi_no,
    label: `${v.vehi_no} - ${v.vehi_name}`,
  }));

  const driverOptions = drivers.map((d) => ({
    value: d.driver_id,
    label: `${d.driver_id} - ${d.driver_name}`,
  }));

  const employeeOptions = employees.map((emp) => ({
    value: emp.emp_code,
    label: `${emp.emp_code} - ${emp.emp_name} - ${emp.pos_title || ""}`,
  }));

  // ---------------- FORM UI ----------------
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>🚗 Vehicle Management System</h2>
      <form onSubmit={handleSubmit}>
        <label>Date:</label>
        <br />
        <DatePicker
          selected={form.Ddate}
          onChange={(date) => setForm({ ...form, Ddate: date })}
          dateFormat="yyyy-MM-dd"
        />
        <br />
        <br />

        <label>Vehicle:</label>
        <br />
        <Select
          options={vehicleOptions}
          onChange={handleVehicleSelect}
          isClearable
          placeholder="Search Vehicle by No or Name..."
          value={
            form.vehi_no
              ? {
                  value: form.vehi_no,
                  label: `${form.vehi_no} - ${form.vehi_name}`,
                }
              : null
          }
        />
        <br />

        <label>Vehicle Name:</label>
        <br />
        <input type="text" value={form.vehi_name} readOnly />
        <br />
        <br />

        <label>Vehicle Type:</label>
        <br />
        <input type="text" value={form.vehi_type} readOnly />
        <br />
        <br />

        <label>Driver:</label>
        <br />
        <Select
          options={driverOptions}
          onChange={handleDriverSelect}
          isClearable
          placeholder="Search Driver by ID or Name..."
          value={
            form.driver_id
              ? {
                  value: form.driver_id,
                  label: `${form.driver_id} - ${form.driver_name}`,
                }
              : null
          }
        />
        <br />

        <label>Designation:</label>
        <br />
        <input type="text" value={form.designation} readOnly />
        <br />
        <br />

        <label>Driver Type:</label>
        <br />
        <input type="text" value={form.driver_type} readOnly />
        <br />
        <br />

        
       
        <br />
          <label>Requested by:</label> 
          <br /> 
          <Select 
          options={employeeOptions} 
          onChange={handleEmployeeSelect} 
          isClearable 
          placeholder="Search Employee by Code or Name..." 
          value={ 
          form.emp_code 
          ? { 
          value: form.emp_code, 
          label: `${form.emp_code} - ${form.emp_name} - ${form.pos_title}`, 
          } 
          : null 
          } 
          /> 
          <br /> 
          <br />


    


        <label>For Whom:</label><br />

<select
  value={form.for_whom_option || ""}
  onChange={(e) => {
    const selected = e.target.value;
    setForm({
      ...form,
      for_whom_option: selected,
      for_whom: selected === "Self" ? "Self" : "",
    });
  }}
>
  <option value="">-- Select Option --</option>
  <option value="Self">Self</option>
  <option value="Others">Others</option>
</select>
<br /><br />

{form.for_whom_option === "Others" && (
  <>
    <label>Enter Name:</label><br />
    <input
      type="text"
      value={form.for_whom}
      placeholder="Enter name"
      onChange={(e) => {
        const value = e.target.value;
        const nameRegex = /^[A-Za-z\s]*$/;
        if (!nameRegex.test(value)) {
          alert("❌ Only letters and spaces are allowed in name");
          return;
        }
        setForm({ ...form, for_whom: value });
      }}
    />
    <br /><br />
  </>
)}


        <label>Start From:</label><br />
            <input
            type="text"
            value={form.start_from}
            onChange={(e) => {
                const value = e.target.value;
                const nameRegex = /^[A-Za-z\s]*$/; // allows only letters & spaces
                if (!nameRegex.test(value)) {
                alert("❌ Only letters and spaces are allowed in Start From");
                return; // stop invalid input
                }
                setForm({ ...form, start_from: value });
            }}
            /><br /><br />

            <label>Destination:</label><br />
            <input
            type="text"
            value={form.destination}
            onChange={(e) => {
                const value = e.target.value;
                const nameRegex = /^[A-Za-z\s]*$/; // allows only letters & spaces
                if (!nameRegex.test(value)) {
                alert("❌ Only letters and spaces are allowed in Destination");
                return;
                }
                setForm({ ...form, destination: value });
            }}
            /><br /><br />


        <label>Start KM:</label>
        <br />
        <input
          type="number"
          value={form.start_km}
          onChange={(e) =>
            setForm({ ...form, start_km: e.target.value })
          }
        />
        <br />
        <br />

        <label>Start Time:</label>
        <br />
        <input
          type="text"
          placeholder="e.g. 10:30 AM"
          value={form.start_time}
          onChange={(e) =>
            setForm({ ...form, start_time: e.target.value })
          }
        />
        <br />
        <br />

        <label>End KM:</label>
        <br />
        <input
          type="number"
          value={form.end_km}
          onChange={(e) =>
            setForm({ ...form, end_km: e.target.value })
          }
        />
        <br />
        <br />

        <label>End Time:</label>
        <br />
        <input
          type="text"
          placeholder="e.g. 01:45 PM"
          value={form.end_time}
          onChange={(e) =>
            setForm({ ...form, end_time: e.target.value })
          }
        />
        <br />
        <br />

        <label>Slip Request:</label>
        <br />
        <select
          value={form.slipreq}
          onChange={(e) => setForm({ ...form, slipreq: e.target.value })}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <br />
        <br />

        <label>Slip Given:</label><br />
        <select
        value={form.slip_given}
        onChange={e => setForm({ ...form, slip_given: e.target.value })}
        >
        <option value="">-- Select Option --</option>
        <option value="Before Trip">Before Trip</option>
        <option value="After Trip">After Trip</option>
        </select><br /><br />

        <label>Vehicle Status:</label>
        <br />
        <input type="text" value={form.vehi_status} readOnly />
        <br />
        <br />

        <button type="submit">Add Vehicle Record</button>
      </form>
    </div>
  );
};

export default VehicleForm;


