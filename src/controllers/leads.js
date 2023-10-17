import { db } from "../../connect.js";

export const getLeads = (req, res) => {
  db.query("select * from leads_details;", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from the database" });
      return;
    }
    res.json(results);
  });
};

export const getNewLeads = (req, res) => {
  db.query(
    `select * from leads_details where status_name = "New";`,
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getLeadData = (req, res) => {
  const { leadId } = req.body;

  db.query(
    "select * from leads_details where lead_id = ?;",
    [leadId],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getCounselorLeads = (req, res) => {
  const { id } = req.body;
  db.query(
    "select * from leads_details where userid = ?;",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Failed to fetch data from database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getCounselorNewLeads = (req, res) => {
  const { id } = req.body;
  db.query(
    `select * from leads_details where userid = ? and status_name = "New";`,
    [id],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Failed to fetch data from database" });
        return;
      }
      res.json(results);
    }
  );
};

export const assignto = (req, res) => {
  const { selectedRows, selectedCounselorId } = req.body;
  db.query(
    "UPDATE leads SET userid = ? WHERE id IN (?);",
    [selectedCounselorId, selectedRows],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Failed to update data" });
        return;
      }
      res.json(results);
    }
  );
};

// get follow up details of a lead from follow_up table
export const getFollowUpDetails = (req, res) => {
  const { leadId } = req.body;

  db.query(
    "select * from follow_up where leadid = ?;",
    [leadId],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

// get today leads
export const getTodayLeads = (req, res) => {
  const currentDate = new Date().toISOString().split("T")[0];

  db.query(
    `SELECT * FROM leads_details WHERE DATE(scheduled_to) = ? && userid = ?;`,
    [currentDate, req.body.id],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

// dashboard leads count from status_leads view
export const getLeadsCount = (req, res) => {
  const startDate = req.body.stDate;
  const endDate = req.body.edDate;

  db.query(
    `SELECT
      status.id AS status_id,
      status.name AS status_name,
      COUNT(leads_details.lead_id) AS number_of_leads,
      COUNT(leads_details.lead_id) * 100.0 / total.total_leads AS percentage
    FROM leads_details
    LEFT JOIN status ON leads_details.statusid = status.id
    CROSS JOIN (
      SELECT COUNT(*) AS total_leads
      FROM leads_details
      WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
    ) AS total
    WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
    GROUP BY status.id, status.name, total.total_leads;
    `,
    [startDate, endDate, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getLeadsCount1 = (req, res) => {
  const startDate = req.body.stDate;
  const endDate = req.body.edDate;

  db.query(
    `SELECT * from status_leads;
    `,
    [startDate, endDate, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

// dashboard leads count from status_leads view for a particular counselor
export const getCounselorLeadsCount = (req, res) => {
  const { userId } = req.body;
  db.query(
    `SELECT * FROM counselor_status_leads WHERE counselor_id = ?; `,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getCounselorLeadsCountAll = (req, res) => {
  const startDate = req.body.stDate;
  const endDate = req.body.edDate;

  db.query(
    `SELECT
      status.id AS status_id,
      status.name AS status_name,
      COUNT(leads_details.lead_id) AS number_of_leads,
      COUNT(leads_details.lead_id) * 100.0 / total.total_leads AS percentage,
      leads_details.userid AS counselor_id,
      leads_details.username AS counselor_name
    FROM leads_details
    LEFT JOIN status ON leads_details.statusid = status.id
    JOIN (
        SELECT userid, COUNT(lead_id) AS total_leads
        FROM leads_details
        GROUP BY userid
    ) AS total ON leads_details.userid = total.userid
    WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
    GROUP BY status.id, status.name, total.total_leads, leads_details.userid; `,
    [startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getSourceLeadsCountAll = (req, res) => {
  const startDate = req.body.stDate;
  const endDate = req.body.edDate;

  db.query(
    ` SELECT
        source.id AS source_id,
        source.name AS source_name,
        COUNT(leads_details.lead_id) AS number_of_leads,
        COUNT(leads_details.lead_id) * 100.0 / total.total_leads AS percentage,
        SUM(CASE WHEN leads_details.status_name = 'Registered' THEN 1 ELSE 0 END) AS registered_leads
      FROM leads_details
      LEFT JOIN source ON leads_details.source_id = source.id
      CROSS JOIN (
        SELECT COUNT(*) AS total_leads 
        FROM leads_details 
        WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
      ) AS total
      WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
      GROUP BY source.id, source.name, total.total_leads;`,
    [startDate, endDate, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};

export const getCourseLeadsCountAll = (req, res) => {
  const startDate = req.body.stDate;
  const endDate = req.body.edDate;

  db.query(
    ` SELECT
      user.name AS counselor_name,
      course.id AS course_id,
      course.name AS course_name,
      COUNT(leads_details.lead_id) AS number_of_leads,
      COUNT(leads_details.lead_id) * 100.0 / total.total_leads AS percentage,
      SUM(CASE WHEN leads_details.status_name = 'Registered' THEN 1 ELSE 0 END) AS registered_leads
    FROM leads_details
    LEFT JOIN user ON leads_details.userid = user.id
    LEFT JOIN course ON leads_details.course_id = course.id
    CROSS JOIN (
        SELECT COUNT(*) AS total_leads 
        FROM leads_details 
        WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
    ) AS total
    WHERE leads_details.newest_date > ? AND leads_details.newest_date < ?
    GROUP BY user.name, course.id, course.name, total.total_leads;`,
    [startDate, endDate, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch data from the database" });
        return;
      }
      res.json(results);
    }
  );
};
