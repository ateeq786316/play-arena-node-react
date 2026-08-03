import fs from "node:fs";
const raw = fs.readFileSync("playarena-backend/.env", "utf8");
const line0 = raw.split("\n").find((l) => l.startsWith("DATABASE_URL="));
console.log("found line:", !!line0, "len:", line0?.length);
console.log("end chars:", JSON.stringify(line0?.slice(-10)));
const m = line0.trim().replace(/\r$/, "").match(/^([A-Za-z0-9_]+)="?(.*?)"?$/);
console.log("match?", !!m);
console.log("key:", m?.[1], "val:", m?.[2]?.slice(0, 50));
