import { model } from "@medusajs/framework/utils"

const StorySubmission = model.define("story_submission", {
  id:        model.id().primaryKey(),
  name:      model.text(),
  age:       model.number().nullable(),
  city:      model.text().nullable(),
  content:   model.text(),
  email:     model.text().nullable(),
  anonymous: model.boolean().default(true),
  status:    model.text().default("pending"),
})

export default StorySubmission
