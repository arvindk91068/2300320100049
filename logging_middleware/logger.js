export const Log = (stack, level, packageName, message) => {
  console.log({
    stack,
    level,
    package: packageName,
    message,
    timestamp: new Date().toISOString(),
  });
};