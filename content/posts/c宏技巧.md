---
title: "C中的宏trick"
date: 2026-10-13
tags: ["cpp", "algorithms", "java"]
summary: "C中的宏trick: 难道真的不需要template"
---

我在玩 raylib 的时候写下了这样的代码：
```c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "raylib.h"
    ... skip
//----- struct Button -----
    ... skip
//----- struct textBox -----
char temp[MAX_TEXTBOX];
typedef void (*Formatter)(char* skeleton, void *value);

void formatInt(char* skeleton, void *value) {
    int n = *(int *)value;
    snprintf(temp, MAX_TEXTBOX, skeleton, n);
}

    ... skip

void formatRect(char* skeleton, void *value) {
    Rectangle rc = *(Rectangle*)value;
    snprintf(temp, MAX_TEXTBOX, skeleton, rc.x, rc.y, rc.width, rc.height);
}

typedef struct{
    char text[MAX_TEXTBOX];
    char* skeleton;
    Vector2 position;
    int size;
    Color col;

    void *valuePtr;
    Formatter formatter;
} textBox;

textBox textBoxs[linesCount];
int textBoxCount = 0;
int defaultSize = lineH * 0.7;

bool addtextBox(int line, char* skeleton, void* valuePtr, Color col, Formatter fmtr) {
    if(lineIsUsed[line]) {
        return false;
    }
  
    lineIsUsed[line] = true;
    textBoxs[textBoxCount++] = (textBox) {
        .position = (Vector2) { displayW, line * lineH},
        .skeleton = skeleton,
        .valuePtr = valuePtr,
        .formatter = fmtr,
        .size = defaultSize,
        .col = col,
    };
    return true;
}
void updateTextBoxs() {
    for(int i = 0; i < textBoxCount; i++) {
        textBox* t = &textBoxs[i];
        t->formatter(t->skeleton, t->valuePtr);
        strcpy(t->text, temp);
    }
}
void drawTextBoxs() {
    for(int i = 0; i < textBoxCount; i++) {
        textBox* t = &textBoxs[i];
        DrawText(t->text, t->position.x, t->position.y, t->size, t->col);
    }
}

//----- main -----

int main(void) {
    InitWindow(screenW, screenH, "work table: a simple window");
    SetTargetFPS(FPS);

    int number1 = 0;
  
    addButton((Vector2){240, 60}, "NiHao", 0);
    addtextBox(1, "number1: %d", &number1, BLACK, formatInt);

    while(!WindowShouldClose()) {

        number1++;

        updateButtons();
        updateTextBoxs();

        BeginDrawing();
        ClearBackground(RAYWHITE);

        DrawLine(displayW, 0, displayW, screenH, BLACK);
    
        drawButtons();
        drawTextBoxs();
    
        EndDrawing();
    }

    CloseWindow();
  
    return 0;
}

```

Button和TextBox两个控件类型都分别是一个结构体，由`add`函数增加实例，`update`函数刷新所有该类型控件成员，`draw`函数绘制所有该类型控件。我希望 TextBox 实现自动跟随变量内容，但是c既没有java那样的所有类型都可以调用的`to_string()`，也没有cpp那样的泛型，从而不得不使用函数指针为每一个示例指定一个`formatter`函数，这样每一种类型我都要重写一个简单的`formatter`，当然优雅欠佳但是起码完成了需求。

结果写完这段代码当天晚上(10-11)我就看到了 Tsoding 的这个视频[Insane Shadow Data Trick in C](https://www.youtube.com/watch?v=gtk3RZHwJUA)，视频中使用古老而且惊人的宏技巧实现了支持任意类型的可变长度数组，其中使用的指针移动方式和`do while(0)`这样的 trick 让蒟蒻叹为观止（实在应该单开一篇帖子，但是 Tsoding 讲的已经相当好了）。代码如下：

```c
#include <stdlib.h>
#include <stdio.h>

typedef struct {
    size_t count;
    size_t capacity;
} Header;

#define ARR_INIT_CAPACITY 1

#define arr_push(arr, x)                                                \
    do {                                                                \
        if (arr == NULL) {                                              \
            Header *header = malloc(sizeof(*arr)*ARR_INIT_CAPACITY+sizeof(Header)); \
            header->count = 0;                                          \
            header->capacity = ARR_INIT_CAPACITY;                       \
            arr = (void*)(header + 1);                                  \
        }                                                               \
        Header *header = (Header*)(arr) - 1;                            \
        if (header->count >= header->capacity) {                        \
            header->capacity *= 2;                                      \
            header = realloc(header, sizeof(*arr)*header->capacity+sizeof(Header)); \
            arr = (void*)(header + 1);                                  \
        }                                                               \
        (arr)[header->count++] = (x);                                   \
    } while(0)

#define arr_len(arr) ((Header*)(arr) - 1)->count

#define arr_free(arr) free((Header*)(arr) - 1)

int main() {
    float *numbers = NULL;
    arr_push(numbers, 69);
    return 0;
}

```

于是我开始考虑用宏重写`updateTextBoxs`应当可以达到效果，并且不能只满足于将`format`函数定义转换成宏语句。

我第一想法是用宏定义函数并直接返回函数指针，这样就抽象掉了函数名，直接在`add`时调用宏，大概像这样：
```c
#define format(typeV)                                       \
    ({                                                      \
        void formatP(char* skeleton, void* value) {         \
            typeV v = *(typeV*) value;                      \
            snprintf(temp, MAX_TEXTBOX, skeleton, v);       \
        }                                                   \
        formatP;                                            \
    })

    ... skip

    addtextBox(1, "number1: %d", &number1, BLACK, format(int));
```
最后还不得不引入了GNU C的\{\}表达式才完成工作。另外，这样的函数定义会有安全隐患，不能在局部作用域进行这样的`addtextBox`。但无论怎么说，也是通过三个参数（格式化字符串，指针，format(TYPE)）对一个变量的追踪。




