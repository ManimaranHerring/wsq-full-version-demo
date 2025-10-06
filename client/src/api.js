const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, opts = {}){
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts
  });
  const body = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body;
}
