import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

// Load the translations map
const rawJson = fs.readFileSync('extracted_strings.json', 'utf8');
const extractedStrings = JSON.parse(rawJson);

const sourceFiles = project.getSourceFiles('src/**/*.tsx');

let modifiedFilesCount = 0;

for (const sourceFile of sourceFiles) {
  let modified = false;

  // Add import if needed
  const hasUseLanguage = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '../context/LanguageContext' || decl.getModuleSpecifierValue() === '../../context/LanguageContext' || decl.getModuleSpecifierValue().includes('LanguageContext'));
  
  if (!hasUseLanguage) {
    // Need to find the correct relative path
    const filePath = sourceFile.getFilePath();
    let relativePath = '../context/LanguageContext';
    if (filePath.includes('/app/')) {
        const depth = filePath.split('/app/')[1].split('/').length;
        if (depth === 1) relativePath = '../context/LanguageContext'; // e.g. src/app/page.tsx
        else if (depth === 2) relativePath = '../../context/LanguageContext'; // e.g. src/app/login/page.tsx
    } else if (filePath.includes('/components/')) {
        relativePath = '../context/LanguageContext';
    }
    
    sourceFile.addImportDeclaration({
      namedImports: ['useLanguage'],
      moduleSpecifier: relativePath,
    });
    modified = true;
  }

  // Find where to inject const { t } = useLanguage();
  // Usually inside the main component function
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
     const decls = defaultExport.getDeclarations();
     if (decls.length > 0 && (decls[0].isKind(SyntaxKind.FunctionDeclaration) || decls[0].isKind(SyntaxKind.VariableDeclaration))) {
         // Actually, injecting variables using ts-morph in every component is tricky due to varying component structures (arrow functions vs function declarations).
         // Let's do a simple text replace later for the hook if we can't reliably inject it.
     }
  }

  // Replace JSX Text
  sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(node => {
    const text = node.getLiteralText().trim();
    if (text && extractedStrings.hasOwnProperty(text)) {
      // Create a JsxExpression
      node.replaceWithText(`{t(${JSON.stringify(text)})}`);
      modified = true;
    }
  });

  // Replace JSX Attributes
  sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(node => {
    const name = node.getNameNode().getText();
    if (['placeholder', 'title', 'alt', 'label'].includes(name)) {
      const initializer = node.getInitializer();
      if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
        const text = initializer.getLiteralValue().trim();
        if (text && extractedStrings.hasOwnProperty(text)) {
           initializer.replaceWithText(`{t(${JSON.stringify(text)})}`);
           modified = true;
        }
      }
    }
  });

  if (modified) {
    sourceFile.saveSync();
    modifiedFilesCount++;
  }
}

console.log(`Modified ${modifiedFilesCount} files.`);
