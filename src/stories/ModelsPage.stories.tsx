import type { Meta, StoryObj } from "@storybook/react";
import ModelsPage from "../app/dashboard/models/page";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const meta: Meta<typeof ModelsPage> = {
    title: "Dashboard/Models/ModelsPage",
    component: ModelsPage,
    decorators: [
        (Story) => {
            const queryClient = new QueryClient();
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
type Story = StoryObj<typeof ModelsPage>;

export const Default: Story = {}; 