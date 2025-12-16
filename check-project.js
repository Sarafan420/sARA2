#!/usr/bin/env node

/**
 * Скрипт для автоматической проверки проекта на ошибки и проблемы
 * 
 * Использование:
 *   node check-project.js          - Запуск всех проверок
 *   node check-project.js --clean-temp - Удаление временных файлов
 *   npm run check                  - Запуск через npm (рекомендуется)
 *   npm run check:clean            - Удаление временных файлов через npm
 * 
 * Выполняет:
 * 1. Проверку на задвоенные файлы (независимо от регистра)
 * 2. Поиск неиспользуемых файлов
 * 3. Поиск неиспользуемого кода (функции, переменные)
 * 4. Очистку кода (дубликаты, стандарты)
 * 5. Проверку на потенциальные ошибки
 * 6. Поиск временных файлов (.git, .vscode, .idea и т.д.)
 * 
 * Результат: детальный отчет с предложениями по исправлению
 */

const fs = require('fs').promises;
const path = require('path');

// Конфигурация
const CONFIG = {
  // Игнорируемые директории и файлы
  ignorePatterns: [
    'node_modules',
    '.git',
    '.vscode',
    '.idea',
    'build',
    'dist',
    '.next',
    'coverage',
    '.cache',
    'prisma/dev.db',
    'prisma/dev.db-journal',
    '.env',
    'package-lock.json',
    '*.map',
    '*.log',
  ],
  // Расширения файлов для анализа
  codeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  // Временные файлы и директории
  tempPatterns: [
    /^\.git$/,
    /^\.vscode$/,
    /^\.idea$/,
    /^\.DS_Store$/,
    /^Thumbs\.db$/,
    /\.tmp$/,
    /\.bak$/,
    /\.swp$/,
    /\.swo$/,
    /^~$/,
    /\.log$/,
  ],
};

// Результаты проверки
const results = {
  duplicateFiles: [],
  unusedFiles: [],
  unusedCode: [],
  codeDuplicates: [],
  potentialErrors: [],
  tempFiles: [],
  summary: {
    duplicates: 0,
    unusedFiles: 0,
    unusedCode: 0,
    codeDuplicates: 0,
    errors: 0,
    tempFiles: 0,
  },
};

/**
 * Проверяет, должен ли файл быть проигнорирован
 */
function shouldIgnore(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return CONFIG.ignorePatterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(normalizedPath);
    }
    return normalizedPath.includes(pattern);
  });
}

/**
 * Рекурсивно получает все файлы в директории
 */
async function getAllFiles(dirPath, fileList = []) {
  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (shouldIgnore(filePath)) {
        continue;
      }

      if (stat.isDirectory()) {
        await getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }

    return fileList;
  } catch (error) {
    console.error(`Ошибка при чтении директории ${dirPath}:`, error.message);
    return fileList;
  }
}

/**
 * 1. Проверка на задвоенные файлы (независимо от регистра)
 */
async function checkDuplicateFiles() {
  console.log('\n🔍 Проверка на задвоенные файлы...');
  const fileMap = new Map();
  const allFiles = await getAllFiles('.');

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath).toLowerCase();
    const fileDir = path.dirname(filePath);

    if (!fileMap.has(fileName)) {
      fileMap.set(fileName, []);
    }
    fileMap.get(fileName).push(filePath);
  }

  for (const [fileName, files] of fileMap.entries()) {
    if (files.length > 1) {
      results.duplicateFiles.push({
        name: fileName,
        files: files,
      });
      results.summary.duplicates++;
    }
  }

  if (results.duplicateFiles.length > 0) {
    console.log(`   ⚠️  Найдено ${results.duplicateFiles.length} групп задвоенных файлов`);
    results.duplicateFiles.forEach(({ name, files }) => {
      console.log(`   - "${name}": ${files.length} файлов`);
      files.forEach(file => console.log(`     • ${file}`));
    });
  } else {
    console.log('   ✅ Задвоенных файлов не найдено');
  }
}

/**
 * Разрешает путь импорта к реальному файлу
 */
async function resolveImportPath(importPath, baseDir) {
  // Игнорируем npm модули и абсолютные пути
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return null;
  }

  // Убираем расширения из пути импорта
  const cleanPath = importPath.replace(/\.(js|jsx|ts|tsx)$/, '');
  
  // Разрешаем относительные пути
  let resolvedPath = path.resolve(baseDir, cleanPath);
  
  // Пробуем разные варианты расширений
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx'];
  const indexFiles = ['/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  
  // Сначала пробуем файл напрямую
  for (const ext of extensions) {
    const testPath = resolvedPath + ext;
    if (await fileExists(testPath)) {
      return path.normalize(testPath);
    }
  }
  
  // Затем пробуем index файлы
  for (const indexFile of indexFiles) {
    const testPath = resolvedPath + indexFile;
    if (await fileExists(testPath)) {
      return path.normalize(testPath);
    }
  }
  
  return null;
}

/**
 * 2. Поиск неиспользуемых файлов
 */
async function findUnusedFiles() {
  console.log('\n🔍 Поиск неиспользуемых файлов...');
  const allFiles = await getAllFiles('.');
  const codeFiles = allFiles.filter(file =>
    CONFIG.codeExtensions.some(ext => file.endsWith(ext))
  );

  // Создаем карту импортов/требований
  const usedFiles = new Set();
  const exportedFiles = new Set();
  const entryPoints = new Set([
    'server.js',
    'launch.js',
  ]);

  // Анализируем импорты в файлах
  for (const filePath of codeFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileDir = path.dirname(filePath);
      const fileName = path.basename(filePath);
      
      // Проверяем, является ли файл точкой входа
      if (fileName === 'index.js' || fileName === 'index.jsx' ||
          fileName === 'App.js' || fileName === 'server.js' ||
          fileName === 'main.js' || fileName === 'launch.js' ||
          filePath.includes('client/src/index.js') ||
          filePath.includes('client/src/App.js')) {
        entryPoints.add(filePath);
        usedFiles.add(filePath);
      }

      // Ищем все импорты/require (улучшенный regex)
      const importRegex = /(?:import\s+(?:.*\s+from\s+)?|require\s*\(\s*)['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const resolvedPath = await resolveImportPath(importPath, fileDir);
        
        if (resolvedPath) {
          usedFiles.add(resolvedPath);
        }
      }

      // Проверяем экспорты
      if (content.match(/export\s+(default\s+)?(function|const|let|var|class)/) ||
          content.includes('module.exports') ||
          content.match(/export\s+\{/)) {
        exportedFiles.add(filePath);
        usedFiles.add(filePath);
      }

      // Проверяем React компоненты (они обычно экспортируются)
      if (content.match(/export\s+default\s+function\s+\w+|export\s+default\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/)) {
        exportedFiles.add(filePath);
        usedFiles.add(filePath);
      }
    } catch (error) {
      // Игнорируем ошибки чтения
    }
  }

  // Находим неиспользуемые файлы
  for (const filePath of codeFiles) {
    const normalizedPath = path.normalize(filePath);
    
    // Игнорируем файлы конфигурации и тесты
    if (filePath.includes('test') || filePath.includes('spec') ||
        filePath.includes('config') || filePath.includes('.config.') ||
        filePath.includes('package.json') || filePath.includes('.eslintrc') ||
        filePath.includes('tailwind.config') || filePath.includes('postcss.config')) {
      continue;
    }

    // Проверяем, используется ли файл
    if (!usedFiles.has(normalizedPath) && !exportedFiles.has(normalizedPath) && !entryPoints.has(normalizedPath)) {
      // Дополнительная проверка: проверяем, используется ли имя файла в других файлах
      const fileName = path.basename(filePath, path.extname(filePath));
      let isReferenced = false;

      // Проверяем в других файлах
      for (const otherFile of codeFiles) {
        if (otherFile === filePath) continue;
        try {
          const otherContent = await fs.readFile(otherFile, 'utf-8');
          // Ищем импорты с именем файла
          const importPattern = new RegExp(`['"]\\./[^'"]*${fileName}['"]|['"]\\.\\./[^'"]*${fileName}['"]`, 'i');
          if (importPattern.test(otherContent)) {
            isReferenced = true;
            break;
          }
        } catch (e) {
          // Игнорируем ошибки
        }
      }

      if (!isReferenced) {
        results.unusedFiles.push(filePath);
        results.summary.unusedFiles++;
      }
    }
  }

  if (results.unusedFiles.length > 0) {
    console.log(`   ⚠️  Найдено ${results.unusedFiles.length} потенциально неиспользуемых файлов`);
    results.unusedFiles.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('   ✅ Неиспользуемых файлов не найдено');
  }
}

/**
 * Проверяет существование файла
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 3. Поиск неиспользуемого кода в файлах
 */
async function findUnusedCode() {
  console.log('\n🔍 Поиск неиспользуемого кода...');
  const allFiles = await getAllFiles('.');
  const codeFiles = allFiles.filter(file =>
    ['.js', '.jsx'].some(ext => file.endsWith(ext))
  );

  for (const filePath of codeFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const unusedItems = [];

      // Поиск неиспользуемых функций
      const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|const\s+(\w+)\s*=\s*(?:async\s+)?function)/g;
      const functions = new Set();
      let match;

      while ((match = functionRegex.exec(content)) !== null) {
        const funcName = match[1] || match[2] || match[3];
        if (funcName) {
          functions.add(funcName);
        }
      }

      // Проверяем использование функций
      for (const funcName of functions) {
        // Игнорируем экспортируемые функции
        if (content.includes(`export`) && content.includes(`export.*${funcName}`)) {
          continue;
        }

        // Подсчитываем использование функции (исключая объявление)
        const usageRegex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
        const declarations = content.match(new RegExp(`(?:function\\s+${funcName}|const\\s+${funcName}\\s*=|let\\s+${funcName}\\s*=|var\\s+${funcName}\\s*=)`, 'g')) || [];
        const usages = content.match(usageRegex) || [];
        
        // Если функция объявлена, но не используется (кроме самого объявления)
        if (declarations.length > 0 && usages.length <= declarations.length) {
          unusedItems.push({
            type: 'function',
            name: funcName,
            line: getLineNumber(content, funcName),
          });
        }
      }

      // Поиск неиспользуемых переменных
      const variableRegex = /(?:const|let|var)\s+(\w+)\s*[=;]/g;
      const variables = new Set();

      while ((match = variableRegex.exec(content)) !== null) {
        const varName = match[1];
        if (!['require', 'module', 'exports'].includes(varName)) {
          variables.add(varName);
        }
      }

      // Проверяем использование переменных
      for (const varName of variables) {
        // Игнорируем экспортируемые переменные
        if (content.includes(`export`) && content.includes(`export.*${varName}`)) {
          continue;
        }

        const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const declarations = content.match(new RegExp(`(?:const|let|var)\\s+${varName}\\s*[=;]`, 'g')) || [];
        const usages = content.match(usageRegex) || [];
        
        // Если переменная объявлена, но не используется достаточно раз
        if (declarations.length > 0 && usages.length <= declarations.length + 1) {
          unusedItems.push({
            type: 'variable',
            name: varName,
            line: getLineNumber(content, varName),
          });
        }
      }

      if (unusedItems.length > 0) {
        results.unusedCode.push({
          file: filePath,
          items: unusedItems,
        });
        results.summary.unusedCode += unusedItems.length;
      }
    } catch (error) {
      // Игнорируем ошибки чтения
    }
  }

  if (results.unusedCode.length > 0) {
    console.log(`   ⚠️  Найдено ${results.summary.unusedCode} потенциально неиспользуемых элементов кода`);
    results.unusedCode.forEach(({ file, items }) => {
      console.log(`   - ${file}:`);
      items.forEach(item => {
        console.log(`     • ${item.type} "${item.name}" (строка ${item.line})`);
      });
    });
  } else {
    console.log('   ✅ Неиспользуемого кода не найдено');
  }
}

/**
 * Получает номер строки для символа
 */
function getLineNumber(content, search) {
  const index = content.indexOf(search);
  if (index === -1) return 0;
  return content.substring(0, index).split('\n').length;
}

/**
 * 4. Проверка на дубликаты кода и стандарты
 */
async function checkCodeDuplicates() {
  console.log('\n🔍 Проверка на дубликаты кода...');
  const allFiles = await getAllFiles('.');
  const codeFiles = allFiles.filter(file =>
    ['.js', '.jsx'].some(ext => file.endsWith(ext))
  );

  const codeBlocks = new Map();

  for (const filePath of codeFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      // Ищем повторяющиеся блоки кода (более 5 строк)
      for (let i = 0; i < lines.length - 5; i++) {
        const block = lines.slice(i, i + 5).join('\n').trim();
        if (block.length > 50) { // Игнорируем слишком короткие блоки
          const blockHash = simpleHash(block);
          if (!codeBlocks.has(blockHash)) {
            codeBlocks.set(blockHash, []);
          }
          codeBlocks.get(blockHash).push({
            file: filePath,
            line: i + 1,
            code: block.substring(0, 100) + '...',
          });
        }
      }
    } catch (error) {
      // Игнорируем ошибки
    }
  }

  // Находим дубликаты (блоки, которые встречаются более одного раза)
  for (const [hash, occurrences] of codeBlocks.entries()) {
    if (occurrences.length > 1) {
      const uniqueFiles = new Set(occurrences.map(o => o.file));
      if (uniqueFiles.size > 1) {
        results.codeDuplicates.push({
          occurrences: occurrences,
        });
        results.summary.codeDuplicates++;
      }
    }
  }

  if (results.codeDuplicates.length > 0) {
    console.log(`   ⚠️  Найдено ${results.codeDuplicates.length} потенциальных дубликатов кода`);
    results.codeDuplicates.slice(0, 10).forEach((dup, idx) => {
      console.log(`   - Дубликат #${idx + 1}:`);
      dup.occurrences.forEach(occ => {
        console.log(`     • ${occ.file}:${occ.line}`);
      });
    });
  } else {
    console.log('   ✅ Дубликатов кода не найдено');
  }
}

/**
 * Простая хеш-функция
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

/**
 * 5. Проверка на потенциальные ошибки
 */
async function checkPotentialErrors() {
  console.log('\n🔍 Проверка на потенциальные ошибки...');
  const allFiles = await getAllFiles('.');
  const codeFiles = allFiles.filter(file =>
    CONFIG.codeExtensions.some(ext => file.endsWith(ext))
  );

  for (const filePath of codeFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const errors = [];

      // Проверка на неиспользуемые импорты
      if (content.includes('import ') || content.includes('require(')) {
        const importLines = content.split('\n').filter(line => 
          line.includes('import ') || line.includes('require(')
        );

        for (const importLine of importLines) {
          const importMatch = importLine.match(/(?:import|require)\(?['"]([^'"]+)['"]\)?/);
          if (importMatch) {
            const importPath = importMatch[1];
            // Проверяем, используется ли импорт в коде
            const importName = path.basename(importPath, path.extname(importPath));
            const restOfContent = content.substring(content.indexOf(importLine) + importLine.length);
            
            // Если это не React и не используется в коде
            if (!importPath.includes('react') && !importPath.includes('React') &&
                !restOfContent.includes(importName) && !importPath.startsWith('.')) {
              // Это может быть неиспользуемый импорт
            }
          }
        }
      }

      // Проверка на console.log в продакшн коде
      if (content.includes('console.log') && !filePath.includes('test') && !filePath.includes('spec')) {
        const consoleMatches = content.match(/console\.(log|warn|error|debug)/g);
        if (consoleMatches) {
          errors.push({
            type: 'console_usage',
            message: `Найдены ${consoleMatches.length} вызовов console.* (рекомендуется удалить для продакшна)`,
            line: getLineNumber(content, 'console.log'),
          });
        }
      }

      // Проверка на TODO/FIXME комментарии
      const todoMatches = content.match(/(TODO|FIXME|XXX|HACK):\s*(.+)/gi);
      if (todoMatches) {
        errors.push({
          type: 'todo_comment',
          message: `Найдены комментарии TODO/FIXME: ${todoMatches.length}`,
          line: 0,
        });
      }

      // Проверка на закомментированный код
      const commentedCodeRegex = /\/\/\s*(?:const|let|var|function|if|for|while)\s+/g;
      const commentedMatches = content.match(commentedCodeRegex);
      if (commentedMatches && commentedMatches.length > 5) {
        errors.push({
          type: 'commented_code',
          message: `Найдено много закомментированного кода (${commentedMatches.length} мест)`,
          line: 0,
        });
      }

      // Проверка на использование var вместо const/let
      const varMatches = content.match(/\bvar\s+\w+/g);
      if (varMatches) {
        errors.push({
          type: 'var_usage',
          message: `Найдено использование var (рекомендуется использовать const/let): ${varMatches.length} мест`,
          line: 0,
        });
      }

      // Проверка на потенциальные проблемы с безопасностью (исключаем комментарии и строки)
      const hasEval = /eval\s*\(/.test(content) && !/\/\/.*eval|['"].*eval/.test(content);
      const hasInnerHTML = /\.innerHTML\s*=/.test(content) && !/\/\/.*innerHTML|['"].*innerHTML/.test(content);
      if (hasEval || hasInnerHTML) {
        errors.push({
          type: 'security',
          message: 'Потенциальная проблема безопасности: использование eval или innerHTML',
          line: 0,
        });
      }

      if (errors.length > 0) {
        results.potentialErrors.push({
          file: filePath,
          errors: errors,
        });
        results.summary.errors += errors.length;
      }
    } catch (error) {
      // Игнорируем ошибки чтения
    }
  }

  if (results.potentialErrors.length > 0) {
    console.log(`   ⚠️  Найдено ${results.summary.errors} потенциальных проблем`);
    results.potentialErrors.forEach(({ file, errors }) => {
      console.log(`   - ${file}:`);
      errors.forEach(err => {
        console.log(`     • [${err.type}] ${err.message}`);
      });
    });
  } else {
    console.log('   ✅ Потенциальных ошибок не найдено');
  }
}

/**
 * 6. Поиск временных файлов
 */
async function findTempFiles() {
  console.log('\n🔍 Поиск временных файлов...');
  const allFiles = await getAllFiles('.');

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    const shouldRemove = CONFIG.tempPatterns.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(fileName) || pattern.test(filePath);
      }
      return fileName.includes(pattern) || filePath.includes(pattern);
    });

    if (shouldRemove) {
      results.tempFiles.push(filePath);
      results.summary.tempFiles++;
    }
  }

  if (results.tempFiles.length > 0) {
    console.log(`   ⚠️  Найдено ${results.tempFiles.length} временных файлов`);
    results.tempFiles.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('   ✅ Временных файлов не найдено');
  }
}

/**
 * Генерация отчета
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 ОТЧЕТ О ПРОВЕРКЕ ПРОЕКТА');
  console.log('='.repeat(80));

  console.log(`\n📁 Задвоенные файлы: ${results.summary.duplicates}`);
  console.log(`📄 Неиспользуемые файлы: ${results.summary.unusedFiles}`);
  console.log(`🔧 Неиспользуемый код: ${results.summary.unusedCode}`);
  console.log(`📋 Дубликаты кода: ${results.summary.codeDuplicates}`);
  console.log(`⚠️  Потенциальные ошибки: ${results.summary.errors}`);
  console.log(`🗑️  Временные файлы: ${results.summary.tempFiles}`);

  const totalIssues = Object.values(results.summary).reduce((sum, val) => sum + val, 0);
  console.log(`\n📊 Всего найдено проблем: ${totalIssues}`);

  if (totalIssues === 0) {
    console.log('\n✅ Проект в отличном состоянии!');
  } else {
    console.log('\n⚠️  Рекомендуется исправить найденные проблемы.');
  }
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Запуск проверки проекта...\n');

  try {
    await checkDuplicateFiles();
    await findUnusedFiles();
    await findUnusedCode();
    await checkCodeDuplicates();
    await checkPotentialErrors();
    await findTempFiles();

    generateReport();

    // Предложение удалить временные файлы
    if (results.tempFiles.length > 0) {
      console.log('\n💡 Для удаления временных файлов используйте:');
      console.log('   node check-project.js --clean-temp');
    }

  } catch (error) {
    console.error('❌ Ошибка при выполнении проверки:', error);
    process.exit(1);
  }
}

/**
 * Удаление временных файлов
 */
async function cleanTempFiles() {
  console.log('🗑️  Удаление временных файлов...\n');
  
  if (results.tempFiles.length === 0) {
    console.log('   ℹ️  Временные файлы уже были найдены ранее. Запускаю поиск заново...');
    await findTempFiles();
  }
  
  if (results.tempFiles.length === 0) {
    console.log('   ✅ Временных файлов не найдено.');
    return;
  }
  
  console.log(`\n   Найдено ${results.tempFiles.length} временных файлов для удаления:`);
  results.tempFiles.forEach(file => console.log(`   - ${file}`));
  
  // Безопасное удаление (только для явно временных файлов, не .git)
  const safeToDelete = results.tempFiles.filter(file => {
    const fileName = path.basename(file);
    // Не удаляем .git автоматически (слишком опасно)
    return !file.includes('.git') && 
           (fileName.match(/^\.(vscode|idea|DS_Store)$/) ||
            fileName.match(/\.(tmp|bak|swp|swo|log)$/) ||
            fileName.match(/^Thumbs\.db$/));
  });
  
  if (safeToDelete.length === 0) {
    console.log('\n   ⚠️  Не найдено безопасных для автоматического удаления файлов.');
    console.log('   Рекомендуется удалить следующие файлы вручную:');
    results.tempFiles.forEach(file => console.log(`   - ${file}`));
    return;
  }
  
  console.log(`\n   Будет удалено ${safeToDelete.length} файлов...`);
  
  for (const filePath of safeToDelete) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        // Используем fs.rmdir для совместимости со старыми версиями Node.js
        await fs.rmdir(filePath, { recursive: true });
        console.log(`   ✓ Удалена директория: ${filePath}`);
      } else {
        await fs.unlink(filePath);
        console.log(`   ✓ Удален файл: ${filePath}`);
      }
    } catch (error) {
      console.error(`   ✗ Ошибка при удалении ${filePath}:`, error.message);
    }
  }
  
  console.log(`\n   ✅ Удалено ${safeToDelete.length} файлов.`);
}

// Обработка аргументов командной строки
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean-temp')) {
    // Сначала находим временные файлы
    findTempFiles().then(() => {
      if (results.tempFiles.length > 0) {
        console.log(`\nНайдено ${results.tempFiles.length} временных файлов для удаления.`);
        cleanTempFiles();
      } else {
        console.log('Временные файлы не найдены.');
      }
    });
  } else {
    main();
  }
}

module.exports = {
  checkDuplicateFiles,
  findUnusedFiles,
  findUnusedCode,
  checkCodeDuplicates,
  checkPotentialErrors,
  findTempFiles,
  results,
};

