import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Authenticated fetch wrapper.
 * Automatically injects the JWT token from NextAuth session.
 *
 * Usage:
 *   const data = await apiFetch(`/logs/temperatures/${restaurantId}`);
 *   const result = await apiFetch('/logs/cooking', { method: 'POST', body: JSON.stringify(data) });
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return res;
}

/**
 * Downloads a PDF report from the API.
 * Opens the PDF in a new tab or triggers download.
 */
export async function downloadReport(
    reportType: 'temperatures' | 'deliveries' | 'cleaning' | 'cooking',
    restaurantId: string,
    startDate?: string,
    endDate?: string,
) {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_URL}/reports/${reportType}/${restaurantId}${queryString}`;

    const session = await getSession();
    const token = session?.accessToken;

    const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
        throw new Error(`Failed to download ${reportType} report`);
    }

    // Convert response to blob and trigger download
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${reportType}-report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
}
