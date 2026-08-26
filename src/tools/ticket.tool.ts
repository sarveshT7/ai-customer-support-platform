import { tool } from "@langchain/core/tools";
import z from "zod";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TicketCategory, TicketPriority } from "../models/ticket.js";
import { ticketService } from "../services/ticket.service.js";
import { withRetry } from "../graphs/ticket/retry.js";

export const createTicketTool = tool(
    async ({ issue, category, priority, orderId }: { issue: string, category: TicketCategory, priority: TicketPriority, orderId: string }) => {
        return withRetry(async () => {
            const ticket = await ticketService.createTicket({
                issue,
                category,
                orderId,
                priority,
            });

            return {
                success: true,
                ticket,
            }
        })
    },
    {
        name: "create_ticket",
        description: `
        Create a support ticket when a customer reports an issue.

         Choose the category based on the customer's problem:
        - Technical: Device not working or software issues.
        - Delivery: Late or missing deliveries.
        - Damaged Product: Product arrived damaged or broken.
        - Refund: Customer requests a refund.
        - Payment: Billing or payment issues.
        - Warranty: Warranty claims or repairs.

        Choose the priority based on the severity of the issue:
        - Low: Minor issues like software glitches.
        - Medium: Normal support needed.
        - High: Urgent issues requiring immediate attention.
        - Critical: Severe safety or business-impacting issues.
`,
        schema: z.object({
            issue: z.string().describe("A concise summary of the customer's issue. Example: 'Laptop won't turn on.'"),
            category: z.enum(TICKET_CATEGORIES)
                .describe("Support ticket category."),
            orderId: z.string().describe("The order ID, for example ORD-1001. Use the exact field name orderId.").min(1),

            priority: z.enum(TICKET_PRIORITIES)
                .describe("Low for minor issues, Medium for normal support, High for urgent issues, Critical for severe safety or business-impacting issues.Choose exactly one of: Low, Medium, High, Critical."),
        })
    }
)
