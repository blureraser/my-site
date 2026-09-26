---
title: "GAMES103 HW1"
date: 2026-09-05
tags: ["godot", "graphics"]
summary: "godot中的课程GAMES103的作业一实现（不包括附加题）"
---
作业要求简单地说就是在unity中不使用unity自带物理引擎完成刚体运动学模拟，动力学模拟，碰撞检测和碰撞冲量处理。

但出于众所周知的原因我不想使用unity，于是godot成为了第一选择。成品效果如下：

{{< video src="games103-hw1" loop="true" caption="运行效果：刚体运动学模拟与碰撞冲量处理" >}}

---

### 一、刚体运动学

#### 1. 平动
刚体平动使用蛙跳积分，即 将速度（角速度）全部 _解释为_ 相邻两次位置更新中点的速度，这样在单位时间元足够小时，可以 _形式化的_ 消去加速度产生的位置偏移的二阶小。

但实际上算法本身相比朴素算法没有任何修正，后续在更新速度也没有要求在计算力时计入半个时间元的位置变化，所以相当于只是提了这样一个概念。

#### 2. 转动
理解起来更加棘手的是转动。

最直观的转动方式应当是 对三维物体每一个顶点相对质心的坐标与旋转矩阵相乘。对一般的三维旋转，只需要选取三个旋转轴，根据世界系角速度更新三个旋转角度，然后用三个二维旋转矩阵相乘即可，非常好。

那这么好的方法为什么不能直接用在物理模拟中呢？那就要提到一个深刻的拓扑学事实：
> 不存在没有奇点的三参数旋转参数化。

这句话是什么意思，我也不知道，但这实际使得世界系角速度对三个轴的角度分解在奇点不可能，这个方法也就无效了。

那物理引擎都是怎么表示刚体的三维旋转呢？答曰：四元数。

要理解四元数，就要从四元数定义开始，学四元数优美性质云云。不过在图形学的应用层面，可以简单地了解以下性质就可以：

首先，对于任意一个旋转操作，其轴单位方向向量为$n = (n_x,n_y, n_z)$，旋转角度为$\theta$（方向由右手法则规定），则四元数
$$q = (cos(\frac{\theta}{2}), sin(\frac{\theta}{2}) n_x, sin(\frac{\theta}{2}) n_y, sin(\frac{\theta}{2}) n_z)$$
就表示了这个旋转。并且定义它的共轭$q^{-1}$为：
$$q^{-1} = (cos(\frac{\theta}{2}), -sin(\frac{\theta}{2}) n_x, -sin(\frac{\theta}{2}) n_y, -sin(\frac{\theta}{2}) n_z)$$
在此基础上，如果想计算一个点$A = (x, y, z)$在经过这样的旋转操作后得到的$A' = (x', y', z')$，操作如下：
1. 定义纯四元数
$$q_A = (0, x, y, z)$$
2. 进行四元数计算，得到的结果也为纯四元数
$$q_{A'} = q * q_A * q^{-1}$$
3. 得到的四元数后三位即为A'坐标
$$q_{A'} = (0, x', y', z')$$
自然地，反过来一个单位四元数就可以表示一个旋转操作。那么若给定初态，刚体的三维旋转状态就可以由一个四元数表示。这种表示方法的好处还在于：对于每一个dt时间的旋转角度变化，可以通过四元数直接（半量）相加（再归一化）进行更新。

在Unity(Godot)中原生支持了四元数的旋转表示，让我们可以不用显式编写这些计算过程。这让旋转本身相当简单：
```C#
		Quaternion q = Quaternion;
		Quaternion dq = new Quaternion(0.5f * dt * w.X, 0.5f * dt * w.Y, 0.5f * dt * w.Z, 0f) * q;
		q = (q + dq).Normalized();

		Position = x;
		Quaternion = q;
```
注意这里Quaternion既是四元数类型名，也是挂载脚本的节点的四元数本身。w为世界坐标的刚体角速度。

---

### 二、刚体动力学
####1. 惯量张量

刚体角动量的定义（$x$ 为相对质心的位置，$\dot x = \omega\times x$）：
$$L = \int x\times \dot x\,dm = \int x\times(\omega\times x)\,dm$$
三重积展开$x\times(\omega\times x) = \left(|x|^2 E - xx^T\right)\omega$：
与$L = I\omega$比较，可以得到：
$$I = \int\left(|x|^2E - xx^T\right)dm$$
把物体当成"每个网格顶点一个等质量质点"来离散，就得到代码里用的参考惯量张量，当然这部分代码是课程作业中预设的不用自己编写：
$$I_{ref} = \sum_i m_i\left(|x_i|^2E - x_ix_i^T\right)$$
这是代码里的写法的来源：先给三个对角元加上 $m|x_i|^2$，再减去外积项 $m\,x_ix_i^T$（`I_ref[0,1] -= m*x*y` 等等）。

还有一个问题，顶点坐标是在物体空间里、以质心为原点取的，所以 $I_{ref}$ 是常量，只需要算一次、求一次逆。世界空间里的惯量张量随姿态变化，但变化方式很简单：把 $x = Rx_{ref}$ 代入定义（$|Rx|=|x|$、$Rxx^TR^T = (Rx)(Rx)^T$）并且Godot直接提供了这个Base矩阵：
$$I_{world} = RI_{ref}R^T, I_{world}^{-1} = RI_{ref}^{-1}R^T$$
对应了代码里的 `ba * (I_inv * (ba_inv * M))` 等。

#### 2. 碰撞过程

由于本例中并没有涉及到会产生力矩的力（空气阻力简单的由线性衰减表征，也没有处理墙壁接触的摩擦力），所以对旋转的动力学处理的讨论可以限制在对冲量的响应中。

更具体的，是要解决这样一个问题：给定刚体上的一个点$p$和冲量施加的方向$\hat{n}$，求要施加多大的冲量后会使刚体上这个点的速度在$n$上的分量为零。

首先有物理学定律（均为矢量矩阵计算式）：
$$\begin{gathered}
v_r = v + \omega \times r \\
\Delta p = p' - p = m(v' - v) = j \\
\Delta L = I(\omega' - \omega) = r \times j
\end{gathered}$$
其中$v_r$为刚体上p点速度，$j$为冲量，于是我们希望有：
$$v_r' \cdot \hat{n}= (v' + \omega' \times r) \cdot \hat{n} = -e (v_r\cdot \hat n)$$
首先带入运动定律可以得到$\Delta v_r = v_r' - v_r$与$j$的关系：
$$ \Delta v_r= (\frac{j}{m} + (I^{-1} r \times j) \times r)$$
其中$I^{-1}$为惯量矩阵的逆矩阵，若对任意矢量 $a=(a_x,a_y,a_z)$引入叉乘矩阵：
$$[a]_\times = \begin{pmatrix} 0 & -a_z & a_y \\ a_z & 0 & -a_x \\ -a_y & a_x & 0 \end{pmatrix}, \qquad [a]_\times b = a\times b, \qquad [a]_\times^T = -[a]_\times$$
就可以把上式化为纯矩阵运算：
$$\Delta v_r = \frac{j}{m} + (I^{-1}(r \times j)) \times r = \frac{j}{m} - r \times (I^{-1}[r]_\times j) = (\frac{1}{m}E - [r]_\times I^{-1}[r]_\times)j$$
其中$E$ 为单位矩阵。就能得到等效质量$K$ 
$$K = \frac{1}{m}E - [r]_\times I^{-1}[r]_\times$$
其物理含义是：在 $r$ 处施加一单位冲量，接触点的速度变化量。
于是代回，简化成：
$$\Delta v_r\cdot\hat n = \left(Kj\right)\cdot \hat n = j\,\hat n^T K\hat n = -(1+e)\left(v_r\cdot\hat n\right)$$

结论就是
$$j = -\,\frac{(1+e)(v_r\cdot \hat{n})}{\hat{n}^T K \hat n}$$

分母是一个可以直接展成标量的量。用 $[r]_\times\hat n = r\times\hat n$和三重积$\hat n\cdot(b\times r) = b\cdot(r\times\hat n)$得到最终计算式：
$$\hat n^T K \hat n = \frac{1}{m} + \left(r\times\hat n\right)^T I^{-1}\left(r\times\hat n\right) = \frac{1}{m} + \hat n \cdot \left[\left(I^{-1}(r\times\hat n)\right)\times r\right]$$
得到$j$后最终更新：
$$v' = v + \frac{j}{m}\hat n, \qquad \omega' = \omega + I^{-1}\left(r\times (j\hat n)\right)$$
至此最困难的部分完成。

---

### 三、其他讨论

结合sat碰撞检测就可以将这种方法扩展到物体之间，我们就应该可以赛博搭积木了（吗？）。于是我写了这个东西，目前美工全是占位符，也没有互动内容没有物体破坏：

{{< game src="bricks" ratio="4 / 3" caption="bricks: 2D 刚体堆叠演示" >}}

但是我们悲剧的发现堆的越高行为越奇怪，平均点这种处理方法引入了严重的滑移。

目前正在尝试使用另一种方法，只能先放出来了。
