import { Project, SyntaxKind, JsxText, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const extractedStrings = new Set<string>();

const sourceFiles = project.getSourceFiles('src/**/*.tsx');

for (const sourceFile of sourceFiles) {
  // Find JSX Text
  sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(node => {
    const text = node.getLiteralText().trim();
    if (text && text.match(/[a-zA-Z]/) && text.length > 1) {
      extractedStrings.add(text);
    }
  });

  sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(node => {
    const name = node.getNameNode().getText();
    if (['placeholder', 'title', 'alt', 'label'].includes(name)) {
      const initializer = node.getInitializer();
      if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
        const text = initializer.getLiteralValue().trim();
        if (text && text.match(/[a-zA-Z]/)) {
          extractedStrings.add(text);
        }
      }
    }
  });
}

const stringsArray = Array.from(extractedStrings);
const translationsMap: Record<string, string> = {};

stringsArray.forEach(str => {
  translationsMap[str] = ""; // To be filled
});

fs.writeFileSync('extracted_strings.json', JSON.stringify(translationsMap, null, 2));
console.log(`Extracted ${stringsArray.length} strings to extracted_strings.json`);
