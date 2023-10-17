import express from "express";
import {
  getLeads,
  getCounselorLeads,
  getLeadData,
  getNewLeads,
  getCounselorNewLeads,
  assignto,
  getFollowUpDetails,
  getTodayLeads,
  getLeadsCount,
  getCounselorLeadsCount,
  getCounselorLeadsCountAll,
  getLeadsCount1,
  getSourceLeadsCountAll,
  getCourseLeadsCountAll,
} from "../controllers/leads.js";

const router = express.Router();

router.get("/dispalyleads", getLeads);
router.post("/dispalyCounselorleads", getCounselorLeads);
router.post("/getLeadData", getLeadData);
router.post("/getNewLeads", getNewLeads);
router.post("/getCounselorNewLeads", getCounselorNewLeads);
router.post("/assignto", assignto);
router.post("/getFollowUpDetails", getFollowUpDetails);
router.post("/getTodayLeads", getTodayLeads);
router.post("/getLeadsCount", getLeadsCount);
router.post("/getCounselorLeadsCount", getCounselorLeadsCount);
router.post("/getCounselorLeadsCountAll", getCounselorLeadsCountAll);
router.get("/getLeadsCount1", getLeadsCount1);
router.post("/getSourceLeadsCountAll", getSourceLeadsCountAll);
router.post("/getCourseLeadsCountAll", getCourseLeadsCountAll);

export default router;
