# STYLE GUIDE
## Ресторан "У Ратуши"

**Версия:** 1.0  
**Дата:** 04.04.2026

---

## СОДЕРЖАНИЕ

1. Цвета
2. Типографика
3. Кнопки
4. Поля ввода
5. Карточки
6. Столики на карте
7. Модальные окна
8. Уведомления
9. Переключатель зон
10. Иконки
11. Отступы и сетка
12. Анимации

---

## 1. ЦВЕТА

### Основная палитра

```
██████  #8B5A2B  Primary (Основной коричневый)
██████  #6B4423  Primary Dark
██████  #C4956A  Primary Light
██████  #D4AF37  Accent Gold (Золотой)
██████  #2E7D32  Secondary (Зелёный)
```

### Статусы

```
██████  #43A047  Success / Доступно
██████  #F9A825  Warning / Ожидает
██████  #C62828  Danger / Занято
██████  #78909C  Maintenance / Ремонт
```

### Нейтральные

```
██████  #FAF7F2  Background (Основной фон)
██████  #FFFFFF  Surface (Карточки)
██████  #2D2A26  Text Primary
██████  #6B6560  Text Secondary
██████  #9E9891  Text Muted
██████  #E8E0D5  Border
```

---

## 2. ТИПОГРАФИКА

### Шрифты

```
ЗАГОЛОВКИ: Playfair Display, Georgia, serif

ОСНОВНОЙ ТЕКСТ: Inter, -apple-system, BlinkMacSystemFont, sans-serif

Примеры заголовков:

┌─────────────────────────────────────┐
│ H1 — Заголовок страницы             │
│ Playfair Display • 36px • Bold      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ H2 — Заголовок секции               │
│ Playfair Display • 28px • SemiBold  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ H3 — Заголовок карточки             │
│ Inter • 22px • SemiBold             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Body — Основной текст               │
│ Inter • 16px • Regular              │
│ Линия 1.6 для оптимальной           │
│ читаемости длинных текстов          │
└─────────────────────────────────────┘
```

---

## 3. КНОПКИ

### Primary Button

```
┌─────────────────────────────────────────┐
│                                         │
│         ЗАБРОНИРОВАТЬ                   │
│                                         │
│  Background: #8B5A2B                    │
│  Text: #FFFFFF                          │
│  Padding: 14px 28px                     │
│  Border-radius: 8px                     │
│  Font: Inter 16px SemiBold              │
│                                         │
│  Hover: Background → #6B4423            │
│         Transform: translateY(-2px)     │
│         Shadow: 0 4px 12px rgba(0,0,0,0.15)
│                                         │
│  Active: Transform → translateY(0)       │
│          Shadow → меньше                │
│                                         │
│  Disabled: Opacity 0.5                  │
│           Cursor: not-allowed           │
│                                         │
└─────────────────────────────────────────┘
```

### Secondary Button

```
┌─────────────────────────────────────────┐
│                                         │
│           Войти                         │
│                                         │
│  Background: transparent                │
│  Border: 2px solid #8B5A2B             │
│  Text: #8B5A2B                          │
│                                         │
│  Hover: Background → #8B5A2B           │
│         Text → #FFFFFF                 │
│                                         │
└─────────────────────────────────────────┘
```

### Ghost Button

```
┌─────────────────────────────────────────┐
│                                         │
│     Отменить                            │
│                                         │
│  Background: transparent                │
│  Text: #6B6560                          │
│                                         │
│  Hover: Text → #8B5A2B                 │
│                                         │
└─────────────────────────────────────────┘
```

### Icon Button

```
┌───┐
│ ← │   Size: 44x44px
└───┘   Border-radius: 50%
        Min touch target: 44px
```

---

## 4. ПОЛЯ ВВОДА

### Text Input

```
┌─────────────────────────────────────────┐
│                                         │
│  Имя                                    │  ← Label (14px, #6B6560)
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Алексей                          │   │  ← Input field
│  └─────────────────────────────────┘   │
│                                         │
│  Border: 2px solid #E8E0D5             │
│  Border-radius: 8px                     │
│  Padding: 14px 16px                     │
│  Font: Inter 16px                       │
│                                         │
│  Focus: Border → #8B5A2B               │
│         Shadow: 0 0 0 4px              │
│               rgba(139,90,43,0.1)       │
│                                         │
└─────────────────────────────────────────┘
```

### Select

```
┌─────────────────────────────────────────┐
│                                         │
│  Длительность                            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 3 часа                          ▼│   │  ← Arrow icon
│  └─────────────────────────────────┘   │
│                                         │
│  Same styles as text input              │
│                                         │
└─────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────┐
│                                         │
│  Email                                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ invalid-email                   │   │  ← Red border
│  └─────────────────────────────────┘   │
│                                         │
│  Введите корректный email              │  ← Error message (13px, #C62828)
│                                         │
│  Border: 2px solid #C62828             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. КАРТОЧКИ

### Базовый Card

```
┌─────────────────────────────────────────┐
│ ╭─────────────────────────────────────╮ │
│ │                                     │ │
│ │           CONTENT                    │ │
│ │                                     │ │
│ │  Background: #FFFFFF               │ │
│ │  Border-radius: 12px               │ │
│ │  Padding: 24px                      │ │
│ │  Shadow: 0 2px 8px rgba(0,0,0,0.06) │ │
│ │                                     │ │
│ │  Hover: Shadow → 0 8px 24px         │ │
│ │               rgba(0,0,0,0.1)       │ │
│ │         Transform → translateY(-4px)│ │
│ │                                     │ │
│ ╰─────────────────────────────────────╯ │
└─────────────────────────────────────────┘
```

### Elevated Card

```
┌─────────────────────────────────────────┐
│ ╭─────────────────────────────────────╮ │
│ │                                     │ │
│ │           CONTENT                    │ │
│ │                                     │ │
│ │  Shadow: 0 4px 16px rgba(0,0,0,0.1) │ │
│ │                                     │ │
│ ╰─────────────────────────────────────╯ │
└─────────────────────────────────────────┘
```

### Bordered Card

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │           CONTENT                    │ │
│ │                                     │ │
│ │  Border: 1px solid #E8E0D5          │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 6. СТОЛИКИ НА КАРТЕ

### Круглый столик (6+ мест)

```
        ╭──────╮
       ╱  🪑   ╲       Size: 64x64px
      │   5    │      Border-radius: 50%
       ╲      ╱       Font: Inter 18px Bold
        ╰────╯       Text: #FFFFFF
     Свободно 4м

  Available:
  Background: linear-gradient(135deg, #43A047, #66BB6A)
  Shadow: 0 4px 12px rgba(67, 160, 71, 0.3)

  Pending:
  Background: linear-gradient(135deg, #F9A825, #FDD835)
  Animation: pulse 2s infinite
  Shadow: 0 4px 12px rgba(249, 168, 37, 0.3)

  Occupied:
  Background: linear-gradient(135deg, #C62828, #EF5350)
  Shadow: 0 4px 12px rgba(198, 40, 40, 0.3)

  Maintenance:
  Background: linear-gradient(135deg, #78909C, #90A4AE)
  Shadow: 0 4px 12px rgba(120, 144, 156, 0.3)

  Hover (all):
  Transform: scale(1.15)
  Z-index: 20
```

### Прямоугольный столик (2-4 места)

```
  ┌──────────────┐
  │      3       │     Size: 80x48px
  └──────────────┘     Border-radius: 8px
   Свободно 2м         Font: Inter 16px Bold

  Same color states as round table
```

### Legend

```
┌─────────────────────────────────────────┐
│  🟢 Свободно   🟡 Ожидает   🔴 Занято   │
│  ⚪ На ремонте                         │
│                                         │
│  Background: #F5F0E8                    │
│  Padding: 12px 16px                     │
│  Border-radius: 8px                     │
└─────────────────────────────────────────┘
```

---

## 7. МОДАЛЬНЫЕ ОКНА

### Overlay

```
┌─────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░╭─────────────────────────╮░░░░░│
│░░░░░░░░│         HEADER          │░░░░░│
│░░░░░░░░│                         │░░░░░│
│░░░░░░░░│         CONTENT          │░░░░░│
│░░░░░░░░│                         │░░░░░│
│░░░░░░░░│         FOOTER          │░░░░░│
│░░░░░░░░╰─────────────────────────╯░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│

  Overlay: rgba(0, 0, 0, 0.5)
  Animation: fadeIn 200ms
```

### Modal Content

```
╭─────────────────────────────────────╮
│  БРОНИРОВАНИЕ СТОЛИКА           ✕  │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Столик №5 • 6 мест                 │
│  📅 04.04.2026 • ⏰ 19:00           │  ← Info block
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Имя                          │   │
│  └─────────────────────────────┘   │  ← Form fields
│  ┌─────────────────────────────┐   │
│  │ Телефон                      │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│           [ЗАБРОНИРОВАТЬ]           │  ← Primary button
╰─────────────────────────────────────╯

  Background: #FFFFFF
  Max-width: 480px
  Border-radius: 16px
  Animation: slideUp 300ms
  Shadow: 0 25px 50px rgba(0, 0, 0, 0.15)
```

### Close Button

```
  ✕                                    Size: 32x32px
                                       Border-radius: 8px
  Color: #9E9891                      
  Hover: Background → #F5F0E8
         Color → #6B6560
```

---

## 8. УВЕДОМЛЕНИЯ (TOAST)

```
┌─────────────────────────────────────────┐
│ ✓  Бронирование создано!                │
└─────────────────────────────────────────┘

  Position: bottom-right (24px, 24px)
  Background: #43A047 (success)
  Color: #FFFFFF
  Padding: 16px 24px
  Border-radius: 12px
  Shadow: 0 8px 24px rgba(0, 0, 0, 0.2)
  Gap: 12px (icon + text)
  Animation: slideIn 300ms

  Variants:
  ┌─────────────────────────────────────────┐
  │ ✓  Success — #43A047                   │
  │ ✗  Error — #C62828                      │
  │ ℹ  Info — #1976D2                      │
  │ ⚠  Warning — #F9A825                  │
  └─────────────────────────────────────────┘
```

---

## 9. ПЕРЕКЛЮЧАТЕЛЬ ЗОН

```
┌─────────────────────────────────────────┐
│                                         │
│    ◀   │  ОСНОВНОЙ ЗАЛ  │   ▶          │
│         ╰─────────────────╯
│
│  Container:
│  Background: #FFFFFF
│  Padding: 16px 24px
│  Border-radius: 12px
│  Shadow: 0 2px 8px rgba(0,0,0,0.06)
│
│  Title:
│  Font: Playfair Display 20px SemiBold
│  Color: #2D2A26
│  Min-width: 180px
│  Text-align: center
│
│  Nav Buttons:
│  Size: 48x48px
│  Border-radius: 50%
│  Background: #8B5A2B
│  Color: #FFFFFF
│  Hover: Background → #6B4423
│         Transform: scale(1.1)
│  Active: Transform: scale(0.95)
│
└─────────────────────────────────────────┘
```

---

## 10. ИКОНКИ

### Используемые иконки (Font Awesome 6)

```
Навигация:
🏠  fa-house              📅  fa-calendar
👤  fa-user               📍  fa-map-marker

Столы и ресторан:
🪑  fa-chair              🍽️  fa-utensils
🥂  fa-champagne-glasses  🍷  fa-wine-glass

Статусы:
✓  fa-check-circle        ✗  fa-xmark-circle
⏰  fa-clock               ⚠  fa-exclamation-circle
🏁  fa-flag-checkered

Зоны:
🚪  fa-door-open           🪟  fa-window-frame
🔥  fa-fire-flame-curved   💿  fa-disc-drive

Действия:
➕  fa-plus                ➖  fa-minus
🗑️  fa-trash-can           ✏️  fa-pencil
⬅️  fa-arrow-left          ➡️  fa-arrow-right

Контакты:
📞  fa-phone               ✉️  fa-envelope
📷  fa-instagram           f   fa-facebook
```

### Размеры иконок

```
Icon XS:   12px  — внутри текста
Icon SM:   16px  — в кнопках
Icon MD:   20px  — в карточках
Icon LG:   24px  — навигация
Icon XL:   32px  — empty states
Icon 2XL:  48px  — декоративные
```

---

## 11. ОТСТУПЫ И СЕТКА

### Система отступов (8px grid)

```
space-1:   4px   — между иконками
space-2:   8px   — tight spacing
space-3:   12px  — внутри компонентов
space-4:   16px  — card padding
space-5:   20px  — между секциями
space-6:   24px  — container padding
space-8:   32px  — большие gaps
space-10:  40px  — page sections
space-12:  48px  — hero spacing
```

### Пример использования

```
┌─────────────────────────────────────────┐
│                                         │
│  Section                                │  ← space-10 сверху
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Card                             │   │
│  │                                   │   │
│  │  ┌─────────────────────────────┐ │   │  ← space-4 padding
│  │  │ Inner content               │ │   │
│  │  │                              │ │   │
│  │  └─────────────────────────────┘ │   │
│  │                                   │   │
│  │  ┌─────────────────────────────┐ │   │
│  │  │ Another element    [Button] │ │   │  ← space-3 между
│  │  └─────────────────────────────┘ │   │
│  │                                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │  ← space-6 между карточками
│  │ Card                             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Скругления

```
radius-sm:  4px   — badges, tags
radius-md:  8px   — buttons, inputs
radius-lg:  12px  — cards
radius-xl:  16px  — modals
radius-2xl: 24px  — крупные карточки
radius-full: 9999px — pills, avatars
```

---

## 12. АНИМАЦИИ

### Тайминги

```
Fast:    100ms  — hover states
Normal:  200ms  — UI transitions
Slow:    300ms  — page elements
Slower:  400ms  — modals
Slowest: 500ms  — complex animations
```

### И easing функции

```
Default:  cubic-bezier(0.4, 0, 0.2, 1)
          ───────────────────────────
          Идеально для большинства UI

Ease-in:  cubic-bezier(0.4, 0, 1, 1)
          ───────────────────────────
          Элементы уходят вверх/вниз

Ease-out: cubic-bezier(0, 0, 0.2, 1)
          ───────────────────────────
          Элементы появляются

Bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
          ───────────────────────────
          Для playful элементов
```

### Анимации появления

```
Fade In:
  from { opacity: 0; }
  to   { opacity: 1; }

Slide Up:
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }

Scale In:
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
```

### Специальные анимации

```
Pulse (Pending tables):
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(249, 168, 37, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 15px rgba(249, 168, 37, 0);
  }

Flicker (Candles):
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.05); }

Disco Spin (Dancefloor):
  0%   { transform: translateX(-50%) rotate(0deg); }
  100% { transform: translateX(-50%) rotate(360deg); }
```

### Hover эффекты

```
Buttons:
  Hover: translateY(-2px), box-shadow
  Active: translateY(0)

Cards:
  Hover: translateY(-4px), shadow-lg

Tables:
  Hover: scale(1.15), z-index: 20
```

---

## ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ

### Форма бронирования

```
┌─────────────────────────────────────────┐
│  БРОНИРОВАНИЕ СТОЛИКА               ✕  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Столик №5 • 6 мест              │   │
│  │ 📅 04.04.2026 • ⏰ 19:00        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Имя                              │   │
│  │ [________________________]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Телефон                          │   │
│  │ [________________________]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Длительность                     │   │
│  │ [3 часа                      ▼] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Пожелания                        │   │
│  │ [________________________]      │   │
│  │ [________________________]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      ЗАБРОНИРОВАТЬ               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💰 +50 бонусов за бронирование        │
│                                         │
└─────────────────────────────────────────┘
```

### Карточка бронирования

```
┌─────────────────────────────────────────┐
│                                         │
│  📅 05.04.2026   ⏰ 19:00               │
│                                         │
│  Столик №3 • Основной зал               │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│         🟡 Ожидает подтверждения        │
│                                         │
│  ────────────────────────────────────   │
│                                         │
│  [Отменить]              [Подробнее →]  │
│                                         │
└─────────────────────────────────────────┘

  Background: #FFFFFF
  Border-radius: 12px
  Padding: 20px
  Shadow: 0 2px 8px rgba(0,0,0,0.06)
  Hover: transform: translateY(-2px)
         shadow: 0 8px 24px rgba(0,0,0,0.1)
```

---

*Style Guide v1.0 — Ресторан "У Ратуши"*
