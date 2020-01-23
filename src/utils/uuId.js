const s4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
let uuId; // eslint-disable-line no-unused-vars
export default uuId = () => {
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
