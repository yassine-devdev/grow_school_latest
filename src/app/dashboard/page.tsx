// IMPORTANT: This is a Server Component.
// Do not add 'use client' to this file.
// The `process.env.API_KEY` is used here to securely fetch data on the server.
// Converting this to a Client Component would expose the API key to the browser.

import DashboardModule from '@/components/modules/DashboardModule';
import { fetchDashboardStats, fetchEngagementChartData, dbRecentActivity } from '@/lib/data/dashboard';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiInsight } from '../../types';

const API_KEY = process.env.API_KEY;

// Define the expected JSON schema for the AI's response
const insightSchema = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      description: "A list of 3-4 actionable insights based on the data.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "A short, catchy title for the insight." },
          summary: { type: "string", description: "A one-sentence summary explaining the insight." },
          icon: { type: "string", description: "The most relevant Lucide icon name (e.g., 'TrendingDown', 'UserCheck', 'ShoppingCart')." },
          actionText: { type: "string", description: "A short, actionable button label (e.g., 'View Report', 'Contact User')." },
          actionLink: { type: "string", description: "The relevant in-app URL for the action (e.g., '/analytics', '/school-hub?user=xyz')." },
        },
        required: ["title", "summary", "icon", "actionText", "actionLink"]
      }
    }
  },
  required: ["insights"]
};

/**
 * Generates actionable insights by sending recent activity data to the Gemini API.
 * This function is designed to run on the server.
 */
async function getAiInsights(): Promise<AiInsight[]> {
    if (!API_KEY) {
        console.warn("AI insights disabled: API_KEY environment variable not found.");
        return [];
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const activityContext = JSON.stringify(dbRecentActivity, null, 2);

    const prompt = `
        You are a proactive and insightful analyst for the "GROW YouR NEED Saas School" platform.
        Your task is to analyze a JSON object of recent platform activity and generate 3-4 concise, actionable insights for the school administrator.
        For each insight, provide a relevant Lucide icon name and a direct in-app link for the administrator to take action.

        Platform Activity Data:
        ---
        ${activityContext}
        ---

        Instructions:
        1.  Identify the most critical trends, warnings, or opportunities in the data.
        2.  For each, craft a short, descriptive title and a one-sentence summary.
        3.  Choose the most appropriate Lucide icon from react-lucide to visually represent the insight.
        4.  Create a compelling call-to-action button text and the corresponding in-app URL.
        5.  Return the results strictly following the provided JSON schema. Ensure you return a JSON object with an "insights" key containing an array of insight objects.
        
        Return ONLY valid JSON matching this structure:
        ${JSON.stringify(insightSchema, null, 2)}
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();
        
        if (!responseText) {
            console.warn("No response text from AI model");
            return [];
        }
        const parsedJson = JSON.parse(responseText);
        return parsedJson.insights || [];
    } catch (error) {
        console.error("Failed to generate AI insights:", error);
        // In case of an API error, return an empty array to prevent the page from crashing.
        return [];
    }
}

export default async function DashboardPage() {
    // Fetch all necessary data in parallel for performance.
    const [stats, chartData, insights] = await Promise.all([
        fetchDashboardStats(),
        fetchEngagementChartData(),
        getAiInsights()
    ]);
    
    // Pass all fetched and generated data as props to the client component.
    return <DashboardModule 
        initialStats={stats} 
        initialChartData={chartData} 
        initialInsights={insights} 
    />;
}