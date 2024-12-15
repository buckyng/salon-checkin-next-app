export const fetchParams = async (
  promiseParams: Promise<{ id: string }>
): Promise<string> => {
  const params = await promiseParams;
  return params.id;
};
