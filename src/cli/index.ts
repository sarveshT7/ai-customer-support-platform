import readLine from "node:readline/promises";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { Command } from "@langchain/langgraph";
import { parentGraph } from "../graphs/parent/graph.js";
import { fileIngestionService } from "../ingestion/index.js";
dotenv.config();

export const cliFunction = async () => {
  // console.log(process.env.LANGSMITH_TRACING);
  // console.log(process.env.LANGSMITH_PROJECT);
  // console.log(process.env.LANGSMITH_API_KEY?.slice(0, 10));
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
    // console.log("You typed:", question);
    let result: any = await parentGraph.invoke({
      messages: [
        new HumanMessage(question)
      ],
    },
      config
    );
    console.log('before cli result', result);

    // Check if the graph is interrupted
    if ("__interrupt__" in result) {
      console.log('Interrupted:', result.__interrupt__[0].value);
      const approval = await rl.question("(y/n): ");
      result = await parentGraph.invoke(
        new Command({
          resume: approval
        }),
        config
      )

    }
    // console.log('after cli result', result);
    const lastMessage: any = result?.messages[result?.messages?.length - 1];

    console.log("\nAI:", lastMessage?.content);
    // console.log("AI:", result);
    // console.log();
  }

  rl.close();

  console.log("👋 Goodbye!");
}















// // const result = await graph.invoke({
// //   userMessage: "Explain JWT in one paragraph.",
// // });

// import { HumanMessage } from "@langchain/core/messages";
// import { graph } from "../graph/graph.js";

// // console.log(result);

// const config = {
//   configurable: {
//     thread_id: "customer-1"
//   }
// }


//  await graph.invoke({
//   messages: [
//     new HumanMessage("Where is my order ORD-1001?")
//   ]
// },
//   config
// );

// const result = await graph.invoke({
//   messages: [
//     new HumanMessage("When will it arrive?")
//   ]
// },
//   config
// );




// console.log('test', result);





