import { spawn } from 'node:child_process';
import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const blogDir = path.resolve(cwd, 'src/content/blog');
const baseConfigPath = path.resolve(cwd, 'textlint.config.blog-base.cjs');
const techConfigPath = path.resolve(cwd, 'textlint.config.blog-tech.cjs');
const supportedExtensions = new Set(['.md', '.mdx']);

const parseArgs = (argv) => {
  const options = {
    format: undefined,
    scope: 'all',
    files: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if ((arg === '--format' || arg === '-f') && argv[index + 1]) {
      options.format = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--scope' && argv[index + 1]) {
      options.scope = argv[index + 1];
      index += 1;
      continue;
    }

    options.files.push(arg);
  }

  return options;
};

const exists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const collectBlogFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectBlogFiles(resolvedPath);
      }

      return resolvedPath;
    })
  );

  return files.flat();
};

const isBlogArticleFile = (filePath) => {
  const extension = path.extname(filePath);
  if (!supportedExtensions.has(extension)) {
    return false;
  }

  const relativePath = path.relative(blogDir, filePath);
  return relativePath !== '' && !relativePath.startsWith('..');
};

const isIgnoredDraft = (filePath) => {
  return path.basename(filePath).startsWith('_');
};

const isDiaryEntry = (filePath) => {
  return path.basename(filePath).toLowerCase().includes('diary');
};

const unique = (values) => {
  return [...new Set(values)];
};

const normalizeInputFiles = async (inputFiles) => {
  if (inputFiles.length === 0) {
    return collectBlogFiles(blogDir);
  }

  const resolvedFiles = inputFiles.map((filePath) => {
    return path.resolve(cwd, filePath);
  });
  const existence = await Promise.all(resolvedFiles.map((filePath) => exists(filePath)));

  return resolvedFiles.filter((filePath, index) => {
    return existence[index] && isBlogArticleFile(filePath);
  });
};

const toRelativePaths = (files) => {
  return files
    .map((filePath) => path.relative(cwd, filePath))
    .sort((left, right) => {
      return left.localeCompare(right);
    });
};

const runTextlint = ({ configPath, files, format, label }) => {
  if (files.length === 0) {
    return Promise.resolve(0);
  }

  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const args = ['exec', 'textlint', '--config', configPath];

  if (format) {
    args.push('--format', format);
  }

  args.push(...files);

  console.log(`\n[textlint:${label}] ${files.length} file(s)`);
  for (const filePath of files) {
    console.log(`- ${filePath}`);
  }

  return new Promise((resolve, reject) => {
    const child = spawn(pnpmCommand, args, {
      cwd,
      stdio: 'inherit',
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
  });
};

const main = async () => {
  const { files, format, scope } = parseArgs(process.argv.slice(2));
  const normalizedFiles = unique(await normalizeInputFiles(files)).filter((filePath) => {
    return !isIgnoredDraft(filePath);
  });

  const diaryFiles = toRelativePaths(normalizedFiles.filter((filePath) => isDiaryEntry(filePath)));
  const techFiles = toRelativePaths(normalizedFiles.filter((filePath) => !isDiaryEntry(filePath)));

  if (normalizedFiles.length === 0) {
    console.log('No blog article files matched textlint targets.');
    return;
  }

  if (scope !== 'all' && scope !== 'diary' && scope !== 'tech') {
    throw new Error(`Unsupported scope: ${scope}`);
  }

  let exitCode = 0;

  if (scope === 'all' || scope === 'diary') {
    exitCode = Math.max(
      exitCode,
      await runTextlint({
        configPath: baseConfigPath,
        files: diaryFiles,
        format,
        label: 'diary',
      })
    );
  }

  if (scope === 'all' || scope === 'tech') {
    exitCode = Math.max(
      exitCode,
      await runTextlint({
        configPath: techConfigPath,
        files: techFiles,
        format,
        label: 'tech',
      })
    );
  }

  process.exitCode = exitCode;
};

await main();
