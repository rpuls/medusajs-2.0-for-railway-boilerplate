import { escapeForLike, tokenize } from "../tokenize"

describe("tokenize", () => {
  it("lowercases and splits on whitespace", () => {
    expect(tokenize("Staple BLACK")).toEqual(["staple", "black"])
  })

  it("collapses runs of whitespace", () => {
    expect(tokenize("  staple    black   ")).toEqual(["staple", "black"])
  })

  it("returns an empty array for an empty or whitespace-only string", () => {
    expect(tokenize("")).toEqual([])
    expect(tokenize("   ")).toEqual([])
  })

  it("preserves hyphens and digits so SKU fragments survive", () => {
    expect(tokenize("3008-BLACK 12")).toEqual(["3008-black", "12"])
  })

  it("preserves slashes so 'L/s' style tokens survive", () => {
    expect(tokenize("Youth L/s")).toEqual(["youth", "l/s"])
  })
})

describe("escapeForLike", () => {
  it("escapes backslash, percent, and underscore", () => {
    expect(escapeForLike("a\\b")).toBe("a\\\\b")
    expect(escapeForLike("100%")).toBe("100\\%")
    expect(escapeForLike("a_b")).toBe("a\\_b")
  })

  it("escapes backslash before percent/underscore so the order can't cascade", () => {
    // \% would otherwise look like an already-escaped %.
    expect(escapeForLike("\\%")).toBe("\\\\\\%")
  })

  it("leaves ordinary characters unchanged", () => {
    expect(escapeForLike("staple black 8")).toBe("staple black 8")
  })
})
