// Generate QR code for tracking
export function generateTrackingQRCode(trackingNumber: string, orderId: string): string {
  // In a real application, you would use a QR code library like qrcode
  // For now, we'll return a placeholder SVG that represents a QR code
  const qrData = `ORDER:${orderId}|TRACKING:${trackingNumber}|TIMESTAMP:${Date.now()}`

  // This is a simplified QR code representation
  // In production, use a proper QR code library
  const svgQR = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="70" y="10" width="20" height="20" fill="black"/>
      <rect x="100" y="10" width="20" height="20" fill="black"/>
      <rect x="130" y="10" width="20" height="20" fill="black"/>
      <rect x="160" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="40" width="20" height="20" fill="black"/>
      <rect x="70" y="40" width="20" height="20" fill="black"/>
      <rect x="130" y="40" width="20" height="20" fill="black"/>
      <rect x="160" y="40" width="20" height="20" fill="black"/>
      <rect x="10" y="70" width="20" height="20" fill="black"/>
      <rect x="40" y="70" width="20" height="20" fill="black"/>
      <rect x="100" y="70" width="20" height="20" fill="black"/>
      <rect x="160" y="70" width="20" height="20" fill="black"/>
      <rect x="10" y="100" width="20" height="20" fill="black"/>
      <rect x="70" y="100" width="20" height="20" fill="black"/>
      <rect x="100" y="100" width="20" height="20" fill="black"/>
      <rect x="130" y="100" width="20" height="20" fill="black"/>
      <rect x="40" y="130" width="20" height="20" fill="black"/>
      <rect x="70" y="130" width="20" height="20" fill="black"/>
      <rect x="130" y="130" width="20" height="20" fill="black"/>
      <rect x="160" y="130" width="20" height="20" fill="black"/>
      <rect x="10" y="160" width="20" height="20" fill="black"/>
      <rect x="40" y="160" width="20" height="20" fill="black"/>
      <rect x="100" y="160" width="20" height="20" fill="black"/>
      <rect x="130" y="160" width="20" height="20" fill="black"/>
      <text x="100" y="195" text-anchor="middle" font-family="monospace" font-size="8" fill="black">${orderId}</text>
    </svg>
  `)}`

  return svgQR
}

// Parse QR code data - NEW FUNCTION
export function parseQRCodeData(qrData: string): { trackingCode: string; orderId: string; timestamp: number } | null {
  try {
    // Try to parse as JSON first (new format)
    const parsed = JSON.parse(qrData)
    if (parsed.trackingCode && parsed.orderId) {
      return {
        trackingCode: parsed.trackingCode,
        orderId: parsed.orderId,
        timestamp: parsed.timestamp || Date.now(),
      }
    }
  } catch (e) {
    // If JSON parsing fails, try the old format
    try {
      const parts = qrData.split("|")
      const orderPart = parts.find((p) => p.startsWith("ORDER:"))
      const trackingPart = parts.find((p) => p.startsWith("TRACKING:"))
      const timestampPart = parts.find((p) => p.startsWith("TIMESTAMP:"))

      if (orderPart && trackingPart) {
        return {
          trackingCode: trackingPart.replace("TRACKING:", ""),
          orderId: orderPart.replace("ORDER:", ""),
          timestamp: timestampPart ? Number.parseInt(timestampPart.replace("TIMESTAMP:", "")) : Date.now(),
        }
      }
    } catch (e2) {
      // If all parsing fails, return null
      return null
    }
  }

  return null
}

// Format tracking code for display
export function formatTrackingCode(trackingNumber: string): string {
  // Format tracking number in groups of 3-4 characters
  return trackingNumber.replace(/(.{3})/g, "$1-").slice(0, -1)
}

// Validate tracking code format
export function validateTrackingCode(trackingNumber: string): boolean {
  // Basic validation - should be alphanumeric and 9-15 characters
  const regex = /^[A-Z0-9]{9,15}$/
  return regex.test(trackingNumber.toUpperCase())
}

// Generate random tracking number
export function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create QR code data in JSON format
export function createQRCodeData(trackingCode: string, orderId: string): string {
  return JSON.stringify({
    trackingCode,
    orderId,
    timestamp: Date.now(),
  })
}

// Verify QR code matches order
export function verifyQRCode(qrData: string, expectedTrackingCode: string, expectedOrderId: string): boolean {
  const parsed = parseQRCodeData(qrData)
  if (!parsed) return false

  return parsed.trackingCode === expectedTrackingCode && parsed.orderId === expectedOrderId
}
