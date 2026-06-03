export interface ApiResponse<T = unknown> {
    success: true
    data: T
    timestamp: string
}