export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">LLM Eval Tool Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Models"
                    description="Manage your LLM models and API keys"
                    href="/dashboard/models"
                />
                <DashboardCard
                    title="Evals"
                    description="Create and manage evaluation questions"
                    href="/dashboard/evals"
                />
                <DashboardCard
                    title="Run Evals"
                    description="Execute evaluations against models"
                    href="/dashboard/run-evals"
                />
                <DashboardCard
                    title="Judge Mode"
                    description="Review and score model responses"
                    href="/dashboard/judge-mode"
                />
                <DashboardCard
                    title="Leaderboard"
                    description="Compare model performance"
                    href="/dashboard/leaderboard"
                />
            </div>
        </div>
    );
}

function DashboardCard({
    title,
    description,
    href
}: {
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="block p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700"
        >
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
        </a>
    );
} 