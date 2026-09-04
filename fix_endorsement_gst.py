import sys

files = [
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\EditPolicy.jsx',
    r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\RenewPolicy.jsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    target = '''    useEffect(() => {
      const net = parseAmount(form.endorsementNetPremium);
      const gstId = form.endorsementGst;
      const gstValue = parseAmount(gstData?.find((g) => g._id === gstId)?.value || 0);
      const gstAmount = round2(net * (gstValue / 100));
      const total = round2(net + gstAmount);
      setForm((prev) => ({
        ...prev,
        endorsementGstAmount: formatAmountWithCommas(gstAmount) || '',
        etotalAmount: formatAmountWithCommas(total) || ''
      }));
    }, [form.endorsementNetPremium, form.endorsementGst, gstData]);'''

    replacement = '''    useEffect(() => {
      const net = parseAmount(form.endorsementNetPremium);
      const gstId = form.endorsementGst;
      const gstValue = parseAmount(gstData?.find((g) => g._id === gstId)?.value);
      const gstAmount = gstValue ? round2(net * (gstValue / 100)) : parseAmount(form.endorsementGstAmount);
      const total = round2(net + gstAmount);
      setForm((prev) => ({
        ...prev,
        endorsementGstAmount: formatAmountWithCommas(gstAmount) || '',
        etotalAmount: formatAmountWithCommas(total) || ''
      }));
    }, [form.endorsementNetPremium, form.endorsementGst, gstData]);'''
                            
    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Success for {file_path}')
    else:
        print(f'Target not found in {file_path}')
