import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import AuthLayout from '@/components/auth/AuthLayout'

export default function VerifyEmail() {
  const { verifyEmail } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. No token provided.')
      return
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token)
        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(result.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    verify()
  }, [token, verifyEmail])

  return (
    <AuthLayout>
      <Card className="border-border">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-2xl font-heading">Email verification</CardTitle>
          <CardDescription className="text-base">
            {status === 'verifying' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been verified'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <div className="flex flex-col items-center gap-4 py-4">
            {status === 'verifying' && (
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
            {message && (
              <Alert variant={status === 'error' ? 'destructive' : undefined} className={status === 'success' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : ''}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-6">
          {status === 'success' && (
            <Link to="/login">
              <Button>Sign in to your account</Button>
            </Link>
          )}
          {status === 'error' && (
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to sign in
            </Link>
          )}
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
