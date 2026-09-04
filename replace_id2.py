import sys
import re

files = {
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\EditPolicy.jsx': True,
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\RenewPolicy.jsx': False
}

for file_path, has_resolve in files.items():
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the MenuItem fallback logic
    pattern = re.compile(r'(\{policyData\?\.endorsementGst\?\.value\s*\|\|\s*\(parseAmount\(form\.endorsementNetPremium\) > 0 && parseAmount\(form\.endorsementGstAmount\) > 0\s*\?\s*String\(Math\.round\(\(parseAmount\(form\.endorsementGstAmount\) / parseAmount\(form\.endorsementNetPremium\)\) \* 100\)\)\s*:\s*String\(form\.endorsementGst\)\)\})')
    
    replacement = r'{policyData?.endorsementGst?.value || (parseAmount(form.endorsementNetPremium) > 0 ? String(Math.round((parseAmount(form.endorsementGstAmount) / parseAmount(form.endorsementNetPremium)) * 100)) : "0")}'
    
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Success for {file_path}')
    else:
        print(f'Target not found in {file_path}')
