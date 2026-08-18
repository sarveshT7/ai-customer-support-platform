import { Annotation } from "@langchain/langgraph";
export const SupportState = Annotation.Root({
    messages: Annotation({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),
    ticket: Annotation({
        reducer: (current, update) => ({ ...current, ...update }),
        default: () => ({ requested: false })
    }),
});
