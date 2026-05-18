'use server';
/**
 * @fileOverview An AI agent that summarizes customer orders for staff members.
 *
 * - staffOrderSummary - A function that generates a concise summary of a customer order.
 * - StaffOrderSummaryInput - The input type for the staffOrderSummary function.
 * - StaffOrderSummaryOutput - The return type for the staffOrderSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StaffOrderSummaryInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  customerPhoneNumber: z.string().optional().describe('The phone number of the customer.'),
  carLicensePlate: z.string().optional().describe('The car license plate for pickup orders.'),
  orderItems: z.array(z.object({
    name: z.string().describe('The name of the item.'),
    quantity: z.number().int().positive().describe('The quantity of the item.'),
    price: z.number().positive().describe('The price of a single unit of the item.'),
  })).describe('A list of items in the order.'),
  specialRequests: z.string().optional().describe('Any special requests or notes from the customer.'),
  totalPrice: z.number().positive().describe('The total price of the order.'),
});
export type StaffOrderSummaryInput = z.infer<typeof StaffOrderSummaryInputSchema>;

const StaffOrderSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the customer order, highlighting key details and special requests.'),
});
export type StaffOrderSummaryOutput = z.infer<typeof StaffOrderSummaryOutputSchema>;

export async function staffOrderSummary(input: StaffOrderSummaryInput): Promise<StaffOrderSummaryOutput> {
  return staffOrderSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'staffOrderSummaryPrompt',
  input: {schema: StaffOrderSummaryInputSchema},
  output: {schema: StaffOrderSummaryOutputSchema},
  prompt: `You are an AI assistant helping staff quickly understand customer orders.
Summarize the following customer order concisely, highlighting the key items, total cost, customer details, and any special requests.

Customer Name: {{{customerName}}}
{{#if customerPhoneNumber}}Customer Phone: {{{customerPhoneNumber}}}{{/if}}
{{#if carLicensePlate}}Car License Plate: {{{carLicensePlate}}}{{/if}}

Order Items:
{{#each orderItems}}
- {{quantity}}x {{name}} ($ {{price}} each)
{{/each}}

Total Price: $ {{totalPrice}}

{{#if specialRequests}}
Special Requests/Notes: {{{specialRequests}}}
{{/if}}

Please provide a summary that is easy to read and helps staff quickly fulfill the order.`,
});

const staffOrderSummaryFlow = ai.defineFlow(
  {
    name: 'staffOrderSummaryFlow',
    inputSchema: StaffOrderSummaryInputSchema,
    outputSchema: StaffOrderSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
