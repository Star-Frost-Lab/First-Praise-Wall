# 🏆 First Praise Wall（全球先夸墙）

一个基于 **Cloudflare Python Workers** 和 **Durable Objects** 的正能量社区网页应用。用户可以参与全球延迟竞赛、发表表扬留言、互相点赞，体验简单有趣的社交互动。

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能特性

### 🎯 核心功能
- **全球延迟排行榜** - 自动检测访问延迟，展示 TOP 10 排名
- **表扬留言墙** - 发表正能量留言，最多 200 字符
- **点赞互动** - 为喜欢的留言点赞，增加作者声誉
- **热门榜单** - 按点赞数排序的热门留言

### 👤 用户系统
- **注册/登录** - 简单的昵称 + 密码认证
- **个人中心** - 查看自己的留言、统计、徽章
- **声誉系统** - 收到点赞 +1，删除他人留言 -1
- **积分系统** - 点赞 +1，签到 +10

### 🎮 激励机制
- **每日签到** - 获得额外 1 次留言机会 + 10 积分
- **成就徽章** - 声誉 ≥50 解锁「👑 墙主」称号
- **个人 Badge** - 可嵌入 GitHub README 的 SVG 徽章

### 🛡️ 安全特性
- **敏感词过滤** - 自动屏蔽不当言论
- **频率限制** - 每日留言 3 次、删除 1 次
- **防刷机制** - 同一留言不可重复点赞

### 🎨 界面特性
- **响应式设计** - 完美适配移动端和桌面端
- **主题切换** - Funny / Warm / Neutral 三种主题
- **实时更新** - 轮询机制保持数据同步
- **动画效果** - 流畅的过渡和交互动画

## 🚀 快速部署

### 前置要求

- Node.js 18+
- Cloudflare 账号
- Wrangler CLI

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/example/first-praise-wall.git
cd first-praise-wall

# 2. 安装 Wrangler CLI
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 部署到 Cloudflare Workers
wrangler deploy
```

部署成功后，访问输出的 Worker URL 即可使用！

### 本地开发

```bash
# 启动本地开发服务器
wrangler dev

# 访问 http://localhost:8787
```

## 📁 项目结构

```
first-praise-wall/
├── index.py          # 主程序文件（Python Workers + 内嵌前端）
├── wrangler.toml     # Cloudflare Workers 配置
├── pyproject.toml    # Python 项目配置
└── README.md         # 项目说明文档
```

## 🔌 API 接口

### 公开接口（无需登录）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 返回 HTML 页面 |
| `/api/ping` | GET | 健康检查 |
| `/api/leaderboard` | GET | 获取延迟排行榜 TOP 10 |
| `/api/wall` | GET | 获取留言墙（最新 50 条） |
| `/api/stats` | GET | 获取统计数据 |
| `/api/badge?nick=昵称` | GET | 获取用户 SVG 徽章 |

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/register` | POST | 用户注册 |
| `/api/login` | POST | 用户登录 |

### 需要登录的接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/profile` | GET | 获取个人资料 |
| `/api/praise` | POST | 发表留言 |
| `/api/praise/{id}` | DELETE | 删除留言 |
| `/api/like/{id}` | POST | 点赞留言 |
| `/api/signin` | POST | 每日签到 |

### 请求示例

```bash
# 注册
curl -X POST https://your-worker.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"nickname": "张三", "password": "123456"}'

# 登录
curl -X POST https://your-worker.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"nickname": "张三", "password": "123456"}'

# 发表留言（需要 token）
curl -X POST https://your-worker.workers.dev/api/praise \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "你真棒！继续加油！"}'

# 获取个人 Badge
curl https://your-worker.workers.dev/api/badge?nick=张三&theme=warm
```

## 🎨 主题定制

通过 URL 参数 `?theme=` 切换主题：

| 主题 | 参数 | 配色 |
|------|------|------|
| 🎉 Funny | `?theme=funny` | 橙黄色系（默认） |
| ❤️ Warm | `?theme=warm` | 红粉色系 |
| 💎 Neutral | `?theme=neutral` | 蓝紫色系 |

## 📊 数据存储

项目使用 **Durable Objects** 进行数据持久化存储：

```python
{
    'users': {
        '昵称': {
            'password_hash': 'sha256_hash',
            'reputation': 10,
            'points': 50,
            'created_at': 1234567890
        }
    },
    'tokens': {
        'token_string': '昵称'
    },
    'daily': {
        '昵称': {
            'date': '2025-01-15',
            'praise_count': 2,
            'delete_count': 0,
            'signed_in': True
        }
    },
    'praises': [
        {
            'id': '1234567890-1234',
            'nickname': '昵称',
            'content': '留言内容',
            'likes': 5,
            'reputation': 10,
            'time': 1234567890
        }
    ],
    'leaderboard': [
        {
            'city': 'Shanghai',
            'latency': 45,
            'time': 1234567890
        }
    ],
    'stats': {
        'praises': 100,
        'likes': 500,
        'users': 50
    }
}
```

## ⚙️ 配置说明

### wrangler.toml

```toml
name = "first-praise-wall"           # Worker 名称
main = "index.py"                     # 入口文件
compatibility_date = "2024-12-01"     # 兼容日期
compatibility_flags = ["python_workers"]  # 启用 Python Workers

[durable_objects]
bindings = [
    { name = "PRAISE_WALL", class_name = "PraiseWall" }
]

[[migrations]]
tag = "v1"
new_classes = ["PraiseWall"]
```

## 🔒 安全说明

- 密码使用 SHA-256 哈希存储，不保存明文
- Token 基于时间戳和随机数生成
- 敏感词使用正则表达式过滤
- 所有用户输入经过 HTML 转义

## 📈 性能优化

- **Durable Objects** 单实例串行处理，无锁并发安全
- **边缘计算** 全球 CDN 节点就近响应
- **自适应轮询** 从 3 秒逐渐降至 10 秒
- **数据限制** 留言/排行榜各限 1000 条

## 🛠️ 技术栈

- **后端**: Cloudflare Python Workers + Durable Objects
- **前端**: HTML5 + Tailwind CSS 4 + Vanilla JavaScript
- **存储**: Durable Objects Storage API
- **部署**: Wrangler CLI

## 📝 开发计划

- [ ] WebSocket 实时推送
- [ ] 每日 UTC 00:00 自动重置排行榜（Alarms）
- [ ] Service Worker 离线缓存
- [ ] 更多成就徽章
- [ ] 举报功能

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Python](https://www.python.org/) - 编程语言

---

<p align="center">
  Made with ❤️ by First Praise Wall Team
</p>

