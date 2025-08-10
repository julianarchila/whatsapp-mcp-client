import { db } from "./db";
import { tool } from "@/server/db/schema/tool";
import { nanoid } from "nanoid";
import { fromPromise } from "neverthrow";

const Tools = [
    {
        id: nanoid(),
        name: "GitHub",
        apiUrl: "https://api.githubcopilot.com/mcp/",
        description: "Version control and collaboration platform for developers.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "OpenWeather",
        apiUrl: "https://api.openweathermap.org/data/2.5/",
        description: "Weather data and forecasts for any location.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Figma",
        apiUrl: "https://api.figma.com/",
        description: "Design and collaboration platform for teams.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Linear",
        apiUrl: "https://api.linear.app",
        description: "Issue tracking and project management for development teams.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Trello",
        apiUrl: "https://api.trello.com",
        description: "Visual project management with boards, lists, and cards.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Discord",
        apiUrl: "https://discord.com/api",
        description: "Voice, video, and text communication for communities.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Zoom",
        apiUrl: "https://api.zoom.us/v2",
        description: "Online meeting and video conferencing platform.",
        createdBy: "system",
    },
    {
        id: nanoid(),
        name: "Adobe Creative Suite",
        apiUrl: "https://adobe.com",
        description: "Professional creative tools for design and content creation.",
        createdBy: "system",
    },
];

async function seedTools() {
    const result = await fromPromise(
        db.insert(tool).values(Tools),
        (e) => e as Error
    );

    result.match(
        () => {
            console.log("✅ Test Tools inserted successfully");
            process.exit(0);
        },
        (error) => {
            console.error("❌ Error inserting Tools:", error.message);
            process.exit(1);
        }
    );
}

seedTools();
