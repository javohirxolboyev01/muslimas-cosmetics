import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardApi, type DashboardPeriod } from './api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  period: (days: DashboardPeriod) => [...dashboardKeys.all, days] as const,
};

export const useDashboard = (days: DashboardPeriod) =>
  useQuery({
    queryKey: dashboardKeys.period(days),
    queryFn: ({ signal }) => dashboardApi.get(days, signal),
    placeholderData: keepPreviousData,
  });
