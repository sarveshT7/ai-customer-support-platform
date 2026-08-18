import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { DOMAIN } from "./router.js";
export const ParentState = Annotation.Root({
    messages: Annotation({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    domain: Annotation({
        reducer: (_, update) => update,
        default: () => DOMAIN.PRODUCT,
    }),
});
