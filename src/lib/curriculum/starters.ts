export type LabId = "scratch" | "python" | "lua";

export const LABS: { id: LabId; req: string; title: string; language: string; industry: string; starter: string; notesPrompt: string }[] = [
  {
    id: "scratch",
    req: "5a",
    title: "Scratch: Cat Catches Fish",
    language: "Scratch (blocks, written as text)",
    industry: "Education & game design",
    starter: `// Sample Scratch project — rebuild these blocks in Scratch, then change them.
// This sample has ONE intentional bug. Can you find it?

when green flag clicked
set [score v] to (0)
go to x: (0) y: (0)
forever
  if <key [right arrow v] pressed?> then
    change x by (10)
  end
  if <key [left arrow v] pressed?> then
    change x by (10)      // <- hmm... does left really go left?
  end
  if <touching [Fish v]?> then
    change [score v] by (1)
    say [Yum!] for (1) seconds
  end
end`,
    notesPrompt: "Debugging notes: What did you expect? What actually happened? What did you change? Did it work?",
  },
  {
    id: "python",
    req: "5b",
    title: "Python: Campout Packing Helper",
    language: "Python 3",
    industry: "Outdoor retail / logistics",
    starter: `# Campout Packing Helper
# Input: the temperature forecast. Decision: what to pack. Output: a packing list.

temperature = int(input("What is the low temperature tonight (F)? "))

packing = ["tent", "water bottle", "flashlight"]

if temperature < 40:
    packing.append("winter sleeping bag")
    packing.append("warm hat")
elif temperature < 60:
    packing.append("fleece jacket")
else:
    packing.append("bug spray")

print("Pack these items:")
for item in packing:
    print("-", item)
`,
    notesPrompt: "Notes: What did you change or add? Any errors you fixed along the way?",
  },
  {
    id: "lua",
    req: "5c",
    title: "Lua: Game Health Meter",
    language: "Lua 5.4",
    industry: "Video game development",
    starter: `-- Game Health Meter
-- Input: damage events. Decision: is the player still alive? Output: status messages.

local health = 100
local hits = {15, 30, 25, 40}

for i, damage in ipairs(hits) do
  health = health - damage
  if health <= 0 then
    print("Hit " .. i .. ": Game over!")
    break
  elseif health < 30 then
    print("Hit " .. i .. ": Low health! " .. health .. " left")
  else
    print("Hit " .. i .. ": Health is " .. health)
  end
end
`,
    notesPrompt: "Notes: What did you change or add? Any errors you fixed along the way?",
  },
];