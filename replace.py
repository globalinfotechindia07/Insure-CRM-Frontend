import sys

file_path = r'c:\GII Projects\Insure CRM\Insure-CRM-Frontend\src\views\Policy\RenewPolicy.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''                  <Select
                    labelId="endorsementGst"
                    label="Endorsement GST"
                    name="endorsementGst"
                    value={form.endorsementGst}
                    onChange={handleChange}
                  >
                    {gstData.length > 0 &&
                      gstData.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.value}
                        </MenuItem>
                      ))}
                  </Select>'''

replacement = '''                  <Select
                    labelId="endorsementGst"
                    label="Endorsement GST"
                    name="endorsementGst"
                    value={form.endorsementGst}
                    onChange={handleChange}
                  >
                    {gstData.length > 0 &&
                      gstData.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.value}
                        </MenuItem>
                      ))}
                    {form.endorsementGst && !gstData.some((t) => String(t._id) === String(form.endorsementGst)) && (
                      <MenuItem key={String(form.endorsementGst)} value={String(form.endorsementGst)}>
                        {policyData?.endorsementGst?.value || 
                          (parseAmount(form.endorsementNetPremium) > 0 && parseAmount(form.endorsementGstAmount) > 0 
                            ? String(Math.round((parseAmount(form.endorsementGstAmount) / parseAmount(form.endorsementNetPremium)) * 100)) 
                            : String(form.endorsementGst))}
                      </MenuItem>
                    )}
                  </Select>'''

if target in content:
    content = content.replace(target, replacement)
    
    # Also fix round2
    content = content.replace('const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;', 'const round2 = (num) => Math.round(Number(num));')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Success')
else:
    print('Target not found')
