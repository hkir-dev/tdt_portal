// import { handlers } from '@/lib/auth';
// export const { GET, POST } = handlers;
// see basePath fix https://github.com/nextauthjs/next-auth/discussions/12160

import { NextRequest } from 'next/server'

import { handlers } from '@/lib/auth'

const basePath = process.env.NEXT_PUBLIC_NEXT_CONFIG_BASE_PATH ?? ''
const host_protocol = process.env.NEXT_PUBLIC_HOST_PROTOCOL ?? 'http'

async function rewriteRequest(request: NextRequest) {
    let { protocol, host, pathname } = request.nextUrl;

    const headers = await request.headers
    // Host rewrite adopted from next-auth/packages/core/src/lib/utils/env.ts:createActionURL
    const detectedHost = headers.get("x-forwarded-host") ?? host
    const detectedProtocol = headers.get("x-forwarded-proto") ?? protocol
    const _protocol = detectedProtocol.endsWith(":")
        ? detectedProtocol
        : detectedProtocol + ":";
    const url = new URL(`${_protocol}//${detectedHost}${basePath}${pathname}${request.nextUrl.search}`)
    // const url = new URL(`${host_protocol}://${detectedHost}${basePath}${pathname}${request.nextUrl.search}`)
    console.log('urlx:', url)

    return new NextRequest(url, request)
}

// async function rewriteRequest(req: NextRequest) {
// 	if (process.env.AUTH_TRUST_HOST !== 'true') return req
// 	const proto = req.headers.get('x-forwarded-proto')
// 	const host = req.headers.get('x-forwarded-host')
// 	if (!proto || !host) {
// 		console.warn("Missing x-forwarded-proto or x-forwarded-host headers.")
// 		return req
// 	}
// 	const envOrigin = `${proto}://${host}${basePath}`
// 	const { href, origin } = req.nextUrl
// 	const url = href.replace(origin, envOrigin)
// 	console.log('urlx:' + url)
// 	console.log('originx:' + origin)
// 	console.log('envOriginx:' + envOrigin)
// 	return new NextRequest(url, req)
// }

export async function GET(request: NextRequest) {
    return await handlers.GET(await rewriteRequest(request))
}

export async function POST(request: NextRequest) {
    return await handlers.POST(await rewriteRequest(request))
}