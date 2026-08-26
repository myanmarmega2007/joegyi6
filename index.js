export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    let token = null;
    let actualPath = url.pathname;
    let isValidToken = false;
    let isExpired = false;

    if (pathParts.length >= 3) {
        const possibleToken = pathParts[1];
        try {
            const decoded = atob(possibleToken).split(':');
            if (decoded.length === 2) {
                const tokenTime = parseInt(decoded[0]);
                const secret = decoded[1];
                
                if (secret === "joegyi_2026_super_secret") {
                    isValidToken = true;
                    token = possibleToken;
                    actualPath = '/' + pathParts.slice(2).join('/');
                    
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (currentTime - tokenTime > 600) {
                        isExpired = true;
                    }
                }
            }
        } catch (e) {}
    }

    const isProtectedHtml = actualPath.endsWith('.html') && actualPath !== '/index.html' && actualPath !== '/';

    if (isProtectedHtml) {
        if (!isValidToken || isExpired) {
            return new Response("Status 403", { status: 403 });
        }
    }

    const target_url = "https://web.joegyi.uk" + actualPath + url.search;
    
    return fetch(target_url, { 
      method: request.method, 
      headers: request.headers 
    });
  }
};
