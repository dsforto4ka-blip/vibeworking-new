// Vibe Working Unified Settings & Cross-Page Synchronization Manager
// Handles Theme, Language, Currency & Real-Time Auth Synchronization
// 1. IP Persistence (via /api/settings)
// 2. User Profile Persistence (via /api/settings & session)
// 3. LocalStorage & Indexed cache (instant zero-flicker on reload)
// 4. Cross-page and Cross-tab real-time sync (BroadcastChannel + storage events)
// 5. Outside click modal closing & Escape key dismiss
// 6. Complete bilingual translations for all pages

export interface UserSettings {
  theme: 'dark' | 'light';
  lang: 'ru' | 'en';
  currency: 'RUB' | 'USD' | 'EUR' | 'BYN';
  updatedAt?: number;
}

export interface StoredUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roleKey: 'worker' | 'client';
  balance: number;
  about?: string;
  city?: string;
  skills?: string;
  telegram?: string;
  createdAt?: string;
  settings?: UserSettings;
}

export const CURRENCIES: Record<string, { symbol: string; position: 'before' | 'after'; rate: number; decimals: number }> = {
  RUB: { symbol: '₽', position: 'after', rate: 1, decimals: 0 },
  USD: { symbol: '$', position: 'before', rate: 0.011, decimals: 2 },
  EUR: { symbol: '€', position: 'before', rate: 0.010, decimals: 2 },
  BYN: { symbol: 'Br', position: 'after', rate: 0.036, decimals: 2 },
};

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  ru: {
    // Nav
    'nav.tasks': 'Задания',
    'nav.how': 'Как это работает',
    'nav.post': 'Разместить заказ',
    'nav.find': 'Найти работу',
    'nav.login': 'Войти',
    'nav.cabinet': 'Личный кабинет',
    'nav.logout': 'Выйти',
    'nav.backToTasks': 'Вернуться к ленте заданий',

    // Hero
    'hero.badge': 'Фриланс-биржа нового поколения для подростков',
    'hero.title': 'Работа для подростков без ИП и самозанятости',
    'hero.subtitle': 'Брать простые онлайн-задания теперь можно без налоговых документов, договоров и бумажной волокиты. Выполняй задачи, развивай навыки и получай честную оплату сразу на карту или СБП.',
    'hero.orderBtn': 'Заказать работу',
    'hero.badge1': 'Без ИП и самозанятости',
    'hero.badge2': 'С 14 лет',
    'hero.badge3': 'Выплаты на карту или СБП',

    // Tasks Feed
    'tasks.title': 'Свежие задания',
    'tasks.subtitle': 'Выбирай интересные проекты и зарабатывай свои первые деньги онлайн',
    'tasks.empty': 'Пока нет опубликованных заданий',
    'tasks.emptyDesc': 'Станьте первым заказчиком на Vibe Working! Опубликуйте реальную задачу и получите отклики от исполнителей.',
    'tasks.postFirst': 'Опубликовать первое задание',
    'filter.all': 'Все задания',
    'filter.texts': 'Тексты',
    'filter.design': 'Дизайн',
    'filter.video': 'Видео / Reels',
    'filter.study': 'Учёба',
    'filter.tables': 'Таблицы',
    'filter.social': 'Соцсети',
    'task.apply': 'Откликнуться',
    'task.applied': 'Вы откликнулись',
    'task.budget': 'Бюджет',
    'task.deadline': 'Срок сдачи',
    'task.client': 'Заказчик',

    // How it works
    'steps.title': 'Как это работает',
    'steps.subtitle': 'Простой путь к первым деньгам без сложных договоров и бюрократии',
    'steps.s1t': 'Регистрируйся',
    'steps.s1d': 'Быстрый вход за 1 минуту по Google, номеру телефона или почте. Никаких паспортов, ИНН и налоговых документов.',
    'steps.s2t': 'Выбирай задание',
    'steps.s2d': 'Листай ленту и выбирай то, что тебе нравится: тексты, монтаж рилсов, дизайн или помощь по учёбе.',
    'steps.s3t': 'Выполняй',
    'steps.s3d': 'Общайся с заказчиком во встроенном удобном чате, согласовывай детали и сдавай готовую работу в срок.',
    'steps.s4t': 'Получай оплату',
    'steps.s4d': 'После подтверждения выполнения деньги моментально зачисляются на твою банковскую карту или по номеру через СБП.',

    // Footer & Gear
    'footer.copy': '© 2026 Vibe Working — фриланс-биржа для подростков',
    'gear.title': 'Настройки сайта',

    // Settings Modal (Clean monochrome theme titles)
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройки сохраняются на сервере по вашему IP и профилю',
    'settings.theme': 'Тема оформления',
    'settings.theme.dark': 'Тёмная',
    'settings.theme.light': 'Светлая',
    'settings.language': 'Язык',
    'lang.ru': 'Русский',
    'lang.en': 'English',
    'settings.currency': 'Валюта',
    'cur.rub': 'Рубль',
    'cur.usd': 'Доллар',
    'cur.eur': 'Евро',
    'cur.byn': 'Бел. рубль',
    'settings.account': 'Личный кабинет',
    'settings.account.meta': 'Профиль и заказы',
    'settings.logout': 'Выйти из аккаунта',
    'settings.syncedProfile': 'Настройки синхронизированы с вашим профилем',
    'settings.syncedIp': 'Настройки сохранены на сервере для вашего IP',
    'settings.syncedLocal': 'Настройки синхронизированы на этом устройстве',

    // Create Order Page (2 - объявление.html)
    'post.badge': 'Публикация заказа',
    'post.title': 'Разместить заказ на Vibe Working',
    'post.subtitle': 'Опишите простую онлайн-задачу, установите понятную цену и получите отклики от подростков-исполнителей уже через пару минут без бумажных договоров.',
    'post.categoryLabel': 'Выберите категорию',
    'post.titleLabel': 'Название задания',
    'post.titleHint': 'Коротко и ясно сформулируйте суть задачи',
    'post.titlePlaceholder': 'Например: Смонтировать динамичный Reels для бренда одежды...',
    'post.budgetLabel': 'Бюджет',
    'post.budgetHint': 'Укажите честную сумму за выполнение работы',
    'post.descLabel': 'Подробное описание',
    'post.descHint': 'Опишите требования, формат сдачи работы, дедлайн и что вы предоставите',
    'post.descPlaceholder': 'Что конкретно нужно сделать?\nПример: Предоставим исходные видео и трек. Нужно нарезать динамичные кадры, наложить субтитры и добавить звуковые эффекты в CapCut или Premiere...',
    'post.perk1': 'Без ИП и бумажных договоров',
    'post.perk2': 'Отклики в первые 15 минут',
    'post.perk3': 'Выплаты на карту или СБП',
    'post.submit': 'Опубликовать задание',
    'post.submitting': 'Публикуем...',
    'post.catTexts': 'Тексты',
    'post.catDesign': 'Дизайн',
    'post.catVideo': 'Видео / Reels',
    'post.catStudy': 'Учёба',
    'post.catTables': 'Таблицы',
    'post.catSocial': 'Соцсети',

    // Cabinet Page (3 - личный кабинет.html)
    'cab.title': 'Личный кабинет',
    'cab.unauthTitle': 'Личный кабинет Vibe Working',
    'cab.unauthDesc': 'Войдите через официальный Google аккаунт, по номеру телефона или почте, чтобы отслеживать отклики, размещать заказы и управлять заработанными деньгами.',
    'cab.googleLogin': 'Вход через Google',
    'cab.toTasks': 'На главную к заданиям',
    'cab.roleWorker': '💼 Исполнитель',
    'cab.roleClient': '🎯 Заказчик',
    'cab.switchToClient': 'Переключить на Заказчика',
    'cab.switchToWorker': 'Переключить на Исполнителя',
    'cab.editProfile': 'Редактировать',
    'cab.settings': 'Настройки',
    'cab.aboutTitle': 'О себе',
    'cab.balance': 'Текущий баланс',
    'cab.balanceSub': 'Выплаты на карту или СБП',
    'cab.topUp': '+ Пополнить',
    'cab.withdraw': 'Вывести',
    'cab.ordersCount': 'Размещено заказов',
    'cab.worksCount': 'Мои отклики и работы',
    'cab.tabOrders': 'Мои заказы',
    'cab.tabWorks': 'Мои отклики и работы',
    'cab.tabSettings': 'Настройки профиля',
    'cab.emptyOrders': 'У вас пока нет активных заказов',
    'cab.emptyOrdersDesc': 'Разместите простое онлайн-задание, чтобы найти ответственного исполнителя среди подростков.',
    'cab.postFirstOrder': 'Разместить первый заказ',
    'cab.emptyWorks': 'Вы ещё не откликались на задания',
    'cab.emptyWorksDesc': 'Перейдите в ленту заданий, выберите подходящий заказ и отправьте свой первый отклик!',
    'cab.goToFeed': 'Перейти к ленте заданий',
    'cab.editModalTitle': 'Редактирование профиля',
    'cab.editModalSub': 'Обновите информацию о себе для заказчиков и исполнителей',
    'cab.nameLabel': 'Имя или название',
    'cab.usernameLabel': 'Юзернейм (@ник)',
    'cab.cityLabel': 'Город',
    'cab.cityPlaceholder': 'Например: Москва',
    'cab.skillsLabel': 'Навыки / Специализация',
    'cab.skillsPlaceholder': 'Монтаж Reels, Дизайн, Копирайтинг...',
    'cab.telegramLabel': 'Telegram для связи',
    'cab.telegramPlaceholder': '@username',
    'cab.aboutLabel': 'О себе',
    'cab.aboutPlaceholder': 'Расскажите кратко о своём опыте и навыках...',
    'cab.cancel': 'Отмена',
    'cab.saveChanges': 'Сохранить изменения',
    'cab.changePhoto': 'Изменить фото профиля',
    'cab.usernameLatinHint': 'Только латинские буквы (a-z, 0-9, _)',
    'cab.tabReviews': 'Отзывы',
    'cab.reviewsCount': 'Отзывы',
    'cab.emptyReviews': 'Пока нет отзывов',
    'cab.emptyReviewsDesc': 'Отзывы появятся здесь после выполнения первых заказов.',
    'cab.rating': 'Рейтинг',
    'cab.paymentMethod': 'Способ оплаты / вывода',
    'cab.methodCard': 'Банковская карта (РФ / СНГ / Мир)',
    'cab.methodSbp': 'Система быстрых платежей (СБП)',
    'cab.balanceModalDeposit': 'Пополнение баланса',
    'cab.balanceModalWithdraw': 'Вывод средств',
    'cab.balanceModalSub': 'Без комиссии через СБП или банковскую карту',
    'cab.amountLabel': 'Сумма в рублях (₽)',
    'cab.confirm': 'Подтвердить',

    // Crop Modal
    'crop.title': 'Обрезать фото профиля',
    'crop.hint': 'Перетаскивайте изображение и используйте масштаб для выбора области',
    'crop.zoom': 'Масштаб',
    'crop.cancel': 'Отмена',
    'crop.save': 'Сохранить',

    // Post task details
    'post.deadlineLabel': 'Срок выполнения',
    'post.deadlineUrgent': 'Срочно (до 24 часов)',
    'post.deadline2_3': '2-3 дня',
    'post.deadlineWeek': 'До недели',
    'post.deadlineFlexible': 'Без спешки',
    'post.contactLabel': 'Контакт для связи (Telegram, телефон или почта)',
    'post.contactHint': 'Укажите удобный контакт для откликов',
    'post.contactPlaceholder': '@username или почта/телефон',
    'post.zeroCommission': 'Без комиссий сервиса для первых заказов',
    'post.safeDeal': 'Безопасная сделка и проверенные исполнители',

    // Auth Modal
    'auth.title': 'Вход в Vibe Working',
    'auth.titleLogin': 'Вход в Vibe Working',
    'auth.titleRegister': 'Регистрация в Vibe Working',
    'auth.subLogin': 'Войдите или зарегистрируйтесь для работы на бирже',
    'auth.subPost': 'Войдите или зарегистрируйтесь, чтобы опубликовать задание',
    'auth.login': 'Войти',
    'auth.register': 'Регистрация',
    'auth.google': 'Продолжить через Google',
    'auth.orContacts': 'или через контакты',
    'auth.byPhone': 'По телефону',
    'auth.byEmail': 'По почте',
    'auth.nameLabel': 'Ваше имя',
    'auth.namePlaceholder': 'Например: Александр',
    'auth.usernameLabel': 'Юзернейм (латиница)',
    'auth.usernamePlaceholder': 'username',
    'auth.usernameLatinHint': 'Только латинские буквы a-z, цифры и _',
    'auth.roleLabel': 'Кто вы на Vibe Working?',
    'auth.role.worker': '💼 Исполнитель',
    'auth.role.workerSub': 'Хочу брать задания',
    'auth.role.client': '🎯 Заказчик',
    'auth.role.clientSub': 'Хочу давать задачи',
    'auth.phoneLabel': 'Номер телефона',
    'auth.phonePlaceholder': '+7 (999) 000-00-00',
    'auth.smsLabel': 'Код подтверждения из СМС',
    'auth.smsPlaceholder': 'Введите код из сообщения',
    'auth.emailLabel': 'Электронная почта',
    'auth.emailPlaceholder': 'example@mail.ru',
    'auth.passLabel': 'Пароль',
    'auth.passPlaceholder': 'Придумайте пароль',
    'auth.submitLogin': 'Войти в аккаунт',
    'auth.submitRegister': 'Зарегистрироваться',

    // Toasts
    'toast.needLogin': 'Сначала войдите в аккаунт, чтобы откликнуться',
    'toast.needLoginPost': 'Сначала войдите в аккаунт, чтобы опубликовать заказ',
    'toast.responseSent': 'Отклик отправлен заказчику!',
    'toast.welcome': 'Добро пожаловать, ',
    'toast.logout': 'Вы вышли из аккаунта',
    'toast.themeDark': 'Тёмная тема включена',
    'toast.themeLight': 'Светлая тема включена',
    'toast.langSwitched': 'Язык переключён на русский',
    'toast.curSwitched': 'Валюта изменена на ',
    'toast.orderCreated': 'Заказ успешно опубликован!',
    'toast.profileSaved': 'Профиль успешно обновлён!',
    'toast.fillAllFields': 'Пожалуйста, заполните все обязательные поля',
    'toast.googleCancel': 'Вход через Google отменён',
    'toast.googleOpening': 'Открываем окно Google...',
    'toast.depositSuccess': 'Баланс успешно пополнен!',
    'toast.withdrawSuccess': 'Заявка на вывод средств оформлена!',
    'toast.insufficientFunds': 'Недостаточно средств на балансе',
  },
  en: {
    // Nav
    'nav.tasks': 'Tasks',
    'nav.how': 'How it works',
    'nav.post': 'Post a task',
    'nav.find': 'Find tasks',
    'nav.login': 'Sign in',
    'nav.cabinet': 'Cabinet',
    'nav.logout': 'Log out',
    'nav.backToTasks': 'Back to task feed',

    // Hero
    'hero.badge': 'Next-gen freelance marketplace for teens',
    'hero.title': 'Work for teens without business registration',
    'hero.subtitle': 'Take simple online tasks without tax paperwork, contracts, or red tape. Complete tasks, grow your skills, and get paid instantly to your card.',
    'hero.orderBtn': 'Order work',
    'hero.badge1': 'No tax registration',
    'hero.badge2': 'From 14 years old',
    'hero.badge3': 'Instant card payouts',

    // Tasks Feed
    'tasks.title': 'Fresh tasks',
    'tasks.subtitle': 'Pick interesting projects and earn your first money online',
    'tasks.empty': 'No tasks published yet',
    'tasks.emptyDesc': 'Be the first client on Vibe Working! Post a real task and get applications from freelancers.',
    'tasks.postFirst': 'Post the first task',
    'filter.all': 'All tasks',
    'filter.texts': 'Texts',
    'filter.design': 'Design',
    'filter.video': 'Video / Reels',
    'filter.study': 'Study',
    'filter.tables': 'Spreadsheets',
    'filter.social': 'Social media',
    'task.apply': 'Apply',
    'task.applied': 'Applied',
    'task.budget': 'Budget',
    'task.deadline': 'Deadline',
    'task.client': 'Client',

    // How it works
    'steps.title': 'How it works',
    'steps.subtitle': 'A simple path to your first money without contracts and bureaucracy',
    'steps.s1t': 'Sign up',
    'steps.s1d': 'Fast login in 1 minute via Google, phone or email. No passports, tax IDs or documents.',
    'steps.s2t': 'Pick a task',
    'steps.s2d': 'Scroll the feed and pick what you like: texts, reels editing, design or study help.',
    'steps.s3t': 'Do the work',
    'steps.s3d': 'Chat with the client in the built-in messenger, align on details and deliver on time.',
    'steps.s4t': 'Get paid',
    'steps.s4d': 'Once the work is confirmed, money is instantly credited to your bank card.',

    // Footer & Gear
    'footer.copy': '© 2026 Vibe Working — Freelance marketplace for teens',
    'gear.title': 'Site settings',

    // Settings Modal (Clean monochrome theme titles)
    'settings.title': 'Settings',
    'settings.subtitle': 'Settings are saved on the server by your IP and profile',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.language': 'Language',
    'lang.ru': 'Русский',
    'lang.en': 'English',
    'settings.currency': 'Currency',
    'cur.rub': 'Ruble',
    'cur.usd': 'US Dollar',
    'cur.eur': 'Euro',
    'cur.byn': 'Bel. ruble',
    'settings.account': 'Personal cabinet',
    'settings.account.meta': 'Profile and orders',
    'settings.logout': 'Log out',
    'settings.syncedProfile': 'Settings synced with your profile',
    'settings.syncedIp': 'Settings saved on server for your IP',
    'settings.syncedLocal': 'Settings synced on this device',

    // Create Order Page (2 - объявление.html)
    'post.badge': 'Task publishing',
    'post.title': 'Post a task on Vibe Working',
    'post.subtitle': 'Describe a simple online task, set a clear budget, and get applications from skilled teens in minutes with zero paperwork.',
    'post.categoryLabel': 'Select category',
    'post.titleLabel': 'Task title',
    'post.titleHint': 'State the essence of the task clearly and briefly',
    'post.titlePlaceholder': 'e.g. Edit a dynamic Reels video for a clothing brand...',
    'post.budgetLabel': 'Budget',
    'post.budgetHint': 'Specify a fair amount for completing the work',
    'post.descLabel': 'Detailed description',
    'post.descHint': 'Describe requirements, deliverable format, deadline, and materials provided',
    'post.descPlaceholder': 'What specifically needs to be done?\nExample: We provide raw video and track. Need to cut dynamic shots, add subtitles and sound effects in CapCut or Premiere...',
    'post.perk1': 'No contracts or paperwork',
    'post.perk2': 'Replies within 15 minutes',
    'post.perk3': 'Card & instant payouts',
    'post.submit': 'Publish task',
    'post.submitting': 'Publishing...',
    'post.catTexts': 'Texts',
    'post.catDesign': 'Design',
    'post.catVideo': 'Video / Reels',
    'post.catStudy': 'Study',
    'post.catTables': 'Tables',
    'post.catSocial': 'Social media',

    // Cabinet Page (3 - личный кабинет.html)
    'cab.title': 'Personal Cabinet',
    'cab.unauthTitle': 'Vibe Working Cabinet',
    'cab.unauthDesc': 'Sign in with your Google account, phone, or email to track applications, post orders, and manage earned funds.',
    'cab.googleLogin': 'Continue with Google',
    'cab.toTasks': 'Back to task feed',
    'cab.roleWorker': '💼 Freelancer',
    'cab.roleClient': '🎯 Client',
    'cab.switchToClient': 'Switch to Client',
    'cab.switchToWorker': 'Switch to Freelancer',
    'cab.editProfile': 'Edit profile',
    'cab.settings': 'Settings',
    'cab.aboutTitle': 'About me',
    'cab.balance': 'Current balance',
    'cab.balanceSub': 'Payouts to card or instant transfer',
    'cab.topUp': '+ Top up',
    'cab.withdraw': 'Withdraw',
    'cab.ordersCount': 'Orders posted',
    'cab.worksCount': 'My applications',
    'cab.tabOrders': 'My orders',
    'cab.tabWorks': 'My applications & works',
    'cab.tabSettings': 'Profile settings',
    'cab.emptyOrders': 'You have no active orders yet',
    'cab.emptyOrdersDesc': 'Post a simple online task to find a reliable teen freelancer.',
    'cab.postFirstOrder': 'Post first order',
    'cab.emptyWorks': 'You haven’t applied to any tasks yet',
    'cab.emptyWorksDesc': 'Explore the task feed, find a great project and submit your first application!',
    'cab.goToFeed': 'Go to task feed',
    'cab.editModalTitle': 'Edit Profile',
    'cab.editModalSub': 'Update your information for clients and freelancers',
    'cab.nameLabel': 'Name or title',
    'cab.usernameLabel': 'Username (@handle)',
    'cab.cityLabel': 'City',
    'cab.cityPlaceholder': 'e.g. New York',
    'cab.skillsLabel': 'Skills / Specialization',
    'cab.skillsPlaceholder': 'Reels editing, Design, Copywriting...',
    'cab.telegramLabel': 'Telegram handle',
    'cab.telegramPlaceholder': '@username',
    'cab.aboutLabel': 'About me',
    'cab.aboutPlaceholder': 'Briefly describe your experience and skills...',
    'cab.cancel': 'Cancel',
    'cab.saveChanges': 'Save changes',
    'cab.changePhoto': 'Change profile photo',
    'cab.usernameLatinHint': 'Latin characters only (a-z, 0-9, _)',
    'cab.tabReviews': 'Reviews',
    'cab.reviewsCount': 'Reviews',
    'cab.emptyReviews': 'No reviews yet',
    'cab.emptyReviewsDesc': 'Reviews will appear here after completing your first orders.',
    'cab.rating': 'Rating',
    'cab.paymentMethod': 'Payment / Payout method',
    'cab.methodCard': 'Bank card (Visa / Mastercard)',
    'cab.methodSbp': 'Instant Payout (SBP)',
    'cab.balanceModalDeposit': 'Top up balance',
    'cab.balanceModalWithdraw': 'Withdraw funds',
    'cab.balanceModalSub': 'Zero commission via bank card or instant transfer',
    'cab.amountLabel': 'Amount in rubles (₽)',
    'cab.confirm': 'Confirm',

    // Crop Modal
    'crop.title': 'Crop Profile Photo',
    'crop.hint': 'Drag the image and use the zoom slider to adjust the crop area',
    'crop.zoom': 'Zoom',
    'crop.cancel': 'Cancel',
    'crop.save': 'Save',

    // Post task details
    'post.deadlineLabel': 'Deadline',
    'post.deadlineUrgent': 'Urgent (under 24 hours)',
    'post.deadline2_3': '2-3 days',
    'post.deadlineWeek': 'Up to a week',
    'post.deadlineFlexible': 'Flexible',
    'post.contactLabel': 'Contact information (Telegram, phone or email)',
    'post.contactHint': 'Specify convenient contact info for applications',
    'post.contactPlaceholder': '@username or email/phone',
    'post.zeroCommission': 'Zero platform fees for initial orders',
    'post.safeDeal': 'Safe deal and verified freelancers',

    // Auth Modal
    'auth.title': 'Sign in to Vibe Working',
    'auth.titleLogin': 'Sign in to Vibe Working',
    'auth.titleRegister': 'Sign up on Vibe Working',
    'auth.subLogin': 'Sign in or create an account to start freelancing',
    'auth.subPost': 'Sign in or register to publish a task',
    'auth.login': 'Sign in',
    'auth.register': 'Sign up',
    'auth.google': 'Continue with Google',
    'auth.orContacts': 'or via contacts',
    'auth.byPhone': 'By phone',
    'auth.byEmail': 'By email',
    'auth.nameLabel': 'Your name',
    'auth.namePlaceholder': 'e.g. Alex',
    'auth.usernameLabel': 'Username (Latin only)',
    'auth.usernamePlaceholder': 'username',
    'auth.usernameLatinHint': 'Latin letters a-z, numbers and _ only',
    'auth.roleLabel': 'Who are you on Vibe Working?',
    'auth.role.worker': '💼 Freelancer',
    'auth.role.workerSub': 'I want to take tasks',
    'auth.role.client': '🎯 Client',
    'auth.role.clientSub': 'I want to post tasks',
    'auth.phoneLabel': 'Phone number',
    'auth.phonePlaceholder': '+1 (555) 000-0000',
    'auth.smsLabel': 'SMS verification code',
    'auth.smsPlaceholder': 'Enter verification code',
    'auth.emailLabel': 'Email address',
    'auth.emailPlaceholder': 'alex@example.com',
    'auth.passLabel': 'Password',
    'auth.passPlaceholder': 'Enter password',
    'auth.submitLogin': 'Sign in',
    'auth.submitRegister': 'Create account',

    // Toasts
    'toast.needLogin': 'Please sign in first to apply',
    'toast.needLoginPost': 'Please sign in first to post an order',
    'toast.responseSent': 'Application sent to the client!',
    'toast.welcome': 'Welcome, ',
    'toast.logout': 'You have logged out',
    'toast.themeDark': 'Dark theme enabled',
    'toast.themeLight': 'Light theme enabled',
    'toast.langSwitched': 'Language switched to English',
    'toast.curSwitched': 'Currency changed to ',
    'toast.orderCreated': 'Task successfully published!',
    'toast.profileSaved': 'Profile successfully updated!',
    'toast.avatarSaved': 'Profile photo successfully updated!',
    'toast.avatarError': 'Failed to upload photo',
    'toast.fillAllFields': 'Please fill in all required fields',
    'toast.googleCancel': 'Google sign-in cancelled',
    'toast.googleOpening': 'Opening Google window...',
    'toast.depositSuccess': 'Balance successfully topped up!',
    'toast.withdrawSuccess': 'Withdrawal request submitted!',
    'toast.insufficientFunds': 'Insufficient funds on balance',
  }
};

class SettingsManager {
  private current: UserSettings = {
    theme: 'dark',
    lang: 'ru',
    currency: 'RUB',
    updatedAt: Date.now(),
  };

  private channel: BroadcastChannel | null = null;
  private subscribers: Array<(settings: UserSettings) => void> = [];
  private serverIp: string = '';
  private syncSource: 'user' | 'ip' | 'local' | 'default' = 'default';

  constructor() {
    this.readLocal();
    this.initSyncChannel();
    this.initStorageListener();
    this.applyTheme(this.current.theme);
    this.applyDocumentLang(this.current.lang);

    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => {
        this.applyTranslations();
        this.updateUI();
        this.syncServerSettings();
        this.initOutsideClickListeners();
      });

      window.addEventListener('pageshow', () => {
        this.readLocal();
        this.applyTheme(this.current.theme);
        this.applyTranslations();
        this.updateUI();
        this.syncServerSettings();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.readLocal();
          this.applyTheme(this.current.theme);
          this.applyTranslations();
          this.updateUI();
        }
      });
    }
  }

  // 1. Outside click modal closing & Escape key listener
  private initOutsideClickListeners() {
    if (typeof document === 'undefined') return;

    // Listen for outside clicks on the settings modal
    document.addEventListener('click', (event) => {
      const modal = document.getElementById('settings-modal');
      if (!modal || !modal.classList.contains('active')) return;

      const modalBox = modal.querySelector('.modal-box');
      const target = event.target as Node | null;
      if (!target) return;

      // Do not close if clicking inside modal content
      if (modalBox && modalBox.contains(target)) return;

      // Do not close if clicking directly on a trigger button that opened it
      const gear = document.getElementById('gear-scroll-indicator');
      if (gear && gear.contains(target)) return;

      const triggerBtn = (target as HTMLElement).closest?.('[onclick*="openSettingsModal"], .btn-settings-open');
      if (triggerBtn) return;

      // Clicked on the backdrop overlay or outside
      modal.classList.remove('active');
    });

    // Close on Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const modal = document.getElementById('settings-modal');
        if (modal && modal.classList.contains('active')) {
          modal.classList.remove('active');
        }
      }
    });

    // Direct overlay click listener
    const modalEl = document.getElementById('settings-modal');
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.classList.remove('active');
        }
      });
    }
  }

  // 2. Чтение настроек из LocalStorage
  private readLocal(): UserSettings {
    try {
      const raw = localStorage.getItem('vw_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.theme === 'light' || parsed.theme === 'dark') this.current.theme = parsed.theme;
          if (parsed.lang === 'ru' || parsed.lang === 'en') this.current.lang = parsed.lang;
          if (['RUB', 'USD', 'EUR', 'BYN'].includes(parsed.currency)) this.current.currency = parsed.currency;
          if (parsed.updatedAt) this.current.updatedAt = parsed.updatedAt;
        }
      } else {
        const userRaw = localStorage.getItem('vw_user') || localStorage.getItem('vw_local_user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (user?.settings) {
            if (user.settings.theme) this.current.theme = user.settings.theme;
            if (user.settings.lang) this.current.lang = user.settings.lang;
            if (user.settings.currency) this.current.currency = user.settings.currency;
          }
        }
      }
    } catch (_) {}
    return this.current;
  }

  private saveLocal() {
    try {
      this.current.updatedAt = Date.now();
      localStorage.setItem('vw_settings', JSON.stringify(this.current));
      const userRaw = localStorage.getItem('vw_user') || localStorage.getItem('vw_local_user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        user.settings = { ...this.current };
        localStorage.setItem('vw_user', JSON.stringify(user));
        localStorage.setItem('vw_local_user', JSON.stringify(user));
      }
    } catch (_) {}
  }

  // 3. BroadcastChannel для мгновенной синхронизации между открытыми страницами и вкладками
  private initSyncChannel() {
    if (typeof window === 'undefined') return;
    try {
      this.channel = new BroadcastChannel('vw_settings_sync');
      this.channel.onmessage = (event) => {
        if (event && event.data && typeof event.data === 'object') {
          this.handleExternalSettings(event.data);
        }
      };
    } catch (e) {}
  }

  private initStorageListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === 'vw_settings' && event.newValue) {
        try {
          const s = JSON.parse(event.newValue);
          this.handleExternalSettings(s);
        } catch (_) {}
      }
    });
  }

  private handleExternalSettings(newSettings: Partial<UserSettings>) {
    let changed = false;
    if (newSettings.theme && (newSettings.theme === 'light' || newSettings.theme === 'dark') && newSettings.theme !== this.current.theme) {
      this.current.theme = newSettings.theme;
      changed = true;
    }
    if (newSettings.lang && (newSettings.lang === 'ru' || newSettings.lang === 'en') && newSettings.lang !== this.current.lang) {
      this.current.lang = newSettings.lang;
      changed = true;
    }
    if (newSettings.currency && ['RUB', 'USD', 'EUR', 'BYN'].includes(newSettings.currency) && newSettings.currency !== this.current.currency) {
      this.current.currency = newSettings.currency as any;
      changed = true;
    }

    if (changed) {
      this.applyTheme(this.current.theme);
      this.applyDocumentLang(this.current.lang);
      this.applyTranslations();
      this.updateUI();
      this.notifySubscribers();
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      try {
        cb({ ...this.current });
      } catch (_) {}
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vw:settings-changed', { detail: { ...this.current } }));
      window.dispatchEvent(new CustomEvent('vw:language-changed', { detail: { lang: this.current.lang } }));
    }
  }

  private broadcast() {
    this.saveLocal();
    if (this.channel) {
      try {
        this.channel.postMessage({ ...this.current });
      } catch (_) {}
    }
    this.notifySubscribers();
  }

  // 4. Синхронизация с сервером по IP и профилю
  public async syncServerSettings() {
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('vw_session_token');
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        headers['x-session-token'] = token;
      }
      const userRaw = localStorage.getItem('vw_user');
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u?.id) headers['x-user-id'] = u.id;
        } catch (_) {}
      }

      const res = await fetch('/api/settings', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.settings) {
          this.serverIp = data.ip || '';
          this.syncSource = data.source || 'ip';

          const s = data.settings;
          let changed = false;
          if (s.theme && s.theme !== this.current.theme) {
            this.current.theme = s.theme;
            changed = true;
          }
          if (s.lang && s.lang !== this.current.lang) {
            this.current.lang = s.lang;
            changed = true;
          }
          if (s.currency && s.currency !== this.current.currency) {
            this.current.currency = s.currency;
            changed = true;
          }

          this.saveLocal();
          this.applyTheme(this.current.theme);
          this.applyDocumentLang(this.current.lang);
          this.applyTranslations();
          this.updateUI();

          if (changed) {
            this.notifySubscribers();
          }
        }
      }
    } catch (_) {
      this.syncSource = 'local';
      this.updateUI();
    }
  }

  public async saveServerSettings() {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('vw_session_token');
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
        headers['x-session-token'] = token;
      }
      const userRaw = localStorage.getItem('vw_user');
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u?.id) headers['x-user-id'] = u.id;
        } catch (_) {}
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          theme: this.current.theme,
          lang: this.current.lang,
          currency: this.current.currency,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ip) this.serverIp = data.ip;
        this.syncSource = data.source || (token ? 'user' : 'ip');
        this.updateUI();
      }
    } catch (_) {
      this.syncSource = 'local';
      this.updateUI();
    }
  }

  // 5. Публичные геттеры и сеттеры
  public getSettings(): UserSettings {
    return { ...this.current };
  }

  public getTheme(): 'dark' | 'light' {
    return this.current.theme;
  }

  public getLanguage(): 'ru' | 'en' {
    return this.current.lang;
  }

  public getCurrency(): 'RUB' | 'USD' | 'EUR' | 'BYN' {
    return this.current.currency;
  }

  public setTheme(theme: 'dark' | 'light', skipServer = false) {
    if (this.current.theme === theme) return;
    this.current.theme = theme;
    this.applyTheme(theme);
    this.broadcast();
    this.updateUI();
    if (!skipServer) this.saveServerSettings();
  }

  public setLanguage(lang: 'ru' | 'en', skipServer = false) {
    if (this.current.lang === lang) return;
    this.current.lang = lang;
    this.applyDocumentLang(lang);
    this.applyTranslations();
    this.broadcast();
    this.updateUI();
    if (!skipServer) this.saveServerSettings();
  }

  public setCurrency(currency: 'RUB' | 'USD' | 'EUR' | 'BYN', skipServer = false) {
    if (this.current.currency === currency) return;
    this.current.currency = currency;
    this.broadcast();
    this.updateUI();
    if (!skipServer) this.saveServerSettings();
  }

  // 6. Форматирование цен и валют
  public formatPrice(rubAmount: number): string {
    const cur = CURRENCIES[this.current.currency] || CURRENCIES.RUB;
    const value = rubAmount * cur.rate;
    const num = value.toFixed(cur.decimals).replace('.', ',');
    let formatted = num;
    if (cur.decimals === 0) {
      formatted = String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    } else {
      const parts = num.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      formatted = parts.join(',');
    }
    return cur.position === 'before'
      ? `${cur.symbol}${formatted}`
      : `${formatted} ${cur.symbol}`;
  }

  public convertToRub(amountInCurrent: number): number {
    const cur = CURRENCIES[this.current.currency] || CURRENCIES.RUB;
    return Math.round(amountInCurrent / cur.rate);
  }

  public t(key: string): string {
    const dict = TRANSLATIONS[this.current.lang] || TRANSLATIONS.ru;
    return dict[key] || TRANSLATIONS.ru[key] || key;
  }

  // 7. Применение DOM стилей и переводов
  private applyTheme(theme: 'dark' | 'light') {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', theme);
  }

  private applyDocumentLang(lang: 'ru' | 'en') {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
  }

  public applyTranslations(root: HTMLElement | Document = document) {
    if (typeof document === 'undefined') return;
    const isRu = this.current.lang === 'ru';

    // 1. Динамическое обновление заголовка страницы (title) и мета-тегов
    const path = window.location.pathname.toLowerCase();
    if (path.includes('2 - ') || path.includes('объявление') || path.includes('post')) {
      document.title = isRu ? 'Разместить заказ — Vibe Working' : 'Post a Task — Vibe Working';
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', isRu
        ? 'Разместите задание на бирже микрозадач для подростков Vibe Working без бюрократии и договоров.'
        : 'Post a task on Vibe Working teen freelance marketplace with zero paperwork.');
    } else if (path.includes('3 - ') || path.includes('кабинет') || path.includes('cabinet')) {
      document.title = isRu ? 'Личный кабинет — Vibe Working' : 'Dashboard — Vibe Working';
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', isRu
        ? 'Личный кабинет на бирже Vibe Working: управление профилем, заказами, откликами и балансом.'
        : 'Dashboard on Vibe Working: manage profile, orders, applications, and balance.');
    } else {
      document.title = isRu ? 'Vibe Working — фриланс-биржа для подростков' : 'Vibe Working — Freelance Platform for Teens';
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) descEl.setAttribute('content', isRu
        ? 'Платформа микрозадач для подростков от 14 лет без ИП, самозанятости и бюрократии.'
        : 'Online freelance task platform for teens 14+ with zero bureaucracy.');
    }

    // 2. data-i18n текстовые узлы
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const val = this.t(key);
        if (val) el.textContent = val;
      }
    });

    // 3. data-i18n-placeholder для полей ввода
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const val = this.t(key);
        if (val && 'placeholder' in el) (el as HTMLInputElement).placeholder = val;
      }
    });

    // 4. data-i18n-title
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const val = this.t(key);
        if (val && 'title' in el) (el as HTMLElement).title = val;
      }
    });
  }

  public updateUI() {
    if (typeof document === 'undefined') return;
    const { theme, lang, currency } = this.current;

    // Theme buttons
    const tDark = document.getElementById('theme-opt-dark');
    const tLight = document.getElementById('theme-opt-light');
    if (tDark) tDark.classList.toggle('active', theme === 'dark');
    if (tLight) tLight.classList.toggle('active', theme === 'light');

    // Language buttons
    const lRu = document.getElementById('lang-opt-ru');
    const lEn = document.getElementById('lang-opt-en');
    if (lRu) lRu.classList.toggle('active', lang === 'ru');
    if (lEn) lEn.classList.toggle('active', lang === 'en');

    // Currency buttons
    const cRub = document.getElementById('cur-opt-rub');
    const cUsd = document.getElementById('cur-opt-usd');
    const cEur = document.getElementById('cur-opt-eur');
    const cByn = document.getElementById('cur-opt-byn');
    if (cRub) cRub.classList.toggle('active', currency === 'RUB');
    if (cUsd) cUsd.classList.toggle('active', currency === 'USD');
    if (cEur) cEur.classList.toggle('active', currency === 'EUR');
    if (cByn) cByn.classList.toggle('active', currency === 'BYN');

    // Select elements
    const curSelect = document.getElementById('task-currency-select') as HTMLSelectElement | null;
    if (curSelect && curSelect.value !== currency) {
      curSelect.value = currency;
    }

    // IP Notice
    const noticeEl = document.getElementById('settings-ip-notice');
    if (noticeEl) {
      const isRu = lang === 'ru';
      if (this.syncSource === 'user') {
        noticeEl.textContent = isRu ? 'Синхронизировано с вашим профилем' : 'Settings synced with your profile';
      } else if (this.syncSource === 'ip' && this.serverIp) {
        noticeEl.textContent = isRu ? `Синхронизировано по IP: ${this.serverIp}` : `Synced by IP: ${this.serverIp}`;
      } else if (this.syncSource === 'local') {
        noticeEl.textContent = isRu ? 'Синхронизировано на этом устройстве' : 'Synced on this device';
      } else {
        noticeEl.textContent = isRu ? (this.serverIp ? `Синхронизировано по IP: ${this.serverIp}` : 'Настройки сохранены') : 'Settings synced';
      }
    }
  }

  public subscribe(cb: (settings: UserSettings) => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }
}

// ==========================================
// UNIFIED CROSS-PAGE AUTH MANAGER
// ==========================================
class AuthSyncManager {
  private channel: BroadcastChannel | null = null;
  private currentUser: StoredUser | null = null;
  private sessionToken: string = '';

  constructor() {
    this.readLocal();
    this.initChannel();
    this.initStorageListener();

    if (typeof window !== 'undefined') {
      window.addEventListener('DOMContentLoaded', () => {
        this.readLocal();
        this.renderAuthNav();
        this.verifyWithServer();
      });

      window.addEventListener('pageshow', () => {
        this.readLocal();
        this.renderAuthNav();
        this.verifyWithServer();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.readLocal();
          this.renderAuthNav();
        }
      });
    }
  }

  private initChannel() {
    if (typeof window === 'undefined') return;
    try {
      this.channel = new BroadcastChannel('vw_auth_sync');
      this.channel.onmessage = (event) => {
        if (event && event.data) {
          if (event.data.type === 'LOGIN' || event.data.type === 'UPDATE') {
            this.currentUser = event.data.user || null;
            this.sessionToken = event.data.token || '';
            this.saveLocal(this.currentUser, this.sessionToken, true);
            this.renderAuthNav();
            this.dispatchChangeEvent();
          } else if (event.data.type === 'LOGOUT') {
            this.currentUser = null;
            this.sessionToken = '';
            this.saveLocal(null, '', true);
            this.renderAuthNav();
            this.dispatchChangeEvent();
          }
        }
      };
    } catch (_) {}
  }

  private initStorageListener() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === 'vw_user' || event.key === 'vw_session_token' || event.key === 'vw_local_user') {
        this.readLocal();
        this.renderAuthNav();
        this.dispatchChangeEvent();
      }
    });
  }

  public readLocal(): StoredUser | null {
    try {
      const raw = localStorage.getItem('vw_user') || localStorage.getItem('vw_local_user');
      this.currentUser = raw ? JSON.parse(raw) : null;
      this.sessionToken = localStorage.getItem('vw_session_token') || (this.currentUser ? 'token_local' : '');
    } catch (_) {
      this.currentUser = null;
      this.sessionToken = '';
    }
    return this.currentUser;
  }

  public saveLocal(user: StoredUser | null, token: string = '', skipBroadcast = false) {
    try {
      this.currentUser = user;
      this.sessionToken = token;
      if (!user) {
        localStorage.removeItem('vw_user');
        localStorage.removeItem('vw_local_user');
        localStorage.removeItem('vw_session_token');
      } else {
        localStorage.setItem('vw_user', JSON.stringify(user));
        localStorage.setItem('vw_local_user', JSON.stringify(user));
        if (token) localStorage.setItem('vw_session_token', token);
      }
    } catch (_) {}

    if (!skipBroadcast) {
      if (this.channel) {
        try {
          this.channel.postMessage({
            type: user ? 'LOGIN' : 'LOGOUT',
            user,
            token
          });
        } catch (_) {}
      }
      this.dispatchChangeEvent();
    }
  }

  public dispatchChangeEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vw:auth-changed', {
        detail: { user: this.currentUser, token: this.sessionToken }
      }));
    }
  }

  public getUser(): StoredUser | null {
    if (!this.currentUser) this.readLocal();
    return this.currentUser;
  }

  public getToken(): string {
    if (!this.sessionToken) this.readLocal();
    return this.sessionToken;
  }

  public setUser(user: StoredUser, token: string) {
    this.saveLocal(user, token, false);
    this.renderAuthNav();
  }

  public async logout() {
    try {
      if (typeof (window as any).signOutFromFirebase === 'function') {
        await (window as any).signOutFromFirebase();
      }
      const token = this.sessionToken;
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'x-session-token': token
          }
        });
      }
    } catch (_) {}
    this.saveLocal(null, '', false);
    this.renderAuthNav();
  }

  public async verifyWithServer() {
    if (!this.sessionToken && !this.currentUser) return;
    try {
      const headers: Record<string, string> = {};
      if (this.sessionToken) {
        headers['Authorization'] = 'Bearer ' + this.sessionToken;
        headers['x-session-token'] = this.sessionToken;
      }
      if (this.currentUser?.id) {
        headers['x-user-id'] = this.currentUser.id;
      }

      const res = await fetch('/api/auth/me', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          this.currentUser = data.user;
          this.saveLocal(this.currentUser, this.sessionToken, true);
          this.renderAuthNav();
        } else if (this.currentUser) {
          // If server was restarted and lost session, re-sync client user to server
          await this.syncUserToServer(this.currentUser, this.sessionToken);
        }
      }
    } catch (_) {
      // Keep local cached user in offline or static mode
    }
  }

  public async syncUserToServer(user: StoredUser, token: string) {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, token })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) this.sessionToken = data.token;
        if (data.user) this.currentUser = data.user;
        this.saveLocal(this.currentUser, this.sessionToken, true);
        this.renderAuthNav();
      }
    } catch (_) {}
  }

export function formatDisplayName(name?: string, username?: string): string {
  if (name && name.trim()) {
    const clean = name.trim().replace(/^@/, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
    }
    return clean;
  }
  if (username) {
    const cleanU = username.trim().replace(/^@/, '');
    return cleanU.charAt(0).toUpperCase() + cleanU.slice(1);
  }
  return 'Пользователь';
}

  public renderAuthNav() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('auth-nav-container');
    if (!container) return;

    const user = this.currentUser;
    const isRu = settingsManager.getLanguage() === 'ru';
    const loginText = isRu ? 'Войти' : 'Sign in';
    const logoutTitle = isRu ? 'Выйти' : 'Log out';

    if (!user) {
      container.innerHTML = `
        <button class="btn-auth-open" onclick="if(typeof openAuthModal==='function'){openAuthModal()}else{window.location.href='index.html#auth'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>${loginText}</span>
        </button>
      `;
    } else {
      const displayName = formatDisplayName(user.name, user.username);
      const initial = (user.name || user.username || 'U').charAt(0).toUpperCase();
      const avatarHtml = user.avatar
        ? `<img src="${user.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : initial;

      container.innerHTML = `
        <a class="vw-account-link" href="3 - личный кабинет.html" title="${isRu ? 'Личный кабинет' : 'Cabinet'}" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:14px;font-weight:600;text-decoration:none;">
          <span class="vw-nav-avatar" style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:var(--accent-on);display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;overflow:hidden;">
            ${avatarHtml}
          </span>
          <span class="vw-nav-name" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${this.escape(displayName)}
          </span>
        </a>
        <button class="btn-logout-small" onclick="if(typeof logout==='function'){logout()}else{window.VWAuth.logout()}" title="${logoutTitle}" aria-label="${logoutTitle}" style="background:transparent;border:1px solid var(--border);color:var(--text-muted);padding:7px 10px;border-radius:9px;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      `;
    }
  }

  private escape(str: string): string {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c] || c));
  }
}

// Single instances attached to window
export const settingsManager = new SettingsManager();
export const authSyncManager = new AuthSyncManager();

if (typeof window !== 'undefined') {
  (window as any).VWSettings = settingsManager;
  (window as any).VWAuth = authSyncManager;

  // Backward compatibility global wrappers
  (window as any).setTheme = (theme: 'dark' | 'light') => settingsManager.setTheme(theme);
  (window as any).setLanguage = (lang: 'ru' | 'en') => settingsManager.setLanguage(lang);
  (window as any).setCurrency = (cur: any) => settingsManager.setCurrency(cur);
  (window as any).formatPrice = (val: number) => settingsManager.formatPrice(val);
  (window as any).formatDisplayName = (name?: string, u?: string) => formatDisplayName(name, u);
  (window as any).getStoredUser = () => authSyncManager.getUser();
  (window as any).saveStoredUser = (user: any, token?: string) => authSyncManager.saveLocal(user, token || '');
}

