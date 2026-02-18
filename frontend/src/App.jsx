import "./App.css";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Signup successful 🎉");
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else {
      alert("Login successful ✅");
      checkUser();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setJobs([]);
  };

  const fetchJobs = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/jobs/${userId}`
      );
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Fetch jobs error:", error);
    }
  };

  const handleAddJob = async () => {
    if (!jobTitle) return;
  
    await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: jobTitle,
        user_id: user.id,
      }),
    });
  
    setJobTitle("");
    fetchJobs(user.id);
  };

  const handleDelete = async (jobId) => {
    await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
      method: "DELETE",
    });
  
    fetchJobs(user.id);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  
    fetchJobs(user.id);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter =
      filter === "All" || job.status === filter;
  
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase());
  
    return matchesFilter && matchesSearch;
  });
  
  const appliedCount = jobs.filter(
    (job) => job.status === "Applied"
  ).length;
  
  const interviewCount = jobs.filter(
    (job) => job.status === "Interview"
  ).length;
  
  const rejectedCount = jobs.filter(
    (job) => job.status === "Rejected"
  ).length;

  useEffect(() => {
    if (user) {
      fetchJobs(user.id);
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: "50px" }}>
        <h1>Job Tracker Auth</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={signUp}>Sign Up</button>
        <button onClick={login} style={{ marginLeft: "10px" }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Welcome {user.email}</h2>

      {/* 1 STATS SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <strong>Total:</strong> {jobs.length} |{" "}
        <span style={{ color: "#3730a3" }}>
          Applied: {appliedCount}
        </span>{" "}
        |{" "}
        <span style={{ color: "#92400e" }}>
          Interview: {interviewCount}
        </span>{" "}
        |{" "}
        <span style={{ color: "#991b1b" }}>
          Rejected: {rejectedCount}
        </span>
      </div>

      {/* 2  FILTER + SEARCH SECTION — ADD IT RIGHT HERE */}
      <div style={{ marginBottom: "20px" }}>
        <button
          className={filter === "All" ? "primary" : "secondary"}
          onClick={() => setFilter("All")}
          style={{ marginRight: "8px" }}
        >
          All
        </button>

        <button
          className={filter === "Applied" ? "primary" : "secondary"}
          onClick={() => setFilter("Applied")}
          style={{ marginRight: "8px" }}
        >
          Applied
        </button>

        <button
          className={filter === "Interview" ? "primary" : "secondary"}
          onClick={() => setFilter("Interview")}
          style={{ marginRight: "8px" }}
        >
          Interview
        </button>

        <button
          className={filter === "Rejected" ? "primary" : "secondary"}
          onClick={() => setFilter("Rejected")}
        >
          Rejected
        </button>

        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: "20px", width: "200px" }}
        />
      </div>

      {/* 3 JOB INPUT SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
        <button
          className="primary"
          onClick={handleAddJob}
          style={{ marginLeft: "10px" }}
        >
          Add Job
        </button>
      </div>
  
      <h3>Your Jobs</h3>
  
      {jobs.length === 0 && <p>No jobs added yet.</p>}
  
      {filteredJobs.map((job) => (
        <div key={job.id} className="job-item">
          <div>
            {job.title}
            <span className={`status ${job.status}`}>
              {job.status}
            </span>
          </div>
  
          <div>
            <select
              value={job.status}
              onChange={(e) =>
                handleStatusChange(job.id, e.target.value)
              }
              style={{ marginRight: "10px" }}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
            </select>
  
            <button
              className="danger"
              onClick={() => handleDelete(job.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
  
      <br />
      <button className="secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default App;
