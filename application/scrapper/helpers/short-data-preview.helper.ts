export function shortDataPreview(data: any): string {
    const textView = JSON.stringify(data, null, 2)
    if (textView.length > 300) return textView.slice(0, 300) + "\n..."
    else return textView
}