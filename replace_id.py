import sys

files = [
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\EditPolicy.jsx',
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\RenewPolicy.jsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = '''                        {policyData?.endorsementGst?.value || 
                          (parseAmount(form.endorsementNetPremium) > 0 && parseAmount(form.endorsementGstAmount) > 0 
                            ? String(Math.round((parseAmount(form.endorsementGstAmount) / parseAmount(form.endorsementNetPremium)) * 100)) 
                            : String(form.endorsementGst))}'''

    replacement = '''                        {policyData?.endorsementGst?.value || 
                          (parseAmount(form.endorsementNetPremium) > 0 
                            ? String(Math.round((parseAmount(form.endorsementGstAmount) / parseAmount(form.endorsementNetPremium)) * 100)) 
                            : '0')}'''
                            
    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Success for {file_path}')
    else:
        print(f'Target not found in {file_path}')
