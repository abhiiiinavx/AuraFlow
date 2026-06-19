import { addDays, formatISO } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "../config/env.js";
import type { TaskPriority } from "../models/Task.js";

export type GeneratedTask = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  category: string;
};

const priorityWords: Record<TaskPriority, string[]> = {
  Low: ["later", "someday", "low", "minor", "optional"],
  Medium: ["plan", "prepare", "follow up", "draft", "review"],
  High: ["urgent", "critical", "today", "blocked", "launch", "deadline", "security"]
};

function inferPriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  if (priorityWords.High.some((word) => lower.includes(word))) return "High";
  if (priorityWords.Low.some((word) => lower.includes(word))) return "Low";
  return "Medium";
}

function fallbackGenerate(prompt: string): GeneratedTask[] {
  const chunks = prompt
    .split(/\n|\.|;/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .slice(0, 8);

  const source = chunks.length ? chunks : [prompt || "Clarify the next task"];

  return source.map((chunk, index) => ({
    title: chunk.length > 80 ? `${chunk.slice(0, 77)}...` : chunk,
    description: `AI-generated from: ${chunk}`,
    priority: inferPriority(chunk),
    dueDate: formatISO(addDays(new Date(), index + 1), { representation: "date" }),
    tags: ["ai", index % 2 === 0 ? "focus" : "planning"],
    category: index % 2 === 0 ? "Execution" : "Planning"
  }));
}

async function openAiJson(prompt: string) {
  const openai = new OpenAI({ apiKey: env.openAiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return compact JSON only. For task generation use {\"tasks\":[{\"title\":\"\",\"description\":\"\",\"priority\":\"Low|Medium|High\",\"dueDate\":\"YYYY-MM-DD\",\"tags\":[\"\"],\"category\":\"\"}]}. For other prompts return keys requested by the user."
      },
      { role: "user", content: prompt }
    ]
  });

  const content = response.choices[0]?.message.content ?? "{}";
  return JSON.parse(content) as Record<string, unknown>;
}

async function geminiJson(prompt: string) {
  const genAI = new GoogleGenerativeAI(env.geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`${prompt}\nReturn JSON only.`);
  const text = result.response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(text) as Record<string, unknown>;
}

async function providerJson(prompt: string) {
  if (env.aiProvider === "openai" && env.openAiKey) return openAiJson(prompt);
  if (env.aiProvider === "gemini" && env.geminiKey) return geminiJson(prompt);
  return {};
}

export async function generateTasksFromText(text: string): Promise<GeneratedTask[]> {
  try {
    const json = await providerJson(
      `Create a prioritized task plan from this text: ${text}. Include title, description, priority, dueDate, tags, category.`
    );
    const tasks = Array.isArray(json.tasks) ? json.tasks : [];
    if (tasks.length) return tasks as GeneratedTask[];
  } catch (error) {
    console.warn("AI provider failed, using fallback task generation.", error);
  }

  return fallbackGenerate(text);
}

export async function detectPriority(text: string) {
  try {
    const json = await providerJson(`Detect the priority for this task as Low, Medium, or High: ${text}`);
    if (json.priority === "Low" || json.priority === "Medium" || json.priority === "High") {
      return json.priority;
    }
  } catch {
    return inferPriority(text);
  }

  return inferPriority(text);
}

export async function suggestSchedule(text: string) {
  const priority = await detectPriority(text);
  const offset = priority === "High" ? 1 : priority === "Medium" ? 3 : 7;
  return {
    dueDate: formatISO(addDays(new Date(), offset), { representation: "date" }),
    reason: `${priority} priority work is scheduled with a ${offset}-day planning window.`
  };
}

export async function recommendNextTask(tasks: Array<{ title: string; priority: TaskPriority; dueDate?: Date }>) {
  const ranked = [...tasks].sort((a, b) => {
    const priorityScore = { High: 3, Medium: 2, Low: 1 };
    const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return Number(a.dueDate ?? new Date("2099-01-01")) - Number(b.dueDate ?? new Date("2099-01-01"));
  });

  const task = ranked[0];
  return {
    title: task?.title ?? "Plan the next focused work block",
    rationale: task ? "Highest priority with the nearest deadline." : "No pending tasks are available."
  };
}

export async function summarizeCompleted(tasks: Array<{ title: string; category: string }>) {
  if (!tasks.length) {
    return "No completed tasks yet. Start with one focused win and build momentum from there.";
  }

  const categories = [...new Set(tasks.map((task) => task.category))].join(", ");
  return `Completed ${tasks.length} tasks across ${categories}. Strongest progress came from closing concrete, trackable work.`;
}
