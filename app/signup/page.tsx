'use client'

import { useState } from 'react'
import { signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await signup(formData)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm mx-auto p-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up to start managing your campaigns
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Acme Corp"
              required
              disabled={isLoading}
              className="bg-transparent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isLoading}
              className="bg-transparent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="bg-transparent"
            />
          </div>

          <Button
            className="w-full mt-2"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
