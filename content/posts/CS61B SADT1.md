---
title: "CS61B 集合类抽象数据结构（一）"
date: 2026-10-07
tags: ["cpp", "algorithms", "java"]
summary: "CS61B学习笔记：BST，lab7"
---

集合类抽象数据结构这个部分在解决这样一个问题：**怎么处理键-值映射?** 我们希望找到一种通用且快速的方法。

具体地说，是如何快速实现接口`Map61B`：
```java
public interface Map61B<K, V> extends Iterable<K> {
    /** Removes all of the mappings from this map. */
    void clear();
    /* Returns true if this map contains a mapping for the specified key. */
    boolean containsKey(K key);
    /* Returns the value to which the specified key is mapped, or null if this
     * map contains no mapping for the key. */
    V get(K key);
    /* Returns the number of key-value mappings in this map. */
    int size();
    /* Associates the specified value with the specified key in this map. */
    void put(K key, V value);
    /* Returns a Set view of the keys contained in this map. */
    Set<K> keySet();
    /* Removes the mapping for the specified key from this map if present. */
    V remove(K key);
    /* Removes the entry for the specified key only if it is currently mapped to
     * the specified value. */
    V remove(K key, V value);

}
```
同时key值类型`K`可以通过调用`compareTo()`比较大小。

---

如果使用二叉搜索维护数组（或者说一整块连续的内存），通过key值查找可以是$O(log n)$但是插入由于挪动依然需要$O(n)$，这样不得不用到链式结构优化插入。问题就变成了如何在链式结构上实现仍为$O(log n)$的二分查找。

二叉搜索树给出了最直接的方案：用树储存数据，建树插入时保证左儿子 < 自己 < 右儿子，这样就可以保证左子树均小于自身且右子树均大于自身，也就保证了二分搜索和无损插入同时可行。

下面是完成了包括删除的完整 BST 的操作个人实现，给出了lab7的完整代码：
```java
package bstmap;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Objects;
import java.util.Set;

public class BSTMap<K extends Comparable<K>, V> implements Map61B<K, V> {

    private class BSTNode {

        K key;
        V val;
        BSTNode lSon, rSon;
        BSTNode(K k, V v, BSTNode lS, BSTNode rS) {
            key = k;
            val = v;
            rSon = rS;
            lSon = lS;
        }
    }

    private BSTNode root;

    private int size = 0;

    @Override
    public void clear() {
        size = 0;
        root = null;
    }

    private BSTNode find(K key, BSTNode t) {
        if(t == null) return null;
        int cmp = key.compareTo(t.key);
        if(cmp < 0) return find(key, t.lSon);
        if(cmp > 0) return find(key, t.rSon);
        return t;
    }

    @Override
    public V get(K key) {
        BSTNode res = find(key, root);
        return res == null ? null : res.val;
    }

    @Override
    public int size() { return size; }

    @Override
    public boolean containsKey(K key) {
        BSTNode res = find(key, root);
        return res != null;
    }

    private void put(K key, V value, BSTNode t, BSTNode fa, boolean lOrr) {
        if(size == 0) {size++; root = new BSTNode(key, value, null, null); return;}
        if(t == null) {
            size++;
            t = new BSTNode(key, value, null, null);
            if(lOrr) fa.lSon = t;
            else fa.rSon = t;
            return;
        }
        int cmp = key.compareTo(t.key);
        if(cmp < 0) put(key, value, t.lSon, t, true);
        else if(cmp > 0) put(key, value, t.rSon, t, false);
        else t.val = value;
    }
    @Override
    public void put(K key, V value) {
        put(key, value, root, null, false);
    }

    private BSTNode delete(K key, BSTNode t) {
        if (t == null) {
            return null;
        }
        int cmp = key.compareTo(t.key);
        if (cmp < 0) {
            t.lSon = delete(key, t.lSon);
        } else if (cmp > 0) {
            t.rSon = delete(key, t.rSon);
        } else if (t.lSon == null) {
            return t.rSon;
        } else if (t.rSon == null) {
            return t.lSon;
        } else {
            BSTNode succ = t.rSon;
            while (succ.lSon != null) {
                succ = succ.lSon;
            }
            t.key = succ.key;
            t.val = succ.val;
            t.rSon = delete(succ.key, t.rSon);
        }
        return t;
    }

    @Override
    public V remove(K key) {
        BSTNode target = find(key, root);
        if (target == null) {
            return null;
        }
        V old = target.val;
        root = delete(key, root);
        size -= 1;
        return old;
    }

    @Override
    public V remove(K key, V value) {
        BSTNode target = find(key, root);
        if (target == null || !Objects.equals(target.val, value)) {
            return null;
        }
        return remove(key);
    }

    @Override
    public Iterator<K> iterator() { throw new UnsupportedOperationException(); }


    private void keySet(BSTNode t, Set<K> res) {
        if(t == null) return;
        res.add(t.key);
        keySet(t.lSon, res);
        keySet(t.rSon, res);
    }
    @Override
    public Set<K> keySet() {
        Set<K> res = new HashSet<K>();
        keySet(root, res);
        return res;
    }

    private void printInOrder(BSTNode t) {
        if(t == null) {
            return;
        }
        printInOrder(t.lSon);
        System.out.println(t.val);
        printInOrder(t.rSon);
    }

    public void printInOrder() {
        printInOrder(root);
    }
}

```
写 remove 的时候发现 put 可以重构优化（我真的应该这么做，或者干脆全拿循环写一遍），但是我懒… …爆栈肯定是因为 java 没有 -O2 优化而不是我写的太石山了（逃。

虽然我的代码质量是石但是还是想吐槽， java 是不是太过度设计了，简单的操作因为对抽象的过度追求而变成了一堆 API 调用和语法堆砌。也有可能是c让人讨厌Class封装了。

---

lab 贴心的准备了和纯链表对比的计时测试，然后我们悲剧地发现BST在顺序插入建树时会退化为链表，即使是在相当符合实际情况的随机插入建树测试中复杂度也来到了$O(\sqrt{n})$，和最优的$O(log n)$相去甚远。本质原因在于树最终的形态过于依赖插入顺序了，是纯概率问题。为了解决这个问题，课程引入了[B树和红黑树]({{< relref "posts/CS61B SADT2.md" >}})

