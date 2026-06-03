import { ApiResponse } from "../types/api.js";

export function ping(): ApiResponse<{ pong: true }> {
    return {
        success: true,
        data: { pong: true },
        timestamp: new Date().toISOString(),
    }
}