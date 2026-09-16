/* 28考研工作台 · Service Worker
   作用：
   1. 让页面具备「可安装」资格（PWA 安装到主屏幕 / 打包成 APK 的硬性要求）
   2. 离线可用：断网时打开仍是完整界面，数据本来就在 localStorage 里

   更新策略：网络优先（network-first）
   —— 因为你改工作台内容后希望立刻看到新版；
      只有断网时才回退到缓存，避免「改了文件页面还是旧内容」。
*/
const CACHE = 'kaoyan-workbench-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // 逐个添加，单个失败不影响整体安装
      Promise.all(ASSETS.map(u => c.add(u).catch(() => null)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  // 只接管本站资源，外部图片（Unsplash 等）走网络
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => {
          if (hit) return hit;
          // 导航请求兜底到首页
          if (req.mode === 'navigate') return caches.match('./index.html');
          return new Response('', { status: 504, statusText: 'Offline' });
        })
      )
  );
});
