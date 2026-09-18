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

行内:$\frac{a+b}{c-d}$、$\dfrac{1}{1+\frac{1}{x}}$、$\sqrt{2}$、$\sqrt[3]{x+y}$、$x_i^2$ 、$a_{i,j}^{n+1}$ 、$2^{2^{2}}$。

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


$$
\begin{aligned}
(a+b)^2 &= (a+b)(a+b) \\
        &= a^2 + ab + ba + b^2 \\
        &= a^2 + 2ab + b^2
\end{aligned}
$$

$$
\begin{align}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{align}
$$

```text
块级代码里的公式:
$$ \sum_{i=1}^{n} i $$     ← 应原样显示,不被 KaTeX 处理
```


### 6. 长公式与溢出

$$
J(\theta) = -\frac{1}{m} \left[ \sum_{i=1}^{m} y^{(i)} \log h_\theta (x^{(i)}) + \left( 1 - y^{(i)} \right) \log \left( 1 - h_\theta (x^{(i)}) \right) \right] + \frac{\lambda}{2m} \sum_{j=1}^{n} \theta_j^2
$$

### 视频内容测试

{{< video src="games103-hw1" loop="true" caption="运行效果：刚体运动学模拟与碰撞冲量处理" >}}


