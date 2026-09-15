function TokenHandler () {
  const cookieArr = document.cookie.split('; ')
  for (let cookie of cookieArr) {
    const [cookieName, cookieValue] = cookie.split('=')
    if (cookieName === 'hmsToken') {
      return decodeURIComponent(cookieValue)
    }
  }
  return localStorage.getItem('token') || null;
}

export default TokenHandler
