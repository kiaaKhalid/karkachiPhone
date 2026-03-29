"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, Package, QrCode, Copy, Download } from "lucide-react"
import { generateTrackingQRCode, formatTrackingCode } from "@/lib/tracking"
import { useToast } from "@/hooks/use-toast"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const trackingCode = searchParams.get("tracking")
  const orderId = searchParams.get("orderId")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    if (trackingCode && orderId) {
      const qrUrl = generateTrackingQRCode(trackingCode, orderId)
      setQrCodeUrl(qrUrl)
    }
  }, [trackingCode, orderId])

  const copyTrackingCode = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode)
      toast({
        title: "Tracking Code Copied!",
        description: "The tracking code has been copied to your clipboard.",
      })
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl && trackingCode) {
      const link = document.createElement("a")
      link.href = qrCodeUrl
      link.download = `tracking-${trackingCode}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded!",
        description: "The QR code has been saved to your device.",
      })
    }
  }

  if (!trackingCode || !orderId) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find your order information. Please check your email or contact support.
            </p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-semibold text-foreground">{orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Processing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tracking Code */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Tracking Code</p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-lg font-mono font-bold text-foreground">
                      {formatTrackingCode(trackingCode)}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyTrackingCode}
                      className="flex-shrink-0 bg-transparent"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save this code to track your order. You'll need to show this QR code to the delivery person.
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">QR Code for Delivery</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex-shrink-0">
                      {qrCodeUrl && (
                        <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                          <img
                            src={qrCodeUrl || "/Placeholder.png"}
                            alt={`QR Code for order ${orderId}`}
                            className="w-32 h-32 sm:w-40 sm:h-40"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Show this QR code to delivery person</h3>
                        <p className="text-sm text-muted-foreground">
                          The delivery person will scan this code to confirm your order delivery. Make sure to have this
                          ready when they arrive.
                        </p>
                      </div>
                      <Button variant="outline" onClick={downloadQRCode} className="w-full sm:w-auto bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Keep your tracking code and QR code safe</li>
                  <li>• The delivery person must scan your QR code to complete delivery</li>
                  <li>• You can view your order status anytime in your dashboard</li>
                  <li>• You'll receive updates via email and SMS</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/orders" className="flex-1">
              <Button className="w-full">View My Orders</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
