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
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  
    // Listen for auth changes (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
  
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Signup successful, Check your email.");
    }
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Login successful");
      checkUser();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setJobs([]);
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setErrorMsg("");
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const response = await fetch("http://localhost:5000/api/jobs", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to fetch jobs");
  
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleAddJob = async () => {
    if (!jobTitle) return;
  
    try {
      setLoading(true);
      setErrorMsg("");
      setMessage("");
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: jobTitle,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to add job");
  
      setMessage("Job added successfully");
      setJobTitle("");
      fetchJobs();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (jobId) => {
    try {
      setLoadingDelete(true);
      setErrorMsg("");
      setMessage("");
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
  
      if (!response.ok) throw new Error("Failed to delete job");
  
      setMessage("Job deleted successfully");
      fetchJobs();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setLoadingUpdate(true);
      setErrorMsg("");
      setMessage("");
  
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update status");
  
      setMessage("Status updated");
      fetchJobs();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingUpdate(false);
    }
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

      {message && (
        <div className="success-message">{message}</div>
      )}

      {errorMsg && (
        <div className="error-message">{errorMsg}</div>
      )}

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
          disabled={loading}
          style={{ marginLeft: "10px" }}
        >
          {loading ? "Adding..." : "Add Job"}
        </button>
      </div>
  
      <h3>Your Jobs</h3>
      {loadingJobs && <p>Loading jobs...</p>}
      {jobs.length === 0 && !loadingJobs && (
        <p>No jobs added yet.</p>
      )}
  
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
              disabled={loadingUpdate}
              style={{ marginRight: "10px" }}
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
            </select>
  
            <button
              className="danger"
              onClick={() => handleDelete(job.id)}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Deleting..." : "Delete"}
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
