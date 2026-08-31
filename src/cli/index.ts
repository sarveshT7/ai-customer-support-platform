import readLine from "node:readline/promises";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { Command } from "@langchain/langgraph";
import { parentGraph } from "../graphs/parent/graph.js";
import { ParentState } from "../graphs/parent/state.js";
import { fileIngestionService } from "../ingestion/index.js";
dotenv.config();

type ParentGraphResult = (typeof ParentState.State) & {
  __interrupt__?: unknown[];
};

export const cliFunction = async () => {
  const args = process.argv.slice(2);

  if (args[0] === "ingest") {
    const filePath = args[1];

    if (!filePath) {
      console.error("Usage: npm run dev -- ingest <file-path>");
      return;
    }

    console.log(`📄 Ingesting: ${filePath}`);

    const result = await fileIngestionService.ingestFile({
      filePath,
      source: filePath,
      sourceType: "markdown",
      mimeType: "text/markdown",
    });

    console.log(
      `✅ Ingested document "${result.document.title}" with ${result.chunks.length} chunks.`,
    );

    return;
  }

  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("🤖 TechStore AI Support");
  console.log("Type 'exit' to quit.\n");
  const config = {
    configurable: {
      thread_id: "customer-1",
    },
  }

  while (true) {
    const question = await rl.question("You: ");
    if (question.toLowerCase() === "exit") {
      break;
    }
    let result: ParentGraphResult;
    try {
      result = await parentGraph.invoke({
        messages: [
          new HumanMessage(question)
        ],
      },
        config
      );

      // Check if the graph is interrupted
      if (result.__interrupt__) {
        console.log('Interrupted:', result.__interrupt__[0]);
        const approval = await rl.question("(y/n): ");
        result = await parentGraph.invoke(
          new Command({
            resume: approval
          }),
          config
        )

      }
    } catch (error) {
      console.error("Error handling request:", error);
      console.log(
        "\nAI: Sorry, I'm having trouble reaching the AI service right now. Please try again in a moment."
      );
      continue;
    }
    const lastMessage: BaseMessage | undefined = result.messages.at(-1);

    console.log("\nAI:", lastMessage?.content);
  }

  rl.close();

  console.log("👋 Goodbye!");
}
