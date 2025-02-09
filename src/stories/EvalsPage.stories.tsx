import type { Meta, StoryObj } from "@storybook/react";
import EvalsPage from "../app/dashboard/evals/page";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const meta: Meta<typeof EvalsPage> = {
    title: "Dashboard/Evals/EvalsPage",
    component: EvalsPage,
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                    },
                },
            });
            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                    <ToastContainer />
                </QueryClientProvider>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof EvalsPage>;

export const Default: Story = {}; 