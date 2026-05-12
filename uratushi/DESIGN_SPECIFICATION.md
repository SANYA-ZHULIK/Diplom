# DESIGN SPECIFICATION
## Ресторан "У Ратуши" — Система бронирования столиков

**Версия:** 1.0  
**Дата:** 04.04.2026  
**Статус:** Готов к передаче в разработку

---

# РАЗДЕЛ 1. ВВЕДЕНИЕ

## 1.1 Описание проекта

**Название:** "У Ратуши" — Интерактивная система бронирования столиков

**Тип продукта:** Веб-приложение (SPA) для ресторана

**Краткое описание:** Современная система онлайн-бронирования столиков с интерактивной картой зала, поддержкой нескольких зон, системой лояльности и администрирования.

## 1.2 Цель проекта

Создание интуитивной, визуально привлекательной системы бронирования, которая:
- Повышает конверсию бронирований на 40%
- Сокращает время бронирования до 2 минут
- Увеличивает узнаваемость бренда
- Снижает нагрузку на персонал ресторана

## 1.3 Целевая аудитория

| Сегмент | Возраст | Описание | Потребности |
|---------|---------|----------|-------------|
| Основной | 25-45 | Активные горожане | Быстрое бронирование, мобильный UX |
| Вторичный | 45-60 | Семейные пары | Простота, понятный интерфейс |
| Корпоративный | 30-50 | Бизнес-клиенты | Конфиденциальность, особые запросы |

## 1.4 Ценностное предложение

**Для гостей:**
- Бронирование за 2 клика
- Визуальный выбор столика на карте зала
- Мгновенное подтверждение
- Бонусная программа

**Для ресторана:**
- Оптимизация загрузки столиков
- Снижение неявок на 30%
- Аналитика бронирований
- Автоматизация коммуникаций

## 1.5 Бизнес-метрики

| Метрика | Текущее | Целевое |
|---------|---------|---------|
| Конверсия бронирований | — | 40% |
| Время бронирования | — | < 2 мин |
| Неявки | — | < 10% |
| NPS | — | > 70 |
| Загрузка зала (пик) | — | 85% |

---

# РАЗДЕЛ 2. БРЕНДИНГ И СТИЛЬ

## 2.1 Бренд-концепция

**Позиционирование:** Уютный ресторан европейской кухни с вековой историей

**Слоган:** "У Ратуши — где каждый вечер особенный"

**Тон коммуникации:** Тёплый, гостеприимный, немного formal-casual

## 2.2 Логотип

```
[Иконка ратуши] + "У Ратуши"
```

**Варианты:**
- Горизонтальный (для header)
- Компактный (для favicon, мобильный)
- Чёрный/белый (для печати)

## 2.3 Цветовая палитра

### Основная палитра

| Имя | HEX | RGB | HSL | Применение |
|-----|-----|-----|-----|------------|
| Primary | `#8B5A2B` | 139, 90, 43 | 25°, 53%, 36% | Основные кнопки, заголовки |
| Primary Dark | `#6B4423` | 107, 68, 35 | 25°, 51%, 28% | Hover состояния |
| Primary Light | `#C4956A` | 196, 149, 106 | 27°, 43%, 59% | Акценты |
| Secondary | `#2E7D32` | 46, 125, 50 | 122°, 46%, 34% | Успешные действия |
| Accent Gold | `#D4AF37` | 212, 175, 55 | 46°, 65%, 52% | Премиум элементы |

### Семантические цвета

| Имя | HEX | Применение |
|-----|-----|------------|
| Success | `#43A047` | Свободные столики, успех |
| Warning | `#F9A825` | Ожидание, внимание |
| Danger | `#C62828` | Занятые, ошибки |
| Info | `#1976D2` | Информация |

### Нейтральные

| Имя | HEX | Применение |
|-----|-----|------------|
| Background | `#FAF7F2` | Основной фон |
| Surface | `#FFFFFF` | Карточки, модалки |
| Border | `#E8E0D5` | Границы |
| Text Primary | `#2D2A26` | Основной текст |
| Text Secondary | `#6B6560` | Вторичный текст |
| Text Muted | `#9E9891` | Плейсхолдеры |

### Тёмная тема (опционально)

| Имя | HEX | Применение |
|-----|-----|------------|
| Background Dark | `#1A1816` | Фон |
| Surface Dark | `#2D2A26` | Карточки |
| Text Dark | `#F5F0E8` | Текст |

## 2.4 Типографика

### Семейства шрифтов

```css
--font-heading: 'Playfair Display', Georgia, serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Шкала типографики

| Токен | Размер | Вес | Line-height | Letter-spacing | Применение |
|-------|--------|-----|-------------|---------------|------------|
| display | 48px | 700 | 1.1 | -0.02em | Hero заголовки |
| h1 | 36px | 700 | 1.2 | -0.01em | Страницы |
| h2 | 28px | 600 | 1.25 | 0 | Секции |
| h3 | 22px | 600 | 1.3 | 0 | Карточки |
| h4 | 18px | 600 | 1.4 | 0 | Элементы |
| body-lg | 18px | 400 | 1.6 | 0 | Основной текст |
| body | 16px | 400 | 1.6 | 0 | Текст интерфейса |
| body-sm | 14px | 400 | 1.5 | 0 | Подписи |
| caption | 12px | 500 | 1.4 | 0.02em | Метки |
| overline | 11px | 600 | 1.2 | 0.08em | Капслолд метки |

### Правила типографики

```
1. Заголовки: Playfair Display, serif
2. Интерфейс: Inter, sans-serif
3. Минимум 16px для body text
4. Line-height >= 1.5 для читаемости
5. Контраст текста >= 4.5:1
```

## 2.5 Иконографика

### Набор иконок

**Основной:** Font Awesome 6 Pro (или Solid)

| Категория | Иконки |
|-----------|--------|
| Навигация | home, user, calendar, map-marker |
| Столики | chair, utensils, glass-water, wine-glass |
| Статусы | check-circle, clock, xmark-circle, exclamation-circle |
| Зоны | door-open, window-frame, music, flame |
| Действия | plus, minus, trash, pencil, arrow-left, arrow-right |
| Социальные | phone, envelope, instagram, facebook |

### Размеры иконок

| Токен | Размер | Применение |
|-------|--------|------------|
| icon-xs | 12px | В тексте |
| icon-sm | 16px | Кнопки |
| icon-md | 20px | Карточки |
| icon-lg | 24px | Навигация |
| icon-xl | 32px | Empty states |
| icon-2xl | 48px | Hero |

### Правила использования иконок

```
1. Всегда использовать один набор (FA6)
2. Только solid вариант
3. Минимальный клик-таргет 44x44px
4. Контраст с фоном >= 3:1
```

## 2.6 Анимация и иллюстрации

### Визуальный стиль

**Основной:** Мягкие тени, скруглённые углы (8-16px), subtle градиенты

**Иллюстрации:** Flat design с минимальными деталями, тёплая цветовая гамма

### Анимационные принципы

| Принцип | Описание |
|---------|---------|
| Мягкость | ease-out для появления, ease-in-out для трансформаций |
| Быстрота | 150-300ms для UI, 400-600ms для страниц |
| Направленность | Fade + slide в направлении действия |
| Обратная связь | Мгновенный отклик на hover (100ms) |

## 2.7 Пространственная система

### Сетка

```
Columns: 12
Gutter: 24px
Margin: 24px (desktop), 16px (mobile)
Max-width: 1280px
```

### Пространственные токены

| Токен | Значение | Применение |
|-------|----------|------------|
| space-1 | 4px | Иконки, inline |
| space-2 | 8px | Tight spacing |
| space-3 | 12px | Компоненты |
| space-4 | 16px | Card padding |
| space-5 | 20px | Sections |
| space-6 | 24px | Containers |
| space-8 | 32px | Large gaps |
| space-10 | 40px | Page sections |
| space-12 | 48px | Hero spacing |

### Скругления

| Токен | Значение | Применение |
|-------|----------|------------|
| radius-sm | 4px | Badges, tags |
| radius-md | 8px | Buttons, inputs |
| radius-lg | 12px | Cards |
| radius-xl | 16px | Modals |
| radius-full | 9999px | Pills, avatars |

---

# РАЗДЕЛ 3. АРХИТЕКТУРА ИНФОРМАЦИИ

## 3.1 Карта сайта

```
/
├── index.html (Главная / Карта зала)
│   ├── Выбор даты и времени
│   ├── Переключатель зон
│   ├── Интерактивная карта зала
│   └── Модалка бронирования
│
├── profile.html (Личный кабинет)
│   ├── Мои бронирования
│   ├── История баллов
│   └── Настройки профиля
│
├── admin.html (Админ-панель)
│   ├── Все бронирования
│   ├── Управление столиками
│   └── Список клиентов
│
└── [Shared]
    ├── Авторизация (модалка)
    ├── Регистрация (модалка)
    └── Уведомления (toast)
```

## 3.2 Структура данных

### Таблица: profiles

```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE
full_name       VARCHAR(100)
phone           VARCHAR(20)
role            VARCHAR(20) DEFAULT 'user' -- user, admin
bonus_points    INTEGER DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Таблица: tables

```sql
id              UUID PRIMARY KEY
table_number    INTEGER UNIQUE
seats           INTEGER
zone            VARCHAR(50)  -- main, middle, basement, dancefloor
position_x      DECIMAL(5,2) -- % position
position_y      DECIMAL(5,2)
status          VARCHAR(20) DEFAULT 'active' -- active, maintenance
```

### Таблица: bookings

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
table_id        UUID REFERENCES tables(id)
booking_date    DATE
booking_time    TIME
end_time        TIME
duration_hours  INTEGER
guest_name      VARCHAR(100)
guest_phone     VARCHAR(20)
guests_count    INTEGER DEFAULT 1
notes           TEXT
status          VARCHAR(20) DEFAULT 'pending' -- pending, confirmed, completed, cancelled
bonus_earned    INTEGER DEFAULT 0
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Таблица: bonus_transactions

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
amount          INTEGER -- positive = earned, negative = spent
type            VARCHAR(20) -- booking, bonus, correction
description     TEXT
booking_id      UUID REFERENCES bookings(id)
created_at      TIMESTAMP
```

## 3.3 Информационная архитектура

### Главная страница (index.html)

```
[Header]
├── Logo
├── Navigation
│   ├── Карта зала (активная)
│   ├── Личный кабинет (авторизован)
│   └── Панель администратора (админ)
└── Auth controls (вход/регистрация или user menu)

[Hero Section]
├── Заголовок
└── Дата/время picker

[Zone Selector]
├── ← Основной зал →
├── ← Средний зал →
├── ← Подвал →
└── ← Танцпол →

[Hall Map]
├── Zone Label
├── Decorative elements (windows, bar, etc.)
├── Tables (positioned)
└── Legend

[Footer]
└── Контакты ресторана
```

---

# РАЗДЕЛ 4. UX-ИССЛЕДОВАНИЕ

## 4.1 Персонажи

### Persona 1: Алекс (Основной)

```
Имя: Александр, 32 года
Профессия: Менеджер в IT-компании
Доход: выше среднего
Город: Москва

Цели:
- Быстро забронировать столик после работы
- Выбрать хорошее место для свидания
- Получить бонусы за лояльность

Боли:
- Сложные формы бронирования
- Непонятно, какой столик выбрать
- Долгое ожидание подтверждения

Поведение:
- Пользуется телефоном 80% времени
- Ищет "лучший ресторан рядом"
- Читает отзывы перед выбором
```

### Persona 2: Елена (Вторичный)

```
Имя: Елена, 52 года
Профессия: Бухгалтер
Доход: средний
Город: Москва

Цели:
- Забронировать столик для семейного ужина
- Быть уверенной в бронировании
- Получить напоминание о визите

Боли:
- Мелкий шрифт на сайте
- Сложная навигация
- Не знает, как отменить бронь

Поведение:
- Предпочитает десктоп
- Звонит для подтверждения
- Пользуется браузером Chrome
```

### Persona 3: Дмитрий (Корпоративный)

```
Имя: Дмитрий, 45 лет
Профессия: Директор
Доход: высокий
Город: Москва

Цели:
- Организовать деловой ужин
- Получить VIP-обслуживание
- Иметь возможность отменить бронь

Боли:
- Нет приватности на сайте
- Сложно связаться с менеджером
- Нет особых условий для постоянных клиентов

Поведение:
- Всё делает через секретаря
- Ожидает премиальный сервис
- Ценит время
```

## 4.2 Сценарии использования

### Сценарий 1: Бронирование столика (Happy Path)

```
ACTOR: Гость (Алекс)
PRECONDITIONS: Гость на главной странице

1. Гость выбирает дату в календаре
   → Система отображает доступные временные слоты

2. Гость выбирает время
   → Система загружает карту зала с актуальными статусами

3. Гость просматривает зоны, переключаясь между ними
   → Система показывает столики выбранной зоны

4. Гость кликает на свободный столик
   → Система открывает модалку бронирования

5. Гость заполняет форму и подтверждает
   → Система создаёт бронирование со статусом "pending"

6. Система показывает уведомление об успешном бронировании
   → Бронирование отображается в списке гостя

POSTCONDITIONS: Бронирование создано, ожидает подтверждения
```

### Сценарий 2: Отмена бронирования

```
ACTOR: Гость (Алекс)
PRECONDITIONS: Гость авторизован, имеет active бронирование

1. Гость переходит в "Мои бронирования"
   → Система отображает список бронирований

2. Гость выбирает активное бронирование
   → Система показывает детали

3. Гость нажимает "Отменить"
   → Система запрашивает подтверждение

4. Гость подтверждает отмену
   → Система обновляет статус на "cancelled"

5. Гость видит уведомление об отмене
   → Баллы (если были начислены) списываются

POSTCONDITIONS: Бронирование отменено, баллы скорректированы
```

### Сценарий 3: Администрирование бронирований

```
ACTOR: Администратор (Дмитрий)
PRECONDITIONS: Пользователь авторизован как admin

1. Админ открывает панель администратора
   → Система загружает список бронирований на сегодня

2. Админ фильтрует по статусу "pending"
   → Система показывает ожидающие бронирования

3. Админ выбирает бронирование и нажимает "Подтвердить"
   → Система обновляет статус на "confirmed"

4. Гость получает уведомление о подтверждении
   → Статус обновляется в реальном времени

POSTCONDITIONS: Бронирование подтверждено
```

## 4.3 User Flow Map

```
[START] → [Главная страница]
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
[Нет аккаунта] [Есть аккаунт] [Админ]
    ↓           ↓           ↓
[Регистрация] [Вход]    [Админ панель]
    ↓           ↓
[Вход]    [Личный кабинет]
    ↓           ↓
    └─────┬─────┘
          ↓
    [Выбор даты]
          ↓
    [Выбор времени]
          ↓
    [Загрузка карты]
          ↓
    [Переключение зон] ←──┐
          ↓               │
    [Выбор столика]       │
          ↓               │
    [Модалка бронир.]      │
          ↓               │
    ┌─────┴─────┐          │
    ↓           ↓          │
[Авторизован] [Гость]      │
    ↓           ↓          │
[Создание бронирования]     │
    ↓                       │
[Уведомление]              │
    ↓                       │
[END] ←─────────────────────┘
```

## 4.4 Карта эмпатии

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ДУМАТЬ                        ЧУВСТВОВАТЬ                     ┃
┃  ─────────                     ────────────                   ┃
┃  • Как быстро забронировать?    • Волнение перед свиданием     ┃
┃  • Где хорошие столики?         • Разочарование при занять     ┃
┃  • Сколько стоит?               • Радость при подтверждении    ┃
┃  • Можно отменить?             • Напряжение при выборе        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

# РАЗДЕЛ 5. ИНТЕРФЕЙС

## 5.1 Компоненты дизайн-системы

### Buttons (Кнопки)

```css
/* Primary Button */
.btn-primary {
    background: var(--color-primary);
    color: white;
    padding: 12px 24px;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 90, 43, 0.3);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Secondary Button */
.btn-secondary {
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
}

/* Ghost Button */
.btn-ghost {
    background: transparent;
    color: var(--color-text-secondary);
}

/* Icon Button */
.btn-icon {
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Inputs (Поля ввода)

```css
.input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: 16px;
    font-family: var(--font-body);
    transition: all 0.2s ease;
    background: var(--color-surface);
}

.input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(139, 90, 43, 0.1);
}

.input:disabled {
    background: var(--color-gray-100);
    cursor: not-allowed;
}

.input.error {
    border-color: var(--color-danger);
}

/* Label */
.label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
}

/* Error message */
.input-error {
    font-size: 13px;
    color: var(--color-danger);
    margin-top: 6px;
}
```

### Cards (Карточки)

```css
.card {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
}

/* Card Variants */
.card-elevated {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-bordered {
    border: 1px solid var(--color-border);
}

.card-interactive {
    cursor: pointer;
}
```

### Tables (Столики на карте)

```css
/* Table Element */
.table {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
}

.table:hover {
    transform: translate(-50%, -50%) scale(1.15);
    z-index: 20;
}

/* Table Shapes */
.table-shape {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Table Sizes */
.table-large {
    width: 80px;
    height: 80px;
    font-size: 22px;
}

.table-small {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-md);
    font-size: 16px;
}

/* Table States */
.table-shape.available {
    background: linear-gradient(135deg, #43A047, #66BB6A);
}

.table-shape.pending {
    background: linear-gradient(135deg, #F9A825, #FDD835);
    animation: pulse 2s infinite;
}

.table-shape.confirmed {
    background: linear-gradient(135deg, #C62828, #EF5350);
}

.table-shape.maintenance {
    background: linear-gradient(135deg, #78909C, #90A4AE);
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249, 168, 37, 0.4); }
    50% { box-shadow: 0 0 0 15px rgba(249, 168, 37, 0); }
}
```

### Modals (Модальные окна)

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    animation: fadeIn 0.2s ease;
}

.modal {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
}

.modal-header {
    padding: 24px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    padding: 0 24px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Notifications (Уведомления)

```css
.toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: var(--radius-lg);
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    animation: slideIn 0.3s ease;
}

.toast.success { background: var(--color-success); }
.toast.error { background: var(--color-danger); }
.toast.info { background: var(--color-info); }
.toast.warning { background: var(--color-warning); }

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

### Zone Selector (Переключатель зон)

```css
.zone-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px 24px;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.zone-title {
    font-family: var(--font-heading);
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text-primary);
    min-width: 180px;
    text-align: center;
}

.zone-nav-btn {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all 0.2s ease;
}

.zone-nav-btn:hover {
    background: var(--color-primary-dark);
    transform: scale(1.1);
}

.zone-nav-btn:active {
    transform: scale(0.95);
}
```

## 5.2 Состояния компонентов

### Button States

| State | Visual | Interaction |
|-------|--------|-------------|
| Default | Primary bg | — |
| Hover | Darker bg, lift | Cursor: pointer, scale(1.02) |
| Active | Darker bg, press | Scale(0.98) |
| Disabled | 50% opacity | Cursor: not-allowed |
| Loading | Spinner icon | Disabled + spinner |

### Input States

| State | Visual | Use case |
|-------|--------|----------|
| Default | Border gray-300 | Empty field |
| Focus | Border primary, shadow | User typing |
| Filled | Border gray-400 | Has value |
| Error | Border red, error msg | Validation failed |
| Disabled | Gray bg | Not editable |

### Table States

| State | Color | Animation | Click action |
|-------|-------|-----------|--------------|
| Available | Green | Glow on hover | Open booking |
| Pending | Yellow | Pulse | Show info |
| Confirmed | Red | None | Show info |
| Maintenance | Gray | None | Show info |

## 5.3 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 320px) { /* Mobile */ }
@media (min-width: 640px) { /* Large Mobile */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
@media (min-width: 1536px) { /* Extra Large */ }
```

### Layout Changes

| Breakpoint | Hall Map Height | Zone Selector | Grid |
|------------|-----------------|---------------|------|
| < 640px | 400px | Full width | 1 column |
| 640-768px | 450px | Full width | 2 columns |
| 768-1024px | 500px | Centered | 3 columns |
| > 1024px | 550px | Centered | 4 columns |

---

# РАЗДЕЛ 6. ПРОТОТИПЫ И МАКЕТЫ

## 6.1 Wireframes (Вайрфреймы)

### Desktop - Главная страница

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                   │
│ [Logo]        [Карта зала] [Кабинет] [Админ]  [Войти]   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              БРОНИРОВАНИЕ СТОЛИКОВ                       │
│                                                          │
│         [📅 04.04.2026]  [⏰ 19:00 ▼]                   │
│                                                          │
│    ┌─────────────────────────────────────────────────┐  │
│    │  ◀  │    ОСНОВНОЙ ЗАЛ    │  ▶  │               │  │
│    └─────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [Окно]         [Окно]         [Окно]   [Вход]   │   │
│  │                                                    │   │
│  │       (1)                (2)                     │   │
│  │                                                    │   │
│  │  [=====  Б А Р  =====]                            │   │
│  │                                                    │   │
│  │       (3)                (4)                      │   │
│  │                     (5)                           │   │
│  │                                                    │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │ 🟢 Свободно  🟡 Ожидает  🔴 Занято  ⚪ Ремон │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Mobile - Главная страница

```
┌─────────────────────────┐
│ [Logo]        [≡]       │
├─────────────────────────┤
│  БРОНИРОВАНИЕ           │
│                         │
│ [📅 04.04] [⏰ 19:00▼]  │
│                         │
│ ◀ ОСНОВНОЙ ЗАЛ ▶       │
│                         │
│ ┌─────────────────────┐ │
│ │[Окн]    (1)    [Окн]│ │
│ │       (2)            │ │
│ │  [====БАР====]      │ │
│ │  (3)       (4)      │ │
│ │        (5)          │ │
│ │[Окн]           [Вход]│ │
│ └─────────────────────┘ │
│                         │
│ 🟢 🟡 🔴 ⚪ Легенда      │
└─────────────────────────┘
```

### Modal - Бронирование

```
┌─────────────────────────────────┐
│         БРОНИРОВАНИЕ         ✕ │
├─────────────────────────────────┤
│                                 │
│    Столик №5 • 6 мест           │
│    📅 04.04.2026 • ⏰ 19:00    │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Имя                      │   │
│  │ [________________]       │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Телефон                  │   │
│  │ [________________]       │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Длительность              │   │
│  │ [3 часа              ▼] │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Пожелания                │   │
│  │ [____________________]  │   │
│  │ [____________________]  │   │
│  └─────────────────────────┘   │
│                                 │
│  [+50 бонусов за бронь]        │
│                                 │
│  ┌─────────────────────────┐   │
│  │     ЗАБРОНИРОВАТЬ        │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Desktop - Личный кабинет

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Аватар]  Александр                        [100 ₽]    │
│           alex@mail.ru                    бонусов       │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ [Мои бронирования]  [История баллов]  [Настройки]  ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ БРОНИРОВАНИЯ                                      │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📅 05.04 • 🕐 19:00 • Столик #3                   │   │
│  │ Статус: 🟡 Ожидает подтверждения    [Отменить]    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📅 10.04 • 🕐 20:00 • Столик #7                   │   │
│  │ Статус: 🟢 Подтверждено              [Отменить]  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📅 25.03 • 🕐 18:00 • Столик #2                   │   │
│  │ Статус: 🔵 Завершено (+50 бонусов)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 6.2 High-Fidelity Mockups

### Цветовые схемы по зонам

| Зона | Фон карты | Акцент | Декор |
|------|-----------|--------|-------|
| Основной | #F5EDE3 | #D4AF37 | Окна, бар |
| Средний | #E8E0D5 | #8B5A2B | Окна |
| Подвал | #2D2A26 | #C62828 | Свечи |
| Танцпол | #1A1816 | #9C27B0 | Диско-шар |

### Типографические стили

| Элемент | Семейство | Размер | Вес | Цвет |
|---------|-----------|--------|-----|------|
| H1 (Заголовок страницы) | Playfair Display | 36px | 700 | #2D2A26 |
| H2 (Заголовок секции) | Playfair Display | 28px | 600 | #2D2A26 |
| H3 (Заголовок карточки) | Inter | 20px | 600 | #2D2A26 |
| Body | Inter | 16px | 400 | #2D2A26 |
| Caption | Inter | 14px | 400 | #6B6560 |
| Button | Inter | 16px | 600 | #FFFFFF |

---

# РАЗДЕЛ 7. ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ

## 7.1 CSS Design Tokens

```css
/* === ЦВЕТА === */
:root {
    /* Primary */
    --color-primary: #8B5A2B;
    --color-primary-dark: #6B4423;
    --color-primary-light: #C4956A;
    
    /* Semantic */
    --color-success: #43A047;
    --color-warning: #F9A825;
    --color-danger: #C62828;
    --color-info: #1976D2;
    
    /* Neutral */
    --color-bg: #FAF7F2;
    --color-surface: #FFFFFF;
    --color-border: #E8E0D5;
    --color-border-light: #F5F0E8;
    
    /* Text */
    --color-text-primary: #2D2A26;
    --color-text-secondary: #6B6560;
    --color-text-muted: #9E9891;
    --color-text-inverse: #FFFFFF;
    
    /* Special */
    --color-gold: #D4AF37;
    --color-overlay: rgba(0, 0, 0, 0.5);
    
    /* Zone backgrounds */
    --zone-main-bg: #F5EDE3;
    --zone-middle-bg: #E8E0D5;
    --zone-basement-bg: #2D2A26;
    --zone-dancefloor-bg: #1A1816;
}

/* === ТИПОГРАФИКА === */
:root {
    --font-heading: 'Playfair Display', Georgia, serif;
    --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    
    --text-display: 48px;
    --text-h1: 36px;
    --text-h2: 28px;
    --text-h3: 22px;
    --text-h4: 18px;
    --text-body-lg: 18px;
    --text-body: 16px;
    --text-body-sm: 14px;
    --text-caption: 12px;
    --text-overline: 11px;
}

/* === ПРОСТРАНСТВО === */
:root {
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;
}

/* === СКРУГЛЕНИЯ === */
:root {
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-full: 9999px;
}

/* === ТЕНИ === */
:root {
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
    --shadow-glow-green: 0 0 20px rgba(67, 160, 71, 0.4);
    --shadow-glow-gold: 0 0 20px rgba(212, 175, 55, 0.4);
}

/* === АНИМАЦИИ === */
:root {
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 400ms;
    --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* === РАЗМЕРЫ === */
:root {
    --header-height: 72px;
    --sidebar-width: 280px;
    --container-max: 1280px;
    --table-size-lg: 80px;
    --table-size-md: 64px;
    --table-size-sm: 56px;
    --click-target-min: 44px;
}
```

## 7.2 JavaScript API

### Supabase Configuration

```javascript
const SUPABASE_URL = 'https://xbwfrfnagesceeozazcr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8mGgiwNsFhmiJas-tHWMaw_ab_M50Bf';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
```

### Zone Management

```javascript
const zones = [
    { id: 'main', name: 'Основной зал', icon: 'fa-utensils' },
    { id: 'middle', name: 'Средний зал', icon: 'fa-couch' },
    { id: 'basement', name: 'Подвал', icon: 'fa-wine-glass' },
    { id: 'dancefloor', name: 'Танцпол', icon: 'fa-music' }
];

let currentZoneIndex = 0;

function getCurrentZone() {
    return zones[currentZoneIndex].id;
}

function changeZone(direction) {
    currentZoneIndex += direction;
    if (currentZoneIndex < 0) currentZoneIndex = zones.length - 1;
    if (currentZoneIndex >= zones.length) currentZoneIndex = 0;
    loadHallMap();
}
```

### Key Functions

```javascript
// Auth
async function handleRegister(event)
async function handleLogin(event)
async function handleLogout()
function setupAuthListener()

// Hall Map
async function loadHallMap()
function renderHallMap(zone)
function createTableElement(table)
function getTableStatus(tableId)
function onTableClick(tableId, status)

// Booking
async function handleBooking(event)
async function cancelBooking(bookingId)

// Admin
async function loadAdminBookings()
async function updateBookingStatus(bookingId, status)
async function loadTables()
async function updateTable(tableId, data)
async function loadClients()
```

## 7.3 Accessibility Requirements (WCAG 2.1 AA)

### Perceivable
- All non-text content has alt text
- Color contrast ratio >= 4.5:1 for text
- Text can be resized to 200% without loss
- No information conveyed by color alone

### Operable
- All functions keyboard accessible
- No keyboard traps
- Focus visible on interactive elements
- Skip navigation link provided

### Understandable
- Language declared in HTML
- Consistent navigation
- Error identification and suggestions
- Labels for all inputs

### Robust
- Valid HTML
- ARIA landmarks
- Status messages announced

### Implementation

```css
/* Focus states */
:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}

/* Skip link */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px 16px;
    z-index: 9999;
}

.skip-link:focus {
    top: 0;
}

/* Screen reader only */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
```

## 7.4 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total Blocking Time | < 200ms | Lighthouse |

### Optimization Strategies

```
1. Critical CSS inline
2. Font preload for primary fonts
3. Image lazy loading
4. Code splitting for admin page
5. Service worker for caching
6. Supabase query optimization
```

---

# РАЗДЕЛ 8. ПЛАН РЕАЛИЗАЦИИ

## 8.1 Фазы проекта

### Phase 1: Foundation (Week 1-2)
- Setup project structure
- Implement design tokens in CSS
- Create base components (buttons, inputs, cards)
- Setup Supabase connection
- Create authentication flow

### Phase 2: Core Features (Week 3-4)
- Hall map with zone switching
- Table visualization
- Booking modal
- User profile page
- Notifications system

### Phase 3: Admin (Week 5)
- Admin dashboard
- Booking management
- Table management
- Client list

### Phase 4: Polish (Week 6)
- Animations and transitions
- Accessibility audit
- Performance optimization
- Cross-browser testing
- Mobile responsiveness

## 8.2 Ресурсы и ответственности

| Role | Responsibilities | FTE |
|------|------------------|-----|
| Frontend Dev | UI implementation, components | 1 |
| Backend Dev | Supabase setup, API | 0.5 |
| Designer | Design system, assets | 0.5 |
| PM | Coordination, QA | 0.25 |

## 8.3 Дедлайны

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| M1: Setup Complete | 11.04.2026 | Project structure, design tokens |
| M2: Auth + Map | 25.04.2026 | Login, registration, hall map |
| M3: Booking Flow | 02.05.2026 | Full booking experience |
| M4: Admin Panel | 09.05.2026 | Admin features |
| M5: Launch Ready | 16.05.2026 | Testing, polish, deployment |

---

# РАЗДЕЛ 9. КОНТРОЛЬ КАЧЕСТВА

## 9.1 Критерии приёмки

### Functional Requirements
- [ ] User can register and login
- [ ] Hall map loads correctly for each zone
- [ ] Tables display correct status colors
- [ ] Booking can be created with all fields
- [ ] Booking appears in user's profile
- [ ] Admin can view and manage bookings
- [ ] Admin can toggle table status

### Visual Requirements
- [ ] All colors match design tokens
- [ ] Typography hierarchy is correct
- [ ] Spacing follows 8px grid
- [ ] Animations are smooth (60fps)
- [ ] Mobile layout is responsive

### Accessibility Requirements
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast >= 4.5:1
- [ ] Screen reader announces dynamic content
- [ ] Focus indicators visible

### Performance Requirements
- [ ] Page load < 3 seconds
- [ ] Interactions respond < 100ms
- [ ] No layout shifts after load

## 9.2 Testing Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] iPhone 12/13/14
- [ ] Samsung Galaxy S21+
- [ ] iPad (768px)
- [ ] Desktop 1920x1080
- [ ] Desktop 1366x768

### Test Scenarios

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| T1 | Register new user | User created, redirected |
| T2 | Login with valid credentials | Logged in, nav updated |
| T3 | Login with invalid credentials | Error message shown |
| T4 | Select date and time | Map loads with status |
| T5 | Click available table | Booking modal opens |
| T6 | Submit booking | Toast shown, list updated |
| T7 | Click pending booking | Details shown |
| T8 | Cancel booking | Status updated, points removed |
| T9 | Admin confirms booking | Status changes to confirmed |
| T10 | Mobile: Book a table | Works on 375px width |

---

# РАЗДЕЛ 10. ПРИЛОЖЕНИЯ

## 10.1 Перечень материалов от заказчика

### Требуется получить
1. Логотип ресторана (SVG, PNG)
2. Фото интерьера (5-10 шт)
3. Актуальное меню (PDF)
4. Контактная информация
5. Пожелания по зонам (расположение, количество столиков)
6. Брендбук (если есть)

### Опционально
- Иллюстрации/фото для зон
- Анимации/видео ресторана
- testimonials гостей

## 10.2 Экспорт ассетов

### Figma Export Settings
```
Format: SVG (icons), PNG 2x (images)
Colors: sRGB
Scale: 1x, 2x, 3x
```

### Icon Export
- Size: 24x24 (base), 48x48 (@2x)
- Format: SVG with currentColor
- Naming: icon-{name}.svg

### Image Export
- Photos: WebP with PNG fallback
- Size: Responsive (srcset)
- Quality: 80%

## 10.3 Deployment Checklist

### Pre-launch
- [ ] All environment variables set
- [ ] Supabase RLS policies configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] SSL certificate active

### Post-launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] User feedback collection
- [ ] Regular backups

---

## ДОКУМЕНТ ПОДГОТОВЛЕН К ПЕРЕДАЧЕ В РАЗРАБОТКУ

**Подпись дизайнера:** ________________  
**Дата:** 04.04.2026  
**Версия:** 1.0

---

# Figma File Reference

**File Name:** `U_Ratuschi_Design_System_v1.0.fig`

### Pages in Figma:
1. **Cover** - Project overview
2. **Design Tokens** - Colors, typography, spacing
3. **Components** - All UI components with states
4. **Pages** - Full page layouts
5. **Icons** - Icon library
6. **Wireframes** - Low-fidelity layouts
7. **Prototypes** - Interactive flows
