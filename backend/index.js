// backend/index.js
const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");

const app = express();
const PORT = 5000;

// JSON middleware (allows sending/receiving JSON)
app.use(cors());
app.use(express.json());

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  req.user = data.user;
  next();
};

app.post("/api/jobs", authenticateUser, async (req, res) => {
  const { title } = req.body;
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("jobs")
    .insert([{ title, user_id }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }

  res.json({ message: "Job saved for this user" });
});

app.get("/api/jobs", authenticateUser, async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }

  res.json(data);
});


app.delete("/api/jobs/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Delete failed" });
  }

  res.json({ message: "Deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

app.put("/api/jobs/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .eq("user_id", req.user.id);
  
  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Update failed" });
  }
  
  res.json({ message: "Updated successfully" });
});