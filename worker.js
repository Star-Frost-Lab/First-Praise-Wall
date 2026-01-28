// First Praise Wall - Cloudflare JavaScript Workers 完整单文件
// 部署: wrangler deploy

// ==================== HTML 前端模板 ====================
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>First Praise Wall - 全球先夸墙</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 5px currentColor; } 50% { box-shadow: 0 0 20px currentColor; } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes danmaku { 
            from { transform: translateX(100vw); opacity: 1; } 
            to { transform: translateX(-100%); opacity: 1; } 
        }
        @keyframes heart-pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .slide-in { animation: slide-in 0.3s ease-out; }
        .heart-pop { animation: heart-pop 0.3s ease-out; }
        .danmaku-item { 
            position: absolute; 
            white-space: nowrap; 
            animation: danmaku linear forwards;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .danmaku-item:hover {
            transform: scale(1.05);
            z-index: 100;
        }
        .danmaku-item:active {
            transform: scale(0.95);
        }
        .theme-funny { --primary: #f59e0b; --secondary: #fbbf24; --bg: #fffbeb; --accent: #d97706; }
        .theme-warm { --primary: #ef4444; --secondary: #f87171; --bg: #fef2f2; --accent: #dc2626; }
        .theme-neutral { --primary: #6366f1; --secondary: #818cf8; --bg: #eef2ff; --accent: #4f46e5; }
        :root { --primary: #f59e0b; --secondary: #fbbf24; --bg: #fffbeb; --accent: #d97706; }
        body { background: var(--bg); }
        .btn-primary { background: var(--primary); }
        .btn-primary:hover { background: var(--accent); }
        .text-primary { color: var(--primary); }
        .border-primary { border-color: var(--primary); }
        .bg-primary { background: var(--primary); }
        .ring-primary { --tw-ring-color: var(--primary); }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 3px; }
        .theme-btn { transition: all 0.2s; }
        .theme-btn.active { transform: scale(1.1); box-shadow: 0 0 0 2px var(--primary); }
    </style>
</head>
<body class="min-h-screen theme-funny">
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div class="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span class="text-xl sm:text-2xl float">🏆</span>
                    <h1 class="text-base sm:text-xl font-bold text-primary whitespace-nowrap">先夸墙</h1>
                </div>
                <div class="flex items-center gap-1 sm:gap-2">
                    <div class="flex bg-gray-100 rounded-lg p-0.5">
                        <button onclick="applyTheme('funny')" class="theme-btn active w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-sm" data-theme="funny" title="Funny">🎉</button>
                        <button onclick="applyTheme('warm')" class="theme-btn w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-sm" data-theme="warm" title="Warm">❤️</button>
                        <button onclick="applyTheme('neutral')" class="theme-btn w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-sm" data-theme="neutral" title="Neutral">💎</button>
                    </div>
                    <button id="nav-home" class="text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-gray-100">首页</button>
                    <button id="nav-danmaku" class="text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-gray-100">弹幕</button>
                    <button id="nav-profile" class="text-xs sm:text-sm px-2 py-1 rounded-lg hover:bg-gray-100 hidden">我的</button>
                    <button id="nav-login" class="btn-primary text-white text-xs sm:text-sm px-3 py-1 rounded-lg">登录</button>
                    <button id="nav-logout" class="text-xs sm:text-sm px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hidden">退出</button>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div class="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between slide-in">
            <div class="flex items-center gap-2 sm:gap-3">
                <span class="text-2xl sm:text-3xl">🌍</span>
                <div>
                    <p class="text-xs sm:text-sm text-gray-600">您的位置</p>
                    <p class="font-bold text-base sm:text-lg" id="user-city">检测中...</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-xs sm:text-sm text-gray-600">延迟</p>
                <p class="font-bold text-xl sm:text-2xl text-primary" id="user-latency">-- ms</p>
            </div>
        </div>

        <div id="page-home">
            <div class="flex gap-1 sm:gap-2 mb-4 border-b overflow-x-auto">
                <button class="tab-btn active px-3 sm:px-4 py-2 font-medium border-b-2 border-primary text-primary whitespace-nowrap text-sm sm:text-base" data-tab="leaderboard">🏅 排行榜</button>
                <button class="tab-btn px-3 sm:px-4 py-2 font-medium border-b-2 border-transparent text-gray-500 hover:text-primary whitespace-nowrap text-sm sm:text-base" data-tab="wall">💬 表扬墙</button>
                <button class="tab-btn px-3 sm:px-4 py-2 font-medium border-b-2 border-transparent text-gray-500 hover:text-primary whitespace-nowrap text-sm sm:text-base" data-tab="hot">🔥 热门</button>
                <button class="tab-btn px-3 sm:px-4 py-2 font-medium border-b-2 border-transparent text-gray-500 hover:text-primary whitespace-nowrap text-sm sm:text-base" data-tab="stats">📊 统计</button>
            </div>

            <div id="tab-leaderboard" class="tab-content">
                <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-amber-400 to-orange-400 p-3 sm:p-4 text-white">
                        <h2 class="text-base sm:text-lg font-bold">⚡ 今日全球延迟排行榜 TOP 10</h2>
                        <p class="text-xs sm:text-sm opacity-80">登录后自动记录 · 每用户保留最佳成绩</p>
                    </div>
                    <div id="leaderboard-list" class="divide-y"></div>
                </div>
            </div>

            <div id="tab-wall" class="tab-content hidden">
                <div id="praise-input-area" class="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4">
                    <div id="login-prompt" class="text-center py-4">
                        <p class="text-gray-500 mb-2 text-sm sm:text-base">请登录后发表留言</p>
                        <button onclick="showLoginModal()" class="btn-primary text-white px-6 py-2 rounded-lg text-sm sm:text-base">登录</button>
                    </div>
                    <div id="praise-form" class="hidden">
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="text-xl sm:text-2xl">✨</span>
                            <span class="font-medium text-sm sm:text-base" id="praise-username"></span>
                            <span class="text-xs sm:text-sm text-gray-400" id="praise-remaining">剩余 3/3 次</span>
                        </div>
                        <textarea id="praise-input" class="w-full border rounded-xl p-3 resize-none focus:ring-2 ring-primary focus:outline-none text-sm sm:text-base" rows="2" placeholder="写下你的表扬..." maxlength="200"></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs sm:text-sm text-gray-400"><span id="char-count">0</span>/200</span>
                            <button id="submit-praise" class="btn-primary text-white px-4 sm:px-6 py-2 rounded-lg disabled:opacity-50 text-sm sm:text-base">发表</button>
                        </div>
                    </div>
                </div>
                <div id="wall-list" class="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin pb-20"></div>
            </div>

            <div id="tab-hot" class="tab-content hidden">
                <div id="hot-list" class="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin pb-20"></div>
            </div>

            <div id="tab-stats" class="tab-content hidden">
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                    <div class="bg-white rounded-2xl shadow-lg p-3 sm:p-4 text-center">
                        <p class="text-2xl sm:text-3xl font-bold text-primary" id="stat-praises">0</p>
                        <p class="text-xs sm:text-sm text-gray-500">总留言</p>
                    </div>
                    <div class="bg-white rounded-2xl shadow-lg p-3 sm:p-4 text-center">
                        <p class="text-2xl sm:text-3xl font-bold text-red-500" id="stat-likes">0</p>
                        <p class="text-xs sm:text-sm text-gray-500">总点赞</p>
                    </div>
                    <div class="bg-white rounded-2xl shadow-lg p-3 sm:p-4 text-center">
                        <p class="text-2xl sm:text-3xl font-bold text-blue-500" id="stat-users">0</p>
                        <p class="text-xs sm:text-sm text-gray-500">用户数</p>
                    </div>
                    <div class="bg-white rounded-2xl shadow-lg p-3 sm:p-4 text-center">
                        <p class="text-2xl sm:text-3xl font-bold text-green-500" id="stat-peak">20:00</p>
                        <p class="text-xs sm:text-sm text-gray-500">活跃时段</p>
                    </div>
                </div>
                <div class="mt-4 bg-white rounded-2xl shadow-lg p-3 sm:p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 pulse-glow"></span>
                        <span class="text-xs sm:text-sm text-gray-500" id="connection-status">实时连接中</span>
                    </div>
                    <p class="text-xs text-gray-400" id="last-update">最后更新: --</p>
                </div>
            </div>
        </div>

        <div id="page-profile" class="hidden">
            <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4">
                <div class="flex items-center gap-3 sm:gap-4 mb-6">
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold" id="profile-avatar">?</div>
                    <div>
                        <h2 class="text-lg sm:text-xl font-bold" id="profile-nickname">用户昵称</h2>
                        <div class="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <span>⭐ 声誉: <span id="profile-reputation">0</span></span>
                            <span>💎 积分: <span id="profile-points">0</span></span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                    <div class="bg-amber-50 rounded-xl p-2 sm:p-3 text-center">
                        <p class="text-lg sm:text-2xl font-bold text-primary" id="profile-praise-left">3/3</p>
                        <p class="text-xs text-gray-500">剩余留言</p>
                    </div>
                    <div class="bg-red-50 rounded-xl p-2 sm:p-3 text-center">
                        <p class="text-lg sm:text-2xl font-bold text-red-500" id="profile-delete-left">1/1</p>
                        <p class="text-xs text-gray-500">剩余删除</p>
                    </div>
                    <button id="signin-btn" class="bg-green-50 rounded-xl p-2 sm:p-3 text-center hover:bg-green-100 transition">
                        <p class="text-lg sm:text-2xl" id="signin-icon">📅</p>
                        <p class="text-xs text-gray-500">签到</p>
                    </button>
                </div>
                <div class="mb-6">
                    <h3 class="font-bold mb-2 text-sm sm:text-base">成就徽章</h3>
                    <div id="profile-badges" class="flex flex-wrap gap-2">
                        <span class="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-400">暂无徽章</span>
                    </div>
                </div>
                <div class="mb-6">
                    <h3 class="font-bold mb-2 text-sm sm:text-base">个人 Badge</h3>
                    <div class="bg-gray-100 rounded-xl p-3 sm:p-4 text-center">
                        <div id="badge-preview" class="mb-3 overflow-x-auto"></div>
                        <div class="flex gap-2 justify-center flex-wrap">
                            <button id="copy-badge-url" class="text-xs sm:text-sm bg-primary text-white px-3 sm:px-4 py-1.5 rounded-lg hover:opacity-90">复制链接</button>
                            <button id="copy-badge-md" class="text-xs sm:text-sm bg-gray-200 px-3 sm:px-4 py-1.5 rounded-lg hover:bg-gray-300">复制 MD</button>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">可嵌入 GitHub README</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 class="font-bold mb-4 text-sm sm:text-base">我的留言</h3>
                <div id="my-praises-list" class="space-y-3 max-h-[40vh] overflow-y-auto scrollbar-thin pb-20">
                    <p class="text-center text-gray-400 py-4 text-sm">暂无留言</p>
                </div>
            </div>
        </div>

        <!-- 弹幕页面 - 简化版 -->
        <div id="page-danmaku" class="hidden">
            <div class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl overflow-hidden relative" style="height: 75vh;">
                <div id="danmaku-container" class="absolute inset-0 overflow-hidden"></div>
                <div class="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                    <span class="text-white text-sm">💬 共 <span id="danmaku-count">0</span> 条留言</span>
                </div>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                    点击弹幕可以点赞 ❤️
                </div>
            </div>
        </div>

        <div class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30">
            <button id="share-btn" class="bg-gradient-to-r from-amber-400 to-orange-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl hover:scale-110 transition pulse-glow">📤</button>
        </div>
    </main>

    <!-- 登录模态框 -->
    <div id="auth-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 slide-in relative">
            <div class="text-center mb-6">
                <span class="text-4xl">🎉</span>
                <h2 class="text-lg sm:text-xl font-bold mt-2" id="auth-title">登录</h2>
            </div>
            <form id="auth-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                    <input type="text" id="auth-nickname" class="w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary focus:outline-none text-sm sm:text-base" required minlength="2" maxlength="20">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <input type="password" id="auth-password" class="w-full border rounded-xl px-4 py-2.5 focus:ring-2 ring-primary focus:outline-none text-sm sm:text-base" required minlength="6">
                </div>
                <button type="submit" class="w-full btn-primary text-white py-2.5 rounded-xl font-medium text-sm sm:text-base" id="auth-submit">登录</button>
            </form>
            <div class="mt-4 text-center">
                <button id="auth-toggle" class="text-sm text-primary hover:underline">没有账号？注册</button>
            </div>
            <button id="auth-close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
    </div>

    <!-- 分享模态框 -->
    <div id="share-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 slide-in relative">
            <h2 class="text-lg sm:text-xl font-bold mb-4 text-center">📤 分享挑战</h2>
            <textarea id="share-text" class="w-full border rounded-xl p-3 resize-none text-sm" rows="4" readonly></textarea>
            <div class="flex gap-2 mt-4">
                <button id="copy-share" class="flex-1 btn-primary text-white py-2.5 rounded-xl text-sm sm:text-base">复制文案</button>
                <button id="close-share" class="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 text-sm sm:text-base">关闭</button>
            </div>
        </div>
    </div>

    <!-- 确认删除模态框 -->
    <div id="confirm-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-6 slide-in relative">
            <div class="text-center mb-4">
                <span class="text-5xl">🗑️</span>
                <h2 class="text-lg font-bold mt-3" id="confirm-title">确认删除</h2>
                <p class="text-gray-500 text-sm mt-2" id="confirm-message">确定要删除这条留言吗？此操作不可撤销。</p>
            </div>
            <div class="flex gap-3 mt-6">
                <button id="confirm-cancel" class="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium">取消</button>
                <button id="confirm-ok" class="flex-1 bg-red-500 text-white py-2.5 rounded-xl hover:bg-red-600 font-medium">确认删除</button>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg z-50 hidden text-sm sm:text-base">
        <span id="toast-msg"></span>
    </div>

    <script>
        const API_BASE = '';
        let state = {
            user: null,
            token: localStorage.getItem('token'),
            theme: localStorage.getItem('theme') || 'funny',
            city: '未知',
            latency: 0,
            leaderboard: [],
            wall: [],
            stats: { praises: 0, likes: 0, users: 0 },
            profile: { reputation: 0, points: 0, praise_left: 3, delete_left: 1, signed_in: false, badges: [] },
            likedPraises: new Set(JSON.parse(localStorage.getItem('likedPraises') || '[]'))
        };

        let pendingDeleteId = null;

        function showToast(msg, duration = 2000) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').textContent = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), duration);
        }

        function formatTime(ts) {
            return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function api(path, options = {}) {
            const headers = { 'Content-Type': 'application/json' };
            if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
            try {
                const res = await fetch(API_BASE + path, { ...options, headers });
                return await res.json();
            } catch (e) {
                console.error('API Error:', e);
                return { error: e.message };
            }
        }

        async function measureLatency() {
            const start = performance.now();
            await fetch(API_BASE + '/api/ping', { method: 'GET', cache: 'no-store' }).catch(() => {});
            state.latency = Math.floor(performance.now() - start);
            document.getElementById('user-latency').textContent = state.latency + ' ms';
            if (state.token) {
                api('/api/visit?latency=' + state.latency);
            }
        }

        async function loadData() {
            const [lb, wall, stats] = await Promise.all([
                api('/api/leaderboard'),
                api('/api/wall'),
                api('/api/stats')
            ]);
            if (!lb.error) { state.leaderboard = lb.data || []; renderLeaderboard(); }
            if (!wall.error) { state.wall = wall.data || []; renderWall(); renderHot(); }
            if (!stats.error) { state.stats = stats.data || state.stats; renderStats(); }
            document.getElementById('user-city').textContent = stats.data?.city || '未知';
            state.city = stats.data?.city || '未知';
        }

        async function loadProfile() {
            if (!state.token) return;
            const res = await api('/api/profile');
            if (!res.error && res.data) {
                state.profile = res.data;
                state.user = { nickname: res.data.nickname };
                renderProfile();
                updateAuthUI();
                if (state.latency > 0) {
                    api('/api/visit?latency=' + state.latency);
                }
            }
        }

        function renderLeaderboard() {
            const list = document.getElementById('leaderboard-list');
            if (state.leaderboard.length === 0) {
                list.innerHTML = '<p class="text-center text-gray-400 py-8 text-sm">暂无数据，登录后自动记录延迟！</p>';
                return;
            }
            list.innerHTML = state.leaderboard.map((item, i) => \`
                <div class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition slide-in" style="animation-delay: \${i * 50}ms">
                    <span class="w-6 sm:w-8 text-center font-bold \${i < 3 ? 'text-xl sm:text-2xl' : 'text-gray-400 text-sm'}">\${['🥇', '🥈', '🥉'][i] || (i + 1)}</span>
                    <div class="flex-1 ml-2 sm:ml-3 min-w-0">
                        <span class="font-medium text-sm sm:text-base truncate block">\${escapeHtml(item.nickname || '匿名')}</span>
                        <span class="text-xs text-gray-400">\${escapeHtml(item.city || '')}</span>
                    </div>
                    <span class="text-primary font-bold text-sm sm:text-base">\${item.latency} ms</span>
                </div>
            \`).join('');
        }

        function renderPraiseCard(praise, showDelete = true) {
            const isLiked = state.likedPraises.has(praise.id);
            const canDelete = state.user && (state.profile.delete_left > 0 || praise.nickname === state.user.nickname);
            const isMine = state.user && praise.nickname === state.user.nickname;
            return \`
                <div class="bg-white rounded-xl shadow p-3 sm:p-4 slide-in" data-id="\${praise.id}">
                    <div class="flex items-start gap-2 sm:gap-3">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold shrink-0 text-sm sm:text-base">
                            \${escapeHtml((praise.nickname || '?').charAt(0).toUpperCase())}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <span class="font-medium text-sm sm:text-base">\${escapeHtml(praise.nickname || '匿名')}</span>
                                <span class="text-xs text-gray-400">⭐\${praise.reputation || 0}</span>
                                <span class="text-xs text-gray-400">\${formatTime(praise.time)}</span>
                            </div>
                            <p class="mt-1 text-gray-700 break-words text-sm sm:text-base">\${escapeHtml(praise.content)}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-end gap-2 mt-2 sm:mt-3">
                        <button onclick="toggleLike('\${praise.id}', this)" class="like-btn flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm \${isLiked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-400'} transition">
                            <span class="like-icon">\${isLiked ? '❤️' : '🤍'}</span>
                            <span class="like-count">\${praise.likes || 0}</span>
                        </button>
                        \${showDelete && state.user ? \`<button onclick="confirmDelete('\${praise.id}')" class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition \${!canDelete && !isMine ? 'opacity-50' : ''}">🗑️</button>\` : ''}
                    </div>
                </div>
            \`;
        }

        function renderWall() {
            const list = document.getElementById('wall-list');
            if (state.wall.length === 0) {
                list.innerHTML = '<p class="text-center text-gray-400 py-8 text-sm">还没有留言，来发表第一条！</p>';
                return;
            }
            list.innerHTML = state.wall.slice(0, 50).map(p => renderPraiseCard(p)).join('');
        }

        function renderHot() {
            const list = document.getElementById('hot-list');
            const hotList = [...state.wall].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 20);
            if (hotList.length === 0) {
                list.innerHTML = '<p class="text-center text-gray-400 py-8 text-sm">暂无热门留言</p>';
                return;
            }
            // 使用稳定的渲染，避免频繁重排
            const currentIds = Array.from(list.querySelectorAll('[data-id]')).map(el => el.dataset.id);
            const newIds = hotList.map(p => p.id);
            
            // 只有当列表变化时才重新渲染
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
                list.innerHTML = hotList.map(p => renderPraiseCard(p, false)).join('');
            } else {
                // 只更新点赞数
                hotList.forEach(p => {
                    const card = list.querySelector(\`[data-id="\${p.id}"]\`);
                    if (card) {
                        const countEl = card.querySelector('.like-count');
                        if (countEl) countEl.textContent = p.likes || 0;
                    }
                });
            }
        }

        function renderStats() {
            document.getElementById('stat-praises').textContent = state.stats.praises || 0;
            document.getElementById('stat-likes').textContent = state.stats.likes || 0;
            document.getElementById('stat-users').textContent = state.stats.users || 0;
            document.getElementById('last-update').textContent = '最后更新: ' + new Date().toLocaleTimeString();
        }

        function renderProfile() {
            if (!state.user) return;
            const p = state.profile;
            document.getElementById('profile-avatar').textContent = state.user.nickname.charAt(0).toUpperCase();
            document.getElementById('profile-nickname').textContent = state.user.nickname;
            document.getElementById('profile-reputation').textContent = p.reputation || 0;
            document.getElementById('profile-points').textContent = p.points || 0;
            const maxPraise = p.signed_in ? 4 : 3;
            const maxDelete = (p.reputation || 0) >= 50 ? 2 : 1;
            document.getElementById('profile-praise-left').textContent = \`\${p.praise_left}/\${maxPraise}\`;
            document.getElementById('profile-delete-left').textContent = \`\${p.delete_left}/\${maxDelete}\`;
            document.getElementById('signin-icon').textContent = p.signed_in ? '✅' : '📅';
            if (p.signed_in) document.getElementById('signin-btn').classList.add('opacity-50');
            else document.getElementById('signin-btn').classList.remove('opacity-50');
            
            const badgesDiv = document.getElementById('profile-badges');
            if (p.badges && p.badges.length > 0) {
                badgesDiv.innerHTML = p.badges.map(b => \`<span class="px-2 sm:px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm">\${b}</span>\`).join('');
            } else {
                badgesDiv.innerHTML = '<span class="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-400">暂无徽章</span>';
            }
            
            const myPraises = state.wall.filter(x => x.nickname === state.user.nickname);
            const myList = document.getElementById('my-praises-list');
            if (myPraises.length > 0) {
                myList.innerHTML = myPraises.map(p => renderPraiseCard(p, true)).join('');
            } else {
                myList.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">暂无留言</p>';
            }
            
            document.getElementById('badge-preview').innerHTML = \`<img src="/api/badge?nick=\${encodeURIComponent(state.user.nickname)}&theme=\${state.theme}" alt="Badge" class="mx-auto rounded-lg max-w-full">\`;
        }

        function updateAuthUI() {
            const isLoggedIn = !!state.user;
            document.getElementById('nav-login').classList.toggle('hidden', isLoggedIn);
            document.getElementById('nav-logout').classList.toggle('hidden', !isLoggedIn);
            document.getElementById('nav-profile').classList.toggle('hidden', !isLoggedIn);
            document.getElementById('login-prompt').classList.toggle('hidden', isLoggedIn);
            document.getElementById('praise-form').classList.toggle('hidden', !isLoggedIn);
            if (isLoggedIn) {
                document.getElementById('praise-username').textContent = state.user.nickname;
                const maxPraise = state.profile.signed_in ? 4 : 3;
                document.getElementById('praise-remaining').textContent = \`剩余 \${state.profile.praise_left}/\${maxPraise} 次\`;
            }
        }

        function showLoginModal() {
            document.getElementById('auth-modal').classList.remove('hidden');
            document.getElementById('auth-modal').classList.add('flex');
        }

        function hideLoginModal() {
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('auth-modal').classList.remove('flex');
        }

        let isRegisterMode = false;
        function toggleAuthMode() {
            isRegisterMode = !isRegisterMode;
            document.getElementById('auth-title').textContent = isRegisterMode ? '注册' : '登录';
            document.getElementById('auth-submit').textContent = isRegisterMode ? '注册' : '登录';
            document.getElementById('auth-toggle').textContent = isRegisterMode ? '已有账号？登录' : '没有账号？注册';
        }

        async function handleAuth(e) {
            e.preventDefault();
            const nickname = document.getElementById('auth-nickname').value.trim();
            const password = document.getElementById('auth-password').value;
            const endpoint = isRegisterMode ? '/api/register' : '/api/login';
            const res = await api(endpoint, {
                method: 'POST',
                body: JSON.stringify({ nickname, password })
            });
            if (res.error) {
                showToast(res.error);
                return;
            }
            state.token = res.token;
            state.user = { nickname: res.nickname };
            localStorage.setItem('token', res.token);
            hideLoginModal();
            await loadProfile();
            updateAuthUI();
            if (state.latency > 0) {
                await api('/api/visit?latency=' + state.latency);
                await loadData();
            }
            showToast(isRegisterMode ? '注册成功！' : '登录成功！');
        }

        function logout() {
            state.user = null;
            state.token = null;
            state.profile = { reputation: 0, points: 0, praise_left: 3, delete_left: 1, signed_in: false, badges: [] };
            localStorage.removeItem('token');
            updateAuthUI();
            showPage('home');
            showToast('已退出登录');
        }

        async function submitPraise() {
            if (!state.user) return showLoginModal();
            const content = document.getElementById('praise-input').value.trim();
            if (!content) return showToast('请输入内容');
            
            const res = await api('/api/praise', {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            if (res.error) {
                showToast(res.error);
                return;
            }
            document.getElementById('praise-input').value = '';
            document.getElementById('char-count').textContent = '0';
            await loadData();
            await loadProfile();
            showToast('发表成功！');
        }

        async function toggleLike(id, btn) {
            if (!state.user) return showLoginModal();
            
            const isLiked = state.likedPraises.has(id);
            const endpoint = isLiked ? '/api/unlike/' + id : '/api/like/' + id;
            
            // 立即更新 UI
            const icon = btn.querySelector('.like-icon');
            const count = btn.querySelector('.like-count');
            const currentCount = parseInt(count.textContent) || 0;
            
            if (isLiked) {
                icon.textContent = '🤍';
                count.textContent = Math.max(0, currentCount - 1);
                btn.classList.remove('bg-red-100', 'text-red-500');
                btn.classList.add('bg-gray-100', 'text-gray-500');
                state.likedPraises.delete(id);
            } else {
                icon.textContent = '❤️';
                icon.classList.add('heart-pop');
                setTimeout(() => icon.classList.remove('heart-pop'), 300);
                count.textContent = currentCount + 1;
                btn.classList.remove('bg-gray-100', 'text-gray-500');
                btn.classList.add('bg-red-100', 'text-red-500');
                state.likedPraises.add(id);
            }
            
            localStorage.setItem('likedPraises', JSON.stringify([...state.likedPraises]));
            
            // 发送 API 请求
            const res = await api(endpoint, { method: 'POST' });
            if (res.error) {
                // 回滚 UI
                if (isLiked) {
                    icon.textContent = '❤️';
                    count.textContent = currentCount;
                    btn.classList.add('bg-red-100', 'text-red-500');
                    btn.classList.remove('bg-gray-100', 'text-gray-500');
                    state.likedPraises.add(id);
                } else {
                    icon.textContent = '🤍';
                    count.textContent = currentCount;
                    btn.classList.remove('bg-red-100', 'text-red-500');
                    btn.classList.add('bg-gray-100', 'text-gray-500');
                    state.likedPraises.delete(id);
                }
                localStorage.setItem('likedPraises', JSON.stringify([...state.likedPraises]));
                showToast(res.error);
                return;
            }
            
            // 重新加载数据以更新统计
            await loadData();
            showToast(isLiked ? '已取消点赞' : '点赞成功！');
        }

        function confirmDelete(id) {
            if (!state.user) return showLoginModal();
            pendingDeleteId = id;
            document.getElementById('confirm-modal').classList.remove('hidden');
            document.getElementById('confirm-modal').classList.add('flex');
        }

        function hideConfirmModal() {
            document.getElementById('confirm-modal').classList.add('hidden');
            document.getElementById('confirm-modal').classList.remove('flex');
            pendingDeleteId = null;
        }

        async function doDelete() {
            if (!pendingDeleteId) return;
            
            const res = await api('/api/praise/' + pendingDeleteId, { method: 'DELETE' });
            hideConfirmModal();
            
            if (res.error) {
                showToast(res.error);
                return;
            }
            await loadData();
            await loadProfile();
            showToast('删除成功！');
        }

        async function signIn() {
            if (!state.user) return showLoginModal();
            if (state.profile.signed_in) return showToast('今日已签到');
            
            const res = await api('/api/signin', { method: 'POST' });
            if (res.error) {
                showToast(res.error);
                return;
            }
            await loadProfile();
            showToast('签到成功！+1 留言次数 +10 积分');
        }

        function showPage(page) {
            document.getElementById('page-home').classList.toggle('hidden', page !== 'home');
            document.getElementById('page-profile').classList.toggle('hidden', page !== 'profile');
            document.getElementById('page-danmaku').classList.toggle('hidden', page !== 'danmaku');
            if (page === 'profile') renderProfile();
            if (page === 'danmaku') startDanmaku();
        }

        // ========== 简化版弹幕系统 ==========
        let danmakuTimer = null;
        let danmakuQueue = [];
        let danmakuIndex = 0;
        const danmakuColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1', '#ff9f43', '#ee5a24', '#ffffff'];

        async function danmakuLike(id, el) {
            if (!state.user) {
                showToast('请先登录');
                return;
            }
            
            const isLiked = state.likedPraises.has(id);
            const endpoint = isLiked ? '/api/unlike/' + id : '/api/like/' + id;
            
            // 找到弹幕中的心形和点赞数元素
            const heartSpan = el.querySelector('.danmaku-heart');
            const likeSpan = el.querySelector('.danmaku-likes');
            const currentCount = parseInt(likeSpan?.textContent) || 0;
            
            if (isLiked) {
                // 取消点赞
                if (heartSpan) heartSpan.textContent = '🤍';
                if (likeSpan) likeSpan.textContent = Math.max(0, currentCount - 1);
                state.likedPraises.delete(id);
                el.style.boxShadow = 'none';
            } else {
                // 点赞
                if (heartSpan) heartSpan.textContent = '❤️';
                if (likeSpan) likeSpan.textContent = currentCount + 1;
                state.likedPraises.add(id);
                el.style.boxShadow = '0 0 20px #ff6b6b';
            }
            
            localStorage.setItem('likedPraises', JSON.stringify([...state.likedPraises]));
            
            const res = await api(endpoint, { method: 'POST' });
            if (res.error) {
                // 回滚
                if (isLiked) {
                    if (heartSpan) heartSpan.textContent = '❤️';
                    state.likedPraises.add(id);
                    if (likeSpan) likeSpan.textContent = currentCount;
                    el.style.boxShadow = '0 0 20px #ff6b6b';
                } else {
                    if (heartSpan) heartSpan.textContent = '🤍';
                    state.likedPraises.delete(id);
                    if (likeSpan) likeSpan.textContent = currentCount;
                    el.style.boxShadow = 'none';
                }
                localStorage.setItem('likedPraises', JSON.stringify([...state.likedPraises]));
                showToast(res.error);
            } else {
                showToast(isLiked ? '取消点赞' : '❤️ +1');
                // 静默更新数据，不重新渲染弹幕
                const [wall, stats] = await Promise.all([
                    api('/api/wall'),
                    api('/api/stats')
                ]);
                if (!wall.error) state.wall = wall.data || [];
                if (!stats.error) { state.stats = stats.data || state.stats; renderStats(); }
            }
        }

        function startDanmaku() {
            const container = document.getElementById('danmaku-container');
            container.innerHTML = '';
            document.getElementById('danmaku-count').textContent = state.wall.length;
            
            // 清除旧定时器
            if (danmakuTimer) {
                clearInterval(danmakuTimer);
                danmakuTimer = null;
            }
            
            if (state.wall.length === 0) return;
            
            // 复制留言列表作为队列，打乱顺序增加趣味性
            danmakuQueue = [...state.wall].sort(() => Math.random() - 0.5);
            danmakuIndex = 0;
            
            const addDanmaku = () => {
                if (danmakuQueue.length === 0) return;
                
                // 获取当前留言
                const praise = danmakuQueue[danmakuIndex];
                danmakuIndex++;
                
                // 如果播放完一轮，重新打乱顺序再播放
                if (danmakuIndex >= danmakuQueue.length) {
                    danmakuIndex = 0;
                    danmakuQueue = [...state.wall].sort(() => Math.random() - 0.5);
                }
                
                const item = document.createElement('div');
                item.className = 'danmaku-item font-medium px-4 py-2 rounded-full shadow-lg';
                item.dataset.id = praise.id;
                
                const top = Math.random() * 80 + 10;
                const duration = 12 + Math.random() * 6;
                const color = danmakuColors[Math.floor(Math.random() * danmakuColors.length)];
                const fontSize = 14 + Math.random() * 4;
                const isLiked = state.likedPraises.has(praise.id);
                
                item.style.cssText = \`
                    top: \${top}%;
                    animation-duration: \${duration}s;
                    color: \${color};
                    font-size: \${fontSize}px;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    \${isLiked ? 'box-shadow: 0 0 15px #ff6b6b;' : ''}
                \`;
                
                item.innerHTML = \`<span style="opacity:0.7">\${escapeHtml(praise.nickname)}:</span> \${escapeHtml(praise.content)} <span style="opacity:0.8;font-size:0.85em"><span class="danmaku-heart">\${isLiked ? '❤️' : '🤍'}</span><span class="danmaku-likes">\${praise.likes || 0}</span></span>\`;
                
                // 点击弹幕点赞
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    danmakuLike(praise.id, item);
                });
                
                container.appendChild(item);
                
                // 动画结束后移除元素
                item.addEventListener('animationend', () => item.remove());
            };
            
            // 根据留言数量决定初始化弹幕数和间隔
            const initialCount = Math.min(3, state.wall.length);
            const interval = Math.max(2500, 10000 / Math.max(1, state.wall.length));
            
            // 初始化时错开添加
            for (let i = 0; i < initialCount; i++) {
                setTimeout(() => addDanmaku(), i * 1200);
            }
            
            // 定时添加新弹幕
            danmakuTimer = setInterval(addDanmaku, interval);
        }

        function showShareModal() {
            const text = \`我是 \${state.user?.nickname || '访客'}，以 \${state.latency}ms 延迟登上先夸墙！来挑战我：\${location.href}\`;
            document.getElementById('share-text').value = text;
            document.getElementById('share-modal').classList.remove('hidden');
            document.getElementById('share-modal').classList.add('flex');
        }

        function hideShareModal() {
            document.getElementById('share-modal').classList.add('hidden');
            document.getElementById('share-modal').classList.remove('flex');
        }

        async function copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                showToast('已复制到剪贴板！');
            } catch (e) {
                showToast('复制失败，请手动复制');
            }
        }

        function applyTheme(theme) {
            state.theme = theme;
            localStorage.setItem('theme', theme);
            document.body.classList.remove('theme-funny', 'theme-warm', 'theme-neutral');
            document.body.classList.add('theme-' + theme);
            
            // 更新主题按钮状态
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-white', 'shadow');
                if (btn.dataset.theme === theme) {
                    btn.classList.add('active', 'bg-white', 'shadow');
                }
            });
        }

        let pollTimer = null;
        function startPolling() {
            let interval = 3000;
            const poll = async () => {
                await loadData();
                if (interval < 10000) interval += 1000;
                pollTimer = setTimeout(poll, interval);
            };
            poll();
        }

        async function init() {
            // 应用保存的主题
            applyTheme(state.theme);
            
            const params = new URLSearchParams(location.search);
            const themeParam = params.get('theme');
            if (['funny', 'warm', 'neutral'].includes(themeParam)) {
                applyTheme(themeParam);
            }
            
            await loadData();
            measureLatency();
            
            if (state.token) {
                await loadProfile();
            }
            updateAuthUI();
            startPolling();
        }

        document.addEventListener('DOMContentLoaded', () => {
            init();

            // Tab 切换
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.tab-btn').forEach(b => {
                        b.classList.remove('active', 'border-primary', 'text-primary');
                        b.classList.add('border-transparent', 'text-gray-500');
                    });
                    btn.classList.add('active', 'border-primary', 'text-primary');
                    btn.classList.remove('border-transparent', 'text-gray-500');
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
                });
            });

            // 导航
            document.getElementById('nav-home').addEventListener('click', () => showPage('home'));
            document.getElementById('nav-danmaku').addEventListener('click', () => showPage('danmaku'));
            document.getElementById('nav-profile').addEventListener('click', () => showPage('profile'));
            document.getElementById('nav-login').addEventListener('click', showLoginModal);
            document.getElementById('nav-logout').addEventListener('click', logout);

            // 登录模态框
            document.getElementById('auth-close').addEventListener('click', hideLoginModal);
            document.getElementById('auth-toggle').addEventListener('click', toggleAuthMode);
            document.getElementById('auth-form').addEventListener('submit', handleAuth);
            document.getElementById('auth-modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) hideLoginModal(); });

            // 确认删除模态框
            document.getElementById('confirm-cancel').addEventListener('click', hideConfirmModal);
            document.getElementById('confirm-ok').addEventListener('click', doDelete);
            document.getElementById('confirm-modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) hideConfirmModal(); });

            // 留言
            document.getElementById('praise-input').addEventListener('input', (e) => { document.getElementById('char-count').textContent = e.target.value.length; });
            document.getElementById('submit-praise').addEventListener('click', submitPraise);

            // 签到
            document.getElementById('signin-btn').addEventListener('click', signIn);

            // 分享
            document.getElementById('share-btn').addEventListener('click', showShareModal);
            document.getElementById('close-share').addEventListener('click', hideShareModal);
            document.getElementById('copy-share').addEventListener('click', () => copyToClipboard(document.getElementById('share-text').value));
            document.getElementById('share-modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) hideShareModal(); });

            // Badge 复制
            document.getElementById('copy-badge-url')?.addEventListener('click', () => {
                const url = \`\${location.origin}/api/badge?nick=\${encodeURIComponent(state.user?.nickname || '')}&theme=\${state.theme}\`;
                copyToClipboard(url);
            });
            document.getElementById('copy-badge-md')?.addEventListener('click', () => {
                const url = \`\${location.origin}/api/badge?nick=\${encodeURIComponent(state.user?.nickname || '')}&theme=\${state.theme}\`;
                copyToClipboard(\`![My Badge](\${url})\`);
            });
        });
    </script>
</body>
</html>`;

// ==================== 工具函数 ====================
function getToday() {
    return new Date().toISOString().split('T')[0];
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken() {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function checkBadWords(text) {
    const badWords = /fuck|shit|damn|傻逼|操你|妈的|去死|草泥马/gi;
    return badWords.test(text);
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}

function createHtmlResponse(html) {
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

function createSvgResponse(svg) {
    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=300'
        }
    });
}

// ==================== Durable Object 类 ====================
export class PraiseWall {
    constructor(state, env) {
        this.state = state;
        this.storage = state.storage;
        this.data = null;
    }

    async loadData() {
        if (this.data !== null) return;
        const stored = await this.storage.get('wall_data');
        if (stored) {
            this.data = stored;
        } else {
            this.data = {
                users: {},
                tokens: {},
                daily: {},
                praises: [],
                leaderboard: [],
                stats: { praises: 0, likes: 0, users: 0 }
            };
        }
    }

    async saveData() {
        await this.storage.put('wall_data', this.data);
    }

    getUserDaily(nickname) {
        const today = getToday();
        let daily = this.data.daily[nickname] || {};
        if (daily.date !== today) {
            daily = { date: today, praise_count: 0, delete_count: 0, signed_in: false };
            this.data.daily[nickname] = daily;
        }
        return daily;
    }

    async handleRegister(body) {
        await this.loadData();
        const nickname = (body.nickname || '').trim();
        const password = body.password || '';

        if (!nickname || nickname.length < 2 || nickname.length > 20) {
            return { error: '昵称需要 2-20 个字符' };
        }
        if (password.length < 6) {
            return { error: '密码至少 6 个字符' };
        }
        if (this.data.users[nickname]) {
            return { error: '昵称已被使用' };
        }

        this.data.users[nickname] = {
            password_hash: await hashPassword(password),
            reputation: 0,
            points: 0,
            created_at: Date.now()
        };
        this.data.stats.users = Object.keys(this.data.users).length;

        const token = generateToken();
        this.data.tokens[token] = nickname;

        await this.saveData();
        return { token, nickname };
    }

    async handleLogin(body) {
        await this.loadData();
        const nickname = (body.nickname || '').trim();
        const password = body.password || '';

        const user = this.data.users[nickname];
        const passwordHash = await hashPassword(password);
        if (!user || user.password_hash !== passwordHash) {
            return { error: '昵称或密码错误' };
        }

        const token = generateToken();
        this.data.tokens[token] = nickname;
        await this.saveData();

        return { token, nickname };
    }

    async handleProfile(token) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const user = this.data.users[nickname] || {};
        const daily = this.getUserDaily(nickname);
        const maxPraise = daily.signed_in ? 4 : 3;
        const maxDelete = (user.reputation || 0) >= 50 ? 2 : 1;

        const badges = [];
        if ((user.reputation || 0) >= 50) badges.push('👑 墙主');
        if ((user.points || 0) >= 100) badges.push('💎 积分达人');

        return {
            data: {
                nickname,
                reputation: user.reputation || 0,
                points: user.points || 0,
                praise_left: Math.max(0, maxPraise - daily.praise_count),
                delete_left: Math.max(0, maxDelete - daily.delete_count),
                signed_in: daily.signed_in,
                badges
            }
        };
    }

    async handlePraise(token, body) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const content = (body.content || '').trim();
        if (!content || content.length > 200) {
            return { error: '内容需要 1-200 个字符' };
        }
        if (checkBadWords(content)) {
            return { error: '包含敏感词汇' };
        }

        const daily = this.getUserDaily(nickname);
        const maxPraise = daily.signed_in ? 4 : 3;
        if (daily.praise_count >= maxPraise) {
            return { error: '今日留言次数已用完' };
        }

        const user = this.data.users[nickname] || {};
        const praise = {
            id: generateId(),
            nickname,
            content,
            likes: 0,
            reputation: user.reputation || 0,
            time: Date.now()
        };

        this.data.praises.unshift(praise);
        if (this.data.praises.length > 1000) {
            this.data.praises = this.data.praises.slice(0, 1000);
        }

        daily.praise_count++;
        this.data.stats.praises = this.data.praises.length;

        await this.saveData();
        return { success: true, id: praise.id };
    }

    async handleLike(token, praiseId) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const praise = this.data.praises.find(p => p.id === praiseId);
        if (!praise) {
            return { error: '留言不存在' };
        }

        praise.likes = (praise.likes || 0) + 1;

        const author = praise.nickname;
        if (this.data.users[author]) {
            this.data.users[author].reputation = (this.data.users[author].reputation || 0) + 1;
            this.data.users[author].points = (this.data.users[author].points || 0) + 1;
        }

        this.data.stats.likes = this.data.praises.reduce((sum, p) => sum + (p.likes || 0), 0);

        await this.saveData();
        return { success: true, likes: praise.likes };
    }

    async handleUnlike(token, praiseId) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const praise = this.data.praises.find(p => p.id === praiseId);
        if (!praise) {
            return { error: '留言不存在' };
        }

        if ((praise.likes || 0) > 0) {
            praise.likes = praise.likes - 1;

            const author = praise.nickname;
            if (this.data.users[author]) {
                this.data.users[author].reputation = Math.max(0, (this.data.users[author].reputation || 0) - 1);
                this.data.users[author].points = Math.max(0, (this.data.users[author].points || 0) - 1);
            }

            this.data.stats.likes = this.data.praises.reduce((sum, p) => sum + (p.likes || 0), 0);
        }

        await this.saveData();
        return { success: true, likes: praise.likes || 0 };
    }

    async handleDelete(token, praiseId) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const praiseIndex = this.data.praises.findIndex(p => p.id === praiseId);
        if (praiseIndex === -1) {
            return { error: '留言不存在' };
        }

        const praise = this.data.praises[praiseIndex];
        const user = this.data.users[nickname] || {};
        const daily = this.getUserDaily(nickname);
        const maxDelete = (user.reputation || 0) >= 50 ? 2 : 1;
        const isOwn = praise.nickname === nickname;

        if (!isOwn) {
            if (daily.delete_count >= maxDelete) {
                return { error: '今日删除次数已用完' };
            }
            if (this.data.users[nickname]) {
                this.data.users[nickname].reputation = Math.max(0, (this.data.users[nickname].reputation || 0) - 1);
            }
        }

        // 删除留言前，先处理点赞相关的声誉和积分
        const praiseAuthor = praise.nickname;
        const praiseLikes = praise.likes || 0;
        if (praiseLikes > 0 && this.data.users[praiseAuthor]) {
            this.data.users[praiseAuthor].reputation = Math.max(0, (this.data.users[praiseAuthor].reputation || 0) - praiseLikes);
            this.data.users[praiseAuthor].points = Math.max(0, (this.data.users[praiseAuthor].points || 0) - praiseLikes);
        }

        this.data.praises.splice(praiseIndex, 1);
        if (!isOwn) {
            daily.delete_count++;
        }
        
        // 重新计算统计数据
        this.data.stats.praises = this.data.praises.length;
        this.data.stats.likes = this.data.praises.reduce((sum, p) => sum + (p.likes || 0), 0);

        await this.saveData();
        return { success: true };
    }

    async handleSignin(token) {
        await this.loadData();
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '请先登录' };
        }

        const daily = this.getUserDaily(nickname);
        if (daily.signed_in) {
            return { error: '今日已签到' };
        }

        daily.signed_in = true;
        if (this.data.users[nickname]) {
            this.data.users[nickname].points = (this.data.users[nickname].points || 0) + 10;
        }

        await this.saveData();
        return { success: true };
    }

    async handleVisit(token, city, latency) {
        await this.loadData();
        
        const nickname = this.data.tokens[token];
        if (!nickname) {
            return { error: '需要登录才能记录延迟' };
        }

        const latencyNum = parseInt(latency) || 999;
        const now = Date.now();

        const existingIndex = this.data.leaderboard.findIndex(e => e.nickname === nickname);
        
        if (existingIndex !== -1) {
            if (latencyNum < this.data.leaderboard[existingIndex].latency) {
                this.data.leaderboard[existingIndex] = {
                    nickname,
                    city: city || '未知',
                    latency: latencyNum,
                    time: now
                };
            }
        } else {
            this.data.leaderboard.push({
                nickname,
                city: city || '未知',
                latency: latencyNum,
                time: now
            });
        }

        this.data.leaderboard.sort((a, b) => a.latency - b.latency);
        this.data.leaderboard = this.data.leaderboard.slice(0, 10);

        await this.saveData();
        return { success: true };
    }

    async handleLeaderboard() {
        await this.loadData();
        return { data: this.data.leaderboard.slice(0, 10) };
    }

    async handleWall() {
        await this.loadData();
        return { data: this.data.praises.slice(0, 50) };
    }

    async handleStats(city) {
        await this.loadData();
        const stats = { ...this.data.stats, city: city || '未知' };
        return { data: stats };
    }

    async handleBadge(nickname, theme) {
        await this.loadData();

        const user = this.data.users[nickname] || {};
        const reputation = user.reputation || 0;
        const points = user.points || 0;

        const totalLikes = this.data.praises
            .filter(p => p.nickname === nickname)
            .reduce((sum, p) => sum + (p.likes || 0), 0);

        const leaderboardEntry = this.data.leaderboard.find(e => e.nickname === nickname);
        const latency = leaderboardEntry ? leaderboardEntry.latency : '--';

        const colors = {
            funny: { bg1: '#fef3c7', bg2: '#fde68a', text: '#92400e' },
            warm: { bg1: '#fee2e2', bg2: '#fecaca', text: '#991b1b' },
            neutral: { bg1: '#e0e7ff', bg2: '#c7d2fe', text: '#3730a3' }
        };
        const c = colors[theme] || colors.funny;

        const crown = reputation >= 50 ? '👑 ' : '';
        const safeNick = escapeHtml(nickname || '访客');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
    <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${c.bg1}"/>
            <stop offset="100%" style="stop-color:${c.bg2}"/>
        </linearGradient>
    </defs>
    <rect width="400" height="120" rx="12" fill="url(#bg)"/>
    <text x="20" y="45" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="${c.text}">${crown}${safeNick}</text>
    <text x="20" y="75" font-family="system-ui, sans-serif" font-size="14" fill="#6b7280">被夸 ${totalLikes} 次 | 声誉 ${reputation} | 延迟 ${latency} ms</text>
    <text x="20" y="100" font-family="system-ui, sans-serif" font-size="11" fill="#9ca3af">First Praise Wall 🏆 | 积分 ${points}</text>
</svg>`;
        return svg;
    }

    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        const cfData = request.cf || {};
        const city = cfData.city || url.searchParams.get('city') || '未知';

        try {
            if (method === 'OPTIONS') {
                return createResponse({});
            }

            if (path === '/api/register' && method === 'POST') {
                const body = await request.json();
                const result = await this.handleRegister(body);
                return createResponse(result);
            }

            if (path === '/api/login' && method === 'POST') {
                const body = await request.json();
                const result = await this.handleLogin(body);
                return createResponse(result);
            }

            if (path === '/api/profile' && method === 'GET') {
                const result = await this.handleProfile(token);
                return createResponse(result);
            }

            if (path === '/api/praise' && method === 'POST') {
                const body = await request.json();
                const result = await this.handlePraise(token, body);
                return createResponse(result);
            }

            if (path.startsWith('/api/praise/') && method === 'DELETE') {
                const praiseId = path.split('/').pop();
                const result = await this.handleDelete(token, praiseId);
                return createResponse(result);
            }

            if (path.startsWith('/api/like/') && method === 'POST') {
                const praiseId = path.split('/').pop();
                const result = await this.handleLike(token, praiseId);
                return createResponse(result);
            }

            if (path.startsWith('/api/unlike/') && method === 'POST') {
                const praiseId = path.split('/').pop();
                const result = await this.handleUnlike(token, praiseId);
                return createResponse(result);
            }

            if (path === '/api/signin' && method === 'POST') {
                const result = await this.handleSignin(token);
                return createResponse(result);
            }

            if (path === '/api/visit' && method === 'GET') {
                const latency = url.searchParams.get('latency') || '0';
                const result = await this.handleVisit(token, city, latency);
                return createResponse(result);
            }

            if (path === '/api/leaderboard' && method === 'GET') {
                const result = await this.handleLeaderboard();
                return createResponse(result);
            }

            if (path === '/api/wall' && method === 'GET') {
                const result = await this.handleWall();
                return createResponse(result);
            }

            if (path === '/api/stats' && method === 'GET') {
                const result = await this.handleStats(city);
                return createResponse(result);
            }

            if (path === '/api/ping' && method === 'GET') {
                return createResponse({ pong: true });
            }

            if (path === '/api/badge' && method === 'GET') {
                const nick = url.searchParams.get('nick') || '';
                const theme = url.searchParams.get('theme') || 'funny';
                if (!nick) {
                    return createResponse({ error: '缺少 nick 参数' }, 400);
                }
                const svg = await this.handleBadge(nick, theme);
                return createSvgResponse(svg);
            }

            return createResponse({ error: 'Not Found' }, 404);

        } catch (e) {
            console.error('Error:', e);
            return createResponse({ error: e.message }, 500);
        }
    }
}

// ==================== 主入口 ====================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === '/' || path === '') {
            return createHtmlResponse(HTML_TEMPLATE);
        }

        if (path.startsWith('/api/')) {
            try {
                const id = env.PRAISE_WALL.idFromName('global-wall');
                const stub = env.PRAISE_WALL.get(id);
                return await stub.fetch(request);
            } catch (e) {
                console.error('DO Error:', e);
                return createResponse({ error: e.message }, 500);
            }
        }

        return createResponse({ error: 'Not Found' }, 404);
    }
};
