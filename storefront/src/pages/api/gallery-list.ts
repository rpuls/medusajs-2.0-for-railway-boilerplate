import { readdirSync } from "fs"
import { join } from "path"
import type { NextApiRequest, NextApiResponse } from "next"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const dir = join(process.cwd(), "public/gallery")
  const files = readdirSync(dir).filter((file) =>
    /\.(jpe?g|png|webp)$/i.test(file)
  )
  res.status(200).json(files)
}
