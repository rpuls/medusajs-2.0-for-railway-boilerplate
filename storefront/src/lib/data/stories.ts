export type Story = {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  authorAge: number
  city: string
  date: string
  coverImage?: string
  tags: string[]
}

export const stories: Story[] = [
  {
    slug: "lan-dau-nhin-vao-guong",
    title: "Lần đầu tiên nhìn vào gương và thấy chính mình",
    excerpt:
      "Tôi 19 tuổi, sống ở Hà Nội. Năm ngoái là lần đầu tiên tôi mặc binder — và là lần đầu tiên tôi không muốn thoát ra khỏi cơ thể mình.",
    author: "K.",
    authorAge: 19,
    city: "Hà Nội",
    date: "2026-05-10",
    tags: ["binder", "hành trình", "lần đầu"],
    content: `Từ năm 14 tuổi, tôi đã không hiểu tại sao mặc áo lại khó chịu đến vậy. Không phải vì chất liệu. Mà vì hình dáng trong gương không phải tôi.

Tôi tốn hàng năm tìm kiếm từ khóa, đọc bài viết tiếng Anh, rồi mới dám tự nhận mình là transmasculine.

Khi chiếc binder đầu tiên đến, tôi mặc vào và nhìn vào gương. Lần đầu tiên trong 5 năm, tôi thấy một người con trai. Tôi đứng đó khóc một lúc — không phải vì buồn.

Nếu bạn đang ở giai đoạn tôi đã qua, tôi muốn nói: cảm giác đó là thật, bạn là thật, và sẽ có ngày bạn thấy chính mình trong gương.`,
  },
  {
    slug: "chon-size-dung-lan-dau",
    title: "Chọn đúng size ngay lần đầu — tôi đã học được điều này theo cách khó",
    excerpt:
      "Tôi order size S vì nghĩ 'chật hơn = phẳng hơn'. Sai hoàn toàn. Đây là những gì tôi ước mình biết sớm hơn.",
    author: "Minh T.",
    authorAge: 22,
    city: "TP. HCM",
    date: "2026-04-28",
    tags: ["size guide", "binder", "mẹo"],
    content: `Lần đầu tôi mua binder, tôi chọn size S — nhỏ hơn số đo thực tế 2 size. Logic của tôi lúc đó là: chật = phẳng hơn.

Sau 3 tiếng mặc, tôi không thở được bình thường. Sườn đau. Và kết quả nhìn từ ngoài vào còn không phẳng như size đúng.

**Những gì tôi học được:**

Binder hoạt động bằng cách phân phối đều áp lực — không phải bóp chặt. Size đúng mới làm được điều đó.

Cách tôi đo bây giờ: đo vòng ngực ở điểm rộng nhất, thở ra bình thường, không hít vào. Đó là số đo thật của bạn.

Nếu bạn giữa 2 size, lấy size lớn hơn. Bạn có thể mặc cả ngày mà không đau — và hiệu quả không kém gì size nhỏ hơn.

Hãy đọc kỹ hướng dẫn chọn size trên mỗi sản phẩm. Sức khỏe quan trọng hơn 1–2cm.`,
  },
]

export function getStory(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug)
}
