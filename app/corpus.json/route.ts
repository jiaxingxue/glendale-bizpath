import { corpus } from '@/lib/data'

export const dynamic = 'force-static'

export function GET() {
  return new Response(JSON.stringify(corpus, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
