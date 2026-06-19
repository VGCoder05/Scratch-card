export function useURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    adminParam: params.get('admin') || '',
    skipParam: params.get('skip') || '',
    uid: params.get('uid') || '',
  };
}