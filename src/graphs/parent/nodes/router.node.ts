import { detectDomain, DOMAIN } from "../router.js";
import { ParentState } from "../state.js";

export async function routerNode(state: typeof ParentState.State) {
  if (!state?.messages || state.messages.length === 0) {
    throw new Error("Parent graph received no messages.");
  }
  const lastMessage = state.messages[state.messages.length - 1];
  const domain = detectDomain(lastMessage.content.toString());
  return { domain }

}