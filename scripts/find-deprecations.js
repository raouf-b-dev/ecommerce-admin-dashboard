import ts from 'typescript';
import path from 'node:path';

const configPath = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.app.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedCommandLine = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);

const program = ts.createProgram({
  rootNames: parsedCommandLine.fileNames,
  options: parsedCommandLine.options
});

const checker = program.getTypeChecker();
const deprecatedUsages = [];

for (const sourceFile of program.getSourceFiles()) {
  if (sourceFile.fileName.includes('node_modules')) continue;

  function visit(node) {
    if (ts.isIdentifier(node)) {
      let symbol = checker.getSymbolAtLocation(node);
      if (symbol) {
        if (symbol.flags & ts.SymbolFlags.Alias) {
          try {
            symbol = checker.getAliasedSymbol(symbol);
          } catch {
            // Ignore non-resolvable aliases
          }
        }
        const jsDocTags = symbol.getJsDocTags();
        const depTag = jsDocTags.find(tag => tag.name === 'deprecated');
        if (depTag) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          const text = tagText(depTag);
          deprecatedUsages.push({
            file: path.relative(process.cwd(), sourceFile.fileName),
            line: line + 1,
            col: character + 1,
            symbol: symbol.name,
            reason: text.replace(/\s+/g, ' ').trim()
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  function tagText(tag) {
    if (!tag.text) return '';
    if (typeof tag.text === 'string') return tag.text;
    return tag.text.map(t => t.text).join('');
  }

  visit(sourceFile);
}

console.log('Total deprecated usages found:', deprecatedUsages.length);
// Deduplicate by file + line + symbol
const unique = new Map();
for (const u of deprecatedUsages) {
  const key = `${u.file}:${u.line}:${u.symbol}`;
  if (!unique.has(key)) {
    unique.set(key, u);
  }
}

for (const u of unique.values()) {
  console.log(`${u.file}:${u.line}:${u.col} [${u.symbol}] ${u.reason.slice(0, 120)}`);
}
