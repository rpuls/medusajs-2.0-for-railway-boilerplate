import { Module } from "@medusajs/framework/utils"
import StorySubmissionService from "./service"

export const STORY_SUBMISSION_MODULE = "storySubmission"

export default Module(STORY_SUBMISSION_MODULE, {
  service: StorySubmissionService,
})
