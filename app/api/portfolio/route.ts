import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "portfolio.json");

export async function GET() {
  try {
    const fileData = await fs.readFile(dataFilePath, "utf-8");
    const json = JSON.parse(fileData);
    return NextResponse.json(json);
  } catch (err) {
    console.error("Error reading portfolio data:", err);
    return NextResponse.json({ error: "Failed to load portfolio data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const updatedData = await request.json();
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "Portfolio data saved successfully!" });
  } catch (err) {
    console.error("Error saving portfolio data:", err);
    return NextResponse.json({ error: "Failed to save portfolio data" }, { status: 500 });
  }
}
