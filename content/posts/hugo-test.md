---
title: "Hugo 测试帖"
date: 2026-09-05
tags: ["hugo", "front"]
summary: "部署前测试用:验证列表页、正文排版与标签集合页的完整链路。"
---

## 这是二级标题

普通段落,验证 `行内代码`、**加粗**、*斜体* 和 [链接](https://example.com) 的渲染。

### 三级标题

- 无序列表项一
- 无序列表项二
- 嵌套列表
  - 子项

1. 有序列表项一
2. 有序列表项二

> 引用块:左侧应该有主色竖条、白底圆角。

这是一个代码块:

```cpp
#include <iostream>
using namespace std;
int main() {
    cout << "Hello Hugo" << endl;
    return 0;
}
```

这是一个表格:

| 页面 | 模板 | 状态 |
|---|---|---|
| 首页 | index.html | 手写内容 |
| 帖子页 | single.html | Markdown 渲染 |
| 列表页 | list.html | 自动生成 |

### 图片

---
上面有条分割线

![老东西可爱捏](/images/fu.jpg)


