import { db } from "../../connect.js";
import { promisify } from "util";
import { inputLeadValidation, updateLeadValidation } from "./validator.js";

// get courses
export const getCourses = (req, res) => {
  db.query("SELECT * FROM course ORDER BY id", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get batches
export const getBatches = (req, res) => {
  db.query("SELECT * FROM batch ORDER BY code", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get statuses
export const getStatuses = (req, res) => {
  db.query("SELECT * FROM status ORDER BY id", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get sources
export const getSources = (req, res) => {
  db.query("SELECT * FROM source ORDER BY id", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// fetch all counselors
export const getCounselors = (req, res) => {
  db.query(
    "SELECT * FROM user WHERE roleid = '3' ORDER BY id",
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

// submit lead data
const dbQuery = promisify(db.query).bind(db);

export const addLead = async (req, res) => {
  const leadData = req.body; // Assuming the lead data is sent in the request body

  // Validate leadData using your validation function
  const { error } = inputLeadValidation(leadData);
  if (error) {
    console.log("Error validating data:", error);
    return res
      .status(400)
      .json({ errors: error.details.map((detail) => detail.message) });
  }

  try {
    // Start the database transaction
    await dbQuery("START TRANSACTION");

    // Insert customer data into the 'customer' table
    const customerQuery = `
      INSERT INTO customer (nic, passport, name, email, address, school, gender, dob)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const customerValues = [
      leadData.nic,
      leadData.passport,
      leadData.name,
      leadData.email,
      leadData.address,
      leadData.school,
      leadData.gender,
      leadData.dob,
    ];

    const customerResult = await dbQuery(customerQuery, customerValues);

    // Insert customer_contact data into the 'customer_contact' table
    const customerContactQuery = `
    INSERT INTO customer_contact (contact_no, customerid)
    VALUES (?, ?)
`;

    const contactNumbers = [leadData.contact1, leadData.contact2];
    const customerId = customerResult.insertId;

    for (const contactNumber of contactNumbers) {
      if (contactNumber !== null) {
        // Check for null value
        const customerContactValues = [contactNumber, customerId];
        await dbQuery(customerContactQuery, customerContactValues);
      }
    }

    // Insert lead data into the 'leads' table
    const leadsQuery = `
      INSERT INTO leads (scheduled_at, scheduled_to, customerid, course_id, sourceid, userid, batchcode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const leadsValues = [
      leadData.scheduled_at,
      leadData.scheduledto,
      customerResult.insertId,
      leadData.course,
      leadData.source,
      leadData.assignto,
      leadData.batch,
    ];

    const leadsResult = await dbQuery(leadsQuery, leadsValues);

    // Insert follow_up data into the 'follow_up' table
    const followUpQuery = `
      INSERT INTO follow_up (leadid, statusid, date, comment, duration)
      VALUES (?, ?, ?, ?, ?)
    `;
    const followUpValues = [
      leadsResult.insertId,
      leadData.status,
      leadData.date,
      leadData.comment,
      leadData.duration,
    ];

    await dbQuery(followUpQuery, followUpValues);

    // Commit the transaction
    await dbQuery("COMMIT");

    // Transaction completed successfully, send response
    res.status(200).json({ message: "Lead data inserted successfully" });
  } catch (err) {
    // If any error occurs, rollback the transaction
    await dbQuery("ROLLBACK");

    console.log("Error inserting data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// insert imported lead data
export const addImportedLead = async (req, res) => {
  const leadDetailsArray = req.body; // Assuming an array of lead details is sent in the request body

  try {
    // Start the database transaction
    await dbQuery("START TRANSACTION");

    for (const leadDetails of leadDetailsArray) {
      const customerQuery = `
        INSERT INTO customer (name, email, address)
        VALUES (?, ?, ?)
      `;
      const customerValues = [
        leadDetails.name,
        leadDetails.email,
        leadDetails.address,
      ];

      const customerResult = await dbQuery(customerQuery, customerValues);

      // Insert customer_contact details into the 'customer_contact' table
      const customerContactQuery = `
        INSERT INTO customer_contact (contact_no, customerid)
        VALUES (?, ?)
      `;

      const contactNumbers = [leadDetails.mobile1, leadDetails.mobile2];
      const customerId = customerResult.insertId;

      for (const contactNumber of contactNumbers) {
        if (contactNumber !== null) {
          const customerContactValues = [contactNumber, customerId];
          await dbQuery(customerContactQuery, customerContactValues);
        }
      }

      const leadsQuery = `
        INSERT INTO leads (customerid, course_id, sourceid, userid)
        VALUES (?, ?, ?, ?)
      `;
      const leadsValues = [
        customerId,
        leadDetails.course,
        leadDetails.source,
        leadDetails.assignto,
      ];

      const leadsResult = await dbQuery(leadsQuery, leadsValues);

      const followUpQuery = `
        INSERT INTO follow_up (leadid, statusid, date, comment)
        VALUES (?, ?, ?, ?)
      `;
      const followUpValues = [
        leadsResult.insertId,
        leadDetails.status,
        leadDetails.date,
        leadDetails.comment,
      ];

      await dbQuery(followUpQuery, followUpValues);
    }

    // Commit the transaction
    await dbQuery("COMMIT");

    // Transaction completed successfully, send response
    res.status(200).json({ message: "Lead data inserted successfully" });
  } catch (err) {
    // If any error occurs, rollback the transaction
    await dbQuery("ROLLBACK");

    console.log("Error inserting data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// update lead data
export const updateLead = async (req, res) => {
  const { leadId } = req.body;
  const { processedInputs } = req.body;

  const { error } = updateLeadValidation(processedInputs);
  if (error) {
    console.log("Error validating data:", error);
    return res
      .status(400)
      .json({ errors: error.details.map((detail) => detail.message) });
  }

  try {
    // Start the database transaction
    await dbQuery("START TRANSACTION");

    // Update customer data in the 'customer' table
    const customerUpdateQuery = `
      UPDATE customer
      SET nic = ?, passport = ?, name = ?, email = ?, address = ?, school = ?, gender = ?, dob = ?
      WHERE id = (SELECT customerid FROM leads WHERE id = ?)
    `;
    const customerUpdateValues = [
      processedInputs.nic,
      processedInputs.passport,
      processedInputs.name,
      processedInputs.email,
      processedInputs.address,
      processedInputs.school,
      processedInputs.gender,
      processedInputs.dob,
      leadId,
    ];

    console.log(customerUpdateValues);

    const customerResul = await dbQuery(
      customerUpdateQuery,
      customerUpdateValues
    );

    // Update customer_contact data in the 'customer_contact' table
    const customerContactDeleteQuery = `
      DELETE FROM customer_contact
      WHERE customerid = (SELECT customerid FROM leads WHERE id = ?)
    `;

    await dbQuery(customerContactDeleteQuery, [leadId]);

    // Insert customer_contact data into the 'customer_contact' table

    const customerContactInsertQuery = `
    INSERT INTO customer_contact (contact_no, customerid)
    VALUES (?, ?)
`;

    const contactNumbers = [processedInputs.mobile1, processedInputs.mobile2];

    for (const contactNumber of contactNumbers) {
      if (contactNumber !== null) {
        const customerContactValues = [contactNumber, leadId];
        await dbQuery(customerContactInsertQuery, customerContactValues);
      }
    }

    // Update lead data in the 'leads' table
    const leadsUpdateQuery = `
      UPDATE leads
      SET scheduled_to = ?, course_id = ?, sourceid = ?, userid = ?, batchcode = ?
      WHERE id = ?
    `;
    const leadsUpdateValues = [
      processedInputs.scheduled_to,
      processedInputs.course_id,
      processedInputs.source_id,
      processedInputs.userid,
      processedInputs.batch_id,
      leadId,
    ];

    await dbQuery(leadsUpdateQuery, leadsUpdateValues);

    // Insert follow_up data into the 'follow_up' table
    const followUpInsertQuery = `
      INSERT INTO follow_up (leadid, statusid, date, comment)
      VALUES (?, ?, ?, ?)
    `;

    const followUpInsertValues = [
      leadId,
      processedInputs.fstatus,
      processedInputs.fdate,
      processedInputs.fcomment,
    ];

    if (processedInputs.fstatus) {
      await dbQuery(followUpInsertQuery, followUpInsertValues);
    }

    // Commit the transaction
    await dbQuery("COMMIT");

    // Transaction completed successfully, send response
    res.status(200).json({ message: "Lead data updated successfully" });
  } catch (err) {
    // If any error occurs, rollback the transaction
    await dbQuery("ROLLBACK");

    console.log("Error updating data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers = (req, res) => {
  db.query(
    "SELECT user.*, role.name as roleName FROM user INNER JOIN role ON user.roleid = role.id ORDER BY id;",
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

export const getRoles = (req, res) => {
  db.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

export const getReports = (req, res) => {
  db.query("SELECT * FROM reports", (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// fetch particular user
export const getUser = (req, res) => {
  const { userID } = req.body;
  db.query("SELECT * FROM user WHERE id = ?", [userID], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// update roster data in user table of a particular user
export const updateUser = (req, res) => {
  const { userID } = req.body;
  const { selectedDays, selectedHalfDay } = req.body;
  db.query(
    "UPDATE user SET full_days = ? , half_day = ? WHERE id = ?",
    [selectedDays, selectedHalfDay, userID],
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

// get courses
export const getSelectedCourse = (req, res) => {
  const { id } = req.body;
  db.query("SELECT * FROM course where id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get batches
export const getSelectedBatch = (req, res) => {
  const { codeId } = req.body;
  db.query("SELECT * FROM batch where code = ?", [codeId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get statuses
export const getSelectedStatus = (req, res) => {
  const { id } = req.body;
  db.query("SELECT * FROM status where id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// get sources
export const getSelectedSource = (req, res) => {
  const { id } = req.body;
  db.query("SELECT * FROM source where id = ? ", [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to fetch data from database" });
      return;
    }
    res.json(results);
  });
};

// add new course to the course table
export const addCourse = (req, res) => {
  const { name, description } = req.body;
  db.query(
    "INSERT INTO course (name, description) VALUES (?, ?)",
    [name, description],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Failed to insert data" });
        return;
      }
      res.json(results);
    }
  );
};

// update course data in course table
export const updateCourse = (req, res) => {
  const { id, name, description } = req.body;
  db.query(
    "UPDATE course SET name = ?, description = ? WHERE id = ?",
    [name, description, id],
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

// add new source to the source table
export const addSource = (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO source (name ) VALUES (?)", [name], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to insert data" });
      return;
    }
    res.json(results);
  });
};

// update source data in source table
export const updateSource = (req, res) => {
  const { id, name } = req.body;
  db.query(
    "UPDATE source SET name = ? WHERE id = ?",
    [name, id],
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

// add new status to the status table
export const addStatus = (req, res) => {
  const { name } = req.body;
  db.query("INSERT INTO status (name ) VALUES (?)", [name], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Failed to insert data" });
      return;
    }
    res.json(results);
  });
};

// update status data in status table
export const updateStatus = (req, res) => {
  const { id, name } = req.body;
  db.query(
    "UPDATE status SET name = ? WHERE id = ?",
    [name, id],
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

// add new batch to the batch table
export const addBatch = (req, res) => {
  const {
    code,
    description,
    orientation_date,
    commencement_date,
    fee,
    course,
  } = req.body;
  db.query(
    "INSERT INTO batch (code, description, orientation_date, commencement_date, fee, course_id) VALUES (?, ? , ? , ? , ? , ?)",
    [code, description, orientation_date, commencement_date, fee, course],
    (err, results) => {
      if (err) {
        console.error("Error executing query:", err.message);
        res.status(500).json({ error: "Failed to insert data" });
        return;
      }
      res.json(results);
    }
  );
};

// update batch data in batch table
export const updateBatch = (req, res) => {
  const {
    code,
    description,
    orientation_date,
    commencement_date,
    fee,
    course,
  } = req.body;
  db.query(
    "UPDATE batch SET description = ?, orientation_date = ?, commencement_date = ?, fee = ?, course_id = ? WHERE code = ?",
    [description, orientation_date, commencement_date, fee, course, code],
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
