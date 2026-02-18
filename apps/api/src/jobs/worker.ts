import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { generateNudge } from "../services/nudge-engine.js";
import { scheduleMondayReflections } from "./nudge-scheduler.js";

const nudgeWorker = new Worker(
  "nudge",
  async (job) => {
    switch (job.name) {
      case "weekly-scheduler":
        await scheduleMondayReflections();
        break;
      case "monday-reflection":
        await generateNudge(job.data.userId, "monday");
        break;
      case "pre-meeting":
        await generateNudge(job.data.userId, "pre_meeting", job.data.meetingContext);
        break;
      case "post-meeting":
        await generateNudge(job.data.userId, "post_meeting", job.data.meetingContext);
        break;
      case "contextual":
        await generateNudge(job.data.userId, "contextual");
        break;
      case "meeting-check":
        // TODO Phase 6: integrate calendar APIs for upcoming meeting detection
        break;
      default:
        console.warn(`Unknown job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  { connection },
);

nudgeWorker.on("completed", (job) => {
  console.log(`Job ${job.id} (${job.name}) completed`);
});

nudgeWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} (${job?.name}) failed:`, err);
});

export { nudgeWorker };
