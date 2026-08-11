import { tool } from "@langchain/core/tools";
import z from "zod";
import { Ticket, TicketPriority } from "../models/ticket.js";
import { tickets } from "../data/tickets.js";


export const createTicketTool = tool(
    async ({ issue, category, priority }: { issue: string, category: string, priority: TicketPriority }) => {
        const customerId = "CUS-101";
        const ticket: Ticket = {
            ticketId: `TKT-${crypto.randomUUID()}`,
            issue,
            category,
            priority,
            status: "Open",
            createdAt: new Date().toISOString(),
        }

        tickets.push(ticket);

        return {
            success: true,
            ticket
        }
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
            // customerId: z.string().describe("The customer ID"),
            issue: z.string().describe("A concise summary of the customer's issue. Example: 'Laptop won't turn on.'"),
            category: z.enum([
                "Technical",
                "Delivery",
                "Damaged Product",
                "Refund",
                "Payment",
                "Warranty"
            ])
                .describe("Support ticket category."),
            orderId: z.string().describe("The order ID, for example ORD-1001. Use the exact field name orderId."),

            priority: z.enum(["Low", "Medium", "High", "Critical"])
                .describe("Low for minor issues, Medium for normal support, High for urgent issues, Critical for severe safety or business-impacting issues.Choose exactly one of: Low, Medium, High, Critical."),
        })
    }
)