#!/usr/bin/env python3
import datetime
import json
import pathlib
import sqlite3
import sys

DB = pathlib.Path.home() / '.local/share/fcitx5/input-counter/stats.db'
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'data' / 'typing.json'
WEB = ROOT / 'static' / 'typing.json'
WEEKS = 26
THRESHOLDS = (200, 500, 1000)


def level(chars):
    if chars <= 0:
        return 0
    for i, t in enumerate(THRESHOLDS):
        if chars < t:
            return i + 1
    return len(THRESHOLDS) + 1


def load_daily():
    con = sqlite3.connect('file:{}?mode=ro'.format(DB), uri=True)
    try:
        rows = con.execute('select hour, chars from stats').fetchall()
    finally:
        con.close()
    daily = {}
    for hour, chars in rows:
        day = datetime.datetime.fromtimestamp(hour).strftime('%Y-%m-%d')
        daily[day] = daily.get(day, 0) + chars
    return daily


def main():
    if not DB.exists():
        sys.exit('未找到 fcitx5-input-counter 数据库: {}'.format(DB))

    daily = load_daily()
    today = datetime.date.today()
    last_sun = today - datetime.timedelta(days=(today.weekday() + 1) % 7)
    first_sun = last_sun - datetime.timedelta(days=(WEEKS - 1) * 7)

    weeks = []
    for w in range(WEEKS):
        col = []
        for d in range(7):
            day = first_sun + datetime.timedelta(days=w * 7 + d)
            if day > today:
                col.append(None)
            else:
                key = day.isoformat()
                chars = daily.get(key, 0)
                col.append({'d': key, 'c': chars, 'lv': level(chars)})
        weeks.append(col)

    groups = []
    last_month, start = None, 0
    for i, col in enumerate(weeks):
        first = next((x for x in col if x), None)
        month = int((first or col[-1])['d'][5:7])
        if month != last_month:
            if last_month is not None:
                groups.append((last_month, i - start))
            last_month, start = month, i
    groups.append((last_month, WEEKS - start))

    months = [
        {'label': '{}月'.format(m) if n >= 4 else '', 'span': n}
        for m, n in groups
    ]

    data = {
        'generated': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
        'total': sum(daily.values()),
        'weeks': weeks,
        'months': months,
    }

    payload = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(payload, encoding='utf-8')
    WEB.write_text(payload, encoding='utf-8')

    filled = sum(1 for col in weeks for x in col if x and x['c'] > 0)
    span = sum(1 for col in weeks for x in col if x)
    print('写入 {} 与 {}'.format(OUT.relative_to(ROOT), WEB.relative_to(ROOT)))
    print('窗口 {} 周 · {} 天有数据 · 累计 {} 字 · 生成于 {}'.format(
        WEEKS, filled, data['total'], data['generated']))


if __name__ == '__main__':
    main()
