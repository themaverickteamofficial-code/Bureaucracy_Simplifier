import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Clone the request headers and set a new header `x-hello-from-middleware1`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-hello-from-middleware1', 'hello')


    // You can also set request headers in NextResponse.rewrite
    return NextResponse.next({
        request: {
        // New request headers
        headers: requestHeaders,
        },
    })
}
