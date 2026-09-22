import { Suspense } from "react";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";
import { AnalyticsSkeleton } from "@/components/analytics/widgets";

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsClient />
        </Suspense>
    );
}
