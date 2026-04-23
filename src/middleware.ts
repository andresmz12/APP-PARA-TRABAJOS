export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/admin/:path*',
    '/empresa/:path*',
    '/candidato/:path*',
    '/redirect',
  ],
};
