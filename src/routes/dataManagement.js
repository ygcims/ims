import express from "express";
import {
  getCourses,
  getBatches,
  getStatuses,
  getSources,
  getCounselors,
  addLead,
  updateLead,
  addImportedLead,
  getUsers,
  getRoles,
  getReports,
  getUser,
  updateUser,
  getSelectedCourse,
  getSelectedBatch,
  getSelectedStatus,
  getSelectedSource,
  addCourse,
  updateCourse,
  addSource,
  updateSource,
  addStatus,
  updateStatus,
  addBatch,
  updateBatch,
} from "../controllers/dataManagement.js";

const router = express.Router();

router.get("/courses", getCourses);
router.get("/batches", getBatches);
router.get("/statuses", getStatuses);
router.get("/sources", getSources);
router.get("/counselors", getCounselors);
router.post("/addLead", addLead);
router.post("/updateLead", updateLead);
router.post("/addImportedLead", addImportedLead);
router.get("/getUsers", getUsers);
router.get("/getRoles", getRoles);
router.get("/getReports", getReports);
router.post("/getUser", getUser);
router.post("/updateUser", updateUser);
router.post("/getSelectedCourse", getSelectedCourse);
router.post("/getSelectedBatch", getSelectedBatch);
router.post("/getSelectedStatus", getSelectedStatus);
router.post("/getSelectedSource", getSelectedSource);
router.post("/addCourse", addCourse);
router.post("/updateCourse", updateCourse);
router.post("/addSource", addSource);
router.post("/updateSource", updateSource);
router.post("/addStatus", addStatus);
router.post("/updateStatus", updateStatus);
router.post("/addBatch", addBatch);
router.post("/updateBatch", updateBatch);

export default router;
