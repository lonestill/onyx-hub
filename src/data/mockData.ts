import { FeedbackItem, CrashReportItem, DailyMetric, OsBreakdown, LoaderBreakdown } from '../types';

export const mockDailyMetrics: DailyMetric[] = [
  { date: '15 Sep', appLaunches: 42, gameLaunches: 28, uniqueUsers: 19, crashes: 2 },
  { date: '16 Sep', appLaunches: 58, gameLaunches: 41, uniqueUsers: 24, crashes: 1 },
  { date: '17 Sep', appLaunches: 79, gameLaunches: 55, uniqueUsers: 31, crashes: 3 },
  { date: '18 Sep', appLaunches: 94, gameLaunches: 68, uniqueUsers: 38, crashes: 2 },
  { date: '19 Sep', appLaunches: 108, gameLaunches: 80, uniqueUsers: 45, crashes: 1 },
  { date: '20 Sep', appLaunches: 125, gameLaunches: 92, uniqueUsers: 51, crashes: 4 },
  { date: '21 Sep', appLaunches: 154, gameLaunches: 115, uniqueUsers: 64, crashes: 3 },
  { date: '22 Sep', appLaunches: 172, gameLaunches: 130, uniqueUsers: 72, crashes: 2 },
  { date: '23 Sep', appLaunches: 198, gameLaunches: 148, uniqueUsers: 83, crashes: 1 },
  { date: '24 Sep', appLaunches: 215, gameLaunches: 165, uniqueUsers: 89, crashes: 5 },
  { date: '25 Sep', appLaunches: 240, gameLaunches: 182, uniqueUsers: 98, crashes: 2 },
  { date: '26 Sep', appLaunches: 275, gameLaunches: 205, uniqueUsers: 112, crashes: 3 },
  { date: '27 Sep', appLaunches: 298, gameLaunches: 224, uniqueUsers: 120, crashes: 2 },
  { date: '28 Sep', appLaunches: 310, gameLaunches: 245, uniqueUsers: 128, crashes: 1 },
];

export const mockOsBreakdown: OsBreakdown[] = [
  { os: 'Windows 10/11 x64', share: 74, count: 286 },
  { os: 'macOS Apple Silicon (arm64)', share: 18, count: 70 },
  { os: 'Linux (Arch / Ubuntu x64)', share: 8, count: 30 },
];

export const mockLoaderBreakdown: LoaderBreakdown[] = [
  { name: 'Fabric', count: 184, color: '#38bdf8' },
  { name: 'NeoForge', count: 86, color: '#f59e0b' },
  { name: 'Forge', count: 62, color: '#ec4899' },
  { name: 'Vanilla', count: 34, color: '#10b981' },
  { name: 'Quilt', count: 20, color: '#a855f7' },
];

export const mockFeedbacks: FeedbackItem[] = [
  {
    id: 'fb-001',
    type: 'review',
    rating: 5,
    title: 'Автоматический бисект спас мою 300+ мод сборку',
    comment: 'Парни, бисект просто охуенный. Полдня сидел ебался со сборкой на 1.20.1 Fabric, игра падала на инициализации. Лаунчер за 4 перезапуска сам нашёл косячный аддон к Create и отключил его. Это магия.',
    contact: '@kirill_dev (TG)',
    status: 'resolved',
    launcherVersion: '1.6.17',
    os: 'Windows',
    arch: 'x64',
    anonymousId: 'anon-9941a',
    createdAt: '2026-09-28T11:20:00Z',
    upvotes: 14,
    tags: ['Crash Bisect', 'Fabric', 'Create'],
    adminNotes: 'Пользователь подтвердил решение, мод create_tweaked_compat имел баг с версией 0.5.1'
  },
  {
    id: 'fb-002',
    type: 'feature',
    title: 'Добавить экспорт установленных модов в HTML/Markdown',
    comment: 'Было бы заебись иметь кнопку «Поделиться сборкой», которая генерит чистый markdown со списком модов и ссылками на Modrinth/CurseForge, чтобы друзьям кидать в дискорд.',
    contact: 'steve_miner#1337',
    status: 'in_progress',
    launcherVersion: '1.6.16',
    os: 'macOS',
    arch: 'arm64',
    anonymousId: 'anon-7120b',
    createdAt: '2026-09-27T18:45:00Z',
    upvotes: 8,
    tags: ['Export', 'Modrinth', 'Community'],
    adminNotes: 'Issue #41 уже заведён в репозитории'
  },
  {
    id: 'fb-003',
    type: 'bug',
    title: 'Фриз UI при скачивании тяжёлых модпаков на слабом инете',
    comment: 'Когда качаешь пак весом 800+ МБ, прогресс-бар иногда замирает на 94%, хотя процесс в диспетчере задач продолжает жрать диск. Потом резко отпускает на 100%.',
    contact: 'alexey.k@inbox.ru',
    status: 'investigating',
    launcherVersion: '1.6.16',
    os: 'Windows',
    arch: 'x64',
    anonymousId: 'anon-1053c',
    createdAt: '2026-09-27T09:15:00Z',
    upvotes: 3,
    tags: ['Downloader', 'IPC-Freeze'],
    logsSnippet: `[12:44:02] [DownloadWorker/INFO] Fetching chunk 48/52 (hash: e3b0c442...)
[12:44:15] [Electron/WARN] Main process IPC unresponsive for 2400ms (buffer flush)
[12:44:17] [DownloadWorker/INFO] Chunk verified, extracting...`
  },
  {
    id: 'fb-004',
    type: 'review',
    rating: 5,
    title: 'Интерфейс на голову выше Prisme и тем более CurseForge',
    comment: 'Никакой лишней хуйни, рекламы и свистоперделок. Запуск мгновенный, памяти жрёт копейки. Очень жду интеграцию с облачной синхронизацией профилей.',
    status: 'new',
    launcherVersion: '1.6.17',
    os: 'Linux',
    arch: 'x64',
    anonymousId: 'anon-8824d',
    createdAt: '2026-09-26T22:10:00Z',
    upvotes: 6,
    tags: ['Performance', 'Wayland', 'Linux'],
  },
  {
    id: 'fb-005',
    type: 'feature',
    title: 'Поддержка профилей Java Garbage Collector (ZGC / Shenandoah)',
    comment: 'Сделайте пресеты запуска Java: дефолтный G1GC, агрессивный ZGC для сборок 16GB+ RAM и оптимизированный под слабые ноутбуки.',
    status: 'new',
    launcherVersion: '1.6.17',
    os: 'Windows',
    arch: 'x64',
    anonymousId: 'anon-3312e',
    createdAt: '2026-09-26T14:30:00Z',
    upvotes: 11,
    tags: ['JVM', 'GC Presets', 'Roadmap'],
    adminNotes: 'Issue #42 закреплён за роадмапом 1.7'
  }
];

export const mockCrashes: CrashReportItem[] = [
  {
    id: 'cr-401',
    timestamp: '2026-09-28T14:10:22Z',
    launcherVersion: '1.6.17',
    minecraftVersion: '1.20.1',
    loader: 'Fabric',
    os: 'Windows 11 x64',
    suspectedCulprit: 'sodium-extra-0.5.1.jar',
    errorTitle: 'MixinApplyException: Mixin [sodium-extra.mixins.json:features.gui] failed',
    stackTrace: `org.spongepowered.asm.mixin.transformer.throwables.MixinApplyException: Mixin [sodium-extra.mixins.json:features.gui.MixinVideoOptionsScreen] from phase [DEFAULT] in library [sodium-extra-0.5.1.jar] failed transform
    at org.spongepowered.asm.mixin.transformer.MixinProcessor.applyMixins(MixinProcessor.java:392)
    at net.fabricmc.loader.impl.launch.knot.KnotClassDelegate.getPostMixinClassByteArray(KnotClassDelegate.java:422)
    at net.minecraft.client.gui.screen.option.VideoOptionsScreen.init(VideoOptionsScreen.java:64)`,
    modCount: 142,
    status: 'investigating',
    occurrences: 6
  },
  {
    id: 'cr-402',
    timestamp: '2026-09-28T09:44:11Z',
    launcherVersion: '1.6.16',
    minecraftVersion: '1.21.1',
    loader: 'NeoForge',
    os: 'macOS 15.0 ARM64',
    suspectedCulprit: 'iris-neoforge-1.7.3.jar',
    errorTitle: 'GLFW error 65542: NSGL: The driver does not support OpenGL 3.2',
    stackTrace: `net.minecraft.client.main.Main.main(Main.java:188)
    at org.lwjgl.glfw.GLFW.glfwCreateWindow(GLFW.java:2140)
    at com.mojang.blaze3d.platform.GlStateManager._createWindow(GlStateManager.java:142)`,
    modCount: 48,
    status: 'fixed',
    occurrences: 2
  },
  {
    id: 'cr-403',
    timestamp: '2026-09-27T21:18:05Z',
    launcherVersion: '1.6.17',
    minecraftVersion: '1.19.2',
    loader: 'Forge',
    os: 'Linux 6.8.0 x64',
    suspectedCulprit: 'rubidium-mc1.19.2-0.6.2a.jar',
    errorTitle: 'Early loading crash: Duplicate mod id "rubidium" found',
    stackTrace: `net.minecraftforge.fml.loading.ModSorter.sort(ModSorter.java:112)
    at net.minecraftforge.fml.loading.ModSorter.detectDuplicates(ModSorter.java:140)`,
    modCount: 86,
    status: 'unresolved',
    occurrences: 9
  }
];
