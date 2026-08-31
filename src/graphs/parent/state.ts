import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Domain } from "./router.js";

export const ParentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    domain: Annotation<Domain | undefined>({
        reducer: (_, update) => update,
        default: () => undefined,
    }),
});