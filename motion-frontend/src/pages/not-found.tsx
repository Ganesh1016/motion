import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Page not found.</p>
        <Button asChild>
          <Link to="/app">Go to app</Link>
        </Button>
      </div>
    </div>
  )
}