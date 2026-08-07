import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { Domain, DOMAIN } from "./router.js";

export const ParentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),
    domain: Annotation<Domain>({
        reducer: (_, update) => update,
        default: () => DOMAIN.PRODUCT,
    }),
});