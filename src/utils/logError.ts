const logError = (context: string, err: unknown) => {
    const message = err instanceof Error ? err.message : err
    console.error(`[${context}] ${message}`);
}
export { logError }
