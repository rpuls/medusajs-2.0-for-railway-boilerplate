import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { STORY_SUBMISSION_MODULE } from "../../../modules/story-submission"
import StorySubmissionService from "../../../modules/story-submission/service"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { name, age, city, content, email, anonymous } = req.body as any

  if (!content || content.trim().length < 50) {
    res.status(400).json({ error: "Câu chuyện phải có ít nhất 50 ký tự." })
    return
  }

  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: "Vui lòng nhập tên (có thể dùng tên giả)." })
    return
  }

  const storyService: StorySubmissionService = req.scope.resolve(STORY_SUBMISSION_MODULE)

  const submission = await storyService.createStorySubmissions({
    name:      name.trim(),
    age:       age ? parseInt(age) : null,
    city:      city?.trim() || null,
    content:   content.trim(),
    email:     email?.trim() || null,
    anonymous: anonymous !== false,
    status:    "pending",
  })

  res.status(201).json({ id: submission.id, message: "Cảm ơn bạn đã chia sẻ câu chuyện!" })
}
