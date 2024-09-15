export const getToken = () => {
  let token = sessionStorage.getItem('jwtToken') ?? ''
  if (!token) {
    token = localStorage.getItem('jwtToken') ?? ''
  }
  if (!token) {
    throw new Error('Not found jwtToken')
  }
  return token.replaceAll('"', '')
}
