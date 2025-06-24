const tokenKey = 'jwtToken';

export const getToken = () => {
  const sessionToken = sessionStorage.getItem('jwtToken') ?? '';
  if (sessionToken) {
    return JSON.parse(sessionToken);
  }
  const localToken = localStorage.getItem('jwtToken') ?? '';
  if (localToken) {
    return JSON.parse(localToken);
  }
  const cookieValue = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith(`${tokenKey}=`));

  if (cookieValue) {
    const value = cookieValue.split('=')[1];
    return decodeURIComponent(value.trim());
  }
  return '';
};
