import { MedusaService } from "@medusajs/framework/utils"
import StorySubmission from "./models/story-submission"

class StorySubmissionService extends MedusaService({
  StorySubmission,
}) {}

export default StorySubmissionService
