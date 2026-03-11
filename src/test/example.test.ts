import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

const test = async () => {
  const { data, error } = await supabase.from("user_achievements").select("*");

  console.log(data, error);
};

const test = async () => {
  const { data, error } = await supabase.from("user_achievements").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);
};

test();
