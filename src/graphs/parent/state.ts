import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Domain, DOMAIN } from "./router.js";

export const ParentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    domain: Annotation<Domain>({
        reducer: (_, update) => update,
        default: () => DOMAIN.PRODUCT,
    }),
});