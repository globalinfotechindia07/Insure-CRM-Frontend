import sys
import re

files = [
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\EditPolicy.jsx',
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\RenewPolicy.jsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(r'const\s+gstValue\s*=\s*parseAmount\(gstData\?\.find\(\(g\)\s*=>\s*g\._id\s*===\s*gstId\)\?\.value\s*\|\|\s*0\);(\s*)const\s+gstAmount\s*=\s*round2\(net\s*\*\s*\(gstValue\s*/\s*100\)\);')
    
    replacement = r'''const gstValue = parseAmount(gstData?.find((g) => g._id === gstId)?.value);
      const gstAmount = gstValue ? round2(net * (gstValue / 100)) : parseAmount(form.endorsementGstAmount);'''
                            
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Success for {file_path}')
    else:
        print(f'Target not found in {file_path}')
