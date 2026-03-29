import { z } from "zod"

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Checkout validation schemas
export const shippingInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"),
})

export const paymentInfoSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
})

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stock: z.number().min(0, "Stock cannot be negative"),
  specs: z.record(z.string()),
})

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ShippingInfoData = z.infer<typeof shippingInfoSchema>
export type PaymentInfoData = z.infer<typeof paymentInfoSchema>
export type ProductFormData = z.infer<typeof productSchema>
export type ContactFormData = z.infer<typeof contactSchema>
