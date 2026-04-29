import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect } = context;
  const url = new URL(request.url);
  const isLocal =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.startsWith('192.168.');
  const authError = url.searchParams.has('error');

  // 1. Redirect already-authenticated users
  if (cookies.get('site_auth')?.value === 'authenticated') {
    // ONLY redirect if we are on the root of the ASTRO site and 
    // user not already at destiniation (prevents redirect loops)
    if (!isLocal && url.pathname === '/' && !url.hostname.includes('deck')) {
      return redirect('https://deck.peoplesapp.org', 302);
    }
    return next();
  }

  // 2. Handle Password Submission
  if (request.method === 'POST') {
    const data = await request.formData();
    const password = data.get('password');
    const correctPassword =
      process.env.SITE_PASSWORD || import.meta.env.SITE_PASSWORD;

    if (password === correctPassword) {
      // Set cookie and redirect
      cookies.set('site_auth', 'authenticated', {
        path: '/',
        secure: !isLocal, // Safari subdomain req's (Dynamic for local testing)
        sameSite: 'lax',
        domain: url.hostname,
      });
      return redirect(isLocal ? url.href : 'https://deck.peoplesapp.org', 302);
    } else {
      return redirect(`${url.pathname}?error=1`, 302);
    }
  }
  // Return the simple login form
  return new Response(
    `<html>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
<form method="POST" style="border:1px solid #ddd;padding:30px;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
<h2 style="margin-top:0;">Deck Access</h2>
${authError ? '<p style="color:red;font-size:14px;">Incorrect password. Try again.</p>' : ''}
<input type="password" name="password" placeholder="Password" required autofocus
style="width:100%;padding:12px;margin:15px 0;border:1px solid #ccc;border-radius:6px;box-sizing:border-box;"/>
<button type="submit" style="width:100%;padding:12px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">
Login
</button>
</form>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } },
  );
});
