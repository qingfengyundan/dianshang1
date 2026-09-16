# Git Hooks 脚本

## pre-commit - 代码提交前检查

创建文件 `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 运行 pre-commit 检查..."

# 运行前端 lint
if [ -d "frontend" ]; then
  echo "检查前端代码..."
  cd frontend
  npm run lint --silent
  if [ $? -ne 0 ]; then
    echo "❌ 前端代码检查失败，请修复后再提交"
    exit 1
  fi
  cd ..
fi

# 运行后端 lint
if [ -d "backend" ]; then
  echo "检查后端代码..."
  cd backend
  npm run lint --silent
  if [ $? -ne 0 ]; then
    echo "❌ 后端代码检查失败，请修复后再提交"
    exit 1
  fi
  cd ..
fi

echo "✅ 代码检查通过"
exit 0
```

## pre-push - 防止直接推送到保护分支

创建文件 `.git/hooks/pre-push`:

```bash
#!/bin/bash

current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$current_branch" = "main" ] || [ "$current_branch" = "develop" ]; then
    echo "❌ 错误: 不允许直接推送到 $current_branch 分支"
    echo "请创建 Pull Request 进行合并"
    exit 1
fi

echo "✅ 推送检查通过"
exit 0
```

## commit-msg - 提交信息格式检查

创建文件 `.git/hooks/commit-msg`:

```bash
#!/bin/bash

commit_msg_file=$1
commit_msg=$(cat "$commit_msg_file")

# 检查提交信息格式: type(scope): subject
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\(.+\))?: .{1,}$"; then
    echo "❌ 错误: 提交信息格式不正确"
    echo ""
    echo "正确格式: type(scope): subject"
    echo ""
    echo "示例:"
    echo "  feat(dashboard): 添加 AI 分析功能"
    echo "  fix(auth): 修复登录超时问题"
    echo "  docs(readme): 更新安装文档"
    echo ""
    echo "允许的 type:"
    echo "  feat, fix, docs, style, refactor, perf, test, chore, revert"
    exit 1
fi

echo "✅ 提交信息格式正确"
exit 0
```

## 安装方法

```bash
# 复制并赋予执行权限
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/commit-msg
```
