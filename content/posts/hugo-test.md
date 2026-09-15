---
title: "Hugo 测试帖"
date: 2026-09-05
tags: ["hugo", "front"]
summary: "部署前测试用:验证列表页、正文排版、标签集合页与 LaTeX 公式渲染的完整链路。"
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

## LaTeX 公式渲染测试

新增了katex,所以新增了这段测试

### 1. 四种定界符

行内 `$...$`:质能方程 $E = mc^2$。行内 `\(...\)`:勾股定理 \(a^2 + b^2 = c^2\)。

块级 `$$...$$`:

$$
\int_0^1 x^2 \,\mathrm{d}x = \frac{1}{3}
$$

块级 `\[...\]`:

\[
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\]

### 2. 分式、根式、上下标

行内:$\frac{a+b}{c-d}$、$\dfrac{1}{1+\frac{1}{x}}$、$\sqrt{2}$、$\sqrt[3]{x+y}$、$x_i^2$、$a_{i,j}^{n+1}$、$2^{2^{2}}$。

块级:二阶导与拉普拉斯算子

$$
\frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u
$$

### 3. 大型算子与极限

$$
\sum_{k=1}^{\infty} \frac{1}{k^2} = \frac{\pi^2}{6},
\qquad
\int_{-\infty}^{+\infty} e^{-x^2}\,\mathrm{d}x = \sqrt{\pi},
\qquad
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^{n} = e
$$

行内时算子应该缩成小号:$\sum_{k=1}^{n} k$ 与 $\int_0^1 f(x)\,\mathrm{d}x$。

### 4. 符号表

表格单元格里的 `$...$` 也要渲染 —— 这张表本身就是一条测试。

| 类别 | 公式 |
|---|---|
| 希腊字母 | $\alpha,\ \beta,\ \gamma,\ \Gamma,\ \theta,\ \lambda,\ \mu,\ \pi,\ \sigma,\ \phi,\ \omega,\ \Omega$ |
| 关系符 | $a \le b,\ a \ge b,\ a \ne b,\ a \approx b,\ a \equiv b,\ a \propto b$ |
| 箭头 | $A \to B,\ f\colon X \to Y,\ x \mapsto x^2,\ p \Rightarrow q,\ a \Leftrightarrow b$ |
| 集合 | $x \in \mathbb{R}^n,\ A \subset B,\ A \subseteq B,\ A \cup B,\ A \cap B,\ \varnothing$ |
| 量词 | $\forall \varepsilon > 0,\ \exists \delta > 0$ |
| 自适应括号 | $\left( \frac{a}{b} \right)^2,\ \left\{ \frac{x}{y} \right\},\ \left\lfloor \frac{n}{2} \right\rfloor,\ \lVert x \rVert_2$ |

### 5. 矩阵、行列式、分段函数、多行推导

$$
A = \begin{pmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \end{pmatrix},
\qquad
\det A = \begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc
$$

$$
f(x) = \begin{cases} x^2, & x \ge 0 \\ -x, & x < 0 \end{cases}
$$

`aligned` 是**内层**环境,写在定界符里面:

$$
\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\
        &= a^2 + ab + ba + b^2 \\
        &= a^2 + 2ab + b^2
\end{aligned}
$$

`align`、`gather`、`array` 这类**文档级**环境 KaTeX 也认,**但只能在 display 模式下用**(块级公式里就行):

$$
\begin{align}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{align}
$$

写成行内 `$\begin{align} ... \end{align}$` 会报 `{align} can be used only in display mode`(见第 9 节)。

另外注意:`align` 会给每条公式**自动编号** —— 上面那两行末尾会自己出现 `(1)`、`(2)`。这个编号不是页面文本,而是 KaTeX 用 CSS 计数器生成的(`.eqn-num::before` 的 `content: "(" counter(katexEqnNo) ")"`),所以选中复制公式时复制不到它,`textContent` 里也查不到。不想要编号就用 `aligned` 或 `align*`。

### 6. 与中文混排

设物体质量为 $m$,加速度为 $a$,由牛顿第二定律 $F = ma$ 可知:当 $m = 2\,\mathrm{kg}$、$a = 3\,\mathrm{m/s^2}$ 时,$F = 6\,\mathrm{N}$。公式紧贴中文时不应多出空格,行高也不该被撑得忽高忽低。

单位用 `\mathrm{}` 包起来是为了保持正体:`$m/s^2$` 那样写会被排成斜体变量相乘,物理上语义就错了。

### 7. Markdown 陷阱字符

下划线、星号、反斜杠在 Markdown 里都有特殊含义,能不能活下来取决于 `passthrough` 配置:

- 下划线不被吃成斜体:$x_1 + x_2 + x_{i,j}$
- 星号不被吃成强调:$a*b*c$ 与 $f^{*}(x)$
- 反斜杠命令照常:$\alpha \ne \beta$、$\%$、$\&$
- 公式**外**的 Markdown 照常:*斜体*、**加粗**、~~删除线~~、`行内代码`

代码里的公式不该被渲染(`renderMathInElement` 默认忽略 `code` / `pre` 标签):

行内代码里的公式 `$x^2 + y^2$` 应显示为字面文本。

```text
块级代码里的公式:
$$ \sum_{i=1}^{n} i $$     ← 应原样显示,不被 KaTeX 处理
```

#### 7.1 货币:两个美元符会把中间的内容吃成公式

正文里真出现美元符号时,怎么写都会被吃。下面两行**都会**渲染成公式 —— `\$` 转义只是在 Markdown 阶段把 `\$` 还原成字面的 `$`,等 KaTeX 扫描 DOM 时它看到的还是两个 `$`:

价格 \$5.00 和 \$10.00 之间(用 `\$` 转义,照样渲染)

价格 $5.00 和 $10.00 之间(裸写,同样渲染)

两行结果一样:第一个 `$` 到第二个 `$` 之间的 `5.00 和 ` 被当成行内公式,只剩下一句 "价格 … 10.00 之间" 的残句。

顺带一提,这两行每行都会在浏览器控制台留下一条警告 `Unicode text character "和" used in math mode`(来自 KaTeX 的 `strict: 'warn'` 默认值)。整页刷新下来只有这 2 条警告、0 个 JS 错误 —— 反过来说,**控制台冒出这类警告,基本就是正文里的 `$` 被误当成公式了**。

可靠写法只有一个 —— 放进反引号变成 `<code>`,而 `code` 在 auto-render 的忽略名单里:

安全写法:`$5.00` 和 `$10.00`

(把两个 `$` 拆进不同的 `<span>` 也能达到同样效果,因为扫描是按文本节点进行的,但没必要。)

结论:**正文里的美元金额用反引号包起来**,或者干脆写 "5 美元"。

### 8. 长公式与溢出

$$
J(\theta) = -\frac{1}{m} \left[ \sum_{i=1}^{m} y^{(i)} \log h_\theta (x^{(i)}) + \left( 1 - y^{(i)} \right) \log \left( 1 - h_\theta (x^{(i)}) \right) \right] + \frac{\lambda}{2m} \sum_{j=1}^{n} \theta_j^2
$$

这一行是站内最长的公式,实测自然宽度约 610~640px(取决于字体加载),桌面视口下的正文列宽是 822px,放得下。窄屏时 `.katex-display` 的 `overflow-x` 是 `visible`,不会自带横向滚动条,长公式会直接顶出正文列。

### 9. 错误与容错

`head.html` 里设了 `throwOnError: false`,不同性质的错误表现完全不同,分两类看。

**(a) 定界符或花括号配对不上 —— 从它开始,同一个文本节点里的公式全部放弃。**

故意写坏的公式:$\frac{1}{2$ 结束,它后面这个 $\sqrt{9} = 3$ 也一起变成了字面文本。

这两个公式之间没有别的 HTML 元素,同处一个文本节点。原因在 `auto-render` 的 `findEndOfMath`:它在找闭合定界符时会数花括号,花括号不平衡就返回 `-1`,而主循环遇到 `-1` 是直接 `break` 的 —— 于是从这个坏公式往后,整个文本节点都不再渲染。这不是 Bug,是"宁可整段不渲染,也不要错位渲染"的取舍。

对照:故意写坏的公式:$\frac{1}{2$ 结束,但**这一条** $\sqrt{9} = 3$ 正常渲染了。

差别在于**它前面隔着一个 `<strong>` 元素**,已经属于下一个文本节点 —— 扫描是按文本节点独立进行的,前一个节点放弃不影响后一个。所以就出现了有点反直觉的现象:同一个段落里,前面写坏一个公式,后面隔着强调符的公式反而活着。

**(b) 配对完整但语法不合法 —— 只有它自己变红。**

前面 $\begin{align} a &= b \end{align}$ 这里写错了(行内不能用 `align`),后面这个 $\sqrt{9} = 3$ 照常渲染。

这种错误由 KaTeX 在渲染那一刻抛 `ParseError`,被 `throwOnError: false` 接住,原地渲染成红色错误文本,`title` 属性里带着真正的报错信息(鼠标悬停可见)。整页不会崩,后面的公式也不受影响。

### 10. 实测结果

在 1280×720 视口、JetBrains Mono 字体已加载的条件下测得:

| # | 测试项 | 实测 |
|---|---|---|
| 1 | 四种定界符 | 4/4 渲染,`$$` 与 `\[` 均为块级居中 |
| 2 | 分式、根式、上下标嵌套 | 正常,`2^{2^{2}}` 类多级嵌套不掉字符 |
| 3 | 大型算子 | 行内缩号、块级展开,`\sum` 上下限位置切换正确 |
| 4 | 表格单元格内公式 | 6/6 行渲染,单元格宽度随公式撑开 |
| 5 | 矩阵 / 行列式 / 分段 / `aligned` / `align` | 全部渲染,`&` 对齐符逐行生效 |
| 6 | 与中文混排 | 无多余空格,行高稳定 |
| 7 | `_` `*` `\` 不被 Markdown 吞 | 全部原样进入 KaTeX |
| 8 | 代码块 / 行内代码内公式 | 原样显示,未被渲染(符合预期) |
| 9 | 长公式 | 自然宽约 610–640px < 正文列 822px,不溢出 |
| 10 | 报错容错 | (a) 同文本节点整段放弃 (b) 单条变红,后续正常 |
| 11 | 货币美元符 | `\$` 转义无效,只有反引号安全 |

整页共 **9 个块级公式 + 33 个行内公式(42 处)**,其中 1 条是第 9 节故意写坏的红色报错,其余全部渲染成功,无控制台报错。

### 11. 已知限制 / 可选改进

- 窄屏(375px)下整个站点本来就会横向滚动(侧边栏宽度固定),公式再叠加一点溢出。若要让长公式自己在框内滚动,给 `posts.css` 加一条:

  ```css
  .post-content .katex-display { overflow-x: auto; overflow-y: hidden; }
  ```

- 行内公式里的中文字符会被 KaTeX 当数学排版,写"中英混排"的公式时要注意用 `\text{}` 包中文。
- KaTeX 覆盖的是 LaTeX 的数学子集:没有 `\usepackage`、没有自定义宏、没有 `\label`/`\ref` 交叉引用、没有 `\cite`。要引用公式编号只能手写在文字里。
