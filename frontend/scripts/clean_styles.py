import os
import re

directory = r'd:\Coding\college\sem-4\dbms\sql_website\Jai_s_website\Real_estateDBMS\frontend\src\pages'

patterns = [
    (r"background:\s*['\"]#fff['\"]\s*,?", ''),
    (r"background:\s*['\"]var\(--bg-soft\)['\"]\s*,?", ''),
    (r"border:\s*['\"]1px solid #(?:ddd|eee|e5e5e5)['\"]\s*,?", ''),
    (r"boxShadow:\s*['\"]0 4px 12px rgba\(0,0,0,0\.05\)['\"]\s*,?", ''),
]

for root, _, files in os.walk(directory):
    for const_file in files:
        if const_file.endswith('.jsx'):
            filepath = os.path.join(root, const_file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            for pattern, repl in patterns:
                new_content = re.sub(pattern, repl, new_content)
            
            # fix trailing commas like style={{ padding: 40, }} -> style={{ padding: 40 }}
            new_content = re.sub(r',\s*\}', ' }', new_content)
            # fix style={{ }} empty styles
            new_content = re.sub(r'style=\{\{\s*\}\}', '', new_content)

            if new_content != content:
                print(f'Updated {filepath}')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
