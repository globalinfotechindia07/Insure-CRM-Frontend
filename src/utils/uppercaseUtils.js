export const toUppercasePayload = (data) => {
  if (data === null || data === undefined) return data;
  if (data instanceof FormData) {
    const excludedKeys = ['password', 'confirmpassword', 'oldpassword', 'newpassword', 'token', '_id'];
    const newFormData = new FormData();
    for (const [key, value] of data.entries()) {
      const lowerKey = key.toLowerCase();
      if (typeof value === 'string' && !excludedKeys.includes(lowerKey) && !value.startsWith('data:image/') && !value.startsWith('http://') && !value.startsWith('https://')) {
        newFormData.append(key, value.toUpperCase());
      } else {
        newFormData.append(key, value);
      }
    }
    return newFormData;
  }
  if (typeof data === 'string') {
    if (data.startsWith('data:image/') || data.startsWith('http://') || data.startsWith('https://')) {
      return data;
    }
    return data.toUpperCase();
  }
  if (Array.isArray(data)) {
    return data.map((item) => toUppercasePayload(item));
  }
  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
    const newObj = {};
    const excludedKeys = ['password', 'confirmpassword', 'oldpassword', 'newpassword', 'token', 'refreshtoken', 'accesstoken', '_id'];
    for (const key of Object.keys(data)) {
      const lowerKey = key.toLowerCase();
      if (excludedKeys.includes(lowerKey)) {
        newObj[key] = data[key];
      } else {
        newObj[key] = toUppercasePayload(data[key]);
      }
    }
    return newObj;
  }
  return data;
};
