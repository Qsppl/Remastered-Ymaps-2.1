export function shortDataPreview(data: any): string {
    const textView = typeof data !== "string" ? JSON.stringify(data, null, 2) : data
    if (textView.length > 300) return textView.slice(0, 300) + "\n..."
    else return textView
}