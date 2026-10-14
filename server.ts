import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data folder and db.json exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserSettings {
  theme: 'dark' | 'light';
  lang: 'ru' | 'en';
  currency: 'RUB' | 'USD' | 'EUR' | 'BYN';
}

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  password?: string;
  roleKey: 'worker' | 'client';
  avatar?: string;
  about?: string;
  city?: string;
  skills?: string;
  telegram?: string;
  balance: number;
  settings: UserSettings;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  currency: 'RUB' | 'USD' | 'EUR' | 'BYN';
  category: string;
  authorId: string;
  authorName: string;
  authorContact?: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'completed';
}

interface Application {
  id: string;
  taskId: string;
  taskTitle: string;
  applicantId: string;
  applicantName: string;
  applicantContact: string;
  budget: string;
  status: 'active' | 'done' | 'review';
  statusText: string;
  createdAt: string;
}

interface Database {
  ipSettings: Record<string, UserSettings>;
  users: User[];
  tasks: Task[];
  applications: Application[];
  sessions: Record<string, string>; // sessionToken -> userId
}

function getInitialDb(): Database {
  return {
    ipSettings: {},
    users: [],
    tasks: [],
    applications: [],
    sessions: {},
  };
}

function readDb(): Database {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return getInitialDb();
  }
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function getSessionUser(req: express.Request, db: Database): User | null {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token && req.headers['x-session-token']) {
    token = String(req.headers['x-session-token']);
  }

  if (token && db.sessions[token]) {
    const userId = db.sessions[token];
    return db.users.find((u) => u.id === userId) || null;
  }

  // Fallback: check if client provided valid x-user-id matching a known user
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId && typeof headerUserId === 'string') {
    const user = db.users.find((u) => u.id === headerUserId);
    if (user) {
      if (token) {
        db.sessions[token] = user.id;
        writeDb(db);
      }
      return user;
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // API: НАСТРОЙКИ (ПО IP ИЛИ ПО ПРОФИЛЮ)
  // ==========================================
  app.get('/api/settings', (req, res) => {
    const db = readDb();
    const ip = getClientIp(req);
    const user = getSessionUser(req, db);

    if (user && user.settings) {
      // Синхронизируем настройки авторизованного профиля с IP
      db.ipSettings[ip] = user.settings;
      writeDb(db);
      return res.json({ source: 'user', settings: user.settings, ip });
    }

    if (db.ipSettings[ip]) {
      return res.json({ source: 'ip', settings: db.ipSettings[ip], ip });
    }

    const defaultSettings: UserSettings = {
      theme: 'dark',
      lang: 'ru',
      currency: 'RUB',
    };
    // Сохраняем начальные настройки для IP
    db.ipSettings[ip] = defaultSettings;
    writeDb(db);
    res.json({ source: 'default', settings: defaultSettings, ip });
  });

  app.post('/api/settings', (req, res) => {
    const db = readDb();
    const ip = getClientIp(req);
    const user = getSessionUser(req, db);
    const { theme, lang, currency } = req.body;

    const newSettings: UserSettings = {
      theme: theme === 'light' ? 'light' : 'dark',
      lang: lang === 'en' ? 'en' : 'ru',
      currency: ['USD', 'EUR', 'BYN'].includes(currency) ? currency : 'RUB',
    };

    // Сохраняем по IP
    db.ipSettings[ip] = newSettings;

    // Сохраняем в профиль пользователя, если он авторизован
    if (user) {
      user.settings = newSettings;
    }

    writeDb(db);
    res.json({ success: true, settings: newSettings, ip, source: user ? 'user' : 'ip' });
  });

  // ==========================================
  // API: АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ РЕАЛЬНЫХ ПОЛЬЗОВАТЕЛЕЙ
  // ==========================================
  app.get('/api/auth/me', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);
    if (!user) {
      return res.json({ user: null });
    }
    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ user: safeUser });
  });

  // Client session synchronization (restores session if server restarted or across tabs)
  app.post('/api/auth/sync', (req, res) => {
    const db = readDb();
    const { user: clientUser, token } = req.body;
    if (clientUser && clientUser.id) {
      let user = db.users.find((u) => u.id === clientUser.id);
      if (!user) {
        user = {
          ...clientUser,
          balance: typeof clientUser.balance === 'number' ? clientUser.balance : 0,
        };
        db.users.push(user);
      }
      const activeToken = token || ('token_' + Math.random().toString(36).substring(2) + Date.now().toString(36));
      db.sessions[activeToken] = user.id;
      writeDb(db);
      const safeUser = { ...user };
      delete safeUser.password;
      return res.json({ success: true, token: activeToken, user: safeUser });
    }
    res.status(400).json({ error: 'User is required' });
  });

  // Google OAuth вход / регистрация
  app.post('/api/auth/google', (req, res) => {
    const db = readDb();
    const { email, displayName, photoURL, uid } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email обязателен для Google OAuth' });
    }

    let user = db.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    const ip = getClientIp(req);
    const ipSetting = db.ipSettings[ip] || { theme: 'dark', lang: 'ru', currency: 'RUB' };

    if (!user) {
      // Регистрируем нового реального пользователя
      const cleanName = displayName || email.split('@')[0];
      const baseUsername = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 20) || 'user';
      let username = baseUsername;
      let counter = 1;
      while (db.users.some((u) => u.username === username)) {
        username = `${baseUsername}_${counter++}`;
      }

      user = {
        id: 'user_' + (uid || Date.now()),
        name: cleanName,
        username,
        email,
        roleKey: 'worker',
        avatar: photoURL || '',
        about: '',
        city: '',
        skills: '',
        balance: 0,
        settings: ipSetting,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      if (photoURL && !user.avatar) user.avatar = photoURL;
      if (displayName && user.name === user.email?.split('@')[0]) user.name = displayName;
      if (user.settings) {
        db.ipSettings[ip] = user.settings;
      } else if (db.ipSettings[ip]) {
        user.settings = db.ipSettings[ip];
      }
    }

    // Создаем сессию
    const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    writeDb(db);

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ token, user: safeUser });
  });

  // Регистрация по почте / телефону
  app.post('/api/auth/register', (req, res) => {
    const db = readDb();
    const { name, email, phone, password, roleKey } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Имя или никнейм обязательны' });
    }

    if (email && db.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Пользователь с такой почтой уже существует' });
    }

    if (phone && db.users.some((u) => u.phone === phone)) {
      return res.status(400).json({ error: 'Пользователь с таким телефоном уже существует' });
    }

    const ip = getClientIp(req);
    const ipSetting = db.ipSettings[ip] || { theme: 'dark', lang: 'ru', currency: 'RUB' };

    const baseUsername = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20) || 'user';
    let username = baseUsername;
    let counter = 1;
    while (db.users.some((u) => u.username === username)) {
      username = `${baseUsername}_${counter++}`;
    }

    const user: User = {
      id: 'user_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      username,
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      password: password || undefined,
      roleKey: roleKey === 'client' ? 'client' : 'worker',
      avatar: '',
      about: '',
      city: '',
      skills: '',
      balance: 0,
      settings: ipSetting,
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    writeDb(db);

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ token, user: safeUser });
  });

  // Вход по почте или телефону
  app.post('/api/auth/login', (req, res) => {
    const db = readDb();
    const { login, password, phone, sms } = req.body;

    let user: User | undefined;

    // Вход по телефону и СМС
    if (phone) {
      if (!sms || sms.trim().length < 4) {
        return res.status(400).json({ error: 'Введите корректный код из СМС' });
      }
      user = db.users.find((u) => u.phone === phone.trim());
      if (!user) {
        // Если телефон еще не зарегистрирован, автоматически создаем аккаунт
        const cleanName = 'User ' + phone.slice(-4);
        const baseUsername = 'user_' + phone.slice(-4);
        const ip = getClientIp(req);
        const ipSetting = db.ipSettings[ip] || { theme: 'dark', lang: 'ru', currency: 'RUB' };

        user = {
          id: 'user_' + Date.now(),
          name: cleanName,
          username: baseUsername,
          phone: phone.trim(),
          roleKey: 'worker',
          balance: 0,
          settings: ipSetting,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      }
    } else if (login) {
      const cleanLogin = login.trim().toLowerCase();
      user = db.users.find(
        (u) =>
          u.email?.toLowerCase() === cleanLogin ||
          u.username.toLowerCase() === cleanLogin ||
          u.phone === cleanLogin
      );

      if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
      }

      if (user.password && password && user.password !== password) {
        return res.status(401).json({ error: 'Неверный пароль' });
      }
    } else {
      return res.status(400).json({ error: 'Укажите данные для входа' });
    }

    const ip = getClientIp(req);
    if (user.settings) {
      db.ipSettings[ip] = user.settings;
    } else if (db.ipSettings[ip]) {
      user.settings = db.ipSettings[ip];
    }

    const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    writeDb(db);

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ token, user: safeUser });
  });

  app.post('/api/auth/logout', (req, res) => {
    const db = readDb();
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-session-token']) {
      token = String(req.headers['x-session-token']);
    }

    if (token && db.sessions[token]) {
      delete db.sessions[token];
      writeDb(db);
    }
    res.json({ success: true });
  });

  // ==========================================
  // API: ЗАДАНИЯ (ТОЛЬКО РЕАЛЬНЫЕ ЗАКАЗЫ)
  // ==========================================
  app.get('/api/tasks', (req, res) => {
    const db = readDb();
    const { category, search } = req.query;

    let filtered = [...db.tasks];

    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === String(category).toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Свежие первыми
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ tasks: filtered });
  });

  app.post('/api/tasks', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Для размещения заказа необходимо войти в аккаунт' });
    }

    const { title, description, budget, currency, category } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ error: 'Заполните название, описание и бюджет' });
    }

    const numBudget = parseFloat(String(budget).replace(/[^\d.]/g, '')) || 0;

    const task: Task = {
      id: 'task_' + Date.now() + Math.random().toString(36).substring(2, 5),
      title: title.trim(),
      description: description.trim(),
      budget: numBudget,
      currency: ['USD', 'EUR', 'BYN'].includes(currency) ? currency : 'RUB',
      category: category || 'дизайн',
      authorId: user.id,
      authorName: user.name,
      authorContact: user.telegram || user.email || user.phone || `@${user.username}`,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    db.tasks.unshift(task);
    writeDb(db);
    res.json({ success: true, task });
  });

  // Отклик на задание
  app.post('/api/tasks/:id/apply', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Сначала войдите в аккаунт, чтобы откликнуться' });
    }

    const task = db.tasks.find((t) => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Задание не найдено' });
    }

    if (task.authorId === user.id) {
      return res.status(400).json({ error: 'Вы не можете откликнуться на собственное задание' });
    }

    const alreadyApplied = db.applications.some(
      (a) => a.taskId === task.id && a.applicantId === user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: 'Вы уже откликнулись на это задание' });
    }

    const appItem: Application = {
      id: 'app_' + Date.now(),
      taskId: task.id,
      taskTitle: task.title,
      applicantId: user.id,
      applicantName: user.name,
      applicantContact: user.telegram || user.email || user.phone || `@${user.username}`,
      budget: `${task.budget} ${task.currency}`,
      status: 'active',
      statusText: 'В работе',
      createdAt: new Date().toISOString(),
    };

    db.applications.unshift(appItem);
    writeDb(db);
    res.json({ success: true, application: appItem });
  });

  // ==========================================
  // API: ЛИЧНЫЙ КАБИНЕТ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  app.get('/api/user/cabinet', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const myOrders = db.tasks.filter((t) => t.authorId === user.id);
    const myWorks = db.applications.filter((a) => a.applicantId === user.id);

    const safeUser = { ...user };
    delete safeUser.password;

    res.json({
      user: safeUser,
      orders: myOrders,
      works: myWorks,
    });
  });

  // Обновление профиля
  app.post('/api/user/profile', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const { displayName, username, about, city, skills, email, telegram, avatar } = req.body;

    if (displayName) user.name = String(displayName).trim();
    if (username) {
      const cleanU = String(username).replace(/^@/, '').trim();
      const duplicate = db.users.find((u) => u.username === cleanU && u.id !== user.id);
      if (duplicate) {
        return res.status(400).json({ error: 'Этот юзернейм уже занят' });
      }
      user.username = cleanU;
    }
    if (about !== undefined) user.about = String(about).trim();
    if (city !== undefined) user.city = String(city).trim();
    if (skills !== undefined) user.skills = String(skills).trim();
    if (email !== undefined) user.email = String(email).trim();
    if (telegram !== undefined) user.telegram = String(telegram).trim();
    if (avatar !== undefined) user.avatar = avatar;

    writeDb(db);

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  });

  // Переключение роли (исполнитель / заказчик)
  app.post('/api/user/role', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const { roleKey } = req.body;
    if (roleKey === 'worker' || roleKey === 'client') {
      user.roleKey = roleKey;
      writeDb(db);
    }

    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  });

  // Операции с балансом (пополнение / вывод)
  app.post('/api/user/balance', (req, res) => {
    const db = readDb();
    const user = getSessionUser(req, db);

    if (!user) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const { amount, action } = req.body;
    const numAmount = parseFloat(amount) || 0;

    if (numAmount <= 0) {
      return res.status(400).json({ error: 'Укажите положительную сумму' });
    }

    if (action === 'withdraw') {
      if (user.balance < numAmount) {
        return res.status(400).json({ error: 'Недостаточно средств на балансе' });
      }
      user.balance = Math.max(0, user.balance - numAmount);
    } else if (action === 'deposit') {
      user.balance += numAmount;
    } else {
      return res.status(400).json({ error: 'Неизвестное действие' });
    }

    writeDb(db);
    const safeUser = { ...user };
    delete safeUser.password;
    res.json({ success: true, user: safeUser });
  });

  let vite: any = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
  }

  // Функция отдачи HTML страниц с трансформацией Vite в dev
  const serveHtml = async (filename: string, req: express.Request, res: express.Response) => {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const baseDir = isProd ? path.resolve(__dirname, 'dist') : __dirname;
      const filePath = path.resolve(baseDir, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Страница не найдена');
      }

      let content = fs.readFileSync(filePath, 'utf-8');
      if (vite) {
        content = await vite.transformIndexHtml(req.originalUrl || `/${filename}`, content);
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(content);
    } catch (err) {
      console.error('Error serving HTML:', err);
      res.status(500).send('Internal Server Error');
    }
  };

  // Маршруты для трёх страниц:
  // 1 - Главная страница
  const serveIndex = (req: express.Request, res: express.Response) => serveHtml('index.html', req, res);
  app.get('/', serveIndex);
  app.get('/index.html', serveIndex);
  app.get('/1%20-%20%D0%B3%D0%BB%D0%B0%D0%B2%D0%BD%D1%8B%D0%B9.html', serveIndex);
  app.get('/1 - главный.html', serveIndex);

  // 2 - Страница размещения заказа (объявление)
  const serveOrderPage = (req: express.Request, res: express.Response) => serveHtml('2 - объявление.html', req, res);
  app.get('/2%20-%20%D0%BE%D0%B1%D1%8A%D1%8F%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5.html', serveOrderPage);
  app.get('/2 - объявление.html', serveOrderPage);
  app.get('/order', serveOrderPage);
  app.get('/post', serveOrderPage);
  app.get('/create-task', serveOrderPage);

  // 3 - Страница личного кабинета
  const serveCabinetPage = (req: express.Request, res: express.Response) => serveHtml('3 - личный кабинет.html', req, res);
  app.get('/3%20-%20%D0%BB%D0%B8%D1%87%D0%BD%D1%8B%D0%B9%20%D0%BA%D0%B0%D0%B1%D0%B8%D0%BD%D0%B5%D1%82.html', serveCabinetPage);
  app.get('/3 - личный кабинет.html', serveCabinetPage);
  app.get('/cabinet', serveCabinetPage);
  app.get('/profile', serveCabinetPage);

  // Vite middlewares в dev
  if (vite) {
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', serveIndex);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vibe Working server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
